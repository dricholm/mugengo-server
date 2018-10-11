import { Controller, Get, UseGuards, Patch, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CurrentUser } from '@/decorators';
import { UserEntity } from '@/entities';
import { SettingsService } from './settings.service';
import { UpdateProfileDto } from '@/dtos';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('profile')
  @UseGuards(AuthGuard())
  getProfile(@CurrentUser() currentUser: UserEntity) {
    return {
      age: currentUser.age,
      country: currentUser.country,
      name: currentUser.name,
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
