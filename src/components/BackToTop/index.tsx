import {useEffect, useState} from 'react';
import styles from './styles.module.css';

/**
 * A floating "back to top" button that appears after the reader scrolls down.
 * Mounted globally via the swizzled Root. Placed bottom-left so it never
 * overlaps the book-assistant FAB (bottom-right).
 */
export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`${styles.btn} ${show ? styles.show : ''}`}
      aria-label="Back to top"
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'auto'
            : 'smooth',
        })
      }>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true">
        <line x1="12" y1="19" x2="12" y2="6" />
        <polyline points="6 12 12 6 18 12" />
      </svg>
    </button>
  );
}
