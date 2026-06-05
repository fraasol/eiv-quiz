import { useState } from 'react';
import type { AnswerRecord } from '../types';
import { SCORE_CORRECT, SCORE_WRONG } from '../scoring';

interface Props {
  records: AnswerRecord[];
  total: number;
  correct: number;
  wrong: number;
  skipped: number;
  score: number;
  passThreshold: number;
  maxScore: number;
  onRestart: () => void;
}

export default function Results({ records, total, correct, wrong, skipped, score, passThreshold, maxScore, onRestart }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const passed = score >= passThreshold;
  const barWidth = Math.min((score / maxScore) * 100, 100);

  const comment =
    score >= 30 ? 'Risultato eccellente! Potresti puntare alla lode.' :
    score >= passThreshold ? 'Hai superato la soglia di sufficienza!' :
    score >= 15 ? 'Quasi! Ripassa qualche argomento e riprova.' :
    "C'è ancora lavoro da fare. Continua a studiare!";

  return (
    <div className="screen results-screen">
      <div className="results-header">
        <div className={`verdict-badge ${passed ? 'pass' : 'fail'}`}>
          {passed ? '✓ SUFFICIENTE' : '✗ NON SUFFICIENTE'}
        </div>
        <div className="score-big">
          <span className="score-num">{score.toFixed(1)}</span>
          <span className="score-denom">/ {maxScore}</span>
        </div>
        <div className="score-bar-wrap">
          <div className="score-bar">
            <div className={`score-bar-fill ${passed ? 'pass' : 'fail'}`} style={{ width: `${barWidth}%` }} />
            <div className="threshold-marker" style={{ left: `${(passThreshold / maxScore) * 100}%` }} title={`Soglia: ${passThreshold}`} />
          </div>
          <div className="score-bar-labels">
            <span>0</span>
            <span className="threshold-label">{passThreshold}</span>
            <span>{maxScore}</span>
          </div>
        </div>
        <p className="result-comment">{comment}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-cell correct">
          <span className="stat-num">{correct}</span>
          <span className="stat-label">Corrette</span>
          <span className="stat-pts">+{(correct * SCORE_CORRECT).toFixed(1)} pt</span>
        </div>
        <div className="stat-cell wrong">
          <span className="stat-num">{wrong}</span>
          <span className="stat-label">Sbagliate</span>
          <span className="stat-pts">{(wrong * SCORE_WRONG).toFixed(1)} pt</span>
        </div>
        <div className="stat-cell skip">
          <span className="stat-num">{skipped}</span>
          <span className="stat-label">Saltate</span>
          <span className="stat-pts">0 pt</span>
        </div>
        <div className="stat-cell total">
          <span className="stat-num">{total}</span>
          <span className="stat-label">Totale</span>
          <span className="stat-pts">&nbsp;</span>
        </div>
      </div>

      <div className="review-section">
        <h2 className="review-title">Revisione domande</h2>
        <div className="review-list">
          {records.map((r, i) => (
            <div
              key={r.question.id}
              className={`review-item ${r.correct ? 'correct' : r.skipped ? 'skipped' : 'wrong'}`}
              onClick={() => setExpandedId(expandedId === r.question.id ? null : r.question.id)}
            >
              <div className="review-item-header">
                <span className="review-num">{i + 1}</span>
                <span className="review-icon">
                  {r.correct ? '✓' : r.skipped ? '–' : '✗'}
                </span>
                <span className="review-q-text">{r.question.question}</span>
                <span className="review-chevron">{expandedId === r.question.id ? '▲' : '▼'}</span>
              </div>
              {expandedId === r.question.id && (
                <div className="review-detail">
                  <div className="review-options">
                    {(['A','B','C','D'] as const).map(key => (
                      <div
                        key={key}
                        className={`review-option ${
                          key === r.question.answer ? 'correct' :
                          key === r.given && key !== r.question.answer ? 'wrong' : ''
                        }`}
                      >
                        <span className="option-key">{key}</span>
                        <span>{r.question.options[key]}</span>
                        {key === r.question.answer && <span className="rv-mark">✓</span>}
                        {key === r.given && key !== r.question.answer && <span className="rv-mark">✗</span>}
                      </div>
                    ))}
                  </div>
                  <div className="review-answer-row">
                    <span>Tua risposta: <strong>{r.skipped ? 'SALTATA' : r.given}</strong></span>
                    <span>Risposta corretta: <strong>{r.question.answer}</strong></span>
                  </div>
                  {r.question.explanation && (
                    <p className="review-explanation">{r.question.explanation}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <button className="restart-btn" onClick={onRestart}>
        ↺ Nuova simulazione
      </button>
    </div>
  );
}
