import {
  ExamAttemptRecord,
  PracticeSet,
  Question,
  Subject,
  WeakSpotQuestionItem,
  ConfidenceLevel,
} from '../types/exam';

/**
 * Compiles all weak spots and mistakes from exam attempts.
 * Identifies:
 * - Recurring mistakes (missed more than once)
 * - Dangerous Blind Spots (user was 'certain' but got it wrong)
 * - Lucky Guesses (got it right, but guessed)
 */
export function compileWeakSpots(
  attempts: ExamAttemptRecord[],
  practiceSets: PracticeSet[],
  subjects: Subject[]
): WeakSpotQuestionItem[] {
  if (!attempts || attempts.length === 0 || !practiceSets || practiceSets.length === 0) {
    return [];
  }

  // Create fast lookup maps
  const questionMap = new Map<string, { q: Question; set: PracticeSet }>();
  practiceSets.forEach((set) => {
    set.questions.forEach((q) => {
      questionMap.set(q.id, { q, set });
    });
  });

  const subjectMap = new Map<string, Subject>();
  subjects.forEach((s) => subjectMap.set(s.id, s));

  // Sort attempts chronologically (oldest to newest) to track progression
  const sortedAttempts = [...attempts].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Map of questionId -> aggregate stats
  interface QuestionAgg {
    questionId: string;
    missCount: number;
    totalAttempts: number;
    lastAttemptDate: string;
    lastUserAnswer: number | null;
    lastConfidence?: ConfidenceLevel;
    hadBlindSpot: boolean;
    isLatestBlindSpot: boolean;
    isLatestLuckyGuess: boolean;
    isLatestResolved: boolean;
    practiceSetId: string;
    practiceSetTitle: string;
    subjectId: string;
    termName?: string;
    yearName?: string;
    semesterTitle: string;
  }

  const aggMap = new Map<string, QuestionAgg>();

  sortedAttempts.forEach((att) => {
    const answers = att.answers || {};
    const confidences = att.confidences || {};

    Object.entries(answers).forEach(([qId, userAns]) => {
      const qMeta = questionMap.get(qId);
      if (!qMeta) return;

      const { q, set } = qMeta;
      const isCorrect = userAns !== null && userAns !== undefined && userAns === q.correctIndex;
      const isMissed = !isCorrect;
      const userConfidence = confidences[qId];

      const isBlindSpot = isMissed && userConfidence === 'certain';
      const isLucky = isCorrect && (userConfidence === 'educated-guess' || userConfidence === 'pure-guess');

      let current = aggMap.get(qId);
      if (!current) {
        current = {
          questionId: qId,
          missCount: 0,
          totalAttempts: 0,
          lastAttemptDate: att.timestamp,
          lastUserAnswer: userAns,
          lastConfidence: userConfidence,
          hadBlindSpot: false,
          isLatestBlindSpot: false,
          isLatestLuckyGuess: false,
          isLatestResolved: false,
          practiceSetId: set.id,
          practiceSetTitle: att.practiceSetTitle || set.title,
          subjectId: set.subjectId,
          termName: att.termName,
          yearName: att.yearName,
          semesterTitle: att.semesterTitle,
        };
        aggMap.set(qId, current);
      }

      current.totalAttempts += 1;
      current.lastAttemptDate = att.timestamp;
      current.lastUserAnswer = userAns;
      current.lastConfidence = userConfidence;

      if (isMissed) {
        current.missCount += 1;
        current.isLatestResolved = false;
      } else {
        current.isLatestResolved = true;
      }

      if (isBlindSpot) {
        current.hadBlindSpot = true;
        current.isLatestBlindSpot = true;
      } else {
        current.isLatestBlindSpot = false;
      }

      current.isLatestLuckyGuess = isLucky;
    });
  });

  const results: WeakSpotQuestionItem[] = [];

  aggMap.forEach((agg, qId) => {
    const qMeta = questionMap.get(qId);
    if (!qMeta) return;

    // We include questions that were missed at least once, or was a blind spot, or was a lucky guess
    if (agg.missCount > 0 || agg.hadBlindSpot || agg.isLatestLuckyGuess) {
      const sub = subjectMap.get(agg.subjectId);
      results.push({
        question: qMeta.q,
        practiceSetId: agg.practiceSetId,
        practiceSetTitle: agg.practiceSetTitle,
        subjectId: agg.subjectId,
        subjectTitle: sub?.title || 'Subject',
        yearName: agg.yearName,
        semesterTitle: agg.semesterTitle,
        termName: agg.termName,
        missCount: agg.missCount,
        totalAttempts: agg.totalAttempts,
        lastAttemptDate: agg.lastAttemptDate,
        lastUserAnswer: agg.lastUserAnswer,
        lastConfidence: agg.lastConfidence,
        isDangerousBlindSpot: agg.isLatestBlindSpot || (agg.hadBlindSpot && !agg.isLatestResolved),
        isLuckyGuess: agg.isLatestLuckyGuess,
        isResolved: agg.isLatestResolved,
      });
    }
  });

  // Prioritize sorting:
  // 1. Unresolved Dangerous Blind Spots first (highest exam risk!)
  // 2. Unresolved Recurring mistakes (missCount >= 2)
  // 3. Unresolved Single mistakes (missCount === 1)
  // 4. Lucky guesses (got right by chance)
  // 5. Resolved mistakes
  return results.sort((a, b) => {
    // Unresolved vs resolved
    if (!a.isResolved && b.isResolved) return -1;
    if (a.isResolved && !b.isResolved) return 1;

    // Dangerous blind spots first
    if (a.isDangerousBlindSpot && !b.isDangerousBlindSpot) return -1;
    if (!a.isDangerousBlindSpot && b.isDangerousBlindSpot) return 1;

    // Then higher missCount
    if (b.missCount !== a.missCount) {
      return b.missCount - a.missCount;
    }

    // Most recent date
    return new Date(b.lastAttemptDate).getTime() - new Date(a.lastAttemptDate).getTime();
  });
}

/**
 * Creates a "Master My Mistakes" drill practice set from weak spots
 */
export function createMasterMyMistakesDrill(
  weakSpots: WeakSpotQuestionItem[],
  customTitle?: string,
  subjectId?: string,
  semesterId?: string,
  termId?: string
): PracticeSet {
  const questions = weakSpots.map((ws) => ws.question);
  const timeLimitMinutes = Math.max(5, Math.ceil(questions.length * 1.5));

  return {
    id: `drill-mistakes-${Date.now()}`,
    subjectId: subjectId || weakSpots[0]?.subjectId || 'sub-all',
    semesterId: semesterId || 'sem-1',
    termId: termId || 'midterms',
    title: customTitle || `Master My Mistakes Drill (${questions.length} Questions)`,
    description: `Targeted reinforcement drill focusing on your recurring mistakes and dangerous blind spots to ensure 100% exam readiness.`,
    timeLimitMinutes,
    passingScorePercent: 85,
    questions,
    createdAt: new Date().toISOString(),
    isCustom: true,
  };
}
