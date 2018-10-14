import { Controller, Get, UseGuards, Patch, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CurrentUser } from '@/decorators';
import { UserEntity, UserLanguagesEntity } from '@/entities';
import { SettingsService } from './settings.service';
import { UpdateProfileDto } from '@/dtos';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('profile')
  @UseGuards(AuthGuard())
  async getProfile(@CurrentUser() currentUser: UserEntity) {
    const user: UserEntity = await this.settingsService.getUserWithLanguages(
      currentUser
    );
    return {
      age: user.age,
      country: user.country,
      languages: user.languages.map((language: UserLanguagesEntity) => ({
        code: language.code,
        level: language.level,
      })),
      name: user.name,
    };
  }

  @Patch('profile')
  @UseGuards(AuthGuard())
  async updateProfile(
    @CurrentUser() currentUser: UserEntity,
    @Body() profileDto: UpdateProfileDto
  ) {
    await this.settingsService.updateProfile(currentUser, profileDto);
  }
}
