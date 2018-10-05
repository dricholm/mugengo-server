import { Injectable } from '@nestjs/common';

import { ConfigService } from '@/shared/services/config.service';
import { Utilities } from '@/utilities/utilities';

@Injectable()
export class CryptoService {
  constructor(private readonly configService: ConfigService) {}

  encrypt(plain: string): string {
    return Utilities.encrypt(plain, this.configService.config.CRYPTO_SECRET);
  }

  decrypt(encrypted: string): string {
    return Utilities.decrypt(
      encrypted,
      this.configService.config.CRYPTO_SECRET
    );
  }

  async hash(plainString: string): Promise<string> {
    return Utilities.hash(plainString);
  }

  async compare(plainString: string, hashString: string): Promise<boolean> {
    return Utilities.compare(plainString, hashString);
  }
}
