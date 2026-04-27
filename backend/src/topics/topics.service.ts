import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  DEFAULT_LIMIT,
  parseCursor,
  parseLimit,
} from '../common/lib/pagination';
import { createSlug } from '../common/lib/slug';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { ListTopicsQueryDto } from './dto/list-topics-query.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class TopicsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: ListTopicsQueryDto) {
    const limit = parseLimit(query.limit ?? DEFAULT_LIMIT);
    const where: Prisma.TopicWhereInput = {
      userId,
      deletedAt: null,
      ...(query.search
        ? {
            name: {
              contains: query.search,
              mode: 'insensitive',
            },
          }
        : {}),
    };

    const items = await this.prisma.topic.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
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

  async create(userId: string, input: CreateTopicDto) {
    return this.prisma.topic.create({
      data: {
        userId,
        name: input.name.trim(),
        slug: createSlug(input.name),
        description: input.description?.trim(),
      },
    });
  }

  async update(userId: string, topicId: string, input: UpdateTopicDto) {
    const existing = await this.prisma.topic.findFirst({
      where: { id: topicId, userId, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException({
        code: 'TOPIC_NOT_FOUND',
        message: 'Topic not found.',
      });
    }

    return this.prisma.topic.update({
      where: { id: topicId },
      data: {
        ...(input.name
          ? {
              name: input.name.trim(),
              slug: createSlug(input.name),
            }
          : {}),
        ...(typeof input.description !== 'undefined'
          ? { description: input.description?.trim() ?? null }
          : {}),
      },
    });
  }

  async remove(userId: string, topicId: string): Promise<{ success: true }> {
    const existing = await this.prisma.topic.findFirst({
      where: { id: topicId, userId, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException({
        code: 'TOPIC_NOT_FOUND',
        message: 'Topic not found.',
      });
    }

    await this.prisma.topic.update({
      where: { id: topicId },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }
}
