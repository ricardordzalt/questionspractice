'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isUnauthorized, useSession } from '../hooks/useSession';
import styles from './ProtectedGate.module.css';

type ProtectedGateProps = {
  children: ReactNode;
};

const PUBLIC_PATHS = new Set(['/login', '/register']);

export function ProtectedGate({ children }: ProtectedGateProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = PUBLIC_PATHS.has(pathname);
  const sessionQuery = useSession(!isPublicRoute);

  useEffect(() => {
    if (!isPublicRoute && sessionQuery.isError && isUnauthorized(sessionQuery.error)) {
      router.replace('/login');
    }
  }, [isPublicRoute, router, sessionQuery.error, sessionQuery.isError]);

  useEffect(() => {
    if (!isPublicRoute && sessionQuery.isSuccess && !sessionQuery.data) {
      router.replace('/login');
    }
  }, [isPublicRoute, router, sessionQuery.data, sessionQuery.isSuccess]);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (sessionQuery.isPending) {
    return <div className={styles.state}>Checking session...</div>;
  }

  if (sessionQuery.isError) {
    return <div className={styles.state}>Redirecting to login...</div>;
  }

  if (!sessionQuery.data) {
    return <div className={styles.state}>Redirecting to login...</div>;
  }

  return <>{children}</>;
}
