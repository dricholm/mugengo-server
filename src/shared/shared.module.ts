import { Module } from '@nestjs/common';

import { CryptoService } from '@/shared/services/crypto.service';

@Module({
  exports: [CryptoService],
  providers: [CryptoService],
})
export class SharedModule {}
