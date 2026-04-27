import { apiRequest, apiRequestEnvelope } from '@/shared/lib/api/apiClient';

export type Tag = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export async function listTags(search = ''): Promise<Tag[]> {
  const params = new URLSearchParams();
  if (search.trim()) {
    params.set('search', search.trim());
  }

  const envelope = await apiRequestEnvelope<Tag[]>(`/tags?${params.toString()}`);
  return envelope.data;
}

export async function createTag(input: { name: string }) {
  return apiRequest<Tag>('/tags', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateTag(tagId: string, input: { name?: string }) {
  return apiRequest<Tag>(`/tags/${tagId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteTag(tagId: string) {
  return apiRequest<{ success: true }>(`/tags/${tagId}`, {
    method: 'DELETE',
  });
}
