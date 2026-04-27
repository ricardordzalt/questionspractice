import styles from "./DashboardHome.module.css";

export function DashboardHome() {
  return (
    <section className={styles.container}>
      <h1 className={styles.title}>Welcome back</h1>
      <p className={styles.subtitle}>
        Pick a study flow and keep your interview momentum today.
      </p>

      <div className={styles.grid}>
        <article className={styles.card}>
          <h2 className={styles.cardTitle}>Continue practicing</h2>
          <p className={styles.cardBody}>Resume where you left off and keep recall speed high.</p>
        </article>

        <article className={styles.card}>
          <h2 className={styles.cardTitle}>Due for review</h2>
          <p className={styles.cardBody}>Questions that need repetition will appear here.</p>
        </article>

        <article className={styles.card}>
          <h2 className={styles.cardTitle}>Weak areas</h2>
          <p className={styles.cardBody}>Track topics that need more reps before interview day.</p>
        </article>
      </div>
    </section>
  );
}
