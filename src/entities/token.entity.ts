import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Generated,
  TableInheritance,
} from 'typeorm';

import { UserEntity } from '@/entities';

@Entity('tokens')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class TokenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Generated('uuid')
  token: string;

  @ManyToOne(type => UserEntity, user => user.tokens, { onDelete: 'CASCADE' })
  user: UserEntity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: number;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: number;
}
