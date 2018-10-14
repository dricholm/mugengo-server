import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection, EntityManager } from 'typeorm';

import { SettingsService } from './settings.service';
import { UserEntity, UserLanguagesEntity } from '@/entities';
import { TestUtilities } from '@/utilities/test-utilities';

describe('SettingsService', () => {
  let service: SettingsService;
  let connection: Connection;
  let entityManager: EntityManager;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot()],
      providers: [SettingsService],
    }).compile();
    service = module.get<SettingsService>(SettingsService);
    connection = module.get<Connection>(Connection);
    entityManager = module.get<EntityManager>(EntityManager);
    await connection.synchronize(true);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    entityManager.delete(UserEntity, {});
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should get profile with languages', async () => {
    const user: UserEntity = await TestUtilities.createUser(entityManager, {
      age: 21,
      country: 'ct',
      name: 'Test user',
    });
    const language: UserLanguagesEntity = entityManager.create(
      UserLanguagesEntity,
      {
        code: 'tst',
        level: 1,
        user,
      }
    );
    await entityManager.save(language);

    const result: UserEntity = await service.getUserWithLanguages(user);

    expect(result.email).toBe(user.email);
    expect(result.languages).toBeDefined();
    expect(result.languages.length).toBe(1);
    expect(result.languages[0].code).toBe(language.code);
    expect(result.languages[0].level).toBe(language.level);
  });

  it('should update profile', async () => {
    const user: UserEntity = await TestUtilities.createUser(entityManager, {
      age: 21,
      country: 'ct',
      name: 'Test user',
    });
    await service.updateProfile(user, {
      age: 22,
      country: 'nw',
      languages: [{ code: 'tst', level: 2 }],
      name: 'New name',
    });

    const userCheck: UserEntity = await entityManager.findOne(
      UserEntity,
      {},
      { relations: ['languages'] }
    );
    expect(userCheck.age).toBe(22);
    expect(userCheck.country).toBe('nw');
    expect(userCheck.name).toBe('New name');
    expect(userCheck.languages).toBeDefined();
    expect(userCheck.languages.length).toBe(1);
    expect(userCheck.languages[0].code).toBe('tst');
    expect(userCheck.languages[0].level).toBe(2);
  });

  it('should update profile (insert & update languages)', async () => {
    const user: UserEntity = await TestUtilities.createUser(entityManager, {
      age: 21,
      country: 'ct',
      name: 'Test user',
    });
    const language: UserLanguagesEntity = entityManager.create(
      UserLanguagesEntity,
      {
        code: 'tst',
        level: 1,
        user,
      }
    );
    await entityManager.save(language);

    await service.updateProfile(user, {
      age: 22,
      country: 'nw',
      languages: [{ code: 'tst', level: 3 }, { code: 'nw', level: 2 }],
      name: 'New name',
    });

    const userCheck: UserEntity = await entityManager.findOne(
      UserEntity,
      {},
      { relations: ['languages'] }
    );
    expect(userCheck.age).toBe(22);
    expect(userCheck.country).toBe('nw');
    expect(userCheck.name).toBe('New name');
    expect(userCheck.languages).toBeDefined();
    expect(userCheck.languages.length).toBe(2);
    expect(userCheck.languages[0].code).toBe('tst');
    expect(userCheck.languages[0].level).toBe(3);
    expect(userCheck.languages[1].code).toBe('nw');
    expect(userCheck.languages[1].level).toBe(2);
  });

  it('should update profile (insert & delete language)', async () => {
    const user: UserEntity = await TestUtilities.createUser(entityManager, {
      age: 21,
      country: 'ct',
      name: 'Test user',
    });
    const language: UserLanguagesEntity = entityManager.create(
      UserLanguagesEntity,
      {
        code: 'tst',
        level: 1,
        user,
      }
    );
    await entityManager.save(language);

    await service.updateProfile(user, {
      age: 22,
      country: 'nw',
      languages: [{ code: 'nw', level: 2 }],
      name: 'New name',
    });

    const userCheck: UserEntity = await entityManager.findOne(
      UserEntity,
      {},
      { relations: ['languages'] }
    );
    expect(userCheck.age).toBe(22);
    expect(userCheck.country).toBe('nw');
    expect(userCheck.name).toBe('New name');
    expect(userCheck.languages).toBeDefined();
    expect(userCheck.languages.length).toBe(1);
    expect(userCheck.languages[0].code).toBe('nw');
    expect(userCheck.languages[0].level).toBe(2);
  });

  it('should update profile (delete language)', async () => {
    const user: UserEntity = await TestUtilities.createUser(entityManager, {
      age: 21,
      country: 'ct',
      name: 'Test user',
    });
    const language: UserLanguagesEntity = entityManager.create(
      UserLanguagesEntity,
      {
        code: 'tst',
        level: 1,
        user,
      }
    );
    await entityManager.save(language);

    await service.updateProfile(user, {
      age: 22,
      country: 'nw',
      languages: [],
      name: 'New name',
    });

    const userCheck: UserEntity = await entityManager.findOne(
      UserEntity,
      {},
      { relations: ['languages'] }
    );
    expect(userCheck.age).toBe(22);
    expect(userCheck.country).toBe('nw');
    expect(userCheck.name).toBe('New name');
    expect(userCheck.languages).toBeDefined();
    expect(userCheck.languages.length).toBe(0);
  });
});
