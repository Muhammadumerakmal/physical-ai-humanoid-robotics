/**
 * Per-browser quiz progress store (no backend).
 *
 * Every <Quiz> records its first result here via `recordAnswer`, keyed by a
 * stable hash of the question so the same quiz isn't double-counted across
 * navigations. The Leaderboard / "Your Progress" page reads aggregate stats
 * with `getStats` and live-updates through `subscribe`.
 *
 * All access is guarded for SSR (localStorage is browser-only).
 */

const KEY = 'pai-quiz-progress-v1';
const EVENT = 'pai:quiz-progress';
const POINTS_PER_CORRECT = 10;

type Entry = {correct: boolean; ts: number};
type Store = {perQuiz: Record<string, Entry>};

export type QuizStats = {
  answered: number;
  correct: number;
  points: number;
  accuracy: number; // 0..100
  currentStreak: number;
  bestStreak: number;
};

export type Level = {name: string; min: number};

/** Achievement tiers, ascending by points. */
export const LEVELS: Level[] = [
  {name: 'Getting Started', min: 0},
  {name: 'Apprentice', min: 50},
  {name: 'Engineer', min: 150},
  {name: 'Roboticist', min: 300},
  {name: 'Humanoid Master', min: 500},
];

function read(): Store {
  if (typeof window === 'undefined') return {perQuiz: {}};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {perQuiz: {}};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && parsed.perQuiz
      ? (parsed as Store)
      : {perQuiz: {}};
  } catch {
    return {perQuiz: {}};
  }
}

function write(store: Store) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // Storage can be unavailable (private mode / quota) — degrade silently.
  }
}

/** Small, stable string hash → quiz id. */
export function quizId(seed: string): string {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 33) ^ seed.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
}

/**
 * Record a quiz result. Counts only the first attempt per quiz, but upgrades a
 * previously-wrong answer to correct if the reader later gets it right (never
 * downgrades), so the tracker rewards learning rather than punishing a miss.
 */
export function recordAnswer(id: string, correct: boolean): void {
  const store = read();
  const existing = store.perQuiz[id];
  if (existing) {
    if (correct && !existing.correct) {
      store.perQuiz[id] = {correct: true, ts: existing.ts};
      write(store);
    }
    return;
  }
  store.perQuiz[id] = {correct, ts: Date.now()};
  write(store);
}

export function getStats(): QuizStats {
  const entries = Object.values(read().perQuiz).sort((a, b) => a.ts - b.ts);
  let answered = 0;
  let correct = 0;
  let cur = 0;
  let best = 0;
  for (const e of entries) {
    answered++;
    if (e.correct) {
      correct++;
      cur++;
      best = Math.max(best, cur);
    } else {
      cur = 0;
    }
  }
  return {
    answered,
    correct,
    points: correct * POINTS_PER_CORRECT,
    accuracy: answered ? Math.round((correct / answered) * 100) : 0,
    currentStreak: cur,
    bestStreak: best,
  };
}

export function resetStats(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}

export function levelFor(points: number): {current: Level; next: Level | null} {
  let current = LEVELS[0];
  let next: Level | null = null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (points >= LEVELS[i].min) {
      current = LEVELS[i];
      next = LEVELS[i + 1] ?? null;
    }
  }
  return {current, next};
}

/** Subscribe to progress changes (same-tab custom event + cross-tab storage). */
export function subscribe(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener('storage', onStorage);
  };
}
