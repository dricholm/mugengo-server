import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { EntityManager, Connection } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OAuthDto } from '@/dtos';
import { UserEntity, TokenEntity, RefreshTokenEntity } from '@/entities';
import { AuthService } from '@/auth/auth.service';
import { CryptoService } from '@/shared/services/crypto.service';

describe('AuthService', () => {
  let service: AuthService;
  let connection: Connection;
  let entityManager: EntityManager;
  let cryptoService: CryptoService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(),
        JwtModule.register({
          secretOrPrivateKey: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: +process.env.JWT_EXPIRY,
          },
        }),
      ],
      providers: [AuthService, CryptoService],
    }).compile();
    service = module.get<AuthService>(AuthService);
    connection = module.get<Connection>(Connection);
    entityManager = module.get<EntityManager>(EntityManager);
    cryptoService = module.get<CryptoService>(CryptoService);
    await connection.synchronize(true);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await entityManager.delete(UserEntity, {});
    await entityManager.delete(TokenEntity, {});
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should create user', async () => {
    jest.spyOn(cryptoService, 'hash').mockReturnValue('hashedValue');
    await service.createUser('user@email.com', 'Username', 'password');

    const userCheck: UserEntity = await entityManager.findOne(UserEntity, {
      email: 'user@email.com',
    });
    expect(userCheck).toBeTruthy();
    expect(userCheck.email).toBe('user@email.com');
    expect(userCheck.name).toBe('Username');
    expect(userCheck.password).toBe('hashedValue');
  });

  it('should throw 400 with invalid password (password grant)', async () => {
    const user: UserEntity = entityManager.create(UserEntity, {
      email: 'user@email.com',
      name: 'Username',
      password: 'password',
    });
    await entityManager.save(user);

    await expect(
      service.getTokenFromPassword(user.email, user.password)
    ).rejects.toThrowError('Email or password incorrect');
  });

  it('should throw 400 with invalid token (refresh_token grant)', async () => {
    await expect(
      service.getTokenFromRefreshToken('notExistingToken')
    ).rejects.toThrowError('Invalid refresh token');
  });

  it('should return tokens (password grant)', async () => {
    jest.spyOn(cryptoService, 'compare').mockReturnValue(true);
    const user: UserEntity = entityManager.create(UserEntity, {
      email: 'user@email.com',
      name: 'Username',
      password: 'password',
    });
    await entityManager.save(user);

    const result: OAuthDto = await service.getTokenFromPassword(
      user.email,
      user.password
    );

    expect(result).toBeTruthy();
    expect(result.access_token).toBeTruthy();
    expect(result.expires_in).toBe(+process.env.JWT_EXPIRY);
    expect(result.refresh_token).toBeTruthy();
    expect(result.token_type).toBe('bearer');
    const tokenCheck: RefreshTokenEntity = await entityManager.findOne(
      RefreshTokenEntity,
      {},
      { relations: ['user'] }
    );
    expect(tokenCheck.user.id).toBe(user.id);
  });

  it('should return tokens (refresh_token grant)', async () => {
    const user: UserEntity = entityManager.create(UserEntity, {
      email: 'user@email.com',
      name: 'Username',
      password: 'password',
    });
    await entityManager.save(user);
    const token: TokenEntity = entityManager.create(RefreshTokenEntity, {
      user,
    });
    await entityManager.save(token);
    jest.spyOn(cryptoService, 'decrypt').mockReturnValue(token.token);

    const result = await service.getTokenFromRefreshToken('encryptedToken');
    expect(result).toBeTruthy();
    expect(result.access_token).toBeTruthy();
    expect(result.expires_in).toBe(+process.env.JWT_EXPIRY);
    expect(result.refresh_token).toBe('encryptedToken');
    expect(result.token_type).toBe('bearer');
    const tokenCheck: RefreshTokenEntity = await entityManager.findOne(
      RefreshTokenEntity
    );
    expect(tokenCheck.updatedAt).not.toEqual(token.updatedAt);
  });

  it('should delete refresh token when logout', async () => {
    const user: UserEntity = entityManager.create(UserEntity, {
      email: 'user@email.com',
      name: 'Username',
      password: 'password',
    });
    await entityManager.save(user);
    const token: TokenEntity = entityManager.create(RefreshTokenEntity, {
      user,
    });
    await entityManager.save(token);
    jest.spyOn(cryptoService, 'decrypt').mockReturnValue(token.token);

    await service.logout(user, 'encryptedToken');
    const tokenCheck: RefreshTokenEntity = await entityManager.findOne(
      RefreshTokenEntity
    );
    expect(tokenCheck).toBeUndefined();
  });

  it('should throw when invalid token', async () => {
    const user: UserEntity = entityManager.create(UserEntity, {
      email: 'user@email.com',
      name: 'Username',
      password: 'password',
    });
    await entityManager.save(user);
    jest.spyOn(cryptoService, 'decrypt').mockReturnValue(null);

    await expect(service.logout(user, 'noToken')).rejects.toThrowError(
      'Invalid refresh token'
    );
  });
});
