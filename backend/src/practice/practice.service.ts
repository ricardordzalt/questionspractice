import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StartPracticeSessionDto } from './dto/start-practice-session.dto';
import { SubmitPracticeAttemptDto } from './dto/submit-practice-attempt.dto';

const ratingOrder = ['again', 'hard', 'good', 'easy'] as const;

@Injectable()
export class PracticeService {
  constructor(private readonly prisma: PrismaService) {}

  async startSession(userId: string, input: StartPracticeSessionDto) {
    const count = Math.max(1, Math.min(input.count ?? 10, 50));
    const now = new Date();

    const where: Prisma.QuestionWhereInput = {
      userId,
      deletedAt: null,
      ...(input.difficulty ? { difficulty: input.difficulty } : {}),
      ...(input.topicIds?.length
        ? {
            topics: {
              some: {
                topicId: { in: input.topicIds },
                deletedAt: null,
                topic: { deletedAt: null },
              },
            },
          }
        : {}),
      ...(input.dueOnly
        ? {
            reviewStates: {
              some: {
                userId,
                deletedAt: null,
                nextReviewAt: { lte: now },
              },
            },
          }
        : {}),
      ...(input.weakOnly
        ? {
            reviewStates: {
              some: {
                userId,
                deletedAt: null,
                OR: [
                  { confidence: { lte: 2 } },
                  { status: { in: ['new', 'learning'] } },
                ],
              },
            },
          }
        : {}),
    };

    const poolSize = Math.max(count * 3, 50);

    const questions = await this.prisma.question.findMany({
      where,
      include: {
        topics: {
          where: { deletedAt: null, topic: { deletedAt: null } },
          include: { topic: true },
        },
        answers: {
          where: { deletedAt: null },
          orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
        },
        reviewStates: {
          where: { userId, deletedAt: null },
          take: 1,
        },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: poolSize,
    });

    const prioritized = [...questions];

    if (input.dueOnly) {
      prioritized.sort((a, b) => {
        const left =
          a.reviewStates[0]?.nextReviewAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const right =
          b.reviewStates[0]?.nextReviewAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return left - right;
      });
    } else if (input.weakOnly) {
      prioritized.sort((a, b) => {
        const left = a.reviewStates[0]?.confidence ?? Number.MAX_SAFE_INTEGER;
        const right = b.reviewStates[0]?.confidence ?? Number.MAX_SAFE_INTEGER;
        return left - right;
      });
    } else {
      this.shuffle(prioritized);
    }

    const selected = prioritized.slice(0, count);

    return {
      startedAt: new Date().toISOString(),
      totalQuestions: selected.length,
      filters: {
        difficulty: input.difficulty ?? null,
        dueOnly: Boolean(input.dueOnly),
        weakOnly: Boolean(input.weakOnly),
        topicIds: input.topicIds ?? [],
      },
      questions: selected.map((question) => ({
        id: question.id,
        title: question.title,
        prompt: question.prompt,
        difficulty: question.difficulty,
        topics: question.topics.map((relation) => ({
          id: relation.topic.id,
          name: relation.topic.name,
        })),
        answers: question.answers.map((answer) => ({
          id: answer.id,
          type: answer.type,
          content: answer.content,
          position: answer.position,
        })),
        review: question.reviewStates[0]
          ? {
              status: question.reviewStates[0].status,
              confidence: question.reviewStates[0].confidence,
              nextReviewAt: question.reviewStates[0].nextReviewAt,
            }
          : null,
      })),
    };
  }

  async submitAttempt(userId: string, input: SubmitPracticeAttemptDto) {
    const question = await this.prisma.question.findFirst({
      where: {
        id: input.questionId,
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

    if (!ratingOrder.includes(input.rating)) {
      throw new BadRequestException({
        code: 'INVALID_RATING',
        message: 'Rating must be one of: again, hard, good, easy.',
      });
    }

    const now = new Date();

    const existingState = await this.prisma.reviewState.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId: input.questionId,
        },
      },
      select: { confidence: true, status: true },
    });

    const baselineConfidence = existingState?.confidence ?? 1;
    const reviewUpdate = this.computeReviewUpdate(
      input.rating,
      baselineConfidence,
      now,
    );

    const [attempt, reviewState] = await this.prisma.$transaction([
      this.prisma.practiceAttempt.create({
        data: {
          userId,
          questionId: input.questionId,
          rating: input.rating,
          revealedAnswer: input.revealedAnswer ?? true,
        },
      }),
      this.prisma.reviewState.upsert({
        where: {
          userId_questionId: {
            userId,
            questionId: input.questionId,
          },
        },
        create: {
          userId,
          questionId: input.questionId,
          status: reviewUpdate.status,
          confidence: reviewUpdate.confidence,
          nextReviewAt: reviewUpdate.nextReviewAt,
          lastReviewedAt: now,
        },
        update: {
          status: reviewUpdate.status,
          confidence: reviewUpdate.confidence,
          nextReviewAt: reviewUpdate.nextReviewAt,
          lastReviewedAt: now,
          deletedAt: null,
        },
      }),
    ]);

    return {
      attempt,
      reviewState,
    };
  }

  private computeReviewUpdate(
    rating: 'again' | 'hard' | 'good' | 'easy',
    currentConfidence: number,
    now: Date,
  ) {
    switch (rating) {
      case 'again': {
        return {
          status: 'learning',
          confidence: Math.max(1, currentConfidence - 1),
          nextReviewAt: this.addHours(now, 6),
        };
      }
      case 'hard': {
        return {
          status: 'reviewing',
          confidence: Math.max(1, currentConfidence),
          nextReviewAt: this.addDays(now, 2),
        };
      }
      case 'good': {
        const confidence = Math.min(5, currentConfidence + 1);
        return {
          status: confidence >= 4 ? 'mastered' : 'reviewing',
          confidence,
          nextReviewAt: this.addDays(now, 4),
        };
      }
      case 'easy':
      default: {
        return {
          status: 'mastered',
          confidence: Math.min(5, currentConfidence + 2),
          nextReviewAt: this.addDays(now, 10),
        };
      }
    }
  }

  private addHours(date: Date, hours: number): Date {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
  }

  private addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  }

  private shuffle<T>(values: T[]): void {
    for (let i = values.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }
  }
}
