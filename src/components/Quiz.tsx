import { useState, useEffect } from 'react';
import type { Question, AnswerKey, Mode } from '../types';
import { computeScore, MAX_SCORE, SCORE_CORRECT, SCORE_WRONG } from '../scoring';

interface Props {
  question: Question;
  index: number;
  total: number;
  mode: Mode;
  correctSoFar: number;
  wrongSoFar: number;
  onAnswer: (given: AnswerKey) => void;
  onStop: () => void;
}

const OPTION_KEYS: AnswerKey[] = ['A', 'B', 'C', 'D'];

export default function Quiz({
  question, index, total, mode,
  correctSoFar, wrongSoFar,
  onAnswer, onStop
}: Props) {
  const [selected, setSelected] = useState<AnswerKey | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [confirmStop, setConfirmStop] = useState(false);

  // Reset per ogni nuova domanda
  useEffect(() => {
    setSelected(null);
    setRevealed(false);
  }, [question.id]);

  const score = computeScore(correctSoFar, wrongSoFar, total);
  const progress = ((index) / total) * 100;

  const handleSelect = (key: AnswerKey) => {
    if (revealed) return;
    setSelected(key);
    if (mode === 'study') {
      setRevealed(true);
    }
  };

  const handleConfirm = () => {
    if (selected === null) return;
    onAnswer(selected);
  };

  const handleSkip = () => {
    if (revealed) return;
    if (mode === 'study') {
      setSelected('SKIP');
      setRevealed(true);
    } else {
      onAnswer('SKIP');
    }
  };

  const handleNext = () => {
    onAnswer(selected!);
  };

  const optionClass = (key: AnswerKey): string => {
    if (!revealed) {
      return selected === key ? 'option selected' : 'option';
    }
    if (key === question.answer) return 'option correct';
    if (key === selected && key !== question.answer) return 'option wrong';
    return 'option faded';
  };

  return (
    <div className="screen quiz-screen">
      {/* Header */}
      <div className="quiz-header">
        <div className="quiz-meta">
          <span className="q-counter">{index + 1} / {total}</span>
          <span className="q-id">#{question.id}</span>
        </div>
        <div className="score-display">
          <span className="score-label">Punteggio</span>
          <span className="score-value">{score.toFixed(1)}<span className="score-max">/{MAX_SCORE}</span></span>
        </div>
        <button className="stop-btn" onClick={() => setConfirmStop(true)} title="Interrompi">✕</button>
      </div>

      {/* Progress */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <div className="question-body">
        <p className="question-text">{question.question}</p>

        <div className="options-list">
          {OPTION_KEYS.map(key => (
            <button
              key={key}
              className={optionClass(key)}
              onClick={() => handleSelect(key)}
              disabled={revealed}
            >
              <span className="option-key">{key}</span>
              <span className="option-text">{question.options[key as 'A'|'B'|'C'|'D']}</span>
              {revealed && key === question.answer && <span className="option-marker">✓</span>}
              {revealed && key === selected && key !== question.answer && <span className="option-marker">✗</span>}
            </button>
          ))}
        </div>

        {/* Study mode explanation */}
        {revealed && mode === 'study' && (
          <div className={`explanation-box ${selected === question.answer ? 'correct' : selected === 'SKIP' ? 'skip' : 'wrong'}`}>
            <div className="explanation-verdict">
              {selected === question.answer
                ? `✓ Corretta! +${SCORE_CORRECT} pt`
                : selected === 'SKIP'
                ? `→ Saltata. 0 pt — La risposta era ${question.answer}`
                : `✗ Sbagliata. ${SCORE_WRONG} pt — La risposta era ${question.answer}`}
            </div>
            {question.explanation && (
              <p className="explanation-text">{question.explanation}</p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="action-row">
          {!revealed ? (
            <>
              {mode === 'exam' ? (
                <>
                  <button
                    className="btn-skip"
                    onClick={handleSkip}
                  >
                    Salta (0 pt)
                  </button>
                  <button
                    className="btn-confirm"
                    onClick={handleConfirm}
                    disabled={selected === null}
                  >
                    Conferma →
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-skip" onClick={handleSkip}>Salta (0 pt)</button>
                  {selected !== null && (
                    <button className="btn-confirm" onClick={() => setRevealed(true)}>
                      Verifica →
                    </button>
                  )}
                </>
              )}
            </>
          ) : (
            <button className="btn-confirm btn-next" onClick={handleNext}>
              {index + 1 < total ? 'Prossima →' : 'Risultati →'}
            </button>
          )}
        </div>
      </div>

      {/* Stop confirmation */}
      {confirmStop && (
        <div className="modal-overlay" onClick={() => setConfirmStop(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <p>Interrompere il quiz e vedere i risultati parziali?</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setConfirmStop(false)}>Continua</button>
              <button className="btn-danger" onClick={onStop}>Interrompi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
