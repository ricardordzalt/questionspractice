'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { AuthStatus } from '@/features/auth/ui/AuthStatus';
import { ProtectedGate } from '@/features/auth/ui/ProtectedGate';
import styles from './AppShell.module.css';

type AppShellProps = {
  children: ReactNode;
};

const navigationItems = [
  { href: '/practice', label: 'Practice' },
  { href: '/questions', label: 'Questions' },
  { href: '/review', label: 'Review' },
  { href: '/topics', label: 'Topics' },
  { href: '/', label: 'Dashboard' },
  { href: '/settings', label: 'Settings' },
];

const publicRoutes = new Set(['/login', '/register']);

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isPublicRoute = publicRoutes.has(pathname);

  if (isPublicRoute) {
    return <ProtectedGate>{children}</ProtectedGate>;
  }

  return (
    <ProtectedGate>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.brand}>
            <p className={styles.brandTitle}>Senior Interview Trainer</p>
            <p className={styles.brandSubtitle}>Preparation feels like training</p>
          </div>

          <nav aria-label='Primary' className={styles.nav}>
            {navigationItems.map((item) => (
              <Link
                className={`${styles.navLink} ${
                  pathname === item.href ? styles.navLinkActive : ''
                }`}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <AuthStatus />
        </aside>

        <main className={styles.main}>{children}</main>
      </div>
    </ProtectedGate>
  );
}
