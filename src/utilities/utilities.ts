import { compare, hash } from 'bcryptjs';
import * as crypto from 'crypto';

export class Utilities {
  static encrypt(plain: string, secret: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(secret),
      iv
    );
    let encrypted = cipher.update(plain);

    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  static decrypt(encrypted: string, secret: string): string {
    try {
      const textParts = encrypted.split(':');
      const iv = Buffer.from(textParts.shift(), 'hex');
      const encryptedText = Buffer.from(textParts.join(':'), 'hex');
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(secret),
        iv
      );
      let decrypted = decipher.update(encryptedText);

      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
    } catch (error) {
      return null;
    }
  }

  static async hash(plainString: string): Promise<string> {
    return hash(plainString, 10);
  }

  static async compare(
    plainString: string,
    hashString: string
  ): Promise<boolean> {
    return compare(plainString, hashString);
  }
}
