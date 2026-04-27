'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { EmptyState } from '@/shared/ui/states/EmptyState';
import { LoadingState } from '@/shared/ui/states/LoadingState';
import { getDueQueue, getReviewSummary, getWeakQuestions } from '../api/reviewApi';
import styles from './ReviewPage.module.css';

export function ReviewPage() {
  const summaryQuery = useQuery({
    queryKey: ['review', 'summary'],
    queryFn: getReviewSummary,
  });

  const dueQuery = useQuery({
    queryKey: ['review', 'due'],
    queryFn: getDueQueue,
  });

  const weakQuery = useQuery({
    queryKey: ['review', 'weak'],
    queryFn: getWeakQuestions,
  });

  if (summaryQuery.isPending || dueQuery.isPending || weakQuery.isPending) {
    return <LoadingState title='Loading review dashboard...' description='Calculating your next study actions.' />;
  }

  const summary = summaryQuery.data;
  const dueItems = dueQuery.data ?? [];
  const weakItems = weakQuery.data ?? [];

  if (!summary) {
    return (
      <EmptyState
        title='Review unavailable right now'
        description='Try refreshing after completing at least one practice attempt.'
      />
    );
  }

  return (
    <section className={styles.wrapper}>
      <h1 className={styles.title}>Review</h1>
      <p className={styles.subtitle}>Know what to practice next and reinforce weak areas.</p>

      <div className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <p className={styles.summaryTitle}>Due now</p>
          <p className={styles.summaryValue}>{summary.dueCount}</p>
          <Link className={styles.button} href='/practice?mode=due'>
            Practice due queue
          </Link>
        </article>

        <article className={styles.summaryCard}>
          <p className={styles.summaryTitle}>Weak questions</p>
          <p className={styles.summaryValue}>{summary.weakCount}</p>
          <Link className={styles.button} href='/practice?mode=weak'>
            Practice weak areas
          </Link>
        </article>

        <article className={styles.summaryCard}>
          <p className={styles.summaryTitle}>Mastered</p>
          <p className={styles.summaryValue}>{summary.masteredCount}</p>
          <p className={styles.itemMeta}>Recent attempts: {summary.recentAttempts}</p>
        </article>
      </div>

      <article className={styles.panel}>
        <h2>Rating summary</h2>
        <div className={styles.ratingGrid}>
          <div className={styles.summaryCard}>
            <p className={styles.summaryTitle}>Again</p>
            <p className={styles.summaryValue}>{summary.ratings.again}</p>
          </div>
          <div className={styles.summaryCard}>
            <p className={styles.summaryTitle}>Hard</p>
            <p className={styles.summaryValue}>{summary.ratings.hard}</p>
          </div>
          <div className={styles.summaryCard}>
            <p className={styles.summaryTitle}>Good</p>
            <p className={styles.summaryValue}>{summary.ratings.good}</p>
          </div>
          <div className={styles.summaryCard}>
            <p className={styles.summaryTitle}>Easy</p>
            <p className={styles.summaryValue}>{summary.ratings.easy}</p>
          </div>
        </div>
      </article>

      <article className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Due queue</h2>
          <Link className={styles.button} href='/practice?mode=due'>
            Review practice mode
          </Link>
        </div>

        {dueItems.length === 0 ? (
          <EmptyState
            title='No questions due right now'
            description='Great. Keep your momentum with a standard practice session.'
          />
        ) : (
          <div className={styles.list}>
            {dueItems.map((item) => (
              <div className={styles.item} key={item.questionId}>
                <strong>{item.title}</strong>
                <p>{item.prompt}</p>
                <p className={styles.itemMeta}>
                  Confidence {item.confidence} · Status {item.status}
                </p>
                <div className={styles.chips}>
                  {item.topics.map((topic) => (
                    <span className={styles.chip} key={topic.id}>
                      {topic.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </article>

      <article className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Weak questions</h2>
          <Link className={styles.button} href='/practice?mode=weak'>
            Practice weak mode
          </Link>
        </div>

        {weakItems.length === 0 ? (
          <EmptyState
            title='No weak questions right now'
            description='Your confidence looks solid. Keep practicing mixed sessions.'
          />
        ) : (
          <div className={styles.list}>
            {weakItems.map((item) => (
              <div className={styles.item} key={item.questionId}>
                <strong>{item.title}</strong>
                <p>{item.prompt}</p>
                <p className={styles.itemMeta}>
                  Confidence {item.confidence} · Status {item.status}
                </p>
                <div className={styles.chips}>
                  {item.topics.map((topic) => (
                    <span className={styles.chip} key={topic.id}>
                      {topic.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
