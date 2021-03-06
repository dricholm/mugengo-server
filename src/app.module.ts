import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/auth/auth.module';
import { SharedModule } from '@/shared/shared.module';
import { SettingsModule } from '@/settings/settings.module';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    AuthModule,
    SharedModule,
    SettingsModule,
    UserModule,
  ],
})
export class AppModule {}
