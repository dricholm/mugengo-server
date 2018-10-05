import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@/shared/services/config.service';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService],
    }).compile();
    service = module.get<ConfigService>(ConfigService);
  });

  it('should set environment variables', () => {
    expect(service).toBeDefined();
    expect(service.config.NODE_ENV).toBe('test');
    expect(service.config.CRYPTO_SECRET).toBeDefined();
    expect(service.config.JWT_SECRET).toBeDefined();
    expect(service.config.PORT).toBeDefined();
    expect(service.config.TYPEORM_CONNECTION).toBeDefined();
    expect(service.config.TYPEORM_HOST).toBeDefined();
    expect(service.config.TYPEORM_USERNAME).toBeDefined();
    expect(service.config.TYPEORM_PASSWORD).toBeDefined();
    expect(service.config.TYPEORM_DATABASE).toBeDefined();
    expect(service.config.TYPEORM_PORT).toBeDefined();
    expect(service.config.TYPEORM_SYNCHRONIZE).toBeDefined();
    expect(service.config.TYPEORM_ENTITIES).toBeDefined();
    expect(service.config.TYPEORM_MIGRATIONS).toBeDefined();
    expect(service.config.TYPEORM_LOGGING).toBeDefined();
  });
});
