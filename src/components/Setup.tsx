import { useState } from 'react';
import type { Mode } from '../types';
import { EXAM_QUESTIONS } from '../scoring';

interface Props {
  totalAvailable: number;
  defaultN: number;
  onStart: (n: number, mode: Mode) => void;
}

export default function Setup({ totalAvailable, defaultN, onStart }: Props) {
  const [nInput, setNInput] = useState(String(defaultN));
  const [mode, setMode] = useState<Mode>('exam');
  const [error, setError] = useState('');

  const handleStart = () => {
    const trimmed = nInput.trim().toLowerCase();
    let n: number;
    if (trimmed === 'tutte' || trimmed === 'all') {
      n = totalAvailable;
    } else if (trimmed === 'esame' || trimmed === '') {
      n = EXAM_QUESTIONS;
    } else {
      n = parseInt(trimmed, 10);
      if (isNaN(n) || n < 1 || n > totalAvailable) {
        setError(`Inserisci un numero tra 1 e ${totalAvailable}`);
        return;
      }
    }
    setError('');
    onStart(n, mode);
  };

  return (
    <div className="screen setup-screen">
      <div className="setup-card">
        <div className="setup-logo">
          <span className="logo-accent">EIV</span>
          <span className="logo-sub">Quiz</span>
        </div>
        <h1 className="setup-title">Simulazione Esame</h1>
        <p className="setup-subtitle">Elaborazione di Immagini e Video</p>

        <div className="setup-section">
          <label className="field-label">Numero di domande</label>
          <div className="preset-buttons">
            <button
              className={`preset-btn ${nInput === String(EXAM_QUESTIONS) ? 'active' : ''}`}
              onClick={() => setNInput(String(EXAM_QUESTIONS))}
            >
              Esame ({EXAM_QUESTIONS})
            </button>
            <button
              className={`preset-btn ${nInput === '10' ? 'active' : ''}`}
              onClick={() => setNInput('10')}
            >
              10
            </button>
            <button
              className={`preset-btn ${nInput === '30' ? 'active' : ''}`}
              onClick={() => setNInput('30')}
            >
              30
            </button>
            <button
              className={`preset-btn ${nInput === String(totalAvailable) ? 'active' : ''}`}
              onClick={() => setNInput(String(totalAvailable))}
            >
              Tutte ({totalAvailable})
            </button>
          </div>
          <input
            className="n-input"
            type="number"
            min={1}
            max={totalAvailable}
            value={nInput}
            onChange={e => { setNInput(e.target.value); setError(''); }}
            placeholder={`1–${totalAvailable}`}
          />
          {error && <p className="input-error">{error}</p>}
        </div>

        <div className="setup-section">
          <label className="field-label">Modalità</label>
          <div className="mode-toggle">
            <button
              className={`mode-btn ${mode === 'exam' ? 'active' : ''}`}
              onClick={() => setMode('exam')}
            >
              <span className="mode-icon">🎯</span>
              <span className="mode-name">Esame</span>
              <span className="mode-desc">Feedback solo alla fine</span>
            </button>
            <button
              className={`mode-btn ${mode === 'study' ? 'active' : ''}`}
              onClick={() => setMode('study')}
            >
              <span className="mode-icon">📖</span>
              <span className="mode-name">Studio</span>
              <span className="mode-desc">Feedback immediato</span>
            </button>
          </div>
        </div>

        <div className="setup-section scoring-info">
          <label className="field-label">Punteggio</label>
          <div className="score-legend">
            <div className="score-item correct">+1.5 pt &mdash; corretta</div>
            <div className="score-item wrong">&minus;0.5 pt &mdash; sbagliata</div>
            <div className="score-item skip">0 pt &mdash; saltata</div>
          </div>
          <p className="threshold-note">Soglia sufficienza: 18/30</p>
        </div>

        <button className="start-btn" onClick={handleStart}>
          Inizia simulazione →
        </button>
      </div>
    </div>
  );
}
