import {useState} from 'react';
import styles from './styles.module.css';

type QuizProps = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
};

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function Quiz({question, options, correctAnswerIndex}: QuizProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);

  return (
    <div className={styles.quizContainer}>
      <div className={styles.quizLabel}>Quick Check</div>
      <h4 className={styles.question}>{question}</h4>
      <div className={styles.options}>
        {options.map((opt: string, i: number) => {
          const isCorrect = showResult && i === correctAnswerIndex;
          const isWrong =
            showResult && selected === i && i !== correctAnswerIndex;
          return (
            <button
              key={i}
              onClick={() => {
                setSelected(i);
                setShowResult(true);
              }}
              className={`${styles.option} ${isCorrect ? styles.correct : ''} ${isWrong ? styles.incorrect : ''}`}
              disabled={showResult}
            >
              <span className={styles.letter}>{LETTERS[i]}</span>
              <span className={styles.optionText}>{opt}</span>
              {isCorrect && (
                <span className={styles.badge} aria-hidden="true">
                  ✓
                </span>
              )}
              {isWrong && (
                <span className={`${styles.badge} ${styles.badgeWrong}`} aria-hidden="true">
                  ✕
                </span>
              )}
            </button>
          );
        })}
      </div>
      {showResult && (
        <div
          className={`${styles.feedback} ${
            selected === correctAnswerIndex ? styles.feedbackCorrect : styles.feedbackWrong
          }`}
        >
          {selected === correctAnswerIndex ? 'Correct!' : 'Not quite — try another option.'}
        </div>
      )}
    </div>
  );
}
