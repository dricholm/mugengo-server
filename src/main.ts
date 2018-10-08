import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

import { AppModule } from '@/app.module';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);

  if (process.env.CORS_ORIGIN) {
    app.enableCors({
      origin: process.env.CORS_ORIGIN,
    });
  }

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  await app.listen(process.env.PORT);
}

bootstrap();
