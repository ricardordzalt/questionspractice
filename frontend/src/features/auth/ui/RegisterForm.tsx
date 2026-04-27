'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClientError } from '@/shared/lib/api/apiClient';
import { authQueryKey } from '../hooks/useSession';
import { register } from '../api/authApi';
import styles from './AuthForm.module.css';

export function RegisterForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: async (user) => {
      queryClient.setQueryData(authQueryKey, user);
      await queryClient.invalidateQueries({ queryKey: authQueryKey });
      router.push('/');
      router.refresh();
    },
  });

  const passwordsMatch = useMemo(
    () => confirmPassword.length === 0 || password === confirmPassword,
    [confirmPassword, password],
  );

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!passwordsMatch) {
      return;
    }

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
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>No email verification required for MVP.</p>

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
              autoComplete='new-password'
              minLength={8}
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Confirm password</span>
            <input
              className={styles.input}
              type='password'
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete='new-password'
              minLength={8}
              required
            />
          </label>

          {!passwordsMatch ? (
            <p className={styles.error}>Passwords do not match.</p>
          ) : null}

          <button
            className={styles.button}
            type='submit'
            disabled={mutation.isPending || !passwordsMatch}
          >
            {mutation.isPending ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}

        <p className={styles.meta}>
          Already registered?{' '}
          <Link className={styles.link} href='/login'>
            Sign in
          </Link>
        </p>
      </section>
    </div>
  );
}
