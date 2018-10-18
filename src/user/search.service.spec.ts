import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection, EntityManager } from 'typeorm';

import { SearchService } from './search.service';
import { UserEntity, UserLanguagesEntity } from '@/entities';
import { TestUtilities } from '@/utilities/test-utilities';

describe('SearchService', () => {
  let service: SearchService;
  let connection: Connection;
  let entityManager: EntityManager;
  const users: Array<UserEntity> = [];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot()],
      providers: [SearchService],
    }).compile();
    service = module.get<SearchService>(SearchService);
    connection = module.get<Connection>(Connection);
    entityManager = module.get<EntityManager>(EntityManager);
    await connection.synchronize(true);
    users.push(await TestUtilities.createUser(entityManager, {}));
    users.push(
      await TestUtilities.createUser(entityManager, { age: 120, country: 'US' })
    );
    await TestUtilities.addLanguage(entityManager, users[1], {
      code: 'en',
      level: 4,
    });
    users.push(
      await TestUtilities.createUser(entityManager, { country: 'FR' })
    );
    await TestUtilities.addLanguage(entityManager, users[2], {
      code: 'fr',
      level: 4,
    });
    await TestUtilities.addLanguage(entityManager, users[2], {
      code: 'de',
      level: 3,
    });
    users.push(
      await TestUtilities.createUser(entityManager, { age: 100, country: 'HU' })
    );
    users.push(
      await TestUtilities.createUser(entityManager, { country: 'DE' })
    );
    await TestUtilities.addLanguage(entityManager, users[4], {
      code: 'de',
      level: 5,
    });
  });

  afterAll(async () => {
    entityManager.delete(UserEntity, {});
    entityManager.delete(UserLanguagesEntity, {});
    await connection.close();
  });

  it('should return all users except current one', async () => {
    const result: Array<UserEntity> = await service.search(users[0].id, {
      country: null,
      fromAge: null,
      languages: [],
      name: null,
      toAge: null,
    });

    expect(result.length).toBe(users.length - 1);
    result.every((user: UserEntity) => user.id !== users[0].id);
  });

  it('should filter by name', async () => {
    const result: Array<UserEntity> = await service.search(users[0].id, {
      country: null,
      fromAge: null,
      languages: [],
      name: users[2].name.toLocaleLowerCase(),
      toAge: null,
    });

    expect(result.length).toBe(1);
    expect(result[0].id).toBe(users[2].id);
  });

  it('should filter by min age', async () => {
    const result: Array<UserEntity> = await service.search(users[0].id, {
      country: null,
      fromAge: 120,
      languages: [],
      name: null,
      toAge: null,
    });

    expect(result.length).toBe(1);
    expect(result[0].id).toBe(users[1].id);
  });

  it('should filter by max age', async () => {
    const result: Array<UserEntity> = await service.search(users[0].id, {
      country: null,
      fromAge: null,
      languages: [],
      name: null,
      toAge: 100,
    });

    expect(result.length).toBe(users.length - 2);
    result.every(
      (user: UserEntity) => user.id !== users[0].id || user.id !== users[1].id
    );
  });

  it('should filter by age interval', async () => {
    const result: Array<UserEntity> = await service.search(users[0].id, {
      country: null,
      fromAge: 100,
      languages: [],
      name: null,
      toAge: 120,
    });

    expect(result.length).toBe(2);
    result.every(
      (user: UserEntity) => user.id === users[1].id || user.id !== users[4].id
    );
  });

  it('should filter by country', async () => {
    const result: Array<UserEntity> = await service.search(users[0].id, {
      country: 'HU',
      fromAge: null,
      languages: [],
      name: null,
      toAge: null,
    });

    expect(result.length).toBe(1);
    expect(result[0].id).toBe(users[3].id);
  });

  it('should filter by language, level exactly', async () => {
    const result: Array<UserEntity> = await service.search(users[0].id, {
      country: null,
      fromAge: null,
      languages: [{ code: 'de', level: 3, relation: 2 }],
      name: null,
      toAge: null,
    });

    expect(result.length).toBe(1);
    expect(result[0].id).toBe(users[2].id);
  });

  it('should filter by language, level at least', async () => {
    const result: Array<UserEntity> = await service.search(users[0].id, {
      country: null,
      fromAge: null,
      languages: [{ code: 'de', level: 3, relation: 1 }],
      name: null,
      toAge: null,
    });

    expect(result.length).toBe(2);
    result.every(
      (user: UserEntity) => user.id === users[2].id || user.id !== users[4].id
    );
  });

  it('should filter by languages', async () => {
    const result: Array<UserEntity> = await service.search(users[0].id, {
      country: null,
      fromAge: null,
      languages: [
        { code: 'de', level: 3, relation: 1 },
        { code: 'fr', level: 4, relation: 2 },
      ],
      name: null,
      toAge: null,
    });

    expect(result.length).toBe(1);
    expect(result[0].id).toBe(users[2].id);
  });

  it('should filter by everything', async () => {
    const result: Array<UserEntity> = await service.search(users[0].id, {
      country: 'FR',
      fromAge: 1,
      languages: [
        { code: 'de', level: 3, relation: 1 },
        { code: 'fr', level: 4, relation: 2 },
      ],
      name: users[2].name,
      toAge: 150,
    });

    expect(result.length).toBe(1);
    expect(result[0].id).toBe(users[2].id);
  });
});
