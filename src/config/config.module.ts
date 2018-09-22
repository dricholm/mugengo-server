import { Module, Global } from '@nestjs/common';

import { ConfigService } from './config.service';

@Global()
@Module({
  exports: [ConfigService],
  providers: [
    {
      provide: ConfigService,
      useValue: new ConfigService(`${process.env.NODE_ENV}.env`),
    },
  ],
})
export class ConfigModule {}
