import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection, EntityManager } from 'typeorm';
import { PassportModule } from '@nestjs/passport';

import { SettingsController } from './settings.controller';
import { UserEntity, UserLanguagesEntity } from '@/entities';
import { TestUtilities } from '@/utilities/test-utilities';
import { SettingsService } from './settings.service';

describe('Settings Controller', () => {
  let controller: SettingsController;
  let connection: Connection;
  let entityManager: EntityManager;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      imports: [
        TypeOrmModule.forRoot(),
        PassportModule.register({ defaultStrategy: 'jwt' }),
      ],
      providers: [SettingsService],
    }).compile();
    controller = module.get<SettingsController>(SettingsController);
    connection = module.get<Connection>(Connection);
    entityManager = module.get<EntityManager>(EntityManager);
    await connection.synchronize(true);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await entityManager.delete(UserEntity, {});
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should return profile', async () => {
    const user: UserEntity = await TestUtilities.createUser(entityManager, {});
    const language: UserLanguagesEntity = entityManager.create(
      UserLanguagesEntity,
      {
        code: 'tst',
        level: 1,
        user,
      }
    );
    await entityManager.save(language);

    const result = await controller.getProfile(user);

    expect(result).toEqual({
      age: user.age,
      country: user.country,
      languages: [{ code: 'tst', level: 1 }],
      name: user.name,
    });
  });

  it('should be successful at profile update', async () => {
    const user: UserEntity = await TestUtilities.createUser(entityManager, {});

    await controller.updateProfile(user, {
      age: 23,
      country: 'ct',
      languages: [{ code: 'tst', level: 3 }],
      name: 'new',
    });
  });
});
