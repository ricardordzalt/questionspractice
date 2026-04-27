import { apiRequest, apiRequestEnvelope } from '@/shared/lib/api/apiClient';
import { Question } from '../types/question.types';

export type QuestionsFilters = {
  search?: string;
  topicId?: string;
  tagId?: string;
  difficulty?: string;
};

export async function listQuestions(filters: QuestionsFilters): Promise<Question[]> {
  const params = new URLSearchParams();

  if (filters.search?.trim()) params.set('search', filters.search.trim());
  if (filters.topicId) params.set('topicId', filters.topicId);
  if (filters.tagId) params.set('tagId', filters.tagId);
  if (filters.difficulty) params.set('difficulty', filters.difficulty);

  const query = params.toString();
  const envelope = await apiRequestEnvelope<Question[]>(`/questions${query ? `?${query}` : ''}`);
  return envelope.data;
}

export type UpsertQuestionInput = {
  title: string;
  prompt: string;
  difficulty: 'junior' | 'mid' | 'senior' | 'staff';
  source?: string;
  notes?: string;
  topicIds: string[];
  tagIds?: string[];
};

export async function createQuestion(input: UpsertQuestionInput): Promise<Question> {
  return apiRequest<Question>('/questions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateQuestion(questionId: string, input: Partial<UpsertQuestionInput>): Promise<Question> {
  return apiRequest<Question>(`/questions/${questionId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteQuestion(questionId: string) {
  return apiRequest<{ success: true }>(`/questions/${questionId}`, {
    method: 'DELETE',
  });
}

export type ImportResult = {
  importedCount: number;
  createdTopics: number;
  createdTags: number;
};

export async function importQuestionsFromBody(payload: unknown): Promise<ImportResult> {
  return apiRequest<ImportResult>('/questions/import', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function importQuestionsFromFile(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append('file', file);

  return apiRequest<ImportResult>('/questions/import/file', {
    method: 'POST',
    body: formData,
  });
}
