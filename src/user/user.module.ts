import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { UserController } from './user.controller';
import { SearchService } from './search.service';

@Module({
  controllers: [UserController],
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [SearchService],
})
export class UserModule {}
