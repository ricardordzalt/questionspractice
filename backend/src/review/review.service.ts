import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async getDue(userId: string, limit = 20) {
    const now = new Date();

    const states = await this.prisma.reviewState.findMany({
      where: {
        userId,
        deletedAt: null,
        nextReviewAt: { lte: now },
      },
      include: {
        question: {
          include: {
            topics: {
              where: { deletedAt: null, topic: { deletedAt: null } },
              include: { topic: true },
            },
          },
        },
      },
      orderBy: [{ nextReviewAt: 'asc' }, { updatedAt: 'asc' }],
      take: limit,
    });

    return states.map((state) => ({
      questionId: state.questionId,
      title: state.question.title,
      prompt: state.question.prompt,
      difficulty: state.question.difficulty,
      confidence: state.confidence,
      status: state.status,
      nextReviewAt: state.nextReviewAt,
      topics: state.question.topics.map((relation) => ({
        id: relation.topic.id,
        name: relation.topic.name,
      })),
    }));
  }

  async getWeak(userId: string, limit = 20) {
    const states = await this.prisma.reviewState.findMany({
      where: {
        userId,
        deletedAt: null,
        OR: [
          { confidence: { lte: 2 } },
          { status: { in: ['new', 'learning'] } },
        ],
      },
      include: {
        question: {
          include: {
            topics: {
              where: { deletedAt: null, topic: { deletedAt: null } },
              include: { topic: true },
            },
          },
        },
      },
      orderBy: [{ confidence: 'asc' }, { updatedAt: 'asc' }],
      take: limit,
    });

    return states.map((state) => ({
      questionId: state.questionId,
      title: state.question.title,
      prompt: state.question.prompt,
      difficulty: state.question.difficulty,
      confidence: state.confidence,
      status: state.status,
      nextReviewAt: state.nextReviewAt,
      topics: state.question.topics.map((relation) => ({
        id: relation.topic.id,
        name: relation.topic.name,
      })),
    }));
  }

  async getSummary(userId: string) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      dueCount,
      weakCount,
      totalAttempts,
      recentAttempts,
      masteredCount,
      ratingGroups,
    ] = await Promise.all([
      this.prisma.reviewState.count({
        where: {
          userId,
          deletedAt: null,
          nextReviewAt: { lte: now },
        },
      }),
      this.prisma.reviewState.count({
        where: {
          userId,
          deletedAt: null,
          OR: [
            { confidence: { lte: 2 } },
            { status: { in: ['new', 'learning'] } },
          ],
        },
      }),
      this.prisma.practiceAttempt.count({
        where: {
          userId,
          deletedAt: null,
        },
      }),
      this.prisma.practiceAttempt.count({
        where: {
          userId,
          deletedAt: null,
          createdAt: { gte: sevenDaysAgo },
        },
      }),
      this.prisma.reviewState.count({
        where: {
          userId,
          deletedAt: null,
          status: 'mastered',
        },
      }),
      this.prisma.practiceAttempt.groupBy({
        by: ['rating'],
        where: {
          userId,
          deletedAt: null,
        },
        _count: {
          rating: true,
        },
      }),
    ]);

    const ratings = {
      again: 0,
      hard: 0,
      good: 0,
      easy: 0,
    };

    for (const group of ratingGroups) {
      if (group.rating in ratings) {
        ratings[group.rating as keyof typeof ratings] = group._count.rating;
      }
    }

    return {
      dueCount,
      weakCount,
      masteredCount,
      totalAttempts,
      recentAttempts,
      ratings,
    };
  }
}
