'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClientError } from '@/shared/lib/api/apiClient';
import { authQueryKey } from '../hooks/useSession';
import { login } from '../api/authApi';
import styles from './AuthForm.module.css';

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: async (user) => {
      queryClient.setQueryData(authQueryKey, user);
      await queryClient.invalidateQueries({ queryKey: authQueryKey });
      router.push('/');
      router.refresh();
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    mutation.mutate({
      email,
      password,
    });
  };

  const errorMessage =
    mutation.error instanceof ApiClientError ? mutation.error.message : null;

  return (
    <div className={styles.wrapper}>
      <section className={styles.card}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in and continue your interview training.</p>

        <form className={styles.form} onSubmit={onSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Email</span>
            <input
              className={styles.input}
              type='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete='email'
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Password</span>
            <input
              className={styles.input}
              type='password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete='current-password'
              minLength={8}
              required
            />
          </label>

          <button className={styles.button} type='submit' disabled={mutation.isPending}>
            {mutation.isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}

        <p className={styles.meta}>
          No account yet?{' '}
          <Link className={styles.link} href='/register'>
            Create one
          </Link>
        </p>
      </section>
    </div>
  );
}
