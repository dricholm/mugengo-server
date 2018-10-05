import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as faker from 'faker';

import { AuthModule } from '@/auth/auth.module';
import { SharedModule } from '@/shared/shared.module';
import { Connection } from 'typeorm';
import { RegisterDto, TokenDto, LogoutDto } from '@/dtos';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  const registerDto: RegisterDto = {
    email: faker.internet.email(null, null, 'mugengo.com'),
    name: faker.name.findName(),
    password: faker.internet.password(8),
  };
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AuthModule, TypeOrmModule.forRoot(), SharedModule],
    }).compile();
    connection = module.get<Connection>(Connection);

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    await app.init();
    await connection.synchronize(true);
  });

  afterAll(async () => {
    await connection.synchronize(true);
    await app.close();
  });

  it('should return 400 if no data is given for register', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .expect(400);
  });

  it('should register new account', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto)
      .expect(201);
  });

  it('should provide token for registered account', async () => {
    const dto: TokenDto = {
      email: registerDto.email,
      grant_type: 'password',
      password: registerDto.password,
      refresh_token: null,
    };
    const result = await request(app.getHttpServer())
      .post('/auth/token')
      .send(dto)
      .expect(201);

    accessToken = result.body.access_token;
    refreshToken = result.body.refresh_token;
  });

  it('should refresh token', async () => {
    const dto: TokenDto = {
      email: null,
      grant_type: 'refresh_token',
      password: null,
      refresh_token: refreshToken,
    };
    const result = await request(app.getHttpServer())
      .post('/auth/token')
      .send(dto)
      .expect(201);

    accessToken = result.body.access_token;
    refreshToken = result.body.refresh_token;
  });

  it('should logout', async () => {
    const dto: LogoutDto = {
      refreshToken,
    };

    request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(dto)
      .expect(204);
  });
});
