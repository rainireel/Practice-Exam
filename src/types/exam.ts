/**
 * ExamVault / ReviseIQ Type Definitions
 */

export interface SchoolYear {
  id: string; // 'year-3', 'year-4', etc.
  name: string; // '3rd Year', '4th Year'
}

export const DEFAULT_SCHOOL_YEARS: SchoolYear[] = [
  { id: 'year-3', name: '3rd Year' },
  { id: 'year-4', name: '4th Year' },
];

export interface Semester {
  id: string; // 'sem-1', 'sem-2'
  number: number; // 1, 2
  title: string; // '1st Semester', '2nd Semester'
}

export const DEFAULT_SEMESTERS: Semester[] = [
  { id: 'sem-1', number: 1, title: '1st Semester' },
  { id: 'sem-2', number: 2, title: '2nd Semester' },
];

export interface AcademicTerm {
  id: string; // 'prelims', 'midterms', 'prefinals', 'finals' or custom
  name: string; // 'Prelims', 'Midterms', 'Prefinals', 'Finals'
  code: string; // 'PRE', 'MID', 'P-FIN', 'FIN'
  color: string;
}

export const DEFAULT_TERMS: AcademicTerm[] = [
  { id: 'prelims', name: 'Prelims', code: 'PRE', color: 'violet' },
  { id: 'midterms', name: 'Midterms', code: 'MID', color: 'indigo' },
  { id: 'prefinals', name: 'Prefinals', code: 'P-FIN', color: 'amber' },
  { id: 'finals', name: 'Finals', code: 'FIN', color: 'emerald' },
];

export interface Question {
  id: string;
  sectionTitle?: string; // e.g. "Sec A: Theory & Core Concepts", "Sec B: Numerical & Code"
  questionText: string;
  codeSnippet?: string;
  options: string[]; // Options [A, B, C, D]
  correctIndex: number; // 0=A, 1=B, 2=C, 3=D
  explanation: string; // Verbatim explanation from source
  keyConcept?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface PracticeSet {
  id: string;
  subjectId: string;
  yearId?: string; // 'year-3', 'year-4'
  semesterId: string; // 'sem-1', 'sem-2'
  termId: string; // 'prelims' | 'midterms' | 'prefinals' | 'finals'
  title: string;
  description: string;
  timeLimitMinutes?: number; // 0 or undefined = untimed
  passingScorePercent?: number; // default 60%
  questions: Question[];
  createdAt?: string;
  isCustom?: boolean;
}

export interface Subject {
  id: string;
  yearId?: string; // 'year-3', 'year-4'
  semesterId: string; // 'sem-1' or 'sem-2'
  title: string;
  code?: string; // optional (course code removed per user request)
  description: string;
  iconName: string; // e.g. "Radio", "Code2", "Database", "Cpu", "Network", "Binary"
  color: string; // e.g. "indigo", "emerald", "violet", "cyan", "amber", "rose"
}

export interface UserExamResponse {
  [questionId: string]: number | null; // questionId -> selectedIndex (0..3) or null if unanswered
}

export interface QuestionStatusMeta {
  [questionId: string]: {
    isFlagged: boolean;
    visited: boolean;
  };
}

export type ConfidenceLevel = 'certain' | 'educated-guess' | 'pure-guess';

export interface ExamAttemptRecord {
  id: string;
  practiceSetId: string;
  practiceSetTitle: string;
  subjectId: string;
  subjectTitle: string;
  yearName?: string;
  semesterTitle: string;
  termName?: string;
  timestamp: string; // ISO string
  score: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  answers: Record<string, number | null>;
  flaggedQuestionIds: string[];
  confidences?: Record<string, ConfidenceLevel>;
}

// Spaced Repetition Types
export type SRSRating = 'again' | 'hard' | 'good' | 'easy';

export interface SpacedRepetitionCard {
  questionId: string;
  practiceSetId: string;
  subjectId: string;
  stage: number; // 1: 1 day, 2: 3 days, 3: 7 days (1 wk), 4: 14 days (2 wks), 5: 30 days (1 mo)
  intervalDays: number;
  dueDate: string; // ISO date string
  lastReviewedDate: string; // ISO date string
  consecutiveCorrect: number;
  isMarkedDifficult: boolean;
  lastRating?: SRSRating;
}

// Weak Spot & Error Notebook Types
export interface WeakSpotQuestionItem {
  question: Question;
  practiceSetId: string;
  practiceSetTitle: string;
  subjectId: string;
  subjectTitle: string;
  yearName?: string;
  semesterTitle: string;
  termName?: string;
  missCount: number; // How many times missed across all attempts
  totalAttempts: number; // How many times tested
  lastAttemptDate: string;
  lastUserAnswer: number | null;
  lastConfidence?: ConfidenceLevel;
  isDangerousBlindSpot: boolean; // Confident ('certain') but wrong
  isLuckyGuess: boolean; // Correct, but marked guess
  isResolved?: boolean; // Got it correct on the latest attempt
}

export type ViewMode =
  | 'dashboard'
  | 'exam'
  | 'review'
  | 'bookmarks'
  | 'error-notebook'
  | 'spaced-review'
  | 'weak-spots';
