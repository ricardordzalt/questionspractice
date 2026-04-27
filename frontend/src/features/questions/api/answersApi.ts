import { apiRequest } from '@/shared/lib/api/apiClient';
import { QuestionAnswer } from '../types/question.types';

export async function createAnswer(input: {
  questionId: string;
  type: string;
  content: string;
  position: number;
}): Promise<QuestionAnswer> {
  return apiRequest<QuestionAnswer>('/answers', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateAnswer(answerId: string, input: Partial<Omit<QuestionAnswer, 'id'>>): Promise<QuestionAnswer> {
  return apiRequest<QuestionAnswer>(`/answers/${answerId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteAnswer(answerId: string) {
  return apiRequest<{ success: true }>(`/answers/${answerId}`, {
    method: 'DELETE',
  });
}
