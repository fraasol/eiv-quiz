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
  const [answers, setAnswers] = useState<Record<number, AnswerKey>>({});

  const handleStart = useCallback((n: number, m: Mode) => {
    const picked = shuffle(allQuestions as Question[]).slice(0, n);
    setQuestions(picked);
    setMode(m);
    setIndex(0);
    setAnswers({});
    setScreen('quiz');
  }, []);

  const handleAnswer = useCallback((given: AnswerKey) => {
    const newAnswers = { ...answers, [index]: given };
    setAnswers(newAnswers);
    if (index + 1 >= questions.length) {
      setScreen('results');
    } else {
      setIndex(index + 1);
    }
  }, [index, questions.length, answers]);

  const handleNavigate = useCallback((to: number) => {
    setIndex(to);
  }, []);

  const handleStop = useCallback(() => {
    setScreen('results');
  }, []);

  const handleRestart = useCallback(() => {
    setScreen('setup');
  }, []);

  const allRecords: AnswerRecord[] = questions.map((q, i) => {
    const given: AnswerKey = answers[i] ?? 'SKIP';
    const skipped = answers[i] === undefined || answers[i] === 'SKIP';
    const correct = !skipped && given === q.answer;
    return { question: q, given, correct, skipped };
  });

  const correctCount = allRecords.filter(r => r.correct).length;
  const wrongCount = allRecords.filter(r => !r.correct && !r.skipped).length;
  const skippedCount = allRecords.filter(r => r.skipped).length;
  const score = computeScore(correctCount, wrongCount, questions.length || EXAM_QUESTIONS);

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
                questions={questions}
                index={index}
                total={questions.length}
                mode={mode}
                answers={answers}
                onAnswer={handleAnswer}
                onNavigate={handleNavigate}
                onStop={handleStop}
            />
        )}
        {screen === 'results' && (
            <Results
                records={allRecords}
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