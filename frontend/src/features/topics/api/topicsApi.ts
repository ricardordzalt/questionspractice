import { apiRequest, apiRequestEnvelope } from '@/shared/lib/api/apiClient';

export type Topic = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function listTopics(search = ''): Promise<Topic[]> {
  const params = new URLSearchParams();
  if (search.trim()) {
    params.set('search', search.trim());
  }

  const envelope = await apiRequestEnvelope<Topic[]>(`/topics?${params.toString()}`);
  return envelope.data;
}

export async function createTopic(input: { name: string; description?: string }) {
  return apiRequest<Topic>('/topics', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateTopic(
  topicId: string,
  input: { name?: string; description?: string },
) {
  return apiRequest<Topic>(`/topics/${topicId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteTopic(topicId: string) {
  return apiRequest<{ success: true }>(`/topics/${topicId}`, {
    method: 'DELETE',
  });
}
