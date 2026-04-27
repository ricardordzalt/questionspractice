import { apiRequest } from '@/shared/lib/api/apiClient';

export type ReviewQueueItem = {
  questionId: string;
  title: string;
  prompt: string;
  difficulty: string;
  confidence: number;
  status: string;
  nextReviewAt: string;
  topics: Array<{ id: string; name: string }>;
};

export type ReviewSummary = {
  dueCount: number;
  weakCount: number;
  masteredCount: number;
  totalAttempts: number;
  recentAttempts: number;
  ratings: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
};

export async function getDueQueue() {
  return apiRequest<ReviewQueueItem[]>('/review/due');
}

export async function getWeakQuestions() {
  return apiRequest<ReviewQueueItem[]>('/review/weak');
}

export async function getReviewSummary() {
  return apiRequest<ReviewSummary>('/review/summary');
}
