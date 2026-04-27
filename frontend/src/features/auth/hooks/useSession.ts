'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiClientError } from '@/shared/lib/api/apiClient';
import { getCurrentUser } from '../api/authApi';

export const authQueryKey = ['auth', 'session'] as const;

export function useSession(enabled = true) {
  return useQuery({
    queryKey: authQueryKey,
    queryFn: getCurrentUser,
    retry: false,
    enabled,
    throwOnError: false,
    select: (user) => user,
  });
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiClientError && ['AUTH_REQUIRED', 'INVALID_TOKEN'].includes(error.code);
}
