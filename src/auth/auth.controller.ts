import {
  Controller,
  Post,
  Body,
  BadRequestException,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CurrentUser } from '@/decorators';
import { RegisterDto, TokenDto, OAuthDto, LogoutDto } from '@/dtos';
import { UserEntity } from '@/entities';
import { AuthService } from '@/auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() registerDto: RegisterDto) {
    try {
      await this.authService.createUser(
        registerDto.email,
        registerDto.name,
        registerDto.password
      );
    } catch (error) {
      // TODO: If email was already registered send a notification
      return;
    }
    // TODO: Implement verification token
  }

  @Post('token')
  async token(@Body() tokenDto: TokenDto): Promise<OAuthDto> {
    switch (tokenDto.grant_type) {
      case 'password':
        return this.authService.getTokenFromPassword(
          tokenDto.email,
          tokenDto.password
        );

      case 'refresh_token':
        return this.authService.getTokenFromRefreshToken(
          tokenDto.refresh_token
        );

      default:
        throw new BadRequestException('Invalid grant type');
    }
  }

  @Post('logout')
  @UseGuards(AuthGuard())
  @HttpCode(204)
  async logout(
    @CurrentUser() currentUser: UserEntity,
    @Body() logoutDto: LogoutDto
  ) {
    await this.authService.logout(currentUser, logoutDto.refreshToken);
  }
}
