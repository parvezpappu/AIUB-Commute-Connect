import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { Roles } from './decorators/roles.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ResendVerificationOtpDto } from './dto/resend-verification-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyPasswordResetOtpDto } from './dto/verify-password-reset-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UserRole } from '../user/entities/user.entity';

const isProduction = process.env.NODE_ENV === 'production';
const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ('none' as const) : ('strict' as const),
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  registerUser(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.registerUser(createAuthDto);
  }

  @Post('login')
  async loginUser(
    @Body() loginAuthDto: LoginAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.authService.loginUser(loginAuthDto);

    res.cookie('accessToken', data.accessToken, {
      ...authCookieOptions,
      maxAge: 60 * 60 * 1000,
    });

    return {
      message: data.message,
      user: data.user,
    };
  }

  @Post('verify-email')
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('resend-verification-otp')
  resendVerificationOtp(
    @Body() resendVerificationOtpDto: ResendVerificationOtpDto,
  ) {
    return this.authService.resendVerificationOtp(resendVerificationOtpDto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('verify-password-reset-otp')
  verifyPasswordResetOtp(
    @Body() verifyPasswordResetOtpDto: VerifyPasswordResetOtpDto,
  ) {
    return this.authService.verifyPasswordResetOtp(verifyPasswordResetOtpDto);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('logout')
  logoutUser(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken', authCookieOptions);

    return {
      message: 'Logout successful',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @Post('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.changePassword(
      req.user.id,
      changePasswordDto,
    );

    res.clearCookie('accessToken', authCookieOptions);

    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @Get('me')
  getCurrentUser(@Req() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin-only')
  adminOnly() {
    return {
      message: 'Only admin can access this route',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Get('student-only')
  studentOnly() {
    return {
      message: 'Only student can access this route',
    };
  }
}
