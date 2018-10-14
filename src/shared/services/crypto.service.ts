import { Injectable } from '@nestjs/common';

import { Utilities } from '@/utilities/utilities';

@Injectable()
export class CryptoService {
  encrypt(plain: string): string {
    return Utilities.encrypt(plain, process.env.CRYPTO_SECRET);
  }

  decrypt(encrypted: string): string {
    return Utilities.decrypt(encrypted, process.env.CRYPTO_SECRET);
  }

  async hash(plainString: string): Promise<string> {
    return Utilities.hash(plainString);
  }

  async compare(plainString: string, hashString: string): Promise<boolean> {
    return Utilities.compare(plainString, hashString);
  }
}
