import { useState, useCallback } from 'react';
import allQuestions from './questions.json';
import type { Question, AnswerKey, Mode, AnswerRecord } from './types';
import { computeScore, EXAM_QUESTIONS, PASS_THRESHOLD, MAX_SCORE } from './scoring';
import Setup from './components/Setup';
import Quiz from './components/Quiz';
import Results from './components/Results';

type Screen = 'setup' | 'quiz' | 'results';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('setup');
  const [mode, setMode] = useState<Mode>('exam');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [records, setRecords] = useState<AnswerRecord[]>([]);

  const handleStart = useCallback((n: number, m: Mode) => {
    const picked = shuffle(allQuestions as Question[]).slice(0, n);
    setQuestions(picked);
    setMode(m);
    setIndex(0);
    setRecords([]);
    setScreen('quiz');
  }, []);

  const handleAnswer = useCallback((given: AnswerKey) => {
    const q = questions[index];
    const skipped = given === 'SKIP';
    const correct = !skipped && given === q.answer;
    const record: AnswerRecord = { question: q, given, correct, skipped };
    const newRecords = [...records, record];
    setRecords(newRecords);

    if (index + 1 >= questions.length) {
      setScreen('results');
    } else {
      setIndex(index + 1);
    }
  }, [questions, index, records]);

  const handleStop = useCallback(() => {
    setScreen('results');
  }, []);

  const handleRestart = useCallback(() => {
    setScreen('setup');
  }, []);

  const correctCount  = records.filter(r => r.correct).length;
  const wrongCount    = records.filter(r => !r.correct && !r.skipped).length;
  const skippedCount  = records.filter(r => r.skipped).length;
  const score         = computeScore(correctCount, wrongCount, questions.length || EXAM_QUESTIONS);

  return (
    <div className="app">
      {screen === 'setup' && (
        <Setup
          totalAvailable={(allQuestions as Question[]).length}
          defaultN={EXAM_QUESTIONS}
          onStart={handleStart}
        />
      )}
      {screen === 'quiz' && (
        <Quiz
          question={questions[index]}
          index={index}
          total={questions.length}
          mode={mode}
          correctSoFar={correctCount}
          wrongSoFar={wrongCount}
          onAnswer={handleAnswer}
          onStop={handleStop}
        />
      )}
      {screen === 'results' && (
        <Results
          records={records}
          total={questions.length}
          correct={correctCount}
          wrong={wrongCount}
          skipped={skippedCount}
          score={score}
          passThreshold={PASS_THRESHOLD}
          maxScore={MAX_SCORE}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
