import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection, EntityManager } from 'typeorm';

import { SettingsService } from './settings.service';
import { UserEntity } from '@/entities';
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

  it('should update profile', async () => {
    const user: UserEntity = await TestUtilities.createUser(entityManager, {
      age: 21,
      country: 'old',
      name: 'Test user',
    });
    await service.updateProfile(user, {
      age: 22,
      country: 'new',
      name: 'New name',
    });

    const userCheck: UserEntity = await entityManager.findOne(UserEntity, {});
    expect(userCheck.age).toBe(22);
    expect(userCheck.country).toBe('new');
    expect(userCheck.name).toBe('New name');
  });
});
