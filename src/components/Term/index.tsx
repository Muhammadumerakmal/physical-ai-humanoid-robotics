import type {ReactNode} from 'react';
import {findEntry} from '@site/src/data/glossary';
import styles from './styles.module.css';

type TermProps = {
  /** Optional explicit glossary key, e.g. <Term id="ZMP">zero moment point</Term>. */
  id?: string;
  children: ReactNode;
};

/**
 * Inline glossary term with a hover/focus tooltip pulled from the shared
 * glossary data. Usage in MDX:
 *
 *   <Term>ZMP</Term>
 *   <Term id="inverse kinematics">IK</Term>
 *
 * Falls back to plain text (no tooltip) if the term is not in the glossary,
 * so it can never break a build over a typo.
 */
export default function Term({id, children}: TermProps) {
  const key = id ?? (typeof children === 'string' ? children : '');
  const entry = key ? findEntry(key) : undefined;

  if (!entry) {
    return <span>{children}</span>;
  }

  const anchor = entry.term.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <span className={styles.term} tabIndex={0}>
      {children}
      <span className={styles.tooltip} role="tooltip">
        <span className={styles.tipTerm}>{entry.term}</span>
        <span className={styles.tipDef}>{entry.definition}</span>
        <a className={styles.tipLink} href={`/glossary#${anchor}`}>
          Open in glossary →
        </a>
      </span>
    </span>
  );
}
