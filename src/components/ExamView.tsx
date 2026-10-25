import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  PracticeSet,
  Question,
  UserExamResponse,
  QuestionStatusMeta,
  ConfidenceLevel,
} from '../types/exam';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  Pause,
  Play,
  X,
  Filter,
  Target,
  Sparkles,
  LayoutGrid,
} from 'lucide-react';

interface ExamViewProps {
  practiceSet: PracticeSet;
  initialAnswers?: UserExamResponse;
  initialFlagged?: string[];
  initialConfidences?: Record<string, ConfidenceLevel>;
  onSubmitExam: (
    answers: UserExamResponse,
    flaggedIds: string[],
    timeSpentSeconds: number,
    confidences?: Record<string, ConfidenceLevel>
  ) => void;
  onExitExam: () => void;
}

export const ExamView: React.FC<ExamViewProps> = ({
  practiceSet,
  initialAnswers = {},
  initialFlagged = [],
  initialConfidences = {},
  onSubmitExam,
  onExitExam,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserExamResponse>(initialAnswers);
  const [confidences, setConfidences] = useState<Record<string, ConfidenceLevel>>(initialConfidences);
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set(initialFlagged));
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(
    practiceSet.timeLimitMinutes ? practiceSet.timeLimitMinutes * 60 : 0
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [paletteFilter, setPaletteFilter] = useState<'all' | 'answered' | 'unanswered' | 'flagged'>('all');
  const [copiedCode, setCopiedCode] = useState(false);

  const totalQuestions = practiceSet.questions.length;
  const currentQuestion: Question | undefined = practiceSet.questions[currentIndex];

  // Timer Effect
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);

      if (practiceSet.timeLimitMinutes && practiceSet.timeLimitMinutes > 0) {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Auto submit on time expiry
            handleFinalSubmit();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, practiceSet.timeLimitMinutes]);

  // Answer selection handler
  const handleSelectOption = (optionIndex: number) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: prev[currentQuestion.id] === optionIndex ? null : optionIndex,
    }));

    // Auto-set default confidence if not yet chosen
    setConfidences((prev) => {
      if (!prev[currentQuestion.id]) {
        return { ...prev, [currentQuestion.id]: 'certain' };
      }
      return prev;
    });
  };

  const handleSetConfidence = (level: ConfidenceLevel) => {
    if (!currentQuestion) return;
    setConfidences((prev) => ({
      ...prev,
      [currentQuestion.id]: level,
    }));
  };

  const handleCycleConfidence = () => {
    if (!currentQuestion) return;
    const current = confidences[currentQuestion.id];
    let nextLevel: ConfidenceLevel = 'certain';
    if (current === 'certain') nextLevel = 'educated-guess';
    else if (current === 'educated-guess') nextLevel = 'pure-guess';
    else if (current === 'pure-guess') nextLevel = 'certain';
    handleSetConfidence(nextLevel);
  };

  const handleClearAnswer = () => {
    if (!currentQuestion) return;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQuestion.id];
      return next;
    });
  };

  const handleToggleFlag = () => {
    if (!currentQuestion) return;
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) {
        next.delete(currentQuestion.id);
      } else {
        next.add(currentQuestion.id);
      }
      return next;
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Escape' && isPaletteOpen) {
        setIsPaletteOpen(false);
      } else if (e.key === 'ArrowRight' || e.key === 'n') {
        if (currentIndex < totalQuestions - 1) setCurrentIndex((i) => i + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'p') {
        if (currentIndex > 0) setCurrentIndex((i) => i - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        handleToggleFlag();
      } else if (
        (e.shiftKey && (e.key === '1' || e.key === '!' || e.code === 'Digit1')) ||
        (e.altKey && e.key === '1') ||
        e.key === 'z' || e.key === 'Z'
      ) {
        e.preventDefault();
        handleSetConfidence('certain');
      } else if (
        (e.shiftKey && (e.key === '2' || e.key === '@' || e.code === 'Digit2')) ||
        (e.altKey && e.key === '2') ||
        e.key === 'x' || e.key === 'X'
      ) {
        e.preventDefault();
        handleSetConfidence('educated-guess');
      } else if (
        (e.shiftKey && (e.key === '3' || e.key === '#' || e.code === 'Digit3')) ||
        (e.altKey && e.key === '3') ||
        e.key === 'v' || e.key === 'V' ||
        e.key === 'g' || e.key === 'G'
      ) {
        e.preventDefault();
        handleSetConfidence('pure-guess');
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleCycleConfidence();
      } else if (['1', '2', '3', '4'].includes(e.key) && !e.shiftKey && !e.altKey) {
        handleSelectOption(parseInt(e.key, 10) - 1);
      } else if (['a', 'b', 'c', 'd'].includes(e.key.toLowerCase()) && !e.altKey && !e.ctrlKey) {
        const idx = e.key.toLowerCase().charCodeAt(0) - 97;
        handleSelectOption(idx);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, totalQuestions, currentQuestion, isPaletteOpen, confidences]);

  // Palette counts
  const answeredCount = Object.values(answers).filter((val) => val !== null && val !== undefined).length;
  const unansweredCount = totalQuestions - answeredCount;
  const flaggedCount = flaggedIds.size;

  const handleFinalSubmit = useCallback(() => {
    setShowSubmitModal(false);
    onSubmitExam(answers, Array.from(flaggedIds), elapsedSeconds, confidences);
  }, [answers, flaggedIds, elapsedSeconds, confidences, onSubmitExam]);

  // Format time
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Group questions by section for the palette
  const sectionGroups = useMemo(() => {
    const groups: { [sec: string]: { q: Question; index: number }[] } = {};
    practiceSet.questions.forEach((q, idx) => {
      const sec = q.sectionTitle || 'General Questions';
      if (!groups[sec]) groups[sec] = [];
      groups[sec].push({ q, index: idx });
    });
    return groups;
  }, [practiceSet.questions]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!currentQuestion) return null;

  const isCurrentFlagged = flaggedIds.has(currentQuestion.id);
  const currentSelectedOption = answers[currentQuestion.id];
  const currentConfidence = confidences[currentQuestion.id];

  return (
    <div className="space-y-4 pb-12">
      {/* Top Sticky Test Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs sticky top-18 z-20 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Exit, Question Palette Toggle, Test Title & Progress */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <button
            onClick={onExitExam}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Exit assessment"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Minimalist Question Palette Toggle Button */}
          <button
            type="button"
            onClick={() => setIsPaletteOpen((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
              isPaletteOpen
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-200'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
            }`}
            title={isPaletteOpen ? 'Close Question Palette (Esc)' : 'Open Question Palette'}
            aria-expanded={isPaletteOpen}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Question Palette</span>
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                isPaletteOpen ? 'bg-indigo-700 text-white' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              {currentIndex + 1}/{totalQuestions}
            </span>
          </button>

          <div className="hidden sm:block">
            <h2 className="text-sm font-bold text-slate-900 truncate max-w-[200px] md:max-w-xs">
              {practiceSet.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="text-emerald-600 font-semibold">{answeredCount} Answered</span>
              <span>•</span>
              <span className="text-amber-600 font-semibold">{flaggedCount} Flagged</span>
            </div>
          </div>
        </div>

        {/* Center / Right: Timer & Submit Button */}
        <div className="flex items-center gap-3">
          {/* Timer Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-mono text-xs font-semibold shadow-xs">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              {practiceSet.timeLimitMinutes && practiceSet.timeLimitMinutes > 0
                ? formatTime(timeRemainingSeconds)
                : formatTime(elapsedSeconds)}
            </span>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="ml-1 text-slate-400 hover:text-white p-0.5 rounded transition-colors"
              title={isPaused ? 'Resume Timer' : 'Pause Timer'}
            >
              {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
            </button>
          </div>

          {/* Prominent Submit Test Anytime Button */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-emerald-200 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Test Anytime</span>
          </button>
        </div>
      </div>

      {/* LEFT SIDE: Slide-in Question Palette inside Toggle Drawer */}
      {isPaletteOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity animate-in fade-in duration-150"
            onClick={() => setIsPaletteOpen(false)}
            aria-hidden="true"
          />

          {/* Left Drawer Container */}
          <aside
            className="fixed top-0 bottom-0 left-0 z-50 w-80 sm:w-88 bg-white border-r border-slate-200/90 shadow-2xl flex flex-col animate-in slide-in-from-left duration-200"
            role="dialog"
            aria-label="Question Palette"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Question Palette</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {answeredCount} of {totalQuestions} answered ({Math.round((answeredCount / totalQuestions) * 100)}%)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPaletteOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Close Palette (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Legend */}
            <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>{answeredCount} Answered</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>{flaggedCount} Flagged</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200 border border-slate-300" />
                <span>{unansweredCount} Left</span>
              </span>
            </div>

            {/* Palette Filter Tabs */}
            <div className="p-3 bg-slate-50 border-b border-slate-100">
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/70 rounded-xl text-[11px] font-medium text-slate-600">
                <button
                  type="button"
                  onClick={() => setPaletteFilter('all')}
                  className={`py-1 rounded-lg transition-colors cursor-pointer ${
                    paletteFilter === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  All ({totalQuestions})
                </button>
                <button
                  type="button"
                  onClick={() => setPaletteFilter('answered')}
                  className={`py-1 rounded-lg transition-colors cursor-pointer ${
                    paletteFilter === 'answered' ? 'bg-white text-emerald-700 font-bold shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  Ans ({answeredCount})
                </button>
                <button
                  type="button"
                  onClick={() => setPaletteFilter('unanswered')}
                  className={`py-1 rounded-lg transition-colors cursor-pointer ${
                    paletteFilter === 'unanswered' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  Left ({unansweredCount})
                </button>
                <button
                  type="button"
                  onClick={() => setPaletteFilter('flagged')}
                  className={`py-1 rounded-lg transition-colors cursor-pointer ${
                    paletteFilter === 'flagged' ? 'bg-white text-amber-700 font-bold shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  Flag ({flaggedCount})
                </button>
              </div>
            </div>

            {/* Scrollable Question Number Grids Grouped by Section */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {Object.entries(sectionGroups).map(([sectionTitle, items]) => {
                const visibleItems = items.filter(({ q }) => {
                  const hasAns = answers[q.id] !== undefined && answers[q.id] !== null;
                  const isFlag = flaggedIds.has(q.id);
                  if (paletteFilter === 'answered') return hasAns;
                  if (paletteFilter === 'unanswered') return !hasAns;
                  if (paletteFilter === 'flagged') return isFlag;
                  return true;
                });

                if (visibleItems.length === 0) return null;

                return (
                  <div key={sectionTitle} className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block truncate">
                      {sectionTitle}
                    </span>

                    <div className="grid grid-cols-5 gap-2">
                      {visibleItems.map(({ q, index }) => {
                        const isCurrent = index === currentIndex;
                        const hasAnswer = answers[q.id] !== undefined && answers[q.id] !== null;
                        const isFlagged = flaggedIds.has(q.id);

                        let buttonStyle = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';
                        if (hasAnswer) {
                          buttonStyle = 'bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-600';
                        }
                        if (isFlagged) {
                          buttonStyle = hasAnswer
                            ? 'bg-emerald-500 text-white ring-2 ring-amber-400'
                            : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200';
                        }
                        if (isCurrent) {
                          buttonStyle += ' ring-2 ring-indigo-600 ring-offset-2 font-black';
                        }

                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => {
                              setCurrentIndex(index);
                              if (window.innerWidth < 640) {
                                setIsPaletteOpen(false);
                              }
                            }}
                            className={`h-9 rounded-xl text-xs font-bold transition-all relative flex items-center justify-center border cursor-pointer ${buttonStyle}`}
                            title={`Jump to Question ${index + 1}`}
                          >
                            <span>{index + 1}</span>
                            {isFlagged && (
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-1 ring-white" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Left Palette Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsPaletteOpen(false);
                  setShowSubmitModal(true);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit & View Results</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPaletteOpen(false)}
                className="w-full py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 text-xs font-medium transition-colors cursor-pointer"
              >
                Close Palette (Esc)
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Floating Left Minimalist Rail Toggle Button (when collapsed) */}
      {!isPaletteOpen && (
        <button
          type="button"
          onClick={() => setIsPaletteOpen(true)}
          className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-30 bg-white/95 hover:bg-white text-slate-700 hover:text-indigo-600 border border-l-0 border-slate-200/90 shadow-md hover:shadow-lg py-3.5 px-2 rounded-r-2xl flex-col items-center gap-2 transition-all cursor-pointer backdrop-blur-xs group"
          title="Open Question Palette"
        >
          <LayoutGrid className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] [writing-mode:vertical-lr] font-bold uppercase tracking-wider text-slate-500 group-hover:text-indigo-600">
            Questions
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
        </button>
      )}

      {/* CENTER OF SCREEN: Minimalist Question Container */}
      <div className="w-full max-w-3xl mx-auto space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
            {/* Question Header: Section tag + Flag toggle */}
            <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                {currentQuestion.sectionTitle || 'General Section'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleFlag}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isCurrentFlagged
                      ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                  title="Flag for later review [Hotkey: F]"
                >
                  <Flag className={`w-3.5 h-3.5 ${isCurrentFlagged ? 'fill-amber-600 text-amber-600' : ''}`} />
                  <span>{isCurrentFlagged ? 'Flagged for Review' : 'Flag Question'}</span>
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
                <span className="text-indigo-600 font-bold mr-2">Q{currentIndex + 1}.</span>
                {currentQuestion.questionText}
              </h3>

              {/* Code Snippet if applicable */}
              {currentQuestion.codeSnippet && (
                <div className="relative group rounded-xl overflow-hidden bg-slate-900 text-slate-100 font-mono text-xs my-4 border border-slate-800">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 border-b border-slate-700/60 text-[11px] text-slate-400">
                    <span>Source Code / Scenario</span>
                    <button
                      onClick={() => copyCode(currentQuestion.codeSnippet!)}
                      className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-4 overflow-x-auto leading-relaxed">
                    <code>{currentQuestion.codeSnippet}</code>
                  </pre>
                </div>
              )}
            </div>

            {/* Multiple Choice Options List */}
            <div className="space-y-3 mt-6">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = currentSelectedOption === idx;
                const letter = String.fromCharCode(65 + idx);

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 group cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                        : 'border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 bg-white'
                    }`}
                  >
                    {/* Option Badge A, B, C, D */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                      }`}
                    >
                      {letter}
                    </div>

                    {/* Option Text */}
                    <div className="flex-1 text-sm text-slate-800 leading-snug pt-0.5">
                      {option}
                    </div>

                    {/* Radio circle visual indicator */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600'
                          : 'border-slate-300 group-hover:border-slate-400'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Confidence Rating per Question */}
            <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-indigo-50/30 to-purple-50/20 border border-slate-200/90 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-indigo-600" />
                  <span>Rate Your Confidence</span>
                </span>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                  <span className="hidden sm:inline">Shortcuts:</span>
                  <span className="inline-flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[9px] shadow-2xs font-semibold">Shift+1-3</kbd>
                    <span className="text-slate-400">or</span>
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[9px] shadow-2xs font-semibold">Z / X / V</kbd>
                    <span className="text-slate-400">•</span>
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[9px] shadow-2xs font-semibold">R</kbd>
                    <span>to cycle</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSetConfidence('certain')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    currentConfidence === 'certain'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm shadow-emerald-200 ring-2 ring-emerald-400/50'
                      : 'bg-white hover:bg-emerald-50/50 text-slate-700 border-slate-200 hover:border-emerald-300'
                  }`}
                  title="Mark as Certain [Hotkey: Shift+1 or Z]"
                >
                  <span className="text-base shrink-0">🎯</span>
                  <div className="text-left leading-tight min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="block font-bold text-xs truncate">Certain</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                        currentConfidence === 'certain' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        Shift+1 · Z
                      </span>
                    </div>
                    <span className={`text-[10px] block truncate mt-0.5 ${currentConfidence === 'certain' ? 'text-emerald-100' : 'text-slate-400'}`}>
                      100% Sure of answer
                    </span>
                  </div>
                  {currentConfidence === 'certain' && (
                    <Check className="w-3.5 h-3.5 text-white ml-auto shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSetConfidence('educated-guess')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    currentConfidence === 'educated-guess'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm shadow-amber-200 ring-2 ring-amber-400/50'
                      : 'bg-white hover:bg-amber-50/50 text-slate-700 border-slate-200 hover:border-amber-300'
                  }`}
                  title="Mark as Educated Guess [Hotkey: Shift+2 or X]"
                >
                  <span className="text-base shrink-0">💡</span>
                  <div className="text-left leading-tight min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="block font-bold text-xs truncate">Educated Guess</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                        currentConfidence === 'educated-guess' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        Shift+2 · X
                      </span>
                    </div>
                    <span className={`text-[10px] block truncate mt-0.5 ${currentConfidence === 'educated-guess' ? 'text-amber-100' : 'text-slate-400'}`}>
                      Narrowed down to 2
                    </span>
                  </div>
                  {currentConfidence === 'educated-guess' && (
                    <Check className="w-3.5 h-3.5 text-white ml-auto shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSetConfidence('pure-guess')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    currentConfidence === 'pure-guess'
                      ? 'bg-purple-600 text-white border-purple-700 shadow-sm shadow-purple-200 ring-2 ring-purple-400/50'
                      : 'bg-white hover:bg-purple-50/50 text-slate-700 border-slate-200 hover:border-purple-300'
                  }`}
                  title="Mark as Pure Guess [Hotkey: Shift+3, V, or G]"
                >
                  <span className="text-base shrink-0">🎲</span>
                  <div className="text-left leading-tight min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="block font-bold text-xs truncate">Pure Guess</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                        currentConfidence === 'pure-guess' ? 'bg-purple-700 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        Shift+3 · V
                      </span>
                    </div>
                    <span className={`text-[10px] block truncate mt-0.5 ${currentConfidence === 'pure-guess' ? 'text-purple-100' : 'text-slate-400'}`}>
                      Total gamble / instinct
                    </span>
                  </div>
                  {currentConfidence === 'pure-guess' && (
                    <Check className="w-3.5 h-3.5 text-white ml-auto shrink-0" />
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Question Action Bar */}
            <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-100 flex-wrap">
              <button
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {currentSelectedOption !== undefined && currentSelectedOption !== null && (
                  <button
                    onClick={handleClearAnswer}
                    className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Clear Selection
                  </button>
                )}

                {currentIndex < totalQuestions - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-200 transition-colors cursor-pointer"
                  >
                    <span>Finish & Submit</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Helpful keyboard hints card */}
          <div className="px-4 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200/60 text-[11px] text-slate-500 flex items-center justify-between flex-wrap gap-2">
            <span className="flex items-center gap-1.5 flex-wrap">
              <span>💡 <strong>Shortcuts:</strong></span>
              <span>Pick: <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">A-D</kbd> or <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">1-4</kbd></span>
              <span>•</span>
              <span>Confidence: <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">Shift+1-3</kbd> or <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">Z/X/V</kbd> (<kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">R</kbd> to cycle)</span>
              <span>•</span>
              <span>Flag: <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">F</kbd></span>
              <span>•</span>
              <span>Nav: <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">←</kbd> / <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">→</kbd></span>
            </span>
            <button
              type="button"
              onClick={() => setIsPaletteOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer flex items-center gap-1"
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Palette ({answeredCount}/{totalQuestions})</span>
            </button>
          </div>
        </div>

      {/* SUBMISSION CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Submit Assessment</h3>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600">
              Are you sure you want to finalize this attempt? All answers will be graded immediately, and verbatim explanations will be unlocked.
            </p>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-2 py-2">
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 text-center">
                <span className="text-[11px] font-semibold text-emerald-800 block">Answered</span>
                <span className="text-xl font-bold text-emerald-700">{answeredCount}</span>
              </div>
              <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-center">
                <span className="text-[11px] font-semibold text-slate-600 block">Unanswered</span>
                <span className="text-xl font-bold text-slate-700">{unansweredCount}</span>
              </div>
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-center">
                <span className="text-[11px] font-semibold text-amber-800 block">Flagged</span>
                <span className="text-xl font-bold text-amber-700">{flaggedCount}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  <strong>{unansweredCount}</strong> questions have not been answered and will be scored as skipped (0 points).
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                Keep Practicing
              </button>
              <button
                onClick={handleFinalSubmit}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-200 transition-colors cursor-pointer"
              >
                Grade My Answers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
