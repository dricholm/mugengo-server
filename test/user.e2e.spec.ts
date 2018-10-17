import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '@/shared/shared.module';
import { Connection, EntityManager } from 'typeorm';
import { SettingsModule } from '@/settings/settings.module';
import { UserEntity } from '@/entities';
import { TestUtilities } from '@/utilities/test-utilities';
import { AuthModule } from '@/auth/auth.module';
import { UserModule } from '@/user/user.module';
import { UserSearchDto } from '@/dtos';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let entityManager: EntityManager;

  let user: UserEntity;
  let accessToken: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AuthModule, UserModule, TypeOrmModule.forRoot(), SharedModule],
    }).compile();
    connection = module.get<Connection>(Connection);
    entityManager = module.get<EntityManager>(EntityManager);

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    await app.init();
    await connection.synchronize(true);
    user = await TestUtilities.createUser(entityManager, {});
    accessToken = TestUtilities.generateAccessToken(user);
  });

  afterAll(async () => {
    await connection.synchronize(true);
    await connection.close();
    await app.close();
  });

  it('should search for user', async () => {
    const searchFor: UserEntity = await TestUtilities.createUser(
      entityManager,
      { age: 30, country: 'US', name: 'John' }
    );
    await TestUtilities.addLanguage(entityManager, searchFor, {
      code: 'en',
      level: 4,
    });
    const data: UserSearchDto = {
      country: 'US',
      fromAge: 2,
      languages: [{ code: 'en', level: 3, relation: 1 }],
      name: 'jo',
      toAge: 50,
    };
    const response = await request(app.getHttpServer())
      .post('/user/search')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(data)
      .expect(200);

    expect(response.body.length).toBe(1);
    expect(response.body[0].id).toBe(searchFor.id);
  });
});
