import {useMemo, useState} from 'react';
import {GLOSSARY, CATEGORIES, type GlossaryCategory} from '@site/src/data/glossary';
import styles from './styles.module.css';

/**
 * Searchable, filterable glossary. Reused by the /glossary page and the
 * appendix doc so there is a single rendered source of truth.
 */
export default function GlossaryList() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<GlossaryCategory | 'All'>('All');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GLOSSARY.filter((e) => {
      const inCategory = active === 'All' || e.category === active;
      if (!inCategory) return false;
      if (!q) return true;
      return (
        e.term.toLowerCase().includes(q) ||
        e.definition.toLowerCase().includes(q) ||
        (e.aka ?? []).some((a) => a.toLowerCase().includes(q))
      );
    }).sort((a, b) => a.term.localeCompare(b.term));
  }, [query, active]);

  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            className={styles.search}
            placeholder={`Search ${GLOSSARY.length} terms…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search glossary"
          />
        </div>
        <div className={styles.filters}>
          <button
            type="button"
            className={`${styles.chip} ${active === 'All' ? styles.chipActive : ''}`}
            onClick={() => setActive('All')}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`${styles.chip} ${active === c ? styles.chipActive : ''}`}
              onClick={() => setActive(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <p className={styles.count}>
        {filtered.length} {filtered.length === 1 ? 'term' : 'terms'}
      </p>

      {filtered.length === 0 ? (
        <p className={styles.empty}>No terms match “{query}”.</p>
      ) : (
        <dl className={styles.list}>
          {filtered.map((e) => (
            <div key={e.term} id={e.term.toLowerCase().replace(/[^a-z0-9]+/g, '-')} className={styles.item}>
              <dt className={styles.term}>
                {e.term}
                {e.aka && e.aka.length > 0 && (
                  <span className={styles.aka}>{e.aka.join(' · ')}</span>
                )}
                <span className={styles.cat}>{e.category}</span>
              </dt>
              <dd className={styles.def}>{e.definition}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
