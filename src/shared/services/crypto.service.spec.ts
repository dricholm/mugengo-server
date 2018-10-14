import { Test, TestingModule } from '@nestjs/testing';

import { CryptoService } from '@/shared/services/crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoService],
    }).compile();
    service = module.get<CryptoService>(CryptoService);
  });

  it('should encrypt and decrypt value', () => {
    const string = 'stringToBeEncrypted';
    const encrypted = service.encrypt(string);
    expect(encrypted).not.toBe(string);
    const decrypted = service.decrypt(encrypted);
    expect(decrypted).toBe(string);
  });
});
