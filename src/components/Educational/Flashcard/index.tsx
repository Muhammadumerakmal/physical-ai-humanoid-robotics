import {useEffect, useMemo, useState} from 'react';
import styles from './styles.module.css';

type Card = {
  front: string;
  back: string;
};

type FlashcardDeckProps = {
  /** Cards in the deck. `front` is the prompt, `back` is the answer. */
  cards: Card[];
  /** Short deck title shown in the header (e.g. "Chapter 1 Review"). */
  title?: string;
  /**
   * Stable id used to persist mastery in localStorage. Defaults to a slug of
   * `title`. Give two decks on the same page different ids.
   */
  deckId?: string;
};

type Mastery = Record<number, 'known' | 'again'>;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * FlashcardDeck — a lightweight, self-check study deck. Flip a card to reveal
 * the answer, mark it "Got it" or "Review", and the deck remembers your
 * progress per browser via localStorage. Mirrors the prop/import style of the
 * Quiz and Exercise components so it drops into any chapter MDX.
 */
export default function FlashcardDeck({
  cards,
  title = 'Flashcards',
  deckId,
}: FlashcardDeckProps) {
  const storageKey = useMemo(
    () => `pai-flashcards:${deckId || slugify(title)}`,
    [deckId, title],
  );

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastery, setMastery] = useState<Mastery>({});
  const [hydrated, setHydrated] = useState(false);

  // Load saved mastery after mount (guarded for SSR).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setMastery(JSON.parse(raw));
    } catch {
      /* ignore malformed/unavailable storage */
    }
    setHydrated(true);
  }, [storageKey]);

  // Persist mastery whenever it changes (after initial hydration).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(mastery));
    } catch {
      /* ignore */
    }
  }, [mastery, storageKey, hydrated]);

  if (!cards || cards.length === 0) return null;

  const total = cards.length;
  const current = cards[index];
  const knownCount = Object.values(mastery).filter((m) => m === 'known').length;

  const go = (next: number) => {
    setIndex((next + total) % total);
    setFlipped(false);
  };

  const mark = (state: 'known' | 'again') => {
    setMastery((prev) => ({...prev, [index]: state}));
    go(index + 1);
  };

  const reset = () => {
    setMastery({});
    setIndex(0);
    setFlipped(false);
  };

  const status = mastery[index];

  return (
    <div className={styles.deck}>
      <div className={styles.header}>
        <span className={styles.icon}>🗂️</span>
        <h4 className={styles.title}>{title}</h4>
        <span className={styles.progress}>
          {knownCount}/{total} learned
        </span>
      </div>

      <div className={styles.progressTrack}>
        <div
          className={styles.progressBar}
          style={{width: `${(knownCount / total) * 100}%`}}
        />
      </div>

      <button
        type="button"
        className={`${styles.card} ${flipped ? styles.isFlipped : ''}`}
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? 'Show question' : 'Reveal answer'}
      >
        <div className={styles.cardInner}>
          <div className={styles.cardFace}>
            <span className={styles.faceLabel}>Question</span>
            <span className={styles.faceText}>{current.front}</span>
            <span className={styles.hint}>Click to flip</span>
          </div>
          <div className={`${styles.cardFace} ${styles.cardBack}`}>
            <span className={styles.faceLabel}>Answer</span>
            <span className={styles.faceText}>{current.back}</span>
            <span className={styles.hint}>Click to flip back</span>
          </div>
        </div>
      </button>

      <div className={styles.markRow}>
        <button
          type="button"
          className={`${styles.markBtn} ${styles.again} ${
            status === 'again' ? styles.activeAgain : ''
          }`}
          onClick={() => mark('again')}
        >
          ↺ Review
        </button>
        <button
          type="button"
          className={`${styles.markBtn} ${styles.known} ${
            status === 'known' ? styles.activeKnown : ''
          }`}
          onClick={() => mark('known')}
        >
          ✓ Got it
        </button>
      </div>

      <div className={styles.nav}>
        <button type="button" className={styles.navBtn} onClick={() => go(index - 1)}>
          ← Prev
        </button>
        <span className={styles.counter}>
          Card {index + 1} of {total}
        </span>
        <button type="button" className={styles.navBtn} onClick={() => go(index + 1)}>
          Next →
        </button>
      </div>

      {knownCount === total && (
        <div className={styles.done}>
          🎉 Deck complete — you marked every card as learned.
          <button type="button" className={styles.resetBtn} onClick={reset}>
            Study again
          </button>
        </div>
      )}
    </div>
  );
}
