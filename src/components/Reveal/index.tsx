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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add(styles.visible);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add(styles.visible);
            observer.unobserve(el);
          }
        }
      },
      {threshold: 0.12, rootMargin: '0px 0px -40px 0px'},
    );
    observer.observe(el);
    return () => observer.disconnect();
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