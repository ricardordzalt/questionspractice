import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { AuthUser } from '../auth/types/auth-user.type';
import { ok, okList } from '../common/types/api-response.type';
import { CreateTagDto } from './dto/create-tag.dto';
import { ListTagsQueryDto } from './dto/list-tags-query.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagsService } from './tags.service';

@Controller('tags')
@UseGuards(AuthGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  async list(@CurrentUser() user: AuthUser, @Query() query: ListTagsQueryDto) {
    const result = await this.tagsService.list(user.id, query);
    return okList(result.data, result.meta);
  }

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() body: CreateTagDto) {
    const tag = await this.tagsService.create(user.id, body);
    return ok(tag);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: UpdateTagDto,
  ) {
    const tag = await this.tagsService.update(user.id, id, body);
    return ok(tag);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    const result = await this.tagsService.remove(user.id, id);
    return ok(result);
  }
}
