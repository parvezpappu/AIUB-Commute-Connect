import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(createAuthDto: CreateAuthDto) {
    return this.userService.create(createAuthDto);
  }

  async loginUser(loginAuthDto: LoginAuthDto) {
    const user = await this.userService.findByAiubId(loginAuthDto.aiubId);

    if (!user) {
      throw new UnauthorizedException('Invalid AIUB ID or password');
    }

    const isPasswordMatched = await bcrypt.compare(
      loginAuthDto.password,
      user.password,
    );

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid AIUB ID or password');
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
}
