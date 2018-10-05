import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { UserEntity } from '@/entities';
import { JwtPayload } from '@/auth/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<UserEntity> {
    const user = await this.entityManager.findOne(UserEntity, {
      email: payload.email,
      id: payload.id,
    });

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
