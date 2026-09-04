import {useEffect, useState} from 'react';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import styles from './styles.module.css';

/** Map a docs folder like `part3-control` to its display name. */
const PART_BY_DIR: Record<string, string> = {
  'part1-foundations': 'Part I · Foundations',
  'part2-sensing': 'Part II · Sensing & Perception',
  'part3-control': 'Part III · Actuation & Control',
  'part4-learning': 'Part IV · Learning & Intelligence',
  'part5-systems': 'Part V · Systems, Simulation & Deployment',
  'part6-future': 'Part VI · The Road Ahead',
  appendices: 'Appendix',
};

const WORDS_PER_MINUTE = 220;

/**
 * Chapter eyebrow rendered above the H1 on book pages. Shows the book part
 * (derived from the doc's folder) and a best-effort reading time computed from
 * the rendered article body after hydration.
 */
export default function ChapterBanner() {
  const {metadata} = useDoc();
  const part = PART_BY_DIR[metadata.sourceDirName] ?? null;
  const [minutes, setMinutes] = useState<number | null>(null);

  /** Open the book assistant with a chapter-specific question. */
  function askAi() {
    window.dispatchEvent(
      new CustomEvent('bookagent:ask', {
        detail: {question: `Explain the chapter "${metadata.title}" in simple terms`},
      }),
    );
  }

  useEffect(() => {
    const el = document.querySelector('.theme-doc-markdown');
    if (!el) return;
    const text = (el.textContent ?? '').trim();
    const words = text ? text.split(/\s+/).length : 0;
    const readMin = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
    setMinutes(readMin);
  }, [metadata.sourceDirName]);

  if (!part) {
    return null;
  }

  return (
    <div className={styles.banner}>
      <span className={styles.part}>{part}</span>
      {minutes !== null && (
        <span className={styles.readTime}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {minutes} min read
        </span>
      )}
      <button type="button" className={styles.askAi} onClick={askAi}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true">
          <path d="M12 3a7 7 0 0 0-4 12.7V18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 3Z" />
          <line x1="9" y1="22" x2="15" y2="22" />
        </svg>
        Ask the AI about this chapter
      </button>
    </div>
  );
}