import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'aiub_commute_connect_secret',
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
