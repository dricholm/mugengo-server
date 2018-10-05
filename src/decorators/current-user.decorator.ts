import { createParamDecorator } from '@nestjs/common';

import { UserEntity } from '@/entities';

export const CurrentUser = createParamDecorator(
  (data, req): UserEntity => req.user
);
