'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authQueryKey, useSession } from '../hooks/useSession';
import { logout } from '../api/authApi';
import styles from './AuthStatus.module.css';

export function AuthStatus() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useSession();

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      queryClient.setQueryData(authQueryKey, null);
      await queryClient.invalidateQueries({ queryKey: authQueryKey });
      router.push('/login');
      router.refresh();
    },
  });

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <p className={styles.email}>{user.email}</p>
      <button
        type='button'
        className={styles.button}
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
      >
        {logoutMutation.isPending ? 'Signing out...' : 'Logout'}
      </button>
    </div>
  );
}
