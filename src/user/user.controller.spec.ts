import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityManager, Connection } from 'typeorm';

import { UserController } from './user.controller';
import { SearchService } from './search.service';
import { UserSearchDto } from '@/dtos';
import { UserEntity } from '@/entities';
import { TestUtilities } from '@/utilities/test-utilities';

const mockSearchService = {
  search: jest.fn(),
};

describe('User Controller', () => {
  let module: TestingModule;
  let controller: UserController;
  let connection: Connection;
  let entityManager: EntityManager;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [UserController],
      imports: [TypeOrmModule.forRoot()],
      providers: [{ provide: SearchService, useValue: mockSearchService }],
    }).compile();
    controller = module.get<UserController>(UserController);
    connection = module.get<Connection>(Connection);
    entityManager = module.get<EntityManager>(EntityManager);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await entityManager.delete(UserEntity, {});
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should call SearchService.search', async () => {
    const data: UserSearchDto = {
      country: 'CT',
      fromAge: 1,
      languages: [],
      name: 'name',
      toAge: 99,
    };
    const user: UserEntity = await TestUtilities.createUser(entityManager, {});
    await controller.search(user, data);

    expect(mockSearchService.search).toHaveBeenCalledWith(user.id, data);
  });
});
