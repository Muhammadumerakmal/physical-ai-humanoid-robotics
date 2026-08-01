import {useState} from 'react';
import styles from './styles.module.css';

type QuizProps = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
};

export default function Quiz({question, options, correctAnswerIndex}: QuizProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);

  return (
    <div className={styles.quizContainer}>
      <h4 className={styles.question}>{question}</h4>
      <div className={styles.options}>
        {options.map((opt: string, i: number) => (
          <button
            key={i}
            onClick={() => { setSelected(i); setShowResult(true); }}
            className={`${styles.option} ${showResult && i === correctAnswerIndex ? styles.correct : ''} ${showResult && selected === i && i !== correctAnswerIndex ? styles.incorrect : ''}`}
            disabled={showResult}
          >
            {opt}
          </button>
        ))}
      </div>
      {showResult && (
        <div className={styles.feedback}>
          {selected === correctAnswerIndex ? '✅ Correct!' : '❌ Try again.'}
        </div>
      )}
    </div>
  );
}
