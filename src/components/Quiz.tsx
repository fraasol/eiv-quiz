import { useState, useEffect } from 'react';
import type { Question, AnswerKey, Mode } from '../types';
import { computeScore, MAX_SCORE, SCORE_CORRECT, SCORE_WRONG } from '../scoring';

interface Props {
  questions: Question[];
  index: number;
  total: number;
  mode: Mode;
  answers: Record<number, AnswerKey>;
  onAnswer: (given: AnswerKey) => void;
  onNavigate: (to: number) => void;
  onStop: () => void;
}

const OPTION_KEYS: AnswerKey[] = ['A', 'B', 'C', 'D'];

function QuestionText({ text }: { text: string }) {
  const matrixRegex = /\[\[([^\]]+)\](?:,\[([^\]]+)\])*\]/g;
  if (!matrixRegex.test(text)) {
    return <p className="question-text">{text}</p>;
  }
  const parts = text.split(/(\[\[.*?\](?:,\[.*?\])*\])/g);
  return (
      <div className="question-text">
        {parts.map((part, i) => {
          if (part.match(/^\[\[/)) {
            try {
              const rows = part.slice(1, -1).split('],[').map(row =>
                  row.replace(/[\[\]]/g, '').split(',').map(v => v.trim())
              );
              return (
                  <span key={i} className="matrix-wrap">
                <span className="matrix-bracket">[</span>
                <span className="matrix-rows">
                  {rows.map((row, ri) => (
                      <span key={ri} className="matrix-row">
                      {row.map((cell, ci) => (
                          <span key={ci} className="matrix-cell">{cell}</span>
                      ))}
                    </span>
                  ))}
                </span>
                <span className="matrix-bracket">]</span>
              </span>
              );
            } catch {
              return <span key={i}>{part}</span>;
            }
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
  );
}

export default function Quiz({
                               questions, index, total, mode, answers, onAnswer, onNavigate, onStop
                             }: Props) {
  const question = questions[index];
  const existingAnswer = answers[index] ?? null;
  const [selected, setSelected] = useState<AnswerKey | null>(existingAnswer);
  const [revealed, setRevealed] = useState(mode === 'study' && existingAnswer !== null);
  const [confirmStop, setConfirmStop] = useState(false);

  useEffect(() => {
    const ea = answers[index] ?? null;
    setSelected(ea);
    setRevealed(mode === 'study' && ea !== null);
  }, [index, answers, mode]);

  const correctSoFar = Object.keys(answers).filter(i => answers[Number(i)] === questions[Number(i)]?.answer).length;
  const wrongSoFar = Object.keys(answers).filter(i => answers[Number(i)] !== 'SKIP' && answers[Number(i)] !== questions[Number(i)]?.answer).length;
  const score = computeScore(correctSoFar, wrongSoFar, total);
  const progress = (index / total) * 100;
  const locked = mode === 'study' && revealed;

  const handleSelect = (key: AnswerKey) => {
    if (locked) return;
    setSelected(key);
    if (mode === 'study') setRevealed(true);
  };

  const handleNext = () => onAnswer(selected ?? 'SKIP');

  const optionClass = (key: AnswerKey): string => {
    if (mode === 'study') {
      if (!revealed) return selected === key ? 'option selected' : 'option';
      if (key === question.answer) return 'option correct';
      if (key === selected && key !== question.answer) return 'option wrong';
      return 'option faded';
    }
    // modalità esame: nessun colore durante il quiz
    return selected === key ? 'option selected' : 'option';
  };

  return (
      <div className="screen quiz-screen">
        <div className="quiz-header">
          <div className="quiz-meta">
            <span className="q-counter">{index + 1} / {total}</span>
            <span className="q-id">#{question.id}</span>
          </div>
          {mode === 'study' && (
              <div className="score-display">
                <span className="score-label">Punteggio</span>
                <span className="score-value">{score.toFixed(1)}<span className="score-max">/{MAX_SCORE}</span></span>
              </div>
          )}
          <button className="stop-btn" onClick={() => setConfirmStop(true)} title="Interrompi">✕</button>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="question-body">
          <QuestionText text={question.question} />

          <div className="options-list">
            {OPTION_KEYS.map(key => (
                <button
                    key={key}
                    className={optionClass(key)}
                    onClick={() => handleSelect(key)}
                    disabled={locked}
                >
                  <span className="option-key">{key}</span>
                  <span className="option-text">{question.options[key as 'A' | 'B' | 'C' | 'D']}</span>
                  {mode === 'study' && revealed && key === question.answer && <span className="option-marker">✓</span>}
                  {mode === 'study' && revealed && key === selected && key !== question.answer && <span className="option-marker">✗</span>}
                </button>
            ))}
          </div>

          {/* Spiegazione solo in modalità studio */}
          {mode === 'study' && revealed && (
              <div className={`explanation-box ${selected === question.answer ? 'correct' : selected === 'SKIP' ? 'skip' : 'wrong'}`}>
                <div className="explanation-verdict">
                  {selected === question.answer
                      ? `✓ Corretta! +${SCORE_CORRECT} pt`
                      : selected === 'SKIP'
                          ? `→ Saltata. 0 pt — La risposta era ${question.answer}`
                          : `✗ Sbagliata. ${SCORE_WRONG} pt — La risposta era ${question.answer}`}
                </div>
                {question.explanation && <p className="explanation-text">{question.explanation}</p>}
              </div>
          )}

          <div className="action-row">
            {index > 0 && (
                <button className="btn-nav" onClick={() => onNavigate(index - 1)}>← Indietro</button>
            )}
            <div className="action-main">

              {/* MODALITÀ STUDIO */}
              {mode === 'study' && !revealed && (
                  <>
                    <button className="btn-skip" onClick={() => { setSelected('SKIP'); setRevealed(true); }}>
                      Salta (0 pt)
                    </button>
                    {selected !== null && (
                        <button className="btn-confirm" onClick={() => setRevealed(true)}>Verifica →</button>
                    )}
                  </>
              )}
              {mode === 'study' && revealed && (
                  <button className="btn-confirm btn-next" onClick={handleNext}>
                    {index + 1 < total ? 'Prossima →' : 'Risultati →'}
                  </button>
              )}

              {/* MODALITÀ ESAME */}
              {mode === 'exam' && (
                  <>
                    <button className="btn-skip" onClick={() => {
                      setSelected('SKIP');
                      if (index + 1 < total) {
                        onAnswer('SKIP');
                      } else {
                        onAnswer('SKIP');
                      }
                    }}>
                      Salta (0 pt)
                    </button>
                    {index + 1 < total ? (
                        <button
                            className="btn-confirm"
                            onClick={() => onAnswer(selected ?? 'SKIP')}
                        >
                          Avanti →
                        </button>
                    ) : (
                        <button
                            className="btn-confirm btn-next"
                            onClick={() => onAnswer(selected ?? 'SKIP')}
                        >
                          Consegna →
                        </button>
                    )}
                  </>
              )}

            </div>
          </div>
        </div>

        {confirmStop && (
            <div className="modal-overlay" onClick={() => setConfirmStop(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <p>Interrompere il quiz e vedere i risultati?</p>
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