import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DEFAULT_LIMIT,
  parseCursor,
  parseLimit,
} from '../common/lib/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { ListAnswersQueryDto } from './dto/list-answers-query.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';

@Injectable()
export class AnswersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: ListAnswersQueryDto) {
    await this.assertQuestionOwnership(userId, query.questionId);

    const limit = parseLimit(query.limit ?? DEFAULT_LIMIT);

    const items = await this.prisma.answer.findMany({
      where: {
        userId,
        questionId: query.questionId,
        deletedAt: null,
      },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
      take: limit + 1,
      ...(parseCursor(query.cursor)
        ? {
            cursor: parseCursor(query.cursor),
            skip: 1,
          }
        : {}),
    });

    const hasNextPage = items.length > limit;
    const data = hasNextPage ? items.slice(0, limit) : items;

    return {
      data,
      meta: {
        hasNextPage,
        nextCursor: hasNextPage ? (data[data.length - 1]?.id ?? null) : null,
      },
    };
  }

  async create(userId: string, input: CreateAnswerDto) {
    await this.assertQuestionOwnership(userId, input.questionId);

    return this.prisma.answer.create({
      data: {
        userId,
        questionId: input.questionId,
        type: input.type.trim(),
        content: input.content.trim(),
        position: input.position ?? 0,
      },
    });
  }

  async update(userId: string, answerId: string, input: UpdateAnswerDto) {
    const existing = await this.prisma.answer.findFirst({
      where: {
        id: answerId,
        userId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException({
        code: 'ANSWER_NOT_FOUND',
        message: 'Answer not found.',
      });
    }

    return this.prisma.answer.update({
      where: { id: answerId },
      data: {
        ...(input.type ? { type: input.type.trim() } : {}),
        ...(input.content ? { content: input.content.trim() } : {}),
        ...(typeof input.position !== 'undefined'
          ? { position: input.position }
          : {}),
      },
    });
  }

  async remove(userId: string, answerId: string): Promise<{ success: true }> {
    const existing = await this.prisma.answer.findFirst({
      where: {
        id: answerId,
        userId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException({
        code: 'ANSWER_NOT_FOUND',
        message: 'Answer not found.',
      });
    }

    await this.prisma.answer.update({
      where: { id: answerId },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }

  private async assertQuestionOwnership(
    userId: string,
    questionId: string,
  ): Promise<void> {
    if (!questionId) {
      throw new BadRequestException({
        code: 'QUESTION_REQUIRED',
        message: 'questionId is required.',
      });
    }

    const question = await this.prisma.question.findFirst({
      where: {
        id: questionId,
        userId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!question) {
      throw new NotFoundException({
        code: 'QUESTION_NOT_FOUND',
        message: 'Question not found.',
      });
    }
  }
}
