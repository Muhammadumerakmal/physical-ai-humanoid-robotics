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
import {burstConfetti} from '@site/src/components/confetti';
import styles from './leaderboard.module.css';

const LEVEL_SEEN_KEY = 'pai-quiz-level-seen';

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

  // Celebrate real level-ups (not the initial load) with a confetti burst.
  useEffect(() => {
    if (!ready) return;
    const idx = LEVELS.findIndex((l) => l.name === current.name);
    try {
      const seen = Number(window.localStorage.getItem(LEVEL_SEEN_KEY) ?? '-1');
      if (idx > seen) {
        window.localStorage.setItem(LEVEL_SEEN_KEY, String(idx));
        if (seen >= 0) burstConfetti();
      }
    } catch {
      /* ignore */
    }
  }, [ready, current.name]);

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

  const badges = [
    {icon: '🎯', name: 'First Steps', desc: 'Answer your first quiz', on: stats.answered >= 1},
    {icon: '🔥', name: 'On a Roll', desc: '3 correct in a row', on: stats.bestStreak >= 3},
    {icon: '⚡', name: 'Sharp', desc: '5 questions correct', on: stats.correct >= 5},
    {icon: '🎖️', name: 'Marksman', desc: '90%+ accuracy (5+ answered)', on: stats.accuracy >= 90 && stats.answered >= 5},
    {icon: '🏆', name: 'Streak Master', desc: '10 correct in a row', on: stats.bestStreak >= 10},
    {icon: '💯', name: 'Century', desc: 'Reach 100 points', on: stats.points >= 100},
  ];
  const unlocked = badges.filter((b) => b.on).length;

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

        <div className={styles.badges}>
          <div className={styles.badgesHead}>
            <span className={styles.ladderTitle}>Achievements</span>
            <span className={styles.badgesCount}>
              {ready ? unlocked : 0} / {badges.length}
            </span>
          </div>
          <div className={styles.badgeGrid}>
            {badges.map((b) => {
              const on = ready && b.on;
              return (
                <div
                  key={b.name}
                  className={`${styles.badge} ${on ? styles.badgeOn : ''}`}
                  title={b.desc}>
                  <span className={styles.badgeIcon} aria-hidden="true">
                    {b.icon}
                  </span>
                  <span className={styles.badgeName}>{b.name}</span>
                  <span className={styles.badgeDesc}>{b.desc}</span>
                </div>
              );
            })}
          </div>
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
