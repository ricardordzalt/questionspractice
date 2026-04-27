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
import { CreateTopicDto } from './dto/create-topic.dto';
import { ListTopicsQueryDto } from './dto/list-topics-query.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { TopicsService } from './topics.service';

@Controller('topics')
@UseGuards(AuthGuard)
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get()
  async list(
    @CurrentUser() user: AuthUser,
    @Query() query: ListTopicsQueryDto,
  ) {
    const result = await this.topicsService.list(user.id, query);
    return okList(result.data, result.meta);
  }

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() body: CreateTopicDto) {
    const topic = await this.topicsService.create(user.id, body);
    return ok(topic);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: UpdateTopicDto,
  ) {
    const topic = await this.topicsService.update(user.id, id, body);
    return ok(topic);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    const result = await this.topicsService.remove(user.id, id);
    return ok(result);
  }
}
