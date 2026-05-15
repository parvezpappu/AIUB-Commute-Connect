import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';

function extractTokenFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());

  const accessTokenCookie = cookies.find((cookie) =>
    cookie.startsWith('accessToken='),
  );

  if (!accessTokenCookie) {
    return null;
  }

  return accessTokenCookie.split('=')[1];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractTokenFromCookie]),
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'aiub_commute_connect_secret',
      ),
    });
  }

  async validate(payload: { sub: number; aiubId: string; role: string }) {
    const user = await this.userService.findByAiubId(payload.aiubId);

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    const { password, ...result } = user;
    return result;
  }
}
