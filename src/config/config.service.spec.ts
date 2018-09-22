import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: new ConfigService('.env.example'),
        },
      ],
    }).compile();
    service = module.get<ConfigService>(ConfigService);
  });

  it('should set to defaults if using .env.example', () => {
    expect(service).toBeDefined();
    expect(service.config.NODE_ENV).toBe('development');
    expect(service.config.PORT).toBe(3000);
    expect(service.config.TYPEORM_CONNECTION).toBe('postgres');
    expect(service.config.TYPEORM_HOST).toBe('localhost');
    expect(service.config.TYPEORM_USERNAME).toBe('root');
    expect(service.config.TYPEORM_PASSWORD).toBe('');
    expect(service.config.TYPEORM_DATABASE).toBe('mugengo');
    expect(service.config.TYPEORM_PORT).toBe(5432);
    expect(service.config.TYPEORM_SYNCHRONIZE).toBe(true);
    expect(service.config.TYPEORM_ENTITIES).toBe('src/**/**.entity.ts');
    expect(service.config.TYPEORM_MIGRATIONS).toBe('src/**/**.migration.ts');
    expect(service.config.TYPEORM_LOGGING).toBe(false);
  });
});
