export interface Question {
  id: number;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export type AnswerKey = 'A' | 'B' | 'C' | 'D' | 'SKIP';
export type Mode = 'exam' | 'study';

export interface AnswerRecord {
  question: Question;
  given: AnswerKey;
  correct: boolean;
  skipped: boolean;
}
