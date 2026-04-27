import { apiRequest } from '@/shared/lib/api/apiClient';

export type AuthUser = {
  id: string;
  email: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  email: string;
  password: string;
};

export async function register(input: RegisterInput): Promise<AuthUser> {
  const data = await apiRequest<{ user: AuthUser }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return data.user;
}

export async function login(input: LoginInput): Promise<AuthUser> {
  const data = await apiRequest<{ user: AuthUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return data.user;
}

export async function logout(): Promise<void> {
  await apiRequest<{ success: true }>('/auth/logout', {
    method: 'POST',
  });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  return apiRequest<AuthUser | null>('/auth/me');
}
