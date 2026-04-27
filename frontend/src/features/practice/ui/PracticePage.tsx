'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { listTopics } from '@/features/topics/api/topicsApi';
import { ApiClientError } from '@/shared/lib/api/apiClient';
import { EmptyState } from '@/shared/ui/states/EmptyState';
import { LoadingState } from '@/shared/ui/states/LoadingState';
import {
  PracticeQuestion,
  startPracticeSession,
  submitPracticeAttempt,
} from '../api/practiceApi';
import styles from './PracticePage.module.css';

type Difficulty = '' | 'junior' | 'mid' | 'senior' | 'staff';
type Rating = 'again' | 'hard' | 'good' | 'easy';

const initialSummary = {
  again: 0,
  hard: 0,
  good: 0,
  easy: 0,
};

export function PracticePage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');

  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty>('');
  const [topicIds, setTopicIds] = useState<string[]>([]);
  const [dueOnly, setDueOnly] = useState(() => mode === 'due');
  const [weakOnly, setWeakOnly] = useState(() => mode === 'weak');

  const [session, setSession] = useState<{
    startedAt: string;
    totalQuestions: number;
    questions: PracticeQuestion[];
  } | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedById, setRevealedById] = useState<Record<string, boolean>>({});
  const [ratedById, setRatedById] = useState<Record<string, Rating>>({});
  const [summary, setSummary] = useState(initialSummary);

  const topicsQuery = useQuery({
    queryKey: ['topics', 'practice-filter'],
    queryFn: () => listTopics(''),
  });

  const startMutation = useMutation({
    mutationFn: startPracticeSession,
    onSuccess: (result) => {
      setSession({
        startedAt: result.startedAt,
        totalQuestions: result.totalQuestions,
        questions: result.questions,
      });
      setCurrentIndex(0);
      setRevealedById({});
      setRatedById({});
      setSummary(initialSummary);
    },
  });

  const answerMutation = useMutation({
    mutationFn: submitPracticeAttempt,
  });

  const currentQuestion = useMemo(() => {
    if (!session) {
      return null;
    }

    if (currentIndex >= session.questions.length) {
      return null;
    }

    return session.questions[currentIndex];
  }, [currentIndex, session]);

  const completed = Boolean(session) && currentQuestion === null;
  const currentRated = currentQuestion ? ratedById[currentQuestion.id] : null;
  const revealed = currentQuestion ? Boolean(revealedById[currentQuestion.id]) : false;

  const startError =
    startMutation.error instanceof ApiClientError ? startMutation.error.message : null;
  const answerError =
    answerMutation.error instanceof ApiClientError ? answerMutation.error.message : null;

  const revealCurrent = useCallback(() => {
    if (!currentQuestion) {
      return;
    }

    setRevealedById((prev) => ({
      ...prev,
      [currentQuestion.id]: true,
    }));
  }, [currentQuestion]);

  const nextQuestion = useCallback(() => {
    if (!session) {
      return;
    }

    setCurrentIndex((prev) => Math.min(prev + 1, session.questions.length));
  }, [session]);

  const rateCurrent = useCallback(
    async (rating: Rating) => {
      if (!currentQuestion || currentRated || answerMutation.isPending) {
        return;
      }

      await answerMutation.mutateAsync({
        questionId: currentQuestion.id,
        rating,
        revealedAnswer: revealed,
      });

      setRatedById((prev) => ({
        ...prev,
        [currentQuestion.id]: rating,
      }));

      setSummary((prev) => ({
        ...prev,
        [rating]: prev[rating] + 1,
      }));
    },
    [answerMutation, currentQuestion, currentRated, revealed],
  );

  useEffect(() => {
    if (!currentQuestion) {
      return;
    }

    const handler = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === 'r' && !revealed) {
        event.preventDefault();
        revealCurrent();
      }

      if (revealed && !currentRated) {
        if (key === '1') {
          event.preventDefault();
          void rateCurrent('again');
        }
        if (key === '2') {
          event.preventDefault();
          void rateCurrent('hard');
        }
        if (key === '3') {
          event.preventDefault();
          void rateCurrent('good');
        }
        if (key === '4') {
          event.preventDefault();
          void rateCurrent('easy');
        }
      }

      if (key === 'n' && currentRated) {
        event.preventDefault();
        nextQuestion();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentQuestion, currentRated, nextQuestion, rateCurrent, revealCurrent, revealed]);

  const resetSession = useCallback(() => {
    setSession(null);
    setCurrentIndex(0);
    setRevealedById({});
    setRatedById({});
    setSummary(initialSummary);
  }, []);

  const startWithCurrentConfig = useCallback(() => {
    startMutation.mutate({
      count,
      difficulty: difficulty || undefined,
      topicIds: topicIds.length > 0 ? topicIds : undefined,
      dueOnly,
      weakOnly,
    });
  }, [count, difficulty, dueOnly, startMutation, topicIds, weakOnly]);

  if (topicsQuery.isPending) {
    return <LoadingState title='Loading practice setup...' description='Preparing topics and filters.' />;
  }

  return (
    <section className={styles.wrapper}>
      <h1 className={styles.title}>Practice Mode</h1>
      <p className={styles.subtitle}>Active recall first. Reveal only after you answer mentally.</p>

      {!session ? (
        <article className={styles.panel}>
          <div className={styles.formGrid}>
            <label>
              Question count
              <input
                className={styles.input}
                type='number'
                min={1}
                max={50}
                value={count}
                onChange={(event) => setCount(Number(event.target.value) || 10)}
              />
            </label>

            <label>
              Difficulty
              <select
                className={styles.select}
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value as Difficulty)}
              >
                <option value=''>All levels</option>
                <option value='junior'>Junior</option>
                <option value='mid'>Mid</option>
                <option value='senior'>Senior</option>
                <option value='staff'>Staff</option>
              </select>
            </label>
          </div>

          <label>
            Topics (optional)
            <select
              className={styles.select}
              multiple
              value={topicIds}
              onChange={(event) => {
                const values = Array.from(event.target.selectedOptions).map((option) => option.value);
                setTopicIds(values);
              }}
            >
              {(topicsQuery.data ?? []).map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.checkboxRow}>
            <label className={styles.checkboxLabel}>
              <input
                type='checkbox'
                checked={dueOnly}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setDueOnly(checked);
                  if (checked) {
                    setWeakOnly(false);
                  }
                }}
              />
              Due for review only
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type='checkbox'
                checked={weakOnly}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setWeakOnly(checked);
                  if (checked) {
                    setDueOnly(false);
                  }
                }}
              />
              Weak questions only
            </label>
          </div>

          <button className={styles.button} type='button' onClick={startWithCurrentConfig}>
            {startMutation.isPending ? 'Starting...' : 'Start session'}
          </button>

          {startError ? <p className={styles.error}>{startError}</p> : null}
        </article>
      ) : null}

      {session && session.totalQuestions === 0 ? (
        <EmptyState
          title='No questions match this practice filter'
          description='Try removing Due-only / Weak-only filters or import more questions first.'
        />
      ) : null}

      {session && currentQuestion ? (
        <article className={styles.panel}>
          <p className={styles.progress}>
            Question {currentIndex + 1} of {session.totalQuestions}
          </p>

          <h2 className={styles.questionTitle}>{currentQuestion.title}</h2>
          <p className={styles.prompt}>{currentQuestion.prompt}</p>

          <div className={styles.chips}>
            <span className={styles.chip}>{currentQuestion.difficulty}</span>
            {currentQuestion.topics.map((topic) => (
              <span key={topic.id} className={styles.chip}>
                {topic.name}
              </span>
            ))}
          </div>

          {!revealed ? (
            <button className={styles.button} type='button' onClick={revealCurrent}>
              Reveal answer
            </button>
          ) : null}

          {revealed ? (
            <div className={styles.answers}>
              {currentQuestion.answers.map((answer) => (
                <div className={styles.answerCard} key={answer.id}>
                  <p className={styles.answerType}>{answer.type}</p>
                  <p>{answer.content}</p>
                </div>
              ))}
            </div>
          ) : null}

          {revealed ? (
            <div className={styles.ratingRow}>
              <button
                className={styles.ratingAgain}
                type='button'
                onClick={() => void rateCurrent('again')}
                disabled={Boolean(currentRated) || answerMutation.isPending}
              >
                Again (1)
              </button>
              <button
                className={styles.ratingHard}
                type='button'
                onClick={() => void rateCurrent('hard')}
                disabled={Boolean(currentRated) || answerMutation.isPending}
              >
                Hard (2)
              </button>
              <button
                className={styles.ratingGood}
                type='button'
                onClick={() => void rateCurrent('good')}
                disabled={Boolean(currentRated) || answerMutation.isPending}
              >
                Good (3)
              </button>
              <button
                className={styles.ratingEasy}
                type='button'
                onClick={() => void rateCurrent('easy')}
                disabled={Boolean(currentRated) || answerMutation.isPending}
              >
                Easy (4)
              </button>
            </div>
          ) : null}

          {answerError ? <p className={styles.error}>{answerError}</p> : null}

          {currentRated ? (
            <button className={styles.buttonGhost} type='button' onClick={nextQuestion}>
              {currentIndex + 1 < session.totalQuestions ? 'Next question (N)' : 'Finish session (N)'}
            </button>
          ) : null}

          <p className={styles.help}>Shortcuts: R reveal · 1/2/3/4 rate · N next.</p>
        </article>
      ) : null}

      {completed ? (
        <article className={styles.panel}>
          <h2>Session complete</h2>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <p className={styles.summaryLabel}>Again</p>
              <p className={styles.summaryValue}>{summary.again}</p>
            </div>
            <div className={styles.summaryCard}>
              <p className={styles.summaryLabel}>Hard</p>
              <p className={styles.summaryValue}>{summary.hard}</p>
            </div>
            <div className={styles.summaryCard}>
              <p className={styles.summaryLabel}>Good</p>
              <p className={styles.summaryValue}>{summary.good}</p>
            </div>
            <div className={styles.summaryCard}>
              <p className={styles.summaryLabel}>Easy</p>
              <p className={styles.summaryValue}>{summary.easy}</p>
            </div>
          </div>

          <div className={styles.ratingRow}>
            <button className={styles.button} type='button' onClick={resetSession}>
              Start another session
            </button>
            <Link className={styles.buttonGhost} href='/review?mode=due'>
              Go to review
            </Link>
          </div>
        </article>
      ) : null}
    </section>
  );
}
