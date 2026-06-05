export const SCORE_CORRECT  =  1.5;
export const SCORE_WRONG    = -0.5;
export const SCORE_SKIP     =  0.0;
export const EXAM_QUESTIONS =  20;
export const PASS_THRESHOLD =  18;
export const MAX_SCORE      =  30;

export function computeScore(correct: number, wrong: number, total: number): number {
  const raw = Math.max(correct * SCORE_CORRECT + wrong * SCORE_WRONG, 0);
  const rawMax = total * SCORE_CORRECT;
  if (rawMax === 0) return 0;
  return Math.round((raw / rawMax) * MAX_SCORE * 10) / 10;
}
