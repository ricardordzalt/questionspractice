import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  DEFAULT_LIMIT,
  parseCursor,
  parseLimit,
} from '../common/lib/pagination';
import { createSlug } from '../common/lib/slug';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { ListQuestionsQueryDto } from './dto/list-questions-query.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

type ImportedAnswer = {
  type: string;
  content: string;
};

type ImportedQuestion = {
  title: string;
  prompt: string;
  difficulty: 'junior' | 'mid' | 'senior' | 'staff';
  source?: string;
  notes?: string;
  topics: string[];
  tags: string[];
  answers: ImportedAnswer[];
};

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: ListQuestionsQueryDto) {
    const limit = parseLimit(query.limit ?? DEFAULT_LIMIT);

    const where: Prisma.QuestionWhereInput = {
      userId,
      deletedAt: null,
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { prompt: { contains: query.search, mode: 'insensitive' } },
              { notes: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(query.difficulty ? { difficulty: query.difficulty } : {}),
      ...(query.topicId
        ? {
            topics: {
              some: {
                topicId: query.topicId,
                deletedAt: null,
                topic: { deletedAt: null },
              },
            },
          }
        : {}),
      ...(query.tagId
        ? {
            tags: {
              some: {
                tagId: query.tagId,
                deletedAt: null,
                tag: { deletedAt: null },
              },
            },
          }
        : {}),
    };

    const items = await this.prisma.question.findMany({
      where,
      include: {
        topics: {
          where: { deletedAt: null, topic: { deletedAt: null } },
          include: { topic: true },
        },
        tags: {
          where: { deletedAt: null, tag: { deletedAt: null } },
          include: { tag: true },
        },
        answers: {
          where: { deletedAt: null },
          orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
        },
      },
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
    const data = (hasNextPage ? items.slice(0, limit) : items).map((item) => ({
      ...this.toQuestionView(item),
    }));

    return {
      data,
      meta: {
        hasNextPage,
        nextCursor: hasNextPage ? (data[data.length - 1]?.id ?? null) : null,
      },
    };
  }

  async create(userId: string, input: CreateQuestionDto) {
    await this.assertTopicOwnership(userId, input.topicIds);
    await this.assertTagOwnership(userId, input.tagIds ?? []);

    return this.prisma.question
      .create({
        data: {
          userId,
          title: input.title.trim(),
          prompt: input.prompt.trim(),
          difficulty: input.difficulty,
          source: input.source?.trim(),
          notes: input.notes?.trim(),
          topics: {
            create: input.topicIds.map((topicId) => ({ topicId })),
          },
          ...(input.tagIds?.length
            ? {
                tags: {
                  create: input.tagIds.map((tagId) => ({ tagId })),
                },
              }
            : {}),
        },
        include: {
          topics: { include: { topic: true } },
          tags: { include: { tag: true } },
          answers: {
            where: { deletedAt: null },
            orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
          },
        },
      })
      .then((question) => this.toQuestionView(question));
  }

  async update(userId: string, questionId: string, input: UpdateQuestionDto) {
    const existing = await this.prisma.question.findFirst({
      where: { id: questionId, userId, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException({
        code: 'QUESTION_NOT_FOUND',
        message: 'Question not found.',
      });
    }

    if (input.topicIds) {
      await this.assertTopicOwnership(userId, input.topicIds);
    }

    if (input.tagIds) {
      await this.assertTagOwnership(userId, input.tagIds);
    }

    return this.prisma
      .$transaction(async (tx) => {
        if (input.topicIds) {
          await tx.questionTopic.deleteMany({
            where: { questionId },
          });

          if (input.topicIds.length > 0) {
            await tx.questionTopic.createMany({
              data: input.topicIds.map((topicId) => ({ questionId, topicId })),
            });
          }
        }

        if (input.tagIds) {
          await tx.questionTag.deleteMany({
            where: { questionId },
          });

          if (input.tagIds.length > 0) {
            await tx.questionTag.createMany({
              data: input.tagIds.map((tagId) => ({ questionId, tagId })),
            });
          }
        }

        return tx.question.update({
          where: { id: questionId },
          data: {
            ...(input.title ? { title: input.title.trim() } : {}),
            ...(input.prompt ? { prompt: input.prompt.trim() } : {}),
            ...(input.difficulty ? { difficulty: input.difficulty } : {}),
            ...(typeof input.source !== 'undefined'
              ? { source: input.source?.trim() ?? null }
              : {}),
            ...(typeof input.notes !== 'undefined'
              ? { notes: input.notes?.trim() ?? null }
              : {}),
          },
          include: {
            topics: { include: { topic: true } },
            tags: { include: { tag: true } },
            answers: {
              where: { deletedAt: null },
              orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
            },
          },
        });
      })
      .then((question) => this.toQuestionView(question));
  }

  async remove(userId: string, questionId: string): Promise<{ success: true }> {
    const existing = await this.prisma.question.findFirst({
      where: { id: questionId, userId, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException({
        code: 'QUESTION_NOT_FOUND',
        message: 'Question not found.',
      });
    }

    await this.prisma.question.update({
      where: { id: questionId },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }

  async importFromPayload(userId: string, payload: unknown) {
    const questions = this.parseImportPayload(payload);

    return this.prisma.$transaction(async (tx) => {
      let importedCount = 0;
      let createdTopics = 0;
      let createdTags = 0;

      const topicCache = new Map<string, string>();
      const tagCache = new Map<string, string>();

      const resolveTopicId = async (name: string): Promise<string> => {
        const key = createSlug(name);
        const fromCache = topicCache.get(key);

        if (fromCache) {
          return fromCache;
        }

        const existing = await tx.topic.findFirst({
          where: {
            userId,
            slug: key,
            deletedAt: null,
          },
          select: { id: true },
        });

        if (existing) {
          topicCache.set(key, existing.id);
          return existing.id;
        }

        const created = await tx.topic.create({
          data: {
            userId,
            name,
            slug: key,
          },
          select: { id: true },
        });

        createdTopics += 1;
        topicCache.set(key, created.id);
        return created.id;
      };

      const resolveTagId = async (name: string): Promise<string> => {
        const key = createSlug(name);
        const fromCache = tagCache.get(key);

        if (fromCache) {
          return fromCache;
        }

        const existing = await tx.tag.findFirst({
          where: {
            userId,
            slug: key,
            deletedAt: null,
          },
          select: { id: true },
        });

        if (existing) {
          tagCache.set(key, existing.id);
          return existing.id;
        }

        const created = await tx.tag.create({
          data: {
            userId,
            name,
            slug: key,
          },
          select: { id: true },
        });

        createdTags += 1;
        tagCache.set(key, created.id);
        return created.id;
      };

      for (const question of questions) {
        const topicIds = await Promise.all(
          question.topics.map((topicName) => resolveTopicId(topicName)),
        );

        const tagIds = await Promise.all(
          question.tags.map((tagName) => resolveTagId(tagName)),
        );

        const createdQuestion = await tx.question.create({
          data: {
            userId,
            title: question.title,
            prompt: question.prompt,
            difficulty: question.difficulty,
            source: question.source,
            notes: question.notes,
          },
          select: { id: true },
        });

        await tx.questionTopic.createMany({
          data: [...new Set(topicIds)].map((topicId) => ({
            questionId: createdQuestion.id,
            topicId,
          })),
        });

        if (tagIds.length > 0) {
          await tx.questionTag.createMany({
            data: [...new Set(tagIds)].map((tagId) => ({
              questionId: createdQuestion.id,
              tagId,
            })),
          });
        }

        await tx.answer.createMany({
          data: question.answers.map((answer, index) => ({
            userId,
            questionId: createdQuestion.id,
            type: answer.type,
            content: answer.content,
            position: index,
          })),
        });

        importedCount += 1;
      }

      return {
        importedCount,
        createdTopics,
        createdTags,
      };
    });
  }

  async importFromFile(
    userId: string,
    file?: { buffer: Buffer; originalname: string },
  ) {
    if (!file) {
      throw new BadRequestException({
        code: 'IMPORT_FILE_REQUIRED',
        message: 'A JSON file is required.',
      });
    }

    let payload: unknown;

    try {
      payload = JSON.parse(file.buffer.toString('utf-8'));
    } catch {
      throw new BadRequestException({
        code: 'IMPORT_INVALID_JSON',
        message: 'Uploaded file is not valid JSON.',
      });
    }

    return this.importFromPayload(userId, payload);
  }

  private parseImportPayload(payload: unknown): ImportedQuestion[] {
    const fields: Record<string, string[]> = {};

    const addError = (field: string, message: string) => {
      fields[field] = fields[field] ?? [];
      fields[field].push(message);
    };

    const sourceQuestions = Array.isArray(payload)
      ? payload
      : this.readObject(payload) &&
          Array.isArray(this.readObject(payload)?.questions)
        ? (this.readObject(payload)?.questions as unknown[])
        : null;

    if (!sourceQuestions || sourceQuestions.length === 0) {
      addError('questions', 'questions must be a non-empty array.');
      throw new BadRequestException({
        code: 'IMPORT_VALIDATION_ERROR',
        message: 'Import validation failed.',
        fields,
      });
    }

    const normalizedQuestions: ImportedQuestion[] = [];
    const allowedDifficulties = new Set(['junior', 'mid', 'senior', 'staff']);

    sourceQuestions.forEach((rawQuestion, index) => {
      const question = this.readObject(rawQuestion);

      if (!question) {
        addError(`questions[${index}]`, 'Each item must be an object.');
        return;
      }

      const title = this.readString(question.title);
      if (!title || title.length < 4) {
        addError(
          `questions[${index}].title`,
          'Title must be at least 4 characters.',
        );
      }

      const prompt = this.readString(question.prompt);
      if (!prompt || prompt.length < 8) {
        addError(
          `questions[${index}].prompt`,
          'Prompt must be at least 8 characters.',
        );
      }

      const rawDifficulty = this.readString(question.difficulty) ?? 'senior';
      const difficulty = rawDifficulty.toLowerCase();

      if (!allowedDifficulties.has(difficulty)) {
        addError(
          `questions[${index}].difficulty`,
          'Difficulty must be one of: junior, mid, senior, staff.',
        );
      }

      const topics = this.normalizeStringArray(
        question.topics,
        this.readString(question.topic),
      );

      if (topics.length === 0) {
        addError(
          `questions[${index}].topics`,
          'At least one topic is required.',
        );
      }

      const tags = this.normalizeStringArray(question.tags);

      const answers = this.normalizeAnswers(question.answers, question.answer);

      if (answers.length === 0) {
        addError(
          `questions[${index}].answers`,
          'At least one answer is required (answer or answers).',
        );
      }

      answers.forEach((answer, answerIndex) => {
        if (!answer.content || answer.content.length < 4) {
          addError(
            `questions[${index}].answers[${answerIndex}].content`,
            'Answer content must be at least 4 characters.',
          );
        }

        if (!answer.type || answer.type.length > 40) {
          addError(
            `questions[${index}].answers[${answerIndex}].type`,
            'Answer type is required and must be <= 40 characters.',
          );
        }
      });

      if (
        !title ||
        !prompt ||
        !allowedDifficulties.has(difficulty) ||
        topics.length === 0 ||
        answers.length === 0
      ) {
        return;
      }

      normalizedQuestions.push({
        title,
        prompt,
        difficulty: difficulty as ImportedQuestion['difficulty'],
        source: this.readString(question.source),
        notes: this.readString(question.notes),
        topics,
        tags,
        answers,
      });
    });

    if (Object.keys(fields).length > 0) {
      throw new BadRequestException({
        code: 'IMPORT_VALIDATION_ERROR',
        message: 'Import validation failed.',
        fields,
      });
    }

    return normalizedQuestions;
  }

  private normalizeAnswers(
    rawAnswers: unknown,
    rawAnswer?: unknown,
  ): ImportedAnswer[] {
    if (Array.isArray(rawAnswers)) {
      return rawAnswers
        .map((item) => {
          if (typeof item === 'string') {
            const content = item.trim();
            return content
              ? {
                  type: 'interview',
                  content,
                }
              : null;
          }

          const answer = this.readObject(item);
          if (!answer) {
            return null;
          }

          return {
            type: this.readString(answer.type) ?? 'interview',
            content: this.readString(answer.content) ?? '',
          };
        })
        .filter((item): item is ImportedAnswer => Boolean(item));
    }

    if (typeof rawAnswer === 'string') {
      const content = rawAnswer.trim();
      if (content) {
        return [
          {
            type: 'interview',
            content,
          },
        ];
      }
    }

    return [];
  }

  private normalizeStringArray(
    firstCandidate: unknown,
    fallbackCandidate?: unknown,
  ): string[] {
    const source = Array.isArray(firstCandidate)
      ? firstCandidate
      : typeof fallbackCandidate === 'string'
        ? [fallbackCandidate]
        : [];

    return [
      ...new Set(
        source
          .map((item) => (typeof item === 'string' ? item.trim() : ''))
          .filter((item) => item.length > 0),
      ),
    ];
  }

  private readObject(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }

    return value as Record<string, unknown>;
  }

  private readString(value: unknown): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  private async assertTopicOwnership(
    userId: string,
    topicIds: string[],
  ): Promise<void> {
    if (topicIds.length === 0) {
      throw new BadRequestException({
        code: 'TOPICS_REQUIRED',
        message: 'At least one topic is required.',
      });
    }

    const count = await this.prisma.topic.count({
      where: {
        id: { in: topicIds },
        userId,
        deletedAt: null,
      },
    });

    if (count !== topicIds.length) {
      throw new BadRequestException({
        code: 'INVALID_TOPICS',
        message: 'One or more topics are invalid.',
      });
    }
  }

  private async assertTagOwnership(
    userId: string,
    tagIds: string[],
  ): Promise<void> {
    if (tagIds.length === 0) {
      return;
    }

    const count = await this.prisma.tag.count({
      where: {
        id: { in: tagIds },
        userId,
        deletedAt: null,
      },
    });

    if (count !== tagIds.length) {
      throw new BadRequestException({
        code: 'INVALID_TAGS',
        message: 'One or more tags are invalid.',
      });
    }
  }

  private toQuestionView(
    item: Prisma.QuestionGetPayload<{
      include: {
        topics: { include: { topic: true } };
        tags: { include: { tag: true } };
        answers: true;
      };
    }>,
  ) {
    return {
      id: item.id,
      title: item.title,
      prompt: item.prompt,
      difficulty: item.difficulty,
      source: item.source,
      notes: item.notes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      topics: item.topics.map((relation) => ({
        id: relation.topic.id,
        name: relation.topic.name,
      })),
      tags: item.tags.map((relation) => ({
        id: relation.tag.id,
        name: relation.tag.name,
      })),
      answers: item.answers.map((answer) => ({
        id: answer.id,
        type: answer.type,
        content: answer.content,
        position: answer.position,
      })),
    };
  }
}
