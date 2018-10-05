import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from '@/auth/auth.service';
import { JwtStrategy } from '@/auth/jwt.strategy';
import { AuthController } from '@/auth/auth.controller';
import { SharedModule } from '@/shared/shared.module';

@Module({
  controllers: [AuthController],
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secretOrPrivateKey: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: +process.env.JWT_EXPIRY,
      },
    }),
    SharedModule,
  ],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
