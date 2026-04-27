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
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { ListAnswersQueryDto } from './dto/list-answers-query.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';

@Controller('answers')
@UseGuards(AuthGuard)
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Get()
  async list(
    @CurrentUser() user: AuthUser,
    @Query() query: ListAnswersQueryDto,
  ) {
    const result = await this.answersService.list(user.id, query);
    return okList(result.data, result.meta);
  }

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() body: CreateAnswerDto) {
    const answer = await this.answersService.create(user.id, body);
    return ok(answer);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: UpdateAnswerDto,
  ) {
    const answer = await this.answersService.update(user.id, id, body);
    return ok(answer);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    const result = await this.answersService.remove(user.id, id);
    return ok(result);
  }
}
