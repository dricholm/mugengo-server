import { Injectable } from '@nestjs/common';
import { EntityManager, SelectQueryBuilder } from 'typeorm';

import { UserSearchDto } from '@/dtos';
import { UserEntity, UserLanguagesEntity } from '@/entities';

@Injectable()
export class SearchService {
  constructor(private readonly entityManager: EntityManager) {}

  async search(
    currentUserId: number,
    data: UserSearchDto
  ): Promise<Array<UserEntity>> {
    const queryBuilder: SelectQueryBuilder<UserEntity> = this.entityManager
      .createQueryBuilder(UserEntity, 'users')
      .leftJoin('users.languages', 'languages')
      .where('users.id != :currentUserId', { currentUserId });

    if (data.name != null && data.name !== '') {
      this.whereName(queryBuilder, data.name);
    }

    if (data.fromAge != null || data.toAge != null) {
      this.whereAge(queryBuilder, data.fromAge, data.toAge);
    }

    if (data.country != null) {
      this.whereCountry(queryBuilder, data.country);
    }

    if (data.languages != null) {
      data.languages.forEach(
        (language: { code: string; level: number; relation: number }) => {
          this.whereLanguage(
            queryBuilder,
            language.code,
            language.level,
            language.relation
          );
        }
      );
    }

    // TODO: Add pagination, order by
    queryBuilder.select([
      'users.id',
      'users.name',
      'users.country',
      'users.age',
      'languages.code',
      'languages.level',
    ]);

    return queryBuilder.getMany();
  }

  private whereName(
    qb: SelectQueryBuilder<UserEntity>,
    name: string
  ): SelectQueryBuilder<UserEntity> {
    return qb.andWhere('users.name ILIKE :name', {
      name: `%${name}%`,
    });
  }

  private whereAge(
    qb: SelectQueryBuilder<UserEntity>,
    fromAge: number,
    toAge: number
  ): SelectQueryBuilder<UserEntity> {
    if (fromAge != null) {
      if (toAge != null) {
        return qb.andWhere('users.age BETWEEN :fromAge AND :toAge', {
          fromAge,
          toAge,
        });
      } else {
        return qb.andWhere('users.age >= :fromAge', {
          fromAge,
        });
      }
    } else {
      return qb.andWhere('users.age <= :toAge', { toAge });
    }
  }

  private whereCountry(
    qb: SelectQueryBuilder<UserEntity>,
    country: string
  ): SelectQueryBuilder<UserEntity> {
    return qb.andWhere('users.country = :country', { country });
  }

  private whereLanguage(
    qb: SelectQueryBuilder<UserEntity>,
    code: string,
    level: number,
    relation: number
  ): SelectQueryBuilder<UserEntity> {
    return qb.andWhere((queryBuilder: SelectQueryBuilder<UserEntity>) => {
      let subQuery: SelectQueryBuilder<UserLanguagesEntity> = queryBuilder
        .subQuery()
        .select()
        .from(UserLanguagesEntity, 'languages')
        .where('"userId" = "users"."id"')
        .andWhere('code = :code', { code });

      switch (relation) {
        case 1:
          subQuery = subQuery.andWhere('level >= :level', { level });
          break;

        case 2:
          subQuery = subQuery.andWhere('level = :level', { level });
          break;

        default:
          break;
      }

      return `EXISTS ${subQuery.getQuery()}`;
    });
  }
}
