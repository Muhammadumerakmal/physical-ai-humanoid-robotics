import {useEffect, useRef, type ReactNode} from 'react';
import styles from './Reveal.module.css';

/**
 * Lightweight scroll-reveal wrapper. Fades + rises content into view once
 * using IntersectionObserver; respects `prefers-reduced-motion` by rendering
 * fully visible immediately. `delay` is used for staggering sibling items.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = () => el.classList.add(styles.visible);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      reveal();
      return;
    }

    // Reveal immediately if the element is already at or above the viewport on
    // mount — covers above-the-fold content and anchor jumps (e.g. /#outline)
    // that land past this section.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      reveal();
      return;
    }

    // threshold 0 (any pixel visible) is more reliable than a fractional
    // threshold for sections taller than the viewport.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal();
            observer.unobserve(el);
          }
        }
      },
      {threshold: 0, rootMargin: '0px 0px -40px 0px'},
    );
    observer.observe(el);

    // Safety net: a fast programmatic scroll can skip an element entirely
    // between observer callbacks. Re-check on scroll (passive, self-removing)
    // so a section can never get stuck invisible.
    const onScroll = () => {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        reveal();
        cleanup();
      }
    };
    const cleanup = () => window.removeEventListener('scroll', onScroll);
    window.addEventListener('scroll', onScroll, {passive: true});

    return () => {
      observer.disconnect();
      cleanup();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles.reveal} ${className ?? ''}`}
      style={delay ? {transitionDelay: `${delay}ms`} : undefined}>
      {children}
    </div>
  );
}