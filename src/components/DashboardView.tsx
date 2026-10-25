import React, { useState } from 'react';
import {
  Subject,
  Semester,
  PracticeSet,
  ExamAttemptRecord,
  SpacedRepetitionCard,
  AcademicTerm,
} from '../types/exam';
import { SubjectIcon, COLOR_CLASSES } from './SubjectIcon';
import {
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  PlusCircle,
  FileText,
  Award,
  Layers,
  Sparkles,
  Trash2,
  Eye,
  HelpCircle,
  Repeat,
  Zap,
  Calendar,
  Settings2,
  Flame,
  Target,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';

interface DashboardViewProps {
  currentSubject?: Subject;
  currentSemester?: Semester;
  practiceSets: PracticeSet[];
  attempts: ExamAttemptRecord[];
  terms: AcademicTerm[];
  srsCards?: Record<string, SpacedRepetitionCard>;
  dueSRSCardsCount?: number;
  weakSpotsCount?: number;
  blindSpotsCount?: number;
  recurringMistakesCount?: number;
  onStartExam: (set: PracticeSet) => void;
  onViewReview: (set: PracticeSet, attempt: ExamAttemptRecord) => void;
  onOpenImport: () => void;
  onOpenErrorNotebook?: () => void;
  onOpenSpacedReview?: () => void;
  onOpenWeakSpots?: () => void;
  onStartMistakesDrill?: () => void;
  onOpenCustomizeStructure: () => void;
  onDeleteCustomSet?: (setId: string) => void;
  onDeletePracticeSet?: (setId: string) => void;
  onDeleteSubject?: (subjectId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentSubject,
  currentSemester,
  practiceSets,
  attempts,
  terms,
  srsCards = {},
  dueSRSCardsCount = 0,
  weakSpotsCount = 0,
  blindSpotsCount = 0,
  recurringMistakesCount = 0,
  onStartExam,
  onViewReview,
  onOpenImport,
  onOpenErrorNotebook,
  onOpenSpacedReview,
  onOpenWeakSpots,
  onStartMistakesDrill,
  onOpenCustomizeStructure,
  onDeleteCustomSet,
  onDeletePracticeSet,
  onDeleteSubject,
}) => {
  const [selectedTermFilter, setSelectedTermFilter] = useState<string>('all');

  if (!currentSubject) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Layers className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Select a Subject</h3>
        <p className="text-sm text-slate-500 mt-1">
          Choose a subject from the sidebar to view available practice assessments, or import a new question set.
        </p>
      </div>
    );
  }

  // Filter practice sets for current subject
  const subjectSets = practiceSets.filter((s) => s.subjectId === currentSubject.id);

  // Filter by active term
  const displayedSets =
    selectedTermFilter === 'all'
      ? subjectSets
      : subjectSets.filter((s) => s.termId === selectedTermFilter);

  // Term maps
  const termMap = new Map(terms.map((t) => [t.id, t]));

  // Stats for this subject
  const subjectSetIds = new Set(subjectSets.map((s) => s.id));
  const subjectAttempts = attempts.filter((a) => subjectSetIds.has(a.practiceSetId));
  const totalQuestions = subjectSets.reduce((sum, s) => sum + s.questions.length, 0);

  const getLatestAttempt = (setId: string): ExamAttemptRecord | undefined => {
    return subjectAttempts.find((a) => a.practiceSetId === setId);
  };

  const getBestScore = (setId: string): number | null => {
    const setAttempts = subjectAttempts.filter((a) => a.practiceSetId === setId);
    if (setAttempts.length === 0) return null;
    return Math.max(...setAttempts.map((a) => a.percentage));
  };

  const colorMeta = COLOR_CLASSES[currentSubject.color] || COLOR_CLASSES.indigo;

  // Term badge color helper
  const getTermBadgeStyle = (termId?: string) => {
    if (!termId) return 'bg-slate-100 text-slate-700 border-slate-200';
    if (termId === 'prelims') return 'bg-violet-100 text-violet-800 border-violet-200';
    if (termId === 'midterms') return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    if (termId === 'prefinals') return 'bg-amber-100 text-amber-800 border-amber-200';
    if (termId === 'finals') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    return 'bg-cyan-100 text-cyan-800 border-cyan-200';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Subject Hero Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${colorMeta.bg} ${colorMeta.text} ${colorMeta.border} shadow-xs`}
            >
              <SubjectIcon name={currentSubject.iconName} className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {currentSemester && (
                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200/60">
                    {currentSemester.title}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
                {currentSubject.title}
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {currentSubject.description}
              </p>
            </div>
          </div>

          {/* Quick Metrics & Subject Actions */}
          <div className="flex items-center gap-3 flex-wrap self-start md:self-auto">
            <div className="flex items-center gap-3 sm:gap-6 bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
              <div className="text-center px-2">
                <span className="text-xs text-slate-500 block font-medium">Practice Sets</span>
                <span className="text-lg font-bold text-slate-900">{subjectSets.length}</span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center px-2">
                <span className="text-xs text-slate-500 block font-medium">Total Questions</span>
                <span className="text-lg font-bold text-indigo-600">{totalQuestions}</span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center px-2">
                <span className="text-xs text-slate-500 block font-medium">Attempts</span>
                <span className="text-lg font-bold text-emerald-600">
                  {subjectAttempts.length}
                </span>
              </div>
            </div>

            {onDeleteSubject && (
              <button
                type="button"
                onClick={() => onDeleteSubject(currentSubject.id)}
                className="px-3 py-2 rounded-xl border border-rose-200 hover:border-rose-300 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title={`Delete "${currentSubject.title}" and its practice sets`}
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Delete Subject</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ERROR NOTEBOOK & MASTER MY MISTAKES DRILL HERO CARD */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden border border-rose-900/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center justify-center">
                <Flame className="w-4 h-4 text-rose-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                Error Notebook & Targeted Drills
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 font-mono">
                Exam Prep Mode
              </span>
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight">
              {recurringMistakesCount > 0
                ? `${recurringMistakesCount} Recurring Mistake${recurringMistakesCount !== 1 ? 's' : ''} Need Your Attention!`
                : weakSpotsCount > 0
                ? `${weakSpotsCount} Mistake Question${weakSpotsCount !== 1 ? 's' : ''} Ready in Error Notebook`
                : 'Error Notebook Clean — You Are Ready for Next Test!'}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Every question you answered incorrectly or rated as a guess is automatically compiled in your Error Notebook. Run a 1-click drill before test day so you never get the same concept wrong twice.
            </p>

            <div className="flex items-center gap-4 pt-1 text-xs text-slate-400 flex-wrap">
              <span>
                Total errors logged: <strong className={weakSpotsCount > 0 ? 'text-rose-400 font-bold' : 'text-slate-300'}>{weakSpotsCount}</strong>
              </span>
              <span>•</span>
              <span>
                Recurring misses (2+): <strong className={recurringMistakesCount > 0 ? 'text-amber-400 font-bold' : 'text-slate-300'}>{recurringMistakesCount}</strong>
              </span>
              {blindSpotsCount > 0 && (
                <>
                  <span>•</span>
                  <span>
                    Dangerous blind spots: <strong className="text-rose-400 font-bold">{blindSpotsCount}</strong>
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {onStartMistakesDrill && (recurringMistakesCount > 0 || weakSpotsCount > 0) && (
              <button
                onClick={onStartMistakesDrill}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 transition-all cursor-pointer active:scale-98"
              >
                <Zap className="w-4 h-4 fill-current text-white" />
                <span>1-Click "Master My Mistakes" Drill</span>
              </button>
            )}

            <button
              onClick={() => {
                if (onOpenErrorNotebook) onOpenErrorNotebook();
                else if (onOpenSpacedReview) onOpenSpacedReview();
                else if (onOpenWeakSpots) onOpenWeakSpots();
              }}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/20 transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-rose-300" />
              <span>Open Error Notebook</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 TERMS FILTER TABS (Prelims, Midterms, Prefinals, Finals) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Academic Term Examinations</h3>
            <span className="text-[11px] text-slate-500 hidden sm:inline">• Filter practice sets by term:</span>
          </div>

          <button
            onClick={onOpenCustomizeStructure}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Customize Terms / Semesters</span>
          </button>
        </div>

        {/* Term Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedTermFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedTermFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Terms ({subjectSets.length})
          </button>

          {terms.map((term) => {
            const count = subjectSets.filter((s) => s.termId === term.id).length;
            const isSelected = selectedTermFilter === term.id;

            return (
              <button
                key={term.id}
                onClick={() => setSelectedTermFilter(term.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{term.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-700 font-mono'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {selectedTermFilter === 'all' ? 'All Practice Sets' : `${termMap.get(selectedTermFilter)?.name || 'Term'} Assessments`}
          </h2>
          <p className="text-xs text-slate-500">
            Interactive exams with numbered question palettes, instant grading, and spaced review.
          </p>
        </div>

        <button
          onClick={onOpenImport}
          className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 border border-indigo-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-indigo-600" />
          <span>Import Test to {currentSubject.title}</span>
        </button>
      </div>

      {/* Practice Sets Grid */}
      {displayedSets.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No Assessments for {selectedTermFilter === 'all' ? currentSubject.title : termMap.get(selectedTermFilter)?.name}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
            Import an AI-generated question bank or practice set for this term to start preparing.
          </p>
          <button
            onClick={onOpenImport}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add / Import Exam for this Term</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayedSets.map((set, index) => {
            const latestAttempt = getLatestAttempt(set.id);
            const bestScore = getBestScore(set.id);
            const sections = Array.from(
              new Set(set.questions.map((q) => q.sectionTitle).filter(Boolean))
            );
            const termObj = set.termId ? termMap.get(set.termId) : undefined;
            const termLabel = termObj?.name || 'General';

            return (
              <div
                key={set.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative"
              >
                <div>
                  {/* Top line tags with Term Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Term Badge (Prelims, Midterms, Prefinals, Finals) */}
                      <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border ${getTermBadgeStyle(set.termId)}`}>
                        {termLabel}
                      </span>

                      {set.isCustom && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-200">
                          Custom
                        </span>
                      )}

                      {bestScore !== null ? (
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                            bestScore >= (set.passingScorePercent || 60)
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <Award className="w-3 h-3" />
                          Best: {bestScore}%
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400">
                          Not Taken Yet
                        </span>
                      )}
                    </div>

                    {(onDeletePracticeSet || onDeleteCustomSet) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onDeletePracticeSet) {
                            onDeletePracticeSet(set.id);
                          } else {
                            onDeleteCustomSet?.(set.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title={`Delete practice set "${set.title}"`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {set.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {set.description}
                  </p>

                  {/* Sections Chips */}
                  {sections.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap mt-3">
                      {sections.map((sec, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200/60 truncate max-w-[200px]"
                        >
                          {sec}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Meta Specs */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                      {set.questions.length} Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {set.timeLimitMinutes
                        ? `${set.timeLimitMinutes} Mins`
                        : 'Untimed Practice'}
                    </span>
                    <span>Pass: {set.passingScorePercent || 60}%</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  {latestAttempt ? (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>
                        Last run: <strong>{latestAttempt.percentage}%</strong>
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400">Ready for {termLabel} prep</span>
                  )}

                  <div className="flex items-center gap-2">
                    {latestAttempt && (
                      <button
                        onClick={() => onViewReview(set, latestAttempt)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="View detailed explanation review of last attempt"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </button>
                    )}

                    <button
                      onClick={() => onStartExam(set)}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-indigo-200 transition-all cursor-pointer group-hover:scale-102"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{latestAttempt ? 'Retake Exam' : 'Start Exam'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
