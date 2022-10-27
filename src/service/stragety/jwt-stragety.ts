import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../../common/interfaces/jwt.interface';
import { UserService } from '../user.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private reflector: Reflector,
    private readonly userService: UserService,
  ) {
    super(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: 'secret',
      },

      async (payload: any, next: any) => await this.validate(payload, next),
    );
  }

  async validate(payload: JwtPayload, done: any) {
    const user = await this.userService.getUserById(payload.userId);
    if (!user) {
      return done(new UnauthorizedException(), false);
    }
    done(null, user);
  }
}
