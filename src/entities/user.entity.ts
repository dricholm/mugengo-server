import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TokenEntity } from '@/entities/token.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(type => TokenEntity, token => token.user)
  tokens: TokenEntity[];

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 100 })
  name: string;

  @Column()
  password: string;

  @Column({ default: false })
  public: boolean;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  age: number;

  @Column({ nullable: true })
  gender: number;

  @Column({ type: 'text', nullable: true })
  about: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: number;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: number;
}
