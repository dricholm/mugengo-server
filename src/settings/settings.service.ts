import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { UserEntity, UserLanguagesEntity } from '@/entities';
import { UpdateProfileDto } from '@/dtos';

@Injectable()
export class SettingsService {
  constructor(private readonly entityManager: EntityManager) {}

  async getUserWithLanguages({ id }: UserEntity) {
    return this.entityManager.findOne(
      UserEntity,
      { id },
      { relations: ['languages'] }
    );
  }

  async updateProfile(
    user: UserEntity,
    { age, country, name, languages }: UpdateProfileDto
  ) {
    await this.entityManager.update(
      UserEntity,
      { id: user.id },
      {
        age,
        country,
        name,
      }
    );

    if (languages.length === 0) {
      await this.entityManager.delete(UserLanguagesEntity, { user });
    } else {
      const upserts = languages.map(
        (language: { code: string; level: number }) =>
          this.entityManager
            .createQueryBuilder()
            .insert()
            .into(UserLanguagesEntity)
            .values({ code: language.code, level: language.level, user })
            .onConflict('("userId", "code") DO UPDATE SET level = :level')
            .setParameters({ level: language.level })
            .execute()
      );
      await Promise.all(upserts);

      await this.entityManager
        .createQueryBuilder()
        .delete()
        .from(UserLanguagesEntity)
        .where('"userId" = :userId AND code NOT IN (:...codes)', {
          codes: languages.map(
            (language: { code: string; level: number }) => language.code
          ),
          userId: user.id,
        })
        .execute();
    }
  }
}
