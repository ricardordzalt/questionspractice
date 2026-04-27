import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { AuthUser } from '../auth/types/auth-user.type';
import { ok, okList } from '../common/types/api-response.type';
import { CreateQuestionDto } from './dto/create-question.dto';
import { ListQuestionsQueryDto } from './dto/list-questions-query.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionsService } from './questions.service';

@Controller('questions')
@UseGuards(AuthGuard)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  async list(
    @CurrentUser() user: AuthUser,
    @Query() query: ListQuestionsQueryDto,
  ) {
    const result = await this.questionsService.list(user.id, query);
    return okList(result.data, result.meta);
  }

  @Post('import')
  async importFromBody(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    const result = await this.questionsService.importFromPayload(user.id, body);
    return ok(result);
  }

  @Post('import/file')
  @UseInterceptors(FileInterceptor('file'))
  async importFromFile(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file?: { buffer: Buffer; originalname: string },
  ) {
    const result = await this.questionsService.importFromFile(user.id, file);
    return ok(result);
  }

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() body: CreateQuestionDto) {
    const question = await this.questionsService.create(user.id, body);
    return ok(question);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: UpdateQuestionDto,
  ) {
    const question = await this.questionsService.update(user.id, id, body);
    return ok(question);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    const result = await this.questionsService.remove(user.id, id);
    return ok(result);
  }
}
