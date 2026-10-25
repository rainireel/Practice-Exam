import {
  SchoolYear,
  Semester,
  Subject,
  PracticeSet,
  ExamAttemptRecord,
  SpacedRepetitionCard,
  AcademicTerm,
  DEFAULT_SCHOOL_YEARS,
  DEFAULT_SEMESTERS,
  DEFAULT_TERMS,
} from '../types/exam';
import {
  DEFAULT_SUBJECTS,
  DEFAULT_PRACTICE_SETS,
} from '../data/defaultQuestionBank';

const STORAGE_KEYS = {
  YEARS: 'reviseiq_years_v3',
  SEMESTERS: 'reviseiq_semesters_v3',
  TERMS: 'reviseiq_terms_v3',
  SUBJECTS: 'reviseiq_subjects_v3',
  PRACTICE_SETS: 'reviseiq_practice_sets_v3',
  ATTEMPTS: 'reviseiq_attempts_v3',
  BOOKMARKS: 'reviseiq_bookmarks_v3',
  SPACED_REPETITION: 'reviseiq_spaced_repetition_v3',
};

export function getStoredSchoolYears(): SchoolYear[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.YEARS);
    if (!raw) return DEFAULT_SCHOOL_YEARS;
    const parsed = JSON.parse(raw);
    return parsed.length > 0 ? parsed : DEFAULT_SCHOOL_YEARS;
  } catch {
    return DEFAULT_SCHOOL_YEARS;
  }
}

export function saveSchoolYears(years: SchoolYear[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.YEARS, JSON.stringify(years));
  } catch (e) {
    console.error('Failed to save school years', e);
  }
}

export function getStoredSemesters(): Semester[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SEMESTERS);
    if (!raw) return DEFAULT_SEMESTERS;
    const parsed = JSON.parse(raw);
    return parsed.length > 0 ? parsed : DEFAULT_SEMESTERS;
  } catch {
    return DEFAULT_SEMESTERS;
  }
}

export function saveSemesters(semesters: Semester[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SEMESTERS, JSON.stringify(semesters));
  } catch (e) {
    console.error('Failed to save semesters', e);
  }
}

export function getStoredTerms(): AcademicTerm[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TERMS);
    if (!raw) return DEFAULT_TERMS;
    const parsed = JSON.parse(raw);
    return parsed.length > 0 ? parsed : DEFAULT_TERMS;
  } catch {
    return DEFAULT_TERMS;
  }
}

export function saveTerms(terms: AcademicTerm[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TERMS, JSON.stringify(terms));
  } catch (e) {
    console.error('Failed to save terms', e);
  }
}

export function getStoredSubjects(): Subject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (!raw) return DEFAULT_SUBJECTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_SUBJECTS;
  } catch {
    return DEFAULT_SUBJECTS;
  }
}

export function saveSubjects(subjects: Subject[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  } catch (e) {
    console.error('Failed to save subjects', e);
  }
}

export function getStoredPracticeSets(): PracticeSet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRACTICE_SETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRACTICE_SETS, JSON.stringify(DEFAULT_PRACTICE_SETS));
      return DEFAULT_PRACTICE_SETS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_PRACTICE_SETS;
  } catch {
    return DEFAULT_PRACTICE_SETS;
  }
}

export function savePracticeSets(sets: PracticeSet[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRACTICE_SETS, JSON.stringify(sets));
  } catch (e) {
    console.error('Failed to save practice sets', e);
  }
}

export function getStoredAttempts(): ExamAttemptRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAttempt(record: ExamAttemptRecord): void {
  try {
    const current = getStoredAttempts();
    const updated = [record, ...current].slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save attempt', e);
  }
}

export function getStoredBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function toggleBookmarkStorage(questionId: string): string[] {
  try {
    const bookmarks = getStoredBookmarks();
    const index = bookmarks.indexOf(questionId);
    let updated: string[];
    if (index >= 0) {
      updated = bookmarks.filter((id) => id !== questionId);
    } else {
      updated = [...bookmarks, questionId];
    }
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function getStoredSRSCards(): Record<string, SpacedRepetitionCard> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SPACED_REPETITION);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveStoredSRSCards(cards: Record<string, SpacedRepetitionCard>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SPACED_REPETITION, JSON.stringify(cards));
  } catch (e) {
    console.error('Failed to save spaced repetition cards', e);
  }
}

export function resetAllData(): void {
  Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
}
