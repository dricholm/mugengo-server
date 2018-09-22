import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';

@Module({
  controllers: [AppController],
  imports: [ConfigModule, TypeOrmModule.forRoot()],
  providers: [AppService],
})
export class AppModule {}
