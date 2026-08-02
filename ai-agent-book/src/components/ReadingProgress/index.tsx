import {useEffect, useState} from 'react';
import type {ReactNode} from 'react';

/**
 * A thin reading-progress bar fixed to the top of the viewport. Width tracks
 * how far the reader has scrolled through the current page (0-100%), so it
 * doubles as "how far through this chapter I am". Mounted globally in
 * <Root>; styling lives in src/css/custom.css (`.reading-progress`).
 */
export default function ReadingProgress(): ReactNode {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      setProgress(scrollable > 0 ? Math.min(1, scrollTop / scrollable) : 0);
    };

    update();
    window.addEventListener('scroll', update, {passive: true});
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="reading-progress"
      style={{width: `${progress * 100}%`}}
    />
  );
}
