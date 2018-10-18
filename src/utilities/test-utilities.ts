import { EntityManager } from 'typeorm';
import * as faker from 'faker';
import * as jwt from 'jsonwebtoken';

import { UserEntity, UserLanguagesEntity } from '@/entities';
import { Utilities } from '@/utilities/utilities';
import { JwtPayload } from '@/auth/jwt-payload.interface';

export class TestUtilities {
  static async createUser(
    entityManager: EntityManager,
    userData: Partial<UserEntity>
  ): Promise<UserEntity> {
    const user: UserEntity = entityManager.create(UserEntity, {
      age: faker.random.number({ min: 20, max: 99 }),
      country: faker.address.countryCode(),
      email: faker.internet.email(null, null, 'mugengo.com'),
      languages: [],
      name: faker.name.findName(),
      password: faker.internet.password(),
      ...userData,
    });
    user.password = await Utilities.hash(user.password);
    return entityManager.save(user);
  }

  static async addLanguage(
    entityManager: EntityManager,
    user: UserEntity,
    languageData: Partial<UserLanguagesEntity>
  ): Promise<UserLanguagesEntity> {
    const language: UserLanguagesEntity = entityManager.create(
      UserLanguagesEntity,
      {
        code: faker.random.locale(),
        level: faker.random.number({ min: 1, max: 4 }),
        user,
        ...languageData,
      }
    );
    return entityManager.save(language);
  }

  static generateAccessToken(user: UserEntity): string {
    const payload: JwtPayload = { email: user.email };
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
    });
  }

  static encrypt(plain: string): string {
    return Utilities.encrypt(plain, process.env.CRYPTO_SECRET);
  }

  static decrypt(encrypted: string): string {
    return Utilities.decrypt(encrypted, process.env.CRYPTO_SECRET);
  }
}
