import {useCallback, useEffect, useRef, useState} from 'react';
import {useLocation} from '@docusaurus/router';
import styles from './styles.module.css';

type Highlight = {
  id: string;
  path: string;
  /** Page title captured at creation, for the review panel. */
  title: string;
  text: string;
  note: string;
  createdAt: number;
};

const KEY = 'pai-notes';
const MARK_ATTR = 'data-hl-id';

function loadAll(): Highlight[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Highlight[]) : [];
  } catch {
    return [];
  }
}

function persist(items: Highlight[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* ignore quota / unavailable */
  }
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

/** The chapter/article body Docusaurus renders. */
function getContainer(): HTMLElement | null {
  return (
    (document.querySelector('.theme-doc-markdown') as HTMLElement | null) ??
    (document.querySelector('main article') as HTMLElement | null)
  );
}

/** Wrap the first text-node occurrence of `text` inside `container` in a <mark>. */
function wrapFirst(container: HTMLElement, text: string, id: string): boolean {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.includes(text)) {
        return NodeFilter.FILTER_SKIP;
      }
      // Skip text already inside a highlight or inside code blocks.
      const parent = node.parentElement;
      if (!parent || parent.closest('mark, pre, code')) {
        return NodeFilter.FILTER_SKIP;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const node = walker.nextNode() as Text | null;
  if (!node || !node.nodeValue) return false;
  const start = node.nodeValue.indexOf(text);
  if (start < 0) return false;
  try {
    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, start + text.length);
    const mark = document.createElement('mark');
    mark.className = styles.mark;
    mark.setAttribute(MARK_ATTR, id);
    range.surroundContents(mark);
    return true;
  } catch {
    return false;
  }
}

/** Replace a <mark> with its plain text (used when deleting a highlight). */
function unwrap(id: string) {
  const el = document.querySelector(`[${MARK_ATTR}="${id}"]`);
  if (el && el.parentNode) {
    el.replaceWith(document.createTextNode(el.textContent ?? ''));
  }
}

function PenIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export default function Notes() {
  const location = useLocation();
  const [items, setItems] = useState<Highlight[]>([]);
  const [open, setOpen] = useState(false);
  const [toolbar, setToolbar] = useState<{x: number; y: number} | null>(null);
  const pendingRange = useRef<Range | null>(null);

  // Hydrate from storage after mount (SSR-safe).
  useEffect(() => {
    setItems(loadAll());
  }, []);

  const setAndPersist = useCallback((next: Highlight[]) => {
    setItems(next);
    persist(next);
  }, []);

  // Re-apply this page's highlights on navigation (after the DOM settles).
  useEffect(() => {
    const id = window.setTimeout(() => {
      const container = getContainer();
      if (!container) return;
      for (const h of loadAll()) {
        if (h.path !== location.pathname) continue;
        if (container.querySelector(`[${MARK_ATTR}="${h.id}"]`)) continue;
        wrapFirst(container, h.text, h.id);
      }
    }, 250);
    return () => window.clearTimeout(id);
  }, [location.pathname]);

  // Show the selection toolbar when the user selects text inside the chapter.
  useEffect(() => {
    function onMouseUp() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setToolbar(null);
        return;
      }
      const text = sel.toString().trim();
      const container = getContainer();
      const range = sel.getRangeAt(0);
      if (
        !text ||
        text.length < 4 ||
        text.length > 600 ||
        !container ||
        !container.contains(range.commonAncestorContainer)
      ) {
        setToolbar(null);
        return;
      }
      const rect = range.getBoundingClientRect();
      pendingRange.current = range.cloneRange();
      setToolbar({
        x: rect.left + rect.width / 2,
        y: rect.top + window.scrollY,
      });
    }
    document.addEventListener('mouseup', onMouseUp);
    return () => document.removeEventListener('mouseup', onMouseUp);
  }, []);

  function addHighlight() {
    const range = pendingRange.current;
    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if (!range || !text) return;
    const id = uid();
    const container = getContainer();
    if (container) wrapFirst(container, text, id);
    const entry: Highlight = {
      id,
      path: location.pathname,
      title: document.title.split('|')[0].trim(),
      text,
      note: '',
      createdAt: Date.now(),
    };
    setAndPersist([entry, ...loadAll()]);
    sel?.removeAllRanges();
    setToolbar(null);
    setOpen(true);
  }

  function updateNote(id: string, note: string) {
    setAndPersist(loadAll().map((h) => (h.id === id ? {...h, note} : h)));
  }

  function remove(id: string) {
    unwrap(id);
    setAndPersist(loadAll().filter((h) => h.id !== id));
  }

  function jumpTo(h: Highlight) {
    if (h.path === location.pathname) {
      const el = document.querySelector(`[${MARK_ATTR}="${h.id}"]`);
      if (el) {
        el.scrollIntoView({behavior: 'smooth', block: 'center'});
        (el as HTMLElement).classList.add(styles.flash);
        window.setTimeout(() => (el as HTMLElement).classList.remove(styles.flash), 1200);
        return;
      }
    }
    window.location.assign(h.path);
  }

  const onThisPage = items.filter((h) => h.path === location.pathname);
  const elsewhere = items.filter((h) => h.path !== location.pathname);

  return (
    <>
      {toolbar && (
        <button
          type="button"
          className={styles.selToolbar}
          style={{left: toolbar.x, top: toolbar.y}}
          onMouseDown={(e) => e.preventDefault()}
          onClick={addHighlight}>
          <PenIcon /> Highlight
        </button>
      )}

      {open && (
        <div className={styles.panel} role="dialog" aria-label="My notes and highlights">
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <PenIcon /> Notes &amp; Highlights
            </div>
            <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Close notes">
              ✕
            </button>
          </div>

          <div className={styles.body}>
            {items.length === 0 && (
              <p className={styles.empty}>
                Select any text in a chapter and click <strong>Highlight</strong> to
                save it here. Add your own notes to each highlight.
              </p>
            )}

            {onThisPage.length > 0 && (
              <>
                <div className={styles.groupLabel}>On this page</div>
                {onThisPage.map((h) => (
                  <HighlightCard key={h.id} h={h} onJump={jumpTo} onNote={updateNote} onDelete={remove} />
                ))}
              </>
            )}

            {elsewhere.length > 0 && (
              <>
                <div className={styles.groupLabel}>Elsewhere in the book</div>
                {elsewhere.map((h) => (
                  <HighlightCard key={h.id} h={h} onJump={jumpTo} onNote={updateNote} onDelete={remove} showTitle />
                ))}
              </>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        className={styles.fab}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close notes' : 'Open notes and highlights'}
        aria-expanded={open}>
        <PenIcon />
        {items.length > 0 && <span className={styles.badge}>{items.length}</span>}
      </button>
    </>
  );
}

function HighlightCard({
  h,
  onJump,
  onNote,
  onDelete,
  showTitle,
}: {
  h: Highlight;
  onJump: (h: Highlight) => void;
  onNote: (id: string, note: string) => void;
  onDelete: (id: string) => void;
  showTitle?: boolean;
}) {
  return (
    <div className={styles.card}>
      {showTitle && <div className={styles.cardTitle}>{h.title}</div>}
      <button type="button" className={styles.quote} onClick={() => onJump(h)} title="Jump to highlight">
        “{h.text}”
      </button>
      <textarea
        className={styles.noteInput}
        placeholder="Add a note…"
        defaultValue={h.note}
        onBlur={(e) => onNote(h.id, e.target.value)}
        rows={2}
      />
      <button type="button" className={styles.delete} onClick={() => onDelete(h.id)}>
        Delete
      </button>
    </div>
  );
}
