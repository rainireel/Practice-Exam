import React, { useState, useMemo } from 'react';
import {
  PracticeSet,
  Question,
  WeakSpotQuestionItem,
  Subject,
} from '../types/exam';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  BookOpen,
  Bookmark,
  Zap,
  Flame,
  Target,
  Check,
  Search,
  RotateCcw,
  Play,
  Layers,
} from 'lucide-react';

interface ErrorNotebookViewProps {
  weakSpots: WeakSpotQuestionItem[];
  allPracticeSets: PracticeSet[];
  subjects?: Subject[];
  currentSubjectId?: string;
  onBackToDashboard: () => void;
  onStartMistakesDrill: (filteredSpots: WeakSpotQuestionItem[], title: string) => void;
  bookmarkedQuestionIds?: string[];
  onToggleBookmark?: (questionId: string) => void;
}

export const ErrorNotebookView: React.FC<ErrorNotebookViewProps> = ({
  weakSpots = [],
  allPracticeSets,
  subjects = [],
  currentSubjectId,
  onBackToDashboard,
  onStartMistakesDrill,
  bookmarkedQuestionIds = [],
  onToggleBookmark,
}) => {
  // Category filter: 'all' | 'recurring' | 'blindspots' | 'lucky' | 'resolved'
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'recurring' | 'blindspots' | 'lucky' | 'resolved'
  >('all');

  // Subject filter
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>(
    currentSubjectId || 'all'
  );

  // Search keyword query
  const [searchQuery, setSearchQuery] = useState('');

  // Local state for manually resolved/mastered question IDs
  const [manualResolvedIds, setManualResolvedIds] = useState<Set<string>>(new Set());

  const bookmarksSet = useMemo(() => new Set(bookmarkedQuestionIds), [bookmarkedQuestionIds]);

  // Aggregate stats
  const totalMistakes = weakSpots.length;
  const recurringCount = useMemo(
    () => weakSpots.filter((w) => w.missCount >= 2 && !w.isResolved && !manualResolvedIds.has(w.question.id)).length,
    [weakSpots, manualResolvedIds]
  );
  const blindSpotCount = useMemo(
    () => weakSpots.filter((w) => w.isDangerousBlindSpot && !w.isResolved && !manualResolvedIds.has(w.question.id)).length,
    [weakSpots, manualResolvedIds]
  );
  const luckyGuessCount = useMemo(
    () => weakSpots.filter((w) => w.isLuckyGuess && !manualResolvedIds.has(w.question.id)).length,
    [weakSpots, manualResolvedIds]
  );
  const resolvedCount = useMemo(
    () => weakSpots.filter((w) => w.isResolved || manualResolvedIds.has(w.question.id)).length,
    [weakSpots, manualResolvedIds]
  );
  const resolutionRate = totalMistakes > 0 ? Math.round((resolvedCount / totalMistakes) * 100) : 100;

  // Toggle manual resolution
  const handleToggleResolve = (questionId: string) => {
    setManualResolvedIds((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  // Filter items based on active category, subject, and keyword query
  const filteredItems = useMemo(() => {
    return weakSpots.filter((item) => {
      const isResolved = item.isResolved || manualResolvedIds.has(item.question.id);

      // Subject Filter
      if (selectedSubjectFilter !== 'all' && item.subjectId !== selectedSubjectFilter) {
        return false;
      }

      // Category Filter
      if (selectedCategory === 'recurring' && (item.missCount < 2 || isResolved)) {
        return false;
      }
      if (selectedCategory === 'blindspots' && (!item.isDangerousBlindSpot || isResolved)) {
        return false;
      }
      if (selectedCategory === 'lucky' && (!item.isLuckyGuess || isResolved)) {
        return false;
      }
      if (selectedCategory === 'resolved' && !isResolved) {
        return false;
      }
      if (selectedCategory === 'all' && isResolved) {
        // In 'all', default to unresolved items for active practice
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQuestion = item.question.questionText.toLowerCase().includes(query);
        const matchesConcept = item.question.keyConcept?.toLowerCase().includes(query);
        const matchesExplanation = item.question.explanation.toLowerCase().includes(query);
        const matchesOptions = item.question.options.some((opt) => opt.toLowerCase().includes(query));
        const matchesSet = item.practiceSetTitle.toLowerCase().includes(query);

        if (!matchesQuestion && !matchesConcept && !matchesExplanation && !matchesOptions && !matchesSet) {
          return false;
        }
      }

      return true;
    });
  }, [weakSpots, selectedCategory, selectedSubjectFilter, searchQuery, manualResolvedIds]);

  // Launch Master My Mistakes Drill
  const handleLaunchMistakesDrill = (itemsToDrill: WeakSpotQuestionItem[], title: string) => {
    if (!onStartMistakesDrill) return;
    onStartMistakesDrill(itemsToDrill, title);
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
          <span className="text-xs font-medium text-slate-500">
            {totalMistakes} Question{totalMistakes !== 1 ? 's' : ''} in Error Vault
          </span>
        </div>
      </div>

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-rose-900/50 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center justify-center">
                <Flame className="w-4 h-4 text-rose-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                Exam Weakness & Error Notebook
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {recurringCount > 0 || blindSpotCount > 0
                ? `${recurringCount} Recurring Mistake${recurringCount !== 1 ? 's' : ''} & ${blindSpotCount} Dangerous Blind Spot${blindSpotCount !== 1 ? 's' : ''}`
                : totalMistakes > 0
                ? `${totalMistakes} Question${totalMistakes !== 1 ? 's' : ''} Logged in Error Notebook`
                : 'Your Error Notebook is Clean & Exam-Ready!'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every question you miss or guess across your practice exams is cataloged here with confidence diagnostics. Launch a 1-click drill before test day so you never lose marks on the same concept twice.
            </p>

            <div className="flex items-center gap-4 pt-1 text-xs text-slate-400 flex-wrap">
              <span>
                Total Missed: <strong className="text-rose-400">{totalMistakes}</strong>
              </span>
              <span>•</span>
              <span>
                Recurring Misses (2+): <strong className={recurringCount > 0 ? 'text-rose-400 font-bold' : 'text-slate-300'}>{recurringCount}</strong>
              </span>
              <span>•</span>
              <span>
                Blind Spots: <strong className={blindSpotCount > 0 ? 'text-amber-400 font-bold' : 'text-slate-300'}>{blindSpotCount}</strong>
              </span>
              <span>•</span>
              <span>
                Mastered: <strong className="text-emerald-400">{resolvedCount}</strong> ({resolutionRate}%)
              </span>
            </div>
          </div>

          {/* 1-Click Master My Mistakes Drill Buttons */}
          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2.5 self-start lg:self-auto">
            <button
              onClick={() => {
                const targetList =
                  recurringCount > 0
                    ? weakSpots.filter((w) => w.missCount >= 2 && !w.isResolved && !manualResolvedIds.has(w.question.id))
                    : weakSpots.filter((w) => !w.isResolved && !manualResolvedIds.has(w.question.id));

                handleLaunchMistakesDrill(
                  targetList.length > 0 ? targetList : weakSpots,
                  recurringCount > 0
                    ? `Master My Mistakes Drill (${recurringCount} Recurring Mistakes)`
                    : `Error Notebook Drill (${targetList.length || weakSpots.length} Questions)`
                );
              }}
              disabled={totalMistakes === 0}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-rose-950/50 transition-all cursor-pointer active:scale-98"
            >
              <Zap className="w-4 h-4 fill-current text-white" />
              <span>
                {recurringCount > 0
                  ? `Master My Mistakes Drill (${recurringCount})`
                  : totalMistakes > 0
                  ? `Drill All Mistakes (${weakSpots.filter((w) => !w.isResolved && !manualResolvedIds.has(w.question.id)).length})`
                  : 'No Mistakes to Drill'}
              </span>
            </button>

            {blindSpotCount > 0 && (
              <button
                onClick={() => {
                  const blindSpotItems = weakSpots.filter(
                    (w) => w.isDangerousBlindSpot && !w.isResolved && !manualResolvedIds.has(w.question.id)
                  );
                  handleLaunchMistakesDrill(
                    blindSpotItems,
                    `Blind Spot Drill (${blindSpotItems.length} High-Risk Questions)`
                  );
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>Drill Blind Spots Only ({blindSpotCount})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setSelectedCategory('recurring')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedCategory === 'recurring'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400/50 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-rose-800">
            <span>Recurring Misses</span>
            <Flame className="w-4 h-4 text-rose-600" />
          </div>
          <span className="text-2xl font-black text-rose-700 mt-1 block">
            {recurringCount}
          </span>
          <span className="text-[10px] text-rose-600 font-medium">Missed 2+ times across tests</span>
        </button>

        <button
          onClick={() => setSelectedCategory('blindspots')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedCategory === 'blindspots'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/50 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-amber-800">
            <span>Blind Spots</span>
            <Target className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-amber-700 mt-1 block">
            {blindSpotCount}
          </span>
          <span className="text-[10px] text-amber-600 font-medium">Certain, but got wrong</span>
        </button>

        <button
          onClick={() => setSelectedCategory('lucky')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedCategory === 'lucky'
              ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-400/50 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-indigo-800">
            <span>Lucky Guesses</span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-black text-indigo-700 mt-1 block">
            {luckyGuessCount}
          </span>
          <span className="text-[10px] text-indigo-600 font-medium">Pure guess, but right</span>
        </button>

        <button
          onClick={() => setSelectedCategory('resolved')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedCategory === 'resolved'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/50 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
            <span>Mastered / Solved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            {resolvedCount}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium">{resolutionRate}% resolution rate</span>
        </button>
      </div>

      {/* Filter Bar & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs font-semibold">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Unresolved ({weakSpots.filter((w) => !w.isResolved && !manualResolvedIds.has(w.question.id)).length})
            </button>
            <button
              onClick={() => setSelectedCategory('recurring')}
              className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                selectedCategory === 'recurring'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
              }`}
            >
              Recurring ({recurringCount})
            </button>
            <button
              onClick={() => setSelectedCategory('blindspots')}
              className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                selectedCategory === 'blindspots'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800'
              }`}
            >
              Blind Spots ({blindSpotCount})
            </button>
            <button
              onClick={() => setSelectedCategory('lucky')}
              className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                selectedCategory === 'lucky'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
              }`}
            >
              Lucky Guesses ({luckyGuessCount})
            </button>
            <button
              onClick={() => setSelectedCategory('resolved')}
              className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                selectedCategory === 'resolved'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
              }`}
            >
              Mastered ({resolvedCount})
            </button>
          </div>

          {/* Subject Filter Dropdown */}
          {subjects.length > 0 && (
            <div className="shrink-0 flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">Subject:</span>
              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="all">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Keyword Search Input & Drill Filtered Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search error questions by keyword, topic, or key concept..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            />
          </div>

          {filteredItems.length > 0 && (
            <button
              onClick={() =>
                handleLaunchMistakesDrill(
                  filteredItems,
                  `Custom Drill: ${selectedCategory.toUpperCase()} (${filteredItems.length} Questions)`
                )
              }
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shrink-0 transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span>Drill Filtered ({filteredItems.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* List of Error Question Cards */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <Check className="w-6 h-6 text-emerald-600" />
          </div>
          <h4 className="text-base font-bold text-slate-900">
            {searchQuery ? 'No Questions Match Your Search' : 'No Mistakes in This Category'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? 'Try modifying your search keywords or clearing filters.'
              : selectedCategory === 'all'
              ? 'You have answered all questions correctly or haven’t taken tests yet. Great work!'
              : 'Switch category tabs above to view other questions.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item, idx) => {
            const q = item.question;
            const isBookmarked = bookmarksSet.has(q.id);
            const isManuallyResolved = manualResolvedIds.has(q.id);
            const isActuallyResolved = item.isResolved || isManuallyResolved;

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border-2 p-5 sm:p-6 shadow-xs transition-all space-y-4 ${
                  item.isDangerousBlindSpot && !isActuallyResolved
                    ? 'border-rose-400 ring-2 ring-rose-200/50'
                    : item.missCount >= 2 && !isActuallyResolved
                    ? 'border-rose-300'
                    : isActuallyResolved
                    ? 'border-emerald-200/90'
                    : 'border-slate-200/90'
                }`}
              >
                {/* Header Metadata */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {item.subjectTitle}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 truncate max-w-[200px]">
                      {item.practiceSetTitle}
                    </span>

                    {/* Dangerous Blind Spot Pill */}
                    {item.isDangerousBlindSpot && !isActuallyResolved && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>Dangerous Blind Spot</span>
                      </span>
                    )}

                    {/* Recurring Miss Pill */}
                    {item.missCount >= 2 && !isActuallyResolved && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-rose-500" />
                        <span>Missed {item.missCount} times</span>
                      </span>
                    )}

                    {/* Lucky Guess Pill */}
                    {item.isLuckyGuess && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        <span>Lucky Guess</span>
                      </span>
                    )}

                    {/* Mastered Pill */}
                    {isActuallyResolved && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Mastered</span>
                      </span>
                    )}
                  </div>

                  {/* Actions: Bookmark & Resolve */}
                  <div className="flex items-center gap-1.5">
                    {onToggleBookmark && (
                      <button
                        onClick={() => onToggleBookmark(q.id)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isBookmarked
                            ? 'bg-amber-50 text-amber-600 border-amber-300'
                            : 'bg-white text-slate-400 hover:text-slate-600 border-slate-200'
                        }`}
                        title={isBookmarked ? 'Remove bookmark' : 'Bookmark this question'}
                      >
                        <Bookmark className="w-3.5 h-3.5" fill={isBookmarked ? 'currentColor' : 'none'} />
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleResolve(q.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
                        isActuallyResolved
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                      title={isActuallyResolved ? 'Mark as unresolved' : 'Mark as mastered'}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isActuallyResolved ? 'Mastered' : 'Mark Solved'}</span>
                    </button>
                  </div>
                </div>

                {/* Section title if available */}
                {q.sectionTitle && (
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {q.sectionTitle}
                  </div>
                )}

                {/* Question Prompt */}
                <p className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed">
                  {q.questionText}
                </p>

                {/* Optional Code Snippet */}
                {q.codeSnippet && (
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
                    <code>{q.codeSnippet}</code>
                  </pre>
                )}

                {/* Options List */}
                <div className="space-y-2 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx);
                    const isCorrect = optIdx === q.correctIndex;
                    const isLastSelected = optIdx === item.lastUserAnswer;

                    let optStyle = 'border-slate-200 bg-white text-slate-700';
                    let badgeStyle = 'bg-slate-100 text-slate-600';

                    if (isCorrect) {
                      optStyle = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-medium';
                      badgeStyle = 'bg-emerald-600 text-white';
                    } else if (isLastSelected && !isCorrect) {
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
                        {isCorrect && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded shrink-0">
                            ✓ Correct Answer
                          </span>
                        )}
                        {isLastSelected && !isCorrect && (
                          <span className="text-[11px] font-bold text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded shrink-0">
                            ✕ Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Diagnostics Alert for Blind Spots */}
                {item.isDangerousBlindSpot && !isActuallyResolved && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-950 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <strong className="block font-bold text-rose-900">
                        🚨 Dangerous Blind Spot Alert
                      </strong>
                      <p className="text-rose-800 leading-relaxed">
                        You marked your confidence as <strong>Certain</strong>, but picked the incorrect option. This indicates a high-risk conceptual misconception. Study the explanation below carefully.
                      </p>
                    </div>
                  </div>
                )}

                {/* Verbatim Explanation Callout */}
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                    <Lightbulb className="w-4 h-4 text-indigo-600" />
                    <span>Verbatim Explanation & Key Concept</span>
                    {q.keyConcept && (
                      <span className="ml-auto text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-indigo-200/60 text-indigo-800">
                        {q.keyConcept}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-indigo-950 leading-relaxed pt-1">
                    {q.explanation}
                  </p>
                </div>

                {/* Bottom Action Bar for Question */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                  <span className="text-slate-400">
                    Tested {item.totalAttempts} time{item.totalAttempts !== 1 ? 's' : ''} • Missed {item.missCount}
                  </span>

                  <button
                    onClick={() => handleLaunchMistakesDrill([item], `Targeted Drill: ${q.keyConcept || 'Concept'}`)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Drill This Question</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
