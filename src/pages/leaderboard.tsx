import {useEffect, useState, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import {
  getStats,
  levelFor,
  resetStats,
  subscribe,
  LEVELS,
  type QuizStats,
} from '@site/src/components/Educational/quizStats';
import styles from './leaderboard.module.css';

const EMPTY: QuizStats = {
  answered: 0,
  correct: 0,
  points: 0,
  accuracy: 0,
  currentStreak: 0,
  bestStreak: 0,
};

export default function LeaderboardPage(): ReactNode {
  const [stats, setStats] = useState<QuizStats>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const refresh = () => setStats(getStats());
    refresh();
    setReady(true);
    return subscribe(refresh);
  }, []);

  const {current, next} = levelFor(stats.points);
  const span = next ? next.min - current.min : 1;
  const into = stats.points - current.min;
  const pct = next ? Math.min(100, Math.round((into / span) * 100)) : 100;

  const tiles = [
    {label: 'Points', value: stats.points},
    {label: 'Quizzes answered', value: stats.answered},
    {label: 'Accuracy', value: `${stats.accuracy}%`},
    {label: 'Current streak', value: stats.currentStreak},
    {label: 'Best streak', value: stats.bestStreak},
  ];

  return (
    <Layout
      title="Your Progress"
      description="Track your quiz score, accuracy, and streak as you work through the book.">
      <main className="container margin-vert--lg">
        <div className={styles.head}>
          <div className={styles.kicker}>Your Progress</div>
          <Heading as="h1" className={styles.title}>
            Quiz leaderboard
          </Heading>
          <p className={styles.lede}>
            Every <strong>Quick Check</strong> you answer across the book counts here.
            Scores are kept privately in your browser — nothing is uploaded.
          </p>
        </div>

        <div className={styles.levelCard}>
          <div className={styles.levelTop}>
            <div>
              <div className={styles.levelKicker}>Current level</div>
              <div className={styles.levelName}>{ready ? current.name : '—'}</div>
            </div>
            <div className={styles.levelPoints}>
              {ready ? stats.points : 0}
              <span> pts</span>
            </div>
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{width: `${ready ? pct : 0}%`}} />
          </div>
          <div className={styles.levelFoot}>
            {next
              ? `${next.min - stats.points} pts to ${next.name}`
              : 'Top level reached — nicely done.'}
          </div>
        </div>

        <div className={styles.tiles}>
          {tiles.map((t) => (
            <div key={t.label} className={styles.tile}>
              <div className={styles.tileValue}>{ready ? t.value : '—'}</div>
              <div className={styles.tileLabel}>{t.label}</div>
            </div>
          ))}
        </div>

        <div className={styles.ladder}>
          <div className={styles.ladderTitle}>Levels</div>
          {LEVELS.map((lv) => {
            const reached = ready && stats.points >= lv.min;
            const isCurrent = ready && current.name === lv.name;
            return (
              <div
                key={lv.name}
                className={`${styles.rung} ${reached ? styles.rungReached : ''} ${
                  isCurrent ? styles.rungCurrent : ''
                }`}>
                <span className={styles.rungDot} aria-hidden="true" />
                <span className={styles.rungName}>{lv.name}</span>
                <span className={styles.rungMin}>{lv.min} pts</span>
              </div>
            );
          })}
        </div>

        <div className={styles.actions}>
          <Link className={styles.primaryBtn} to="/docs/intro">
            Answer more quizzes <span aria-hidden="true">→</span>
          </Link>
          <button
            type="button"
            className={styles.resetBtn}
            onClick={() => {
              if (window.confirm('Reset your quiz progress on this browser?')) {
                resetStats();
              }
            }}>
            Reset progress
          </button>
        </div>
      </main>
    </Layout>
  );
}
