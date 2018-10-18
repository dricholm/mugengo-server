import { Controller, Post, HttpCode, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserSearchDto } from '@/dtos';
import { CurrentUser } from '@/decorators';
import { UserEntity } from '@/entities';
import { SearchService } from './search.service';

@Controller('user')
export class UserController {
  constructor(private readonly searchService: SearchService) {}

  @Post('search')
  @UseGuards(AuthGuard())
  @HttpCode(200)
  async search(@CurrentUser() user: UserEntity, @Body() data: UserSearchDto) {
    return this.searchService.search(user.id, data);
  }
}
