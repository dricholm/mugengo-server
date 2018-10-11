import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Connection, EntityManager } from 'typeorm';

import { OAuthDto } from '@/dtos';
import { UserEntity, TokenEntity, RefreshTokenEntity } from '@/entities';
import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { SharedModule } from '@/shared/shared.module';
import { TestUtilities } from '@/utilities/test-utilities';
import { PassportModule } from '@nestjs/passport';

describe('Auth Controller', () => {
  let controller: AuthController;
  let connection: Connection;
  let entityManager: EntityManager;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      imports: [
        TypeOrmModule.forRoot(),
        JwtModule.register({
          secretOrPrivateKey: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: +process.env.JWT_EXPIRY,
          },
        }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        SharedModule,
      ],
      providers: [AuthService],
    }).compile();
    controller = module.get<AuthController>(AuthController);
    connection = module.get<Connection>(Connection);
    entityManager = module.get<EntityManager>(EntityManager);
    await connection.synchronize(true);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await entityManager.delete(UserEntity, {});
    await entityManager.delete(TokenEntity, {});
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should create user', async () => {
    await controller.register({
      email: 'user@email.com',
      name: 'Username',
      password: 'password',
    });
    const user: UserEntity = await entityManager.findOne(UserEntity, {});
    expect(user.email).toBe('user@email.com');
    expect(user.name).toBe('Username');
    expect(user.password).toBeTruthy();
  });

  it('should return token on password grant', async () => {
    const user: UserEntity = await TestUtilities.createUser(entityManager, {
      password: 'password',
    });

    const result: OAuthDto = await controller.token({
      email: user.email,
      grant_type: 'password',
      password: 'password',
      refresh_token: undefined,
    });

    expect(result.access_token).toBeTruthy();
    expect(result.expires_in).toBe(+process.env.JWT_EXPIRY);
    expect(result.refresh_token).toBeTruthy();
    expect(result.token_type).toBe('bearer');

    const tokenCheck: RefreshTokenEntity = await entityManager.findOne(
      RefreshTokenEntity,
      { token: TestUtilities.decrypt(result.refresh_token) },
      { relations: ['user'] }
    );
    expect(tokenCheck).toBeTruthy();
    expect(tokenCheck.user.id).toBe(user.id);
  });

  it('should return token on refresh_token grant', async () => {
    const user: UserEntity = await TestUtilities.createUser(entityManager, {
      password: 'password',
    });
    const token: RefreshTokenEntity = entityManager.create(RefreshTokenEntity, {
      user,
    });
    await entityManager.save(token);
    const encryptedToken = TestUtilities.encrypt(token.token);

    const result = await controller.token({
      email: undefined,
      grant_type: 'refresh_token',
      password: undefined,
      refresh_token: encryptedToken,
    });

    expect(result.access_token).toBeTruthy();
    expect(result.expires_in).toBe(+process.env.JWT_EXPIRY);
    expect(result.refresh_token).toBe(encryptedToken);
    expect(result.token_type).toBe('bearer');
  });

  it('should delete refresh token on logout', async () => {
    const user: UserEntity = await TestUtilities.createUser(entityManager, {
      password: 'password',
    });
    const token: RefreshTokenEntity = entityManager.create(RefreshTokenEntity, {
      user,
    });
    await entityManager.save(token);
    const encryptedToken = TestUtilities.encrypt(token.token);

    await controller.logout(user, { refreshToken: encryptedToken });

    const tokenCheck: RefreshTokenEntity = await entityManager.findOne(
      RefreshTokenEntity,
      {}
    );
    expect(tokenCheck).toBeUndefined();
  });
});
