import { apiRequest } from '@/shared/lib/api/apiClient';

export type PracticeQuestion = {
  id: string;
  title: string;
  prompt: string;
  difficulty: 'junior' | 'mid' | 'senior' | 'staff';
  topics: Array<{ id: string; name: string }>;
  answers: Array<{ id: string; type: string; content: string; position: number }>;
  review: {
    status: string;
    confidence: number;
    nextReviewAt: string;
  } | null;
};

export type StartPracticeInput = {
  count?: number;
  topicIds?: string[];
  difficulty?: 'junior' | 'mid' | 'senior' | 'staff';
  dueOnly?: boolean;
  weakOnly?: boolean;
};

export type PracticeSession = {
  startedAt: string;
  totalQuestions: number;
  filters: {
    difficulty: string | null;
    dueOnly: boolean;
    weakOnly: boolean;
    topicIds: string[];
  };
  questions: PracticeQuestion[];
};

export async function startPracticeSession(
  input: StartPracticeInput,
): Promise<PracticeSession> {
  return apiRequest<PracticeSession>('/practice/start', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function submitPracticeAttempt(input: {
  questionId: string;
  rating: 'again' | 'hard' | 'good' | 'easy';
  revealedAnswer: boolean;
}) {
  return apiRequest<{
    attempt: {
      id: string;
      rating: string;
      questionId: string;
      createdAt: string;
    };
    reviewState: {
      status: string;
      confidence: number;
      nextReviewAt: string;
    };
  }>('/practice/answer', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
