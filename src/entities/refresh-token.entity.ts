import { ChildEntity } from 'typeorm';

import { TokenEntity } from '@/entities';

@ChildEntity()
export class RefreshTokenEntity extends TokenEntity {}
