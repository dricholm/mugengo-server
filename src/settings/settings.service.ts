import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { UserEntity } from '@/entities';
import { UpdateProfileDto } from '@/dtos';

@Injectable()
export class SettingsService {
  constructor(private readonly entityManager: EntityManager) {}

  async updateProfile(user: UserEntity, profile: UpdateProfileDto) {
    await this.entityManager.update(
      UserEntity,
      { id: user.id },
      { ...profile }
    );
  }
}
