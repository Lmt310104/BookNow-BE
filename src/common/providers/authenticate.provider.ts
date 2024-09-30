import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { JWT_ACCESS_STRATEGY } from 'src/utils/constants';
import { ExtractJwt, Strategy } from 'passport-jwt';
@Injectable()
export class AtStrategyProvider extends PassportStrategy(
  Strategy,
  JWT_ACCESS_STRATEGY,
) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt_access_secret'),
    });
  }
  async validate(payload: any) {
    return { id: payload.id, role: payload.role };
  }
}
