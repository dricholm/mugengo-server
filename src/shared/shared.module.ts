import { Module } from '@nestjs/common';

import { ConfigService } from '@/shared/services/config.service';
import { CryptoService } from '@/shared/services/crypto.service';

@Module({
  exports: [ConfigService, CryptoService],
  providers: [
    { provide: ConfigService, useValue: new ConfigService() },
    CryptoService,
  ],
})
export class SharedModule {}
