/**
 * Remembers the last chapter the reader opened (this browser only) so the
 * homepage can offer a "continue where you left off" shortcut. SSR-safe.
 */
const KEY = 'pai-last-read-v1';

export type LastRead = {path: string; title: string; ts: number};

export function recordRead(path: string, title: string): void {
  if (typeof window === 'undefined' || !path) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({path, title, ts: Date.now()}));
  } catch {
    /* storage unavailable — ignore */
  }
}

export function getLastRead(): LastRead | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    return v && typeof v.path === 'string' && typeof v.title === 'string' ? v : null;
  } catch {
    return null;
  }
}
