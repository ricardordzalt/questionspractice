'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiClientError } from '@/shared/lib/api/apiClient';
import { EmptyState } from '@/shared/ui/states/EmptyState';
import { LoadingState } from '@/shared/ui/states/LoadingState';
import { listTags } from '@/features/tags/api/tagsApi';
import { listTopics } from '@/features/topics/api/topicsApi';
import { createAnswer, deleteAnswer, updateAnswer } from '../api/answersApi';
import {
  createQuestion,
  deleteQuestion,
  importQuestionsFromBody,
  importQuestionsFromFile,
  listQuestions,
  updateQuestion,
} from '../api/questionsApi';
import { Question } from '../types/question.types';
import styles from './QuestionsPage.module.css';

type Difficulty = 'junior' | 'mid' | 'senior' | 'staff';
type DraftAnswer = {
  localId: string;
  id?: string;
  type: string;
  content: string;
  position: number;
};

const questionsKey = ['questions'];

const initialFormState = {
  title: '',
  prompt: '',
  difficulty: 'senior' as Difficulty,
  source: '',
  notes: '',
  topicIds: [] as string[],
  tagIds: [] as string[],
};

export function QuestionsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [topicId, setTopicId] = useState('');
  const [tagId, setTagId] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [form, setForm] = useState(initialFormState);
  const [answers, setAnswers] = useState<DraftAnswer[]>([]);
  const [importJsonText, setImportJsonText] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLocalError, setImportLocalError] = useState<string | null>(null);
  const [importFieldErrors, setImportFieldErrors] = useState<Record<string, string[]> | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const topicsQuery = useQuery({
    queryKey: ['topics', 'all'],
    queryFn: () => listTopics(''),
  });

  const tagsQuery = useQuery({
    queryKey: ['tags', 'all'],
    queryFn: () => listTags(''),
  });

  const questionsQuery = useQuery({
    queryKey: [...questionsKey, search, topicId, tagId, difficulty],
    queryFn: () =>
      listQuestions({
        search,
        topicId: topicId || undefined,
        tagId: tagId || undefined,
        difficulty: difficulty || undefined,
      }),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        prompt: form.prompt,
        difficulty: form.difficulty,
        source: form.source || undefined,
        notes: form.notes || undefined,
        topicIds: form.topicIds,
        tagIds: form.tagIds,
      };

      const question = editingQuestion
        ? await updateQuestion(editingQuestion.id, payload)
        : await createQuestion(payload);

      const previousAnswers = new Map((editingQuestion?.answers ?? []).map((answer) => [answer.id, answer]));
      const submittedAnswerIds = new Set<string>();

      for (const [index, answer] of answers.entries()) {
        if (!answer.content.trim()) {
          continue;
        }

        if (answer.id) {
          submittedAnswerIds.add(answer.id);
          await updateAnswer(answer.id, {
            type: answer.type,
            content: answer.content,
            position: index,
          });
        } else {
          await createAnswer({
            questionId: question.id,
            type: answer.type,
            content: answer.content,
            position: index,
          });
        }
      }

      for (const answer of previousAnswers.values()) {
        if (!submittedAnswerIds.has(answer.id)) {
          await deleteAnswer(answer.id);
        }
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: questionsKey });
      closeDrawer();
    },
  });

  const removeMutation = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: questionsKey });
    },
  });

  const importBodyMutation = useMutation({
    mutationFn: importQuestionsFromBody,
    onSuccess: async (result) => {
      await refreshContentQueries();
      setImportSuccess(
        `Imported ${result.importedCount} questions. Created ${result.createdTopics} topics and ${result.createdTags} tags.`,
      );
      setImportJsonText('');
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        setImportFieldErrors(error.fields ?? null);
      }
    },
  });

  const importFileMutation = useMutation({
    mutationFn: importQuestionsFromFile,
    onSuccess: async (result) => {
      await refreshContentQueries();
      setImportSuccess(
        `Imported ${result.importedCount} questions. Created ${result.createdTopics} topics and ${result.createdTags} tags.`,
      );
      setImportFile(null);
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        setImportFieldErrors(error.fields ?? null);
      }
    },
  });

  const errorMessage =
    saveMutation.error instanceof ApiClientError ? saveMutation.error.message : null;
  const importBodyError =
    importBodyMutation.error instanceof ApiClientError
      ? importBodyMutation.error.message
      : null;
  const importFileError =
    importFileMutation.error instanceof ApiClientError
      ? importFileMutation.error.message
      : null;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveMutation.mutate();
  };

  const onImportBodySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearImportFeedback();

    let payload: unknown;
    try {
      payload = JSON.parse(importJsonText);
    } catch {
      setImportLocalError('Invalid JSON. Please fix syntax and try again.');
      return;
    }

    importBodyMutation.mutate(payload);
  };

  const onImportFileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearImportFeedback();

    if (!importFile) {
      setImportLocalError('Please select a JSON file first.');
      return;
    }

    importFileMutation.mutate(importFile);
  };

  const questions = useMemo(() => questionsQuery.data ?? [], [questionsQuery.data]);

  if (topicsQuery.isPending || tagsQuery.isPending || questionsQuery.isPending) {
    return <LoadingState title='Loading questions workspace...' description='Preparing filters and question list.' />;
  }

  async function refreshContentQueries() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: questionsKey }),
      queryClient.invalidateQueries({ queryKey: ['topics'] }),
      queryClient.invalidateQueries({ queryKey: ['tags'] }),
    ]);
  }

  function clearImportFeedback() {
    setImportLocalError(null);
    setImportFieldErrors(null);
    setImportSuccess(null);
  }

  function openCreateDrawer() {
    setEditingQuestion(null);
    setForm(initialFormState);
    setAnswers([
      {
        localId: crypto.randomUUID(),
        type: 'interview',
        content: '',
        position: 0,
      },
    ]);
    setDrawerOpen(true);
  }

  function openEditDrawer(question: Question) {
    setEditingQuestion(question);
    setForm({
      title: question.title,
      prompt: question.prompt,
      difficulty: question.difficulty,
      source: question.source ?? '',
      notes: question.notes ?? '',
      topicIds: question.topics.map((topic) => topic.id),
      tagIds: question.tags.map((tag) => tag.id),
    });
    setAnswers(
      question.answers.map((answer) => ({
        localId: crypto.randomUUID(),
        id: answer.id,
        type: answer.type,
        content: answer.content,
        position: answer.position,
      })),
    );
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingQuestion(null);
    setForm(initialFormState);
    setAnswers([]);
  }

  return (
    <section className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>Questions</h1>
        <button className={styles.button} type='button' onClick={openCreateDrawer}>
          Add question
        </button>
      </header>

      <section className={styles.importPanel}>
        <h2 className={styles.importTitle}>Import JSON</h2>
        <p className={styles.help}>
          Supported shape: {'{ "questions": [{ "title", "prompt", "difficulty", "topics", "tags", "answer|answers" }] }'}
        </p>

        <form className={styles.group} onSubmit={onImportBodySubmit}>
          <textarea
            className={styles.codeInput}
            placeholder='Paste JSON body here...'
            value={importJsonText}
            onChange={(event) => setImportJsonText(event.target.value)}
          />
          <button className={styles.button} type='submit' disabled={importBodyMutation.isPending}>
            {importBodyMutation.isPending ? 'Importing...' : 'Import JSON body'}
          </button>
        </form>

        <form className={styles.row} onSubmit={onImportFileSubmit}>
          <input
            className={styles.input}
            type='file'
            accept='application/json,.json'
            onChange={(event) => setImportFile(event.target.files?.[0] ?? null)}
          />
          <button className={styles.buttonGhost} type='submit' disabled={importFileMutation.isPending}>
            {importFileMutation.isPending ? 'Uploading...' : 'Import JSON file'}
          </button>
        </form>

        {importSuccess ? <p className={styles.success}>{importSuccess}</p> : null}
        {importLocalError ? <p className={styles.error}>{importLocalError}</p> : null}
        {importBodyError ? <p className={styles.error}>{importBodyError}</p> : null}
        {importFileError ? <p className={styles.error}>{importFileError}</p> : null}
        {importFieldErrors ? (
          <ul className={styles.errorList}>
            {Object.entries(importFieldErrors).map(([field, messages]) => (
              <li className={styles.error} key={field}>
                {field}: {messages.join(', ')}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <div className={styles.filters}>
        <input
          className={styles.input}
          placeholder='Search by title, prompt or notes...'
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select className={styles.select} value={topicId} onChange={(event) => setTopicId(event.target.value)}>
          <option value=''>All topics</option>
          {(topicsQuery.data ?? []).map((topic) => (
            <option value={topic.id} key={topic.id}>
              {topic.name}
            </option>
          ))}
        </select>

        <select className={styles.select} value={tagId} onChange={(event) => setTagId(event.target.value)}>
          <option value=''>All tags</option>
          {(tagsQuery.data ?? []).map((tag) => (
            <option value={tag.id} key={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          value={difficulty}
          onChange={(event) => setDifficulty(event.target.value)}
        >
          <option value=''>All levels</option>
          <option value='junior'>Junior</option>
          <option value='mid'>Mid</option>
          <option value='senior'>Senior</option>
          <option value='staff'>Staff</option>
        </select>
      </div>

      <div className={styles.list}>
        {questions.length === 0 ? (
          <EmptyState
            title='No questions found'
            description='Adjust your filters or add/import your first interview question.'
          />
        ) : (
          questions.map((question) => (
            <article className={styles.card} key={question.id}>
              <div className={styles.cardHeader}>
                <div>
                  <strong>{question.title}</strong>
                  <p className={styles.meta}>Difficulty: {question.difficulty}</p>
                </div>

                <div className={styles.row}>
                  <button className={styles.buttonGhost} onClick={() => openEditDrawer(question)} type='button'>
                    Edit
                  </button>
                  <button
                    className={styles.buttonGhost}
                    type='button'
                    onClick={() => removeMutation.mutate(question.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <p>{question.prompt}</p>

              <div className={styles.chips}>
                {question.topics.map((topic) => (
                  <span className={styles.chip} key={topic.id}>
                    {topic.name}
                  </span>
                ))}
                {question.tags.map((tag) => (
                  <span className={styles.chip} key={tag.id}>
                    #{tag.name}
                  </span>
                ))}
              </div>
            </article>
          ))
        )}
      </div>

      {drawerOpen ? (
        <div className={styles.drawerBackdrop}>
          <aside className={styles.drawer}>
            <h2>{editingQuestion ? 'Edit question' : 'Add question'}</h2>

            <form className={styles.group} onSubmit={onSubmit}>
              <input
                className={styles.input}
                placeholder='Question title'
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                required
              />

              <textarea
                className={styles.textarea}
                placeholder='Prompt'
                value={form.prompt}
                onChange={(event) => setForm((prev) => ({ ...prev, prompt: event.target.value }))}
                required
              />

              <div className={styles.gridTwo}>
                <select
                  className={styles.select}
                  value={form.difficulty}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, difficulty: event.target.value as Difficulty }))
                  }
                >
                  <option value='junior'>Junior</option>
                  <option value='mid'>Mid</option>
                  <option value='senior'>Senior</option>
                  <option value='staff'>Staff</option>
                </select>

                <input
                  className={styles.input}
                  placeholder='Source (optional)'
                  value={form.source}
                  onChange={(event) => setForm((prev) => ({ ...prev, source: event.target.value }))}
                />
              </div>

              <textarea
                className={styles.textarea}
                placeholder='Notes (optional)'
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              />

              <div className={styles.group}>
                <p className={styles.groupTitle}>Topics</p>
                <div className={styles.checkboxList}>
                  {(topicsQuery.data ?? []).map((topic) => {
                    const checked = form.topicIds.includes(topic.id);
                    return (
                      <label className={styles.checkboxItem} key={topic.id}>
                        <input
                          type='checkbox'
                          checked={checked}
                          onChange={(event) => {
                            setForm((prev) => ({
                              ...prev,
                              topicIds: event.target.checked
                                ? [...prev.topicIds, topic.id]
                                : prev.topicIds.filter((id) => id !== topic.id),
                            }));
                          }}
                        />
                        {topic.name}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className={styles.group}>
                <p className={styles.groupTitle}>Tags</p>
                <div className={styles.checkboxList}>
                  {(tagsQuery.data ?? []).map((tag) => {
                    const checked = form.tagIds.includes(tag.id);
                    return (
                      <label className={styles.checkboxItem} key={tag.id}>
                        <input
                          type='checkbox'
                          checked={checked}
                          onChange={(event) => {
                            setForm((prev) => ({
                              ...prev,
                              tagIds: event.target.checked
                                ? [...prev.tagIds, tag.id]
                                : prev.tagIds.filter((id) => id !== tag.id),
                            }));
                          }}
                        />
                        {tag.name}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className={styles.group}>
                <p className={styles.groupTitle}>Answers</p>

                {answers.map((answer, index) => (
                  <AnswerItem
                    key={answer.localId}
                    answer={answer}
                    onChange={(next) => {
                      setAnswers((prev) => prev.map((item) => (item.localId === answer.localId ? next : item)));
                    }}
                    onRemove={() => {
                      setAnswers((prev) => prev.filter((item) => item.localId !== answer.localId));
                    }}
                    index={index}
                  />
                ))}

                <button
                  className={styles.buttonGhost}
                  type='button'
                  onClick={() =>
                    setAnswers((prev) => [
                      ...prev,
                      {
                        localId: crypto.randomUUID(),
                        type: 'interview',
                        content: '',
                        position: prev.length,
                      },
                    ])
                  }
                >
                  Add answer
                </button>
              </div>

              {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}

              <div className={styles.row}>
                <button className={styles.button} disabled={saveMutation.isPending} type='submit'>
                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                </button>
                <button className={styles.buttonGhost} type='button' onClick={closeDrawer}>
                  Cancel
                </button>
              </div>
            </form>
          </aside>
        </div>
      ) : null}
    </section>
  );
}

type AnswerItemProps = {
  answer: DraftAnswer;
  onChange: (next: DraftAnswer) => void;
  onRemove: () => void;
  index: number;
};

function AnswerItem({ answer, onChange, onRemove, index }: AnswerItemProps) {
  return (
    <div className={styles.answerCard}>
      <div className={styles.gridTwo}>
        <input
          className={styles.input}
          placeholder='Type (short, interview, deep...)'
          value={answer.type}
          onChange={(event) => onChange({ ...answer, type: event.target.value, position: index })}
        />
        <button className={styles.buttonGhost} type='button' onClick={onRemove}>
          Remove
        </button>
      </div>
      <textarea
        className={styles.textarea}
        placeholder='Answer content'
        value={answer.content}
        onChange={(event) => onChange({ ...answer, content: event.target.value, position: index })}
      />
    </div>
  );
}
