import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  controllers: [SettingsController],
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [SettingsService],
})
export class SettingsModule {}
