import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TokenEntity, UserLanguagesEntity } from '@/entities';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(type => TokenEntity, token => token.user)
  tokens: TokenEntity[];

  @OneToMany(type => UserLanguagesEntity, userLanguage => userLanguage.user)
  languages: UserLanguagesEntity[];

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 100 })
  name: string;

  @Column()
  password: string;

  @Column({ length: 2, nullable: true })
  country: string;

  @Column({ nullable: true })
  age: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: number;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: number;
}
