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

describe('SettingsController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let entityManager: EntityManager;

  let user: UserEntity;
  let accessToken: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        AuthModule,
        SettingsModule,
        TypeOrmModule.forRoot(),
        SharedModule,
      ],
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

  it('should update profile', async () => {
    await request(app.getHttpServer())
      .patch('/settings/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        age: 23,
        country: 'ts',
        languages: [{ code: 'tst', level: 2 }],
        name: 'New name',
      })
      .expect(200);
  });

  it('should get profile', async () => {
    const result: any = await request(app.getHttpServer())
      .get('/settings/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(result.body).toEqual({
      age: 23,
      country: 'ts',
      languages: [{ code: 'tst', level: 2 }],
      name: 'New name',
    });
  });
});
