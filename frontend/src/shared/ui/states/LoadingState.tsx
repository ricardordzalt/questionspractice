import styles from './StateBlock.module.css';

type LoadingStateProps = {
  title?: string;
  description?: string;
};

export function LoadingState({
  title = 'Loading...',
  description = 'Please wait a moment.',
}: LoadingStateProps) {
  return (
    <div className={styles.block}>
      <p className={styles.title}>{title}</p>
      <p className={styles.description}>{description}</p>
    </div>
  );
}
