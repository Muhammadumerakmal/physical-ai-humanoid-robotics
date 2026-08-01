import type {ReactNode} from 'react';
import styles from './styles.module.css';

type ExerciseProps = {
  title?: string;
  children: ReactNode;
};

export default function Exercise({title, children}: ExerciseProps) {
  return (
    <div className={styles.exerciseContainer}>
      <div className={styles.header}>
        <span className={styles.icon}>💻</span>
        <h4 className={styles.title}>{title || 'Coding Exercise'}</h4>
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
