import { JwtService } from '@nestjs/jwt';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { OAuthDto } from '@/dtos';
import { UserEntity, RefreshTokenEntity } from '@/entities';
import { JwtPayload } from '@/auth/jwt-payload.interface';
import { CryptoService } from '@/shared/services/crypto.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly entityManager: EntityManager,
    private readonly cryptoService: CryptoService
  ) {}

  async createUser(email: string, name: string, password: string) {
    const user: UserEntity = this.entityManager.create(UserEntity, {
      email,
      name,
      password,
    });
    user.password = await this.cryptoService.hash(user.password);
    await this.entityManager.save(user);
  }

  async getTokenFromPassword(
    email: string,
    password: string
  ): Promise<OAuthDto> {
    const user: UserEntity = await this.entityManager.findOne(UserEntity, {
      email,
    });

    if (!user || !(await this.cryptoService.compare(password, user.password))) {
      throw new HttpException(
        'Email or password incorrect',
        HttpStatus.BAD_REQUEST
      );
    }

    const refreshToken: RefreshTokenEntity = await this.entityManager.create(
      RefreshTokenEntity,
      { user }
    );
    await this.entityManager.save(refreshToken);

    const accessToken = await this.generateAccessToken({
      email: user.email,
    });

    return {
      access_token: accessToken,
      expires_in: +process.env.JWT_EXPIRY,
      refresh_token: this.cryptoService.encrypt(refreshToken.token),
      token_type: 'bearer',
    };
  }

  async getTokenFromRefreshToken(refreshToken: string) {
    const token = await this.entityManager.findOne(
      RefreshTokenEntity,
      {
        token: this.cryptoService.decrypt(refreshToken),
      },
      { relations: ['user'] }
    );

    if (!token) {
      throw new HttpException('Invalid refresh token', HttpStatus.BAD_REQUEST);
    }

    await this.entityManager.update(RefreshTokenEntity, { id: token.id }, {});

    const accessToken = await this.generateAccessToken({
      email: token.user.email,
    });

    return {
      access_token: accessToken,
      expires_in: +process.env.JWT_EXPIRY,
      refresh_token: refreshToken,
      token_type: 'bearer',
    };
  }

  async logout(user: UserEntity, refreshToken: string) {
    const decrypted = this.cryptoService.decrypt(refreshToken);
    if (!decrypted) {
      throw new HttpException('Invalid refresh token', HttpStatus.BAD_REQUEST);
    }

    await this.entityManager.delete(RefreshTokenEntity, {
      token: decrypted,
      user,
    });
  }

  private generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }
}
