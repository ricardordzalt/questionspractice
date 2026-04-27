'use client';

import { FormEvent, ReactNode, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiClientError } from '@/shared/lib/api/apiClient';
import { EmptyState } from '@/shared/ui/states/EmptyState';
import { LoadingState } from '@/shared/ui/states/LoadingState';
import {
  createTopic,
  deleteTopic,
  listTopics,
  Topic,
  updateTopic,
} from '../api/topicsApi';
import { createTag, deleteTag, listTags, Tag, updateTag } from '@/features/tags/api/tagsApi';
import styles from './TopicsPage.module.css';

const topicsKey = ['topics'];
const tagsKey = ['tags'];

export function TopicsPage() {
  const queryClient = useQueryClient();
  const [topicSearch, setTopicSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [topicName, setTopicName] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [tagName, setTagName] = useState('');

  const topicsQuery = useQuery({
    queryKey: [...topicsKey, topicSearch],
    queryFn: () => listTopics(topicSearch),
  });

  const tagsQuery = useQuery({
    queryKey: [...tagsKey, tagSearch],
    queryFn: () => listTags(tagSearch),
  });

  const createTopicMutation = useMutation({
    mutationFn: createTopic,
    onSuccess: async () => {
      setTopicName('');
      setTopicDescription('');
      await queryClient.invalidateQueries({ queryKey: topicsKey });
    },
  });

  const createTagMutation = useMutation({
    mutationFn: createTag,
    onSuccess: async () => {
      setTagName('');
      await queryClient.invalidateQueries({ queryKey: tagsKey });
    },
  });

  const topicError =
    createTopicMutation.error instanceof ApiClientError
      ? createTopicMutation.error.message
      : null;

  const tagError =
    createTagMutation.error instanceof ApiClientError ? createTagMutation.error.message : null;

  const onCreateTopic = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createTopicMutation.mutate({ name: topicName, description: topicDescription || undefined });
  };

  const onCreateTag = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createTagMutation.mutate({ name: tagName });
  };

  const topics = useMemo(() => topicsQuery.data ?? [], [topicsQuery.data]);
  const tags = useMemo(() => tagsQuery.data ?? [], [tagsQuery.data]);

  if (topicsQuery.isPending || tagsQuery.isPending) {
    return <LoadingState title='Loading topics and tags...' description='Preparing your organization workspace.' />;
  }

  return (
    <section className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>Topics & Tags</h1>
      </header>

      <div className={styles.grid}>
        <EntityPanel<Topic>
          title='Topics'
          searchValue={topicSearch}
          onSearchChange={setTopicSearch}
          items={topics}
          onCreate={onCreateTopic}
          createForm={
            <>
              <input
                className={styles.input}
                placeholder='Topic name'
                value={topicName}
                onChange={(event) => setTopicName(event.target.value)}
                required
              />
              <textarea
                className={styles.textarea}
                placeholder='Description (optional)'
                value={topicDescription}
                onChange={(event) => setTopicDescription(event.target.value)}
              />
            </>
          }
          createLabel={createTopicMutation.isPending ? 'Saving...' : 'Add topic'}
          error={topicError}
          renderItem={(topic) => (
            <EditableTopicItem
              topic={topic}
              onUpdated={() => queryClient.invalidateQueries({ queryKey: topicsKey })}
            />
          )}
        />

        <EntityPanel<Tag>
          title='Tags'
          searchValue={tagSearch}
          onSearchChange={setTagSearch}
          items={tags}
          onCreate={onCreateTag}
          createForm={
            <input
              className={styles.input}
              placeholder='Tag name'
              value={tagName}
              onChange={(event) => setTagName(event.target.value)}
              required
            />
          }
          createLabel={createTagMutation.isPending ? 'Saving...' : 'Add tag'}
          error={tagError}
          renderItem={(tag) => (
            <EditableTagItem
              tag={tag}
              onUpdated={() => queryClient.invalidateQueries({ queryKey: tagsKey })}
            />
          )}
        />
      </div>
    </section>
  );
}

type EntityPanelProps<T> = {
  title: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  items: T[];
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
  createForm: ReactNode;
  createLabel: string;
  error: string | null;
  renderItem: (item: T) => React.ReactNode;
};

function EntityPanel<T>({
  title,
  searchValue,
  onSearchChange,
  items,
  onCreate,
  createForm,
  createLabel,
  error,
  renderItem,
}: EntityPanelProps<T>) {
  return (
    <article className={styles.panel}>
      <h2 className={styles.panelTitle}>{title}</h2>

      <input
        className={styles.input}
        placeholder={`Search ${title.toLowerCase()}...`}
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      <form className={styles.form} onSubmit={onCreate}>
        {createForm}
        <button className={styles.button} type='submit'>
          {createLabel}
        </button>
      </form>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.list}>
        {items.length === 0 ? (
          <EmptyState
            title={`No ${title.toLowerCase()} yet`}
            description={`Create your first ${title.toLowerCase().slice(0, -1)} to start organizing questions.`}
          />
        ) : (
          items.map((item) => renderItem(item))
        )}
      </div>
    </article>
  );
}

type EditableTopicItemProps = {
  topic: Topic;
  onUpdated: () => void;
};

function EditableTopicItem({ topic, onUpdated }: EditableTopicItemProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(topic.name);
  const [description, setDescription] = useState(topic.description ?? '');

  const updateMutation = useMutation({
    mutationFn: () => updateTopic(topic.id, { name, description }),
    onSuccess: async () => {
      setEditing(false);
      onUpdated();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTopic(topic.id),
    onSuccess: async () => {
      onUpdated();
    },
  });

  return (
    <div className={styles.item} key={topic.id}>
      {!editing ? (
        <>
          <div className={styles.itemHeader}>
            <strong>{topic.name}</strong>
            <div className={styles.row}>
              <button className={styles.buttonGhost} type='button' onClick={() => setEditing(true)}>
                Edit
              </button>
              <button
                className={styles.buttonGhost}
                type='button'
                onClick={() => deleteMutation.mutate()}
              >
                Delete
              </button>
            </div>
          </div>
          <p className={styles.meta}>{topic.description || 'No description'}</p>
        </>
      ) : (
        <div className={styles.form}>
          <input className={styles.input} value={name} onChange={(event) => setName(event.target.value)} />
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <div className={styles.row}>
            <button className={styles.button} type='button' onClick={() => updateMutation.mutate()}>
              Save
            </button>
            <button className={styles.buttonGhost} type='button' onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type EditableTagItemProps = {
  tag: Tag;
  onUpdated: () => void;
};

function EditableTagItem({ tag, onUpdated }: EditableTagItemProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(tag.name);

  const updateMutation = useMutation({
    mutationFn: () => updateTag(tag.id, { name }),
    onSuccess: async () => {
      setEditing(false);
      onUpdated();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTag(tag.id),
    onSuccess: async () => {
      onUpdated();
    },
  });

  return (
    <div className={styles.item} key={tag.id}>
      {!editing ? (
        <>
          <div className={styles.itemHeader}>
            <strong>{tag.name}</strong>
            <div className={styles.row}>
              <button className={styles.buttonGhost} type='button' onClick={() => setEditing(true)}>
                Edit
              </button>
              <button
                className={styles.buttonGhost}
                type='button'
                onClick={() => deleteMutation.mutate()}
              >
                Delete
              </button>
            </div>
          </div>
          <p className={styles.meta}>{tag.slug}</p>
        </>
      ) : (
        <div className={styles.form}>
          <input className={styles.input} value={name} onChange={(event) => setName(event.target.value)} />
          <div className={styles.row}>
            <button className={styles.button} type='button' onClick={() => updateMutation.mutate()}>
              Save
            </button>
            <button className={styles.buttonGhost} type='button' onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
