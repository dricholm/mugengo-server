import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
} from 'typeorm';

import { UserEntity } from '@/entities';

@Entity('user_languages')
@Unique(['user', 'code'])
export class UserLanguagesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => UserEntity, user => user.languages, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @Column({ length: 5 })
  code: string;

  @Column()
  level: number;
}
