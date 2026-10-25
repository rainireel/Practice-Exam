import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  PracticeSet,
  ExamAttemptRecord,
  Question,
  SpacedRepetitionCard,
  SRSRating,
  ConfidenceLevel,
} from '../types/exam';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Clock,
  ArrowLeft,
  Bookmark,
  Share2,
  Lightbulb,
  Filter,
  Check,
  X,
  Target,
  Sparkles,
  Shuffle,
  Copy,
  Calendar,
  AlertTriangle,
  Flame,
  Zap,
  BookOpen,
} from 'lucide-react';

interface ReviewViewProps {
  practiceSet: PracticeSet;
  attempt: ExamAttemptRecord;
  bookmarkedQuestionIds: string[];
  srsCards?: Record<string, SpacedRepetitionCard>;
  onUpdateSRSCard?: (card: SpacedRepetitionCard) => void;
  onToggleBookmark: (questionId: string) => void;
  onRetakeFull: (shuffle?: boolean) => void;
  onRetakeMissed: (missedQuestions: Question[]) => void;
  onBackToDashboard: () => void;
  onOpenErrorNotebook?: () => void;
  onOpenSpacedReview?: () => void;
  onOpenWeakSpots?: () => void;
}

export const ReviewView: React.FC<ReviewViewProps> = ({
  practiceSet,
  attempt,
  bookmarkedQuestionIds,
  srsCards = {},
  onUpdateSRSCard,
  onToggleBookmark,
  onRetakeFull,
  onRetakeMissed,
  onBackToDashboard,
  onOpenErrorNotebook,
  onOpenSpacedReview,
  onOpenWeakSpots,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'incorrect' | 'skipped' | 'correct' | 'flagged' | 'due' | 'blindspots' | 'lucky'>('all');
  const [shuffleOnRetake, setShuffleOnRetake] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Trigger celebration confetti on pass or high score
  useEffect(() => {
    if (attempt.passed && attempt.percentage >= 60) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#10b981', '#f59e0b', '#06b6d4'],
        });
      } catch (e) {
        // confetti fallback
      }
    }
  }, [attempt.passed, attempt.percentage]);

  const bookmarksSet = new Set(bookmarkedQuestionIds);

  // Group questions by status
  const missedQuestions: Question[] = [];
  const correctQuestions: Question[] = [];
  const skippedQuestions: Question[] = [];

  const confidences = attempt.confidences || {};
  const blindSpotQuestions: Question[] = [];
  const luckyGuessQuestions: Question[] = [];
  const masteredQuestions: Question[] = [];

  practiceSet.questions.forEach((q) => {
    const userAns = attempt.answers[q.id];
    const isAnswered = userAns !== undefined && userAns !== null;
    const isCorrect = isAnswered && userAns === q.correctIndex;
    const conf = confidences[q.id];

    if (!isAnswered) {
      skippedQuestions.push(q);
      missedQuestions.push(q);
    } else if (isCorrect) {
      correctQuestions.push(q);
      if (conf === 'educated-guess' || conf === 'pure-guess') {
        luckyGuessQuestions.push(q);
      } else {
        masteredQuestions.push(q);
      }
    } else {
      missedQuestions.push(q);
      if (conf === 'certain') {
        blindSpotQuestions.push(q);
      }
    }
  });

  // Filter questions for display
  const filteredQuestions = practiceSet.questions.filter((q) => {
    const userAns = attempt.answers[q.id];
    const isAnswered = userAns !== undefined && userAns !== null;
    const isCorrect = isAnswered && userAns === q.correctIndex;
    const isSkipped = !isAnswered;
    const isFlagged = attempt.flaggedQuestionIds.includes(q.id) || bookmarksSet.has(q.id);
    const conf = confidences[q.id];

    if (activeFilter === 'incorrect') return isAnswered && !isCorrect;
    if (activeFilter === 'skipped') return isSkipped;
    if (activeFilter === 'correct') return isCorrect;
    if (activeFilter === 'flagged') return isFlagged;
    if (activeFilter === 'blindspots') return isAnswered && !isCorrect && conf === 'certain';
    if (activeFilter === 'lucky') return isCorrect && (conf === 'educated-guess' || conf === 'pure-guess');
    return true;
  });

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs}s`;
  };

  const handleCopySummary = () => {
    const summary = `ReviseIQ Assessment: ${practiceSet.title}
Score: ${attempt.score}/${attempt.totalQuestions} (${attempt.percentage}%)
Result: ${attempt.passed ? 'PASSED' : 'NEEDS REVIEW'}
Time: ${formatTime(attempt.timeSpentSeconds)}`;
    navigator.clipboard.writeText(summary);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            title="Copy score summary to clipboard"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied Summary' : 'Share Result'}</span>
          </button>
        </div>
      </div>

      {/* Grade & Score Hero Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs overflow-hidden relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                Performance Evaluation
              </span>
              <span
                className={`text-xs font-bold px-3 py-0.5 rounded-full flex items-center gap-1.5 ${
                  attempt.passed
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {attempt.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {attempt.passed ? 'Assessment Passed' : 'Needs Reinforcement'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {practiceSet.title}
            </h1>
            <p className="text-xs text-slate-500">
              Completed on {new Date(attempt.timestamp).toLocaleDateString()} at{' '}
              {new Date(attempt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* Score Gauge Block */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 shrink-0">
            <div className="text-center">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {attempt.percentage}%
              </span>
              <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                Final Score
              </span>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="text-left text-xs space-y-1">
              <div>
                <strong className="text-slate-800 font-bold">{attempt.correctCount}</strong> /{' '}
                {attempt.totalQuestions} Correct
              </div>
              <div className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Time: {formatTime(attempt.timeSpentSeconds)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-100">
          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 mb-1">
              <span>Correct</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-xl font-bold text-emerald-700">{attempt.correctCount}</span>
            <span className="text-[11px] text-emerald-600 block mt-0.5">
              {Math.round((attempt.correctCount / attempt.totalQuestions) * 100)}% accuracy
            </span>
          </div>

          <div className="bg-rose-50/70 border border-rose-200/60 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs font-semibold text-rose-800 mb-1">
              <span>Incorrect</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <span className="text-xl font-bold text-rose-700">{attempt.incorrectCount}</span>
            <span className="text-[11px] text-rose-600 block mt-0.5">Scheduled for 1d review</span>
          </div>

          <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Skipped</span>
              <HelpCircle className="w-4 h-4 text-slate-500" />
            </div>
            <span className="text-xl font-bold text-slate-800">{attempt.skippedCount}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Scheduled for 1d review</span>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-800 mb-1">
              <span>Flagged / Difficult</span>
              <Bookmark className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-xl font-bold text-amber-700">{attempt.flaggedQuestionIds.length}</span>
            <span className="text-[11px] text-amber-600 block mt-0.5">High-frequency review</span>
          </div>
        </div>

        {/* ERROR NOTEBOOK & MISTAKES DRILL SUMMARY BANNER */}
        {missedQuestions.length > 0 && (
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border border-rose-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                    Error Notebook Updated
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-200/80 text-rose-900">
                    {missedQuestions.length} Missed Question{missedQuestions.length !== 1 ? 's' : ''} Saved
                  </span>
                </div>
                <p className="text-xs text-rose-900 mt-0.5 leading-relaxed">
                  Every missed question and guess has been compiled in your Error Notebook. Launch a targeted drill before your exam to ensure 100% mastery.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
              <button
                onClick={() => onRetakeMissed(missedQuestions)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Drill Missed ({missedQuestions.length})</span>
              </button>

              <button
                onClick={() => {
                  if (onOpenErrorNotebook) onOpenErrorNotebook();
                  else if (onOpenSpacedReview) onOpenSpacedReview();
                  else if (onOpenWeakSpots) onOpenWeakSpots();
                }}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-rose-500" />
                <span>Error Notebook</span>
              </button>
            </div>
          </div>
        )}

        {/* COGNITIVE CONFIDENCE & BLIND SPOT DIAGNOSTIC BANNER */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-rose-50/90 border border-amber-300/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Cognitive Confidence & Blind Spot Diagnostic
                  </h4>
                  {blindSpotQuestions.length > 0 && (
                    <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-rose-500 text-white animate-pulse">
                      High Exam Risk
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                  Comparing your self-rated certainty against actual correctness to reveal hidden blind spots and lucky guesses.
                </p>
              </div>
            </div>

            {(onOpenSpacedReview || onOpenWeakSpots) && (
              <button
                onClick={() => (onOpenSpacedReview ? onOpenSpacedReview() : onOpenWeakSpots?.())}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
              >
                <span>Open Error Notebook</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <button
              onClick={() => setActiveFilter('blindspots')}
              className="p-3 rounded-xl bg-rose-100/90 border border-rose-300 text-left hover:bg-rose-200/90 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                  <span>🚨 Dangerous Blind Spots</span>
                </span>
                <span className="text-lg font-black text-rose-700">{blindSpotQuestions.length}</span>
              </div>
              <span className="text-[11px] text-rose-800 block mt-0.5 leading-snug">
                Marked Certain, but answered incorrectly.
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('lucky')}
              className="p-3 rounded-xl bg-amber-100/90 border border-amber-300 text-left hover:bg-amber-200/90 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <span>🍀 Lucky Guesses</span>
                </span>
                <span className="text-lg font-black text-amber-700">{luckyGuessQuestions.length}</span>
              </div>
              <span className="text-[11px] text-amber-800 block mt-0.5 leading-snug">
                Got correct, but marked as pure or educated guess.
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('correct')}
              className="p-3 rounded-xl bg-emerald-100/90 border border-emerald-300 text-left hover:bg-emerald-200/90 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <span>🎯 Confirmed Mastery</span>
                </span>
                <span className="text-lg font-black text-emerald-700">{masteredQuestions.length}</span>
              </div>
              <span className="text-[11px] text-emerald-800 block mt-0.5 leading-snug">
                Marked Certain and answered correctly.
              </span>
            </button>
          </div>
        </div>

        {/* Dedicated Retake Actions Bar */}
        <div className="pt-6 mt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onRetakeFull(shuffleOnRetake)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-indigo-200 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Full Assessment</span>
            </button>

            {missedQuestions.length > 0 && (
              <button
                onClick={() => onRetakeMissed(missedQuestions)}
                className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                title="Practice only questions you got wrong or skipped"
              >
                <Target className="w-4 h-4 text-amber-600" />
                <span>Retake Missed Only ({missedQuestions.length})</span>
              </button>
            )}
          </div>

          {/* Shuffle toggle */}
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={shuffleOnRetake}
              onChange={(e) => setShuffleOnRetake(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 border-slate-300"
            />
            <Shuffle className="w-3.5 h-3.5 text-slate-400" />
            <span>Shuffle questions on retake</span>
          </label>
        </div>
      </div>

      {/* Review Section Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Verbatim Explanations & Spaced Repetition Schedule
          </h2>
          <p className="text-xs text-slate-500">
            Analyze each answer against official rationales and adjust spaced review intervals.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl text-xs font-semibold text-slate-600 overflow-x-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeFilter === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            All ({practiceSet.questions.length})
          </button>
          <button
            onClick={() => setActiveFilter('blindspots')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeFilter === 'blindspots' ? 'bg-rose-600 text-white font-bold shadow-xs' : 'hover:text-rose-700'
            }`}
          >
            🚨 Blind Spots ({blindSpotQuestions.length})
          </button>
          <button
            onClick={() => setActiveFilter('lucky')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeFilter === 'lucky' ? 'bg-amber-500 text-white font-bold shadow-xs' : 'hover:text-amber-800'
            }`}
          >
            🍀 Lucky ({luckyGuessQuestions.length})
          </button>
          <button
            onClick={() => setActiveFilter('incorrect')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeFilter === 'incorrect' ? 'bg-white text-rose-700 font-bold shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Incorrect ({attempt.incorrectCount})
          </button>
          <button
            onClick={() => setActiveFilter('skipped')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeFilter === 'skipped' ? 'bg-white text-slate-800 font-bold shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Skipped ({attempt.skippedCount})
          </button>
          <button
            onClick={() => setActiveFilter('correct')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeFilter === 'correct' ? 'bg-white text-emerald-700 font-bold shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Correct ({attempt.correctCount})
          </button>
          <button
            onClick={() => setActiveFilter('flagged')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeFilter === 'flagged' ? 'bg-white text-amber-700 font-bold shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Flagged ({attempt.flaggedQuestionIds.length})
          </button>
        </div>
      </div>

      {/* Questions Review Cards List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-2xl border border-slate-200">
            <p className="text-sm text-slate-500">No questions match the selected filter.</p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const userAnsIndex = attempt.answers[q.id];
            const isAnswered = userAnsIndex !== undefined && userAnsIndex !== null;
            const isCorrect = isAnswered && userAnsIndex === q.correctIndex;
            const isSkipped = !isAnswered;
            const isBookmarked = bookmarksSet.has(q.id);
            const originalIndex = practiceSet.questions.findIndex((item) => item.id === q.id);

            const userConfidence = confidences[q.id];
            const isBlindSpot = isAnswered && !isCorrect && userConfidence === 'certain';
            const isLucky = isAnswered && isCorrect && (userConfidence === 'educated-guess' || userConfidence === 'pure-guess');

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border-2 p-5 sm:p-6 shadow-xs transition-all space-y-4 ${
                  isBlindSpot
                    ? 'border-rose-400 ring-2 ring-rose-200/50'
                    : isCorrect
                    ? 'border-emerald-200/90'
                    : isSkipped
                    ? 'border-slate-200'
                    : 'border-rose-200/90'
                }`}
              >
                {/* Header row: Question #, Section, Verdict Badge, Confidence Badge, Bookmark button */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-slate-500 font-mono">
                      Q{originalIndex + 1}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {q.sectionTitle || 'General'}
                    </span>

                    {/* Verdict Pill */}
                    {isCorrect ? (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                        <Check className="w-3 h-3 stroke-[3]" />
                        Correct
                      </span>
                    ) : isSkipped ? (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 flex items-center gap-1 border border-slate-200">
                        <HelpCircle className="w-3 h-3" />
                        Skipped
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 flex items-center gap-1 border border-rose-200">
                        <X className="w-3 h-3 stroke-[3]" />
                        Incorrect
                      </span>
                    )}

                    {/* Confidence Rating Pill */}
                    {userConfidence && (
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 border ${
                          userConfidence === 'certain'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : userConfidence === 'educated-guess'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-purple-50 text-purple-800 border-purple-300'
                        }`}
                        title="Self-rated confidence level before grading"
                      >
                        <span>
                          {userConfidence === 'certain'
                            ? '🎯 Certain'
                            : userConfidence === 'educated-guess'
                            ? '💡 Educated Guess'
                            : '🎲 Pure Guess'}
                        </span>
                      </span>
                    )}

                    {/* Error Notebook Logged Badge */}
                    {!isCorrect && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-rose-500" />
                        <span>In Error Notebook</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Bookmark Button */}
                    <button
                      onClick={() => onToggleBookmark(q.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                        isBookmarked
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200 hover:bg-slate-50'
                      }`}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark this question for study'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                      <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <h4 className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                  {q.questionText}
                </h4>

                {/* Code snippet if present */}
                {q.codeSnippet && (
                  <div className="rounded-xl overflow-hidden bg-slate-900 text-slate-100 font-mono text-xs my-2 p-3.5 border border-slate-800">
                    <pre className="overflow-x-auto">
                      <code>{q.codeSnippet}</code>
                    </pre>
                  </div>
                )}

                {/* Options List */}
                <div className="space-y-2 mt-2">
                  {q.options.map((opt, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx);
                    const isSelectedByUser = userAnsIndex === optIdx;
                    const isThisCorrect = q.correctIndex === optIdx;

                    let optStyle = 'border-slate-200 bg-slate-50/50 text-slate-700';
                    let badgeStyle = 'bg-slate-200 text-slate-700';

                    if (isThisCorrect) {
                      optStyle = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-medium shadow-2xs';
                      badgeStyle = 'bg-emerald-600 text-white';
                    } else if (isSelectedByUser && !isCorrect) {
                      optStyle = 'border-rose-400 bg-rose-50/80 text-rose-950';
                      badgeStyle = 'bg-rose-600 text-white';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-colors ${optStyle}`}
                      >
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${badgeStyle}`}
                        >
                          {letter}
                        </div>
                        <div className="flex-1 leading-snug">{opt}</div>

                        {/* Status Label on Option */}
                        {isThisCorrect && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded shrink-0">
                            ✓ Correct Answer
                          </span>
                        )}
                        {isSelectedByUser && !isCorrect && (
                          <span className="text-[11px] font-bold text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded shrink-0">
                            ✕ Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Cognitive Diagnostics: Dangerous Blind Spot or Lucky Guess Banner */}
                {isBlindSpot && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-950 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <strong className="block font-bold text-rose-900">
                        🚨 Dangerous Blind Spot (High Exam Risk)
                      </strong>
                      <p className="text-rose-800 leading-relaxed">
                        You felt <strong>Certain</strong> about this question, but answered incorrectly. Unconscious errors like this cost the most points on exam day. Prioritize mastering the explanation below!
                      </p>
                    </div>
                  </div>
                )}

                {isLucky && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <strong className="block font-bold text-amber-900">
                        🍀 Lucky Guess (Needs Reinforcement)
                      </strong>
                      <p className="text-amber-800 leading-relaxed">
                        You answered correctly, but marked your confidence as an educated/pure guess. Review the explanation below so you can solve this concept with 100% certainty in the exam.
                      </p>
                    </div>
                  </div>
                )}

                {/* VERBATIM EXPLANATION BOX */}
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                    <Lightbulb className="w-4 h-4 text-indigo-600" />
                    <span>Verbatim Explanation & Key Rationale</span>
                    {q.keyConcept && (
                      <span className="ml-auto text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-indigo-200/60 text-indigo-800">
                        Concept: {q.keyConcept}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-indigo-950 leading-relaxed pt-1">
                    {q.explanation}
                  </p>
                </div>

                {/* QUESTION STATUS & ACTION TOOLBAR */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    {isCorrect ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Solved correctly</span>
                      </span>
                    ) : isBlindSpot ? (
                      <span className="text-rose-700 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>High-Risk Blind Spot — Logged in Error Notebook</span>
                      </span>
                    ) : (
                      <span className="text-slate-600 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-rose-500" />
                        <span>Saved in Error Notebook for drill</span>
                      </span>
                    )}
                  </div>

                  {!isCorrect && (
                    <button
                      onClick={() => onRetakeMissed([q])}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Practice this question again immediately"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Re-Drill This Question</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Sticky Retake Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-md flex items-center justify-between flex-wrap gap-3">
        <div className="text-xs text-slate-500">
          Want to improve your score? Retake the assessment now or launch a targeted drill from your Error Notebook.
        </div>
        <div className="flex items-center gap-2">
          {(onOpenErrorNotebook || onOpenSpacedReview || onOpenWeakSpots) && (
            <button
              onClick={() => {
                if (onOpenErrorNotebook) onOpenErrorNotebook();
                else if (onOpenSpacedReview) onOpenSpacedReview();
                else if (onOpenWeakSpots) onOpenWeakSpots();
              }}
              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs flex items-center gap-1.5 border border-rose-200 transition-colors cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              <span>Open Error Notebook</span>
            </button>
          )}

          <button
            onClick={() => onRetakeFull(shuffleOnRetake)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Assessment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
