import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  DEFAULT_LIMIT,
  parseCursor,
  parseLimit,
} from '../common/lib/pagination';
import { createSlug } from '../common/lib/slug';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { ListTagsQueryDto } from './dto/list-tags-query.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: ListTagsQueryDto) {
    const limit = parseLimit(query.limit ?? DEFAULT_LIMIT);
    const where: Prisma.TagWhereInput = {
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

    const items = await this.prisma.tag.findMany({
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

  async create(userId: string, input: CreateTagDto) {
    return this.prisma.tag.create({
      data: {
        userId,
        name: input.name.trim(),
        slug: createSlug(input.name),
      },
    });
  }

  async update(userId: string, tagId: string, input: UpdateTagDto) {
    const existing = await this.prisma.tag.findFirst({
      where: { id: tagId, userId, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException({
        code: 'TAG_NOT_FOUND',
        message: 'Tag not found.',
      });
    }

    return this.prisma.tag.update({
      where: { id: tagId },
      data: {
        ...(input.name
          ? {
              name: input.name.trim(),
              slug: createSlug(input.name),
            }
          : {}),
      },
    });
  }

  async remove(userId: string, tagId: string): Promise<{ success: true }> {
    const existing = await this.prisma.tag.findFirst({
      where: { id: tagId, userId, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException({
        code: 'TAG_NOT_FOUND',
        message: 'Tag not found.',
      });
    }

    await this.prisma.tag.update({
      where: { id: tagId },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }
}
