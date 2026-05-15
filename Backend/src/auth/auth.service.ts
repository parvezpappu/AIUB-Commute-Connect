import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ResendVerificationOtpDto } from './dto/resend-verification-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { PendingRegistration } from './entities/pending-registration.entity';
import { MailService } from './mail.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @InjectRepository(PendingRegistration)
    private readonly pendingRegistrationRepository: Repository<PendingRegistration>,
  ) {}

  async registerUser(createAuthDto: CreateAuthDto) {
    const existingEmail = await this.userService.findByEmail(createAuthDto.email);

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const existingAiubId = await this.userService.findByAiubId(
      createAuthDto.aiubId,
    );

    if (existingAiubId) {
      throw new ConflictException('University ID already exists');
    }

    const pendingWithEmail =
      await this.pendingRegistrationRepository.findOne({
        where: { email: createAuthDto.email },
      });
    const pendingWithAiubId =
      await this.pendingRegistrationRepository.findOne({
        where: { aiubId: createAuthDto.aiubId },
      });

    if (pendingWithAiubId && pendingWithAiubId.email !== createAuthDto.email) {
      throw new ConflictException('University ID is already pending verification');
    }

    const otp = this.generateOtp();
    const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const pendingRegistration =
      pendingWithEmail ?? this.pendingRegistrationRepository.create();

    pendingRegistration.fullName = createAuthDto.fullName;
    pendingRegistration.aiubId = createAuthDto.aiubId;
    pendingRegistration.email = createAuthDto.email;
    pendingRegistration.password = hashedPassword;
    pendingRegistration.preferredFromLocation =
      createAuthDto.preferredFromLocation || null;
    pendingRegistration.preferredToLocation =
      createAuthDto.preferredToLocation || null;
    pendingRegistration.emailVerificationOtp = hashedOtp;
    pendingRegistration.emailVerificationOtpExpiresAt = otpExpiresAt;

    await this.pendingRegistrationRepository.save(pendingRegistration);
    await this.mailService.sendVerificationOtp(
      createAuthDto.email,
      createAuthDto.fullName,
      otp,
    );

    return {
      message: 'Registration successful. Check your email for the OTP.',
    };
  }

  async loginUser(loginAuthDto: LoginAuthDto) {
    const user = await this.userService.findByAiubId(loginAuthDto.aiubId,true);

    if (!user) {
      throw new UnauthorizedException('Invalid university ID or password');
    }

    const isPasswordMatched = await bcrypt.compare(
      loginAuthDto.password,
      user.password,
    );

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid university ID or password');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Please verify your email with OTP before logging in',
      );
    }

    const payload = {
      sub: user.id,
      aiubId: user.aiubId,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const { password, ...result } = user;

    return {
      message: 'Login successful',
      accessToken,
      user: result,
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const existingUser = await this.userService.findByEmail(verifyEmailDto.email);

    if (existingUser?.isVerified) {
      return {
        message: 'Email is already verified',
      };
    }

    const pendingRegistration =
      await this.pendingRegistrationRepository
        .createQueryBuilder('pendingRegistration')
        .addSelect('pendingRegistration.emailVerificationOtp')
        .where('pendingRegistration.email = :email', {
          email: verifyEmailDto.email,
        })
        .getOne();

    if (!pendingRegistration) {
      throw new BadRequestException('No pending registration found');
    }

    if (pendingRegistration.emailVerificationOtpExpiresAt < new Date()) {
      throw new BadRequestException('OTP expired. Please request a new OTP');
    }

    const isOtpMatched = await bcrypt.compare(
      verifyEmailDto.otp,
      pendingRegistration.emailVerificationOtp,
    );

    if (!isOtpMatched) {
      throw new BadRequestException('Invalid email or OTP');
    }

    await this.userService.createVerifiedUserWithHashedPassword({
      fullName: pendingRegistration.fullName,
      aiubId: pendingRegistration.aiubId,
      email: pendingRegistration.email,
      password: pendingRegistration.password,
      preferredFromLocation: pendingRegistration.preferredFromLocation,
      preferredToLocation: pendingRegistration.preferredToLocation,
    });

    await this.pendingRegistrationRepository.remove(pendingRegistration);

    return {
      message: 'Email verified successfully',
    };
  }

  async resendVerificationOtp(
    resendVerificationOtpDto: ResendVerificationOtpDto,
  ) {
    const existingUser = await this.userService.findByEmail(
      resendVerificationOtpDto.email,
    );

    if (existingUser?.isVerified) {
      return {
        message: 'Email is already verified',
      };
    }

    const pendingRegistration =
      await this.pendingRegistrationRepository.findOne({
        where: { email: resendVerificationOtpDto.email },
      });

    if (!pendingRegistration) {
      throw new BadRequestException('No pending registration found');
    }

    const otp = this.generateOtp();
    pendingRegistration.emailVerificationOtp = await bcrypt.hash(otp, 10);
    pendingRegistration.emailVerificationOtpExpiresAt = new Date(
      Date.now() + 10 * 60 * 1000,
    );
    await this.pendingRegistrationRepository.save(pendingRegistration);
    await this.mailService.sendVerificationOtp(
      pendingRegistration.email,
      pendingRegistration.fullName,
      otp,
    );

    return {
      message: 'A new OTP has been sent',
    };
  }

  private generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('New password and confirmation do not match');
    }

    const user = await this.userService.findById(userId, true);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentPasswordMatched = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordMatched) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.userService.save(user);

    return {
      message: 'Password changed successfully. Please login again.',
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userService.findByEmail(forgotPasswordDto.email);

    if (!user) {
      throw new BadRequestException('No account found with this email');
    }

    if (!user.isVerified) {
      throw new BadRequestException(
        'Please verify your email before resetting password',
      );
    }

    const otp = this.generateOtp();
    user.passwordResetOtp = await bcrypt.hash(otp, 10);
    user.passwordResetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await this.userService.save(user);
    await this.mailService.sendPasswordResetOtp(user.email, user.fullName, otp);

    return {
      message: 'Password reset OTP has been sent',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    if (resetPasswordDto.newPassword !== resetPasswordDto.confirmPassword) {
      throw new BadRequestException('New password and confirmation do not match');
    }

    const user = await this.userService.findByEmailForPasswordReset(
      resetPasswordDto.email,
    );

    if (!user || !user.passwordResetOtp || !user.passwordResetOtpExpiresAt) {
      throw new BadRequestException('Invalid email or OTP');
    }

    if (user.passwordResetOtpExpiresAt < new Date()) {
      throw new BadRequestException('OTP expired. Please request a new OTP');
    }

    const isOtpMatched = await bcrypt.compare(
      resetPasswordDto.otp,
      user.passwordResetOtp,
    );

    if (!isOtpMatched) {
      throw new BadRequestException('Invalid email or OTP');
    }

    user.password = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    user.passwordResetOtp = null;
    user.passwordResetOtpExpiresAt = null;
    await this.userService.save(user);

    return {
      message: 'Password reset successfully. You can now login.',
    };
  }
}
