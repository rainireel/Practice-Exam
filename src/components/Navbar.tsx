import React from 'react';
import {
  GraduationCap,
  PlusCircle,
  History,
  Bookmark,
  Menu,
  ChevronRight,
  Sparkles,
  RotateCcw,
  BookOpen,
  Repeat,
  Flame,
} from 'lucide-react';
import { ViewMode, Subject, PracticeSet, Semester, SchoolYear } from '../types/exam';

interface NavbarProps {
  viewMode: ViewMode;
  onNavigateHome: () => void;
  onOpenImport: () => void;
  onOpenHistory: () => void;
  onOpenBookmarks: () => void;
  onOpenErrorNotebook: () => void;
  onOpenSpacedReview?: () => void;
  onOpenWeakSpots?: () => void;
  onToggleMobileSidebar: () => void;
  activeSchoolYear?: SchoolYear;
  activeSemester?: Semester;
  activeSubject?: Subject;
  activePracticeSet?: PracticeSet;
  completedAttemptsCount: number;
  averageAccuracy: number;
  bookmarkedCount: number;
  dueSRSCardsCount?: number;
  weakSpotsCount: number;
  blindSpotsCount: number;
  recurringMistakesCount?: number;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onNavigateHome,
  onOpenImport,
  onOpenHistory,
  onOpenBookmarks,
  onOpenErrorNotebook,
  onOpenSpacedReview,
  onOpenWeakSpots,
  onToggleMobileSidebar,
  activeSchoolYear,
  activeSemester,
  activeSubject,
  activePracticeSet,
  completedAttemptsCount,
  averageAccuracy,
  bookmarkedCount,
  dueSRSCardsCount = 0,
  weakSpotsCount,
  blindSpotsCount,
  recurringMistakesCount = 0,
  onResetData,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand & Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 group text-left shrink-0 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                  ReviseIQ
                </span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Vault
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Multi-Subject Exam Simulator
              </p>
            </div>
          </button>

          {/* Breadcrumb path: School Year > Semester > Subject > Practice Set */}
          <div className="hidden lg:flex items-center text-xs text-slate-500 font-medium pl-3 border-l border-slate-200 truncate">
            {activeSchoolYear && (
              <span className="text-slate-700 font-bold truncate">{activeSchoolYear.name}</span>
            )}
            {activeSemester && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 mx-1.5 shrink-0" />
                <span className="text-slate-600 truncate">{activeSemester.title}</span>
              </>
            )}
            {activeSubject && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 mx-1.5 shrink-0" />
                <span className="text-slate-800 font-semibold truncate">
                  {activeSubject.title}
                </span>
              </>
            )}
            {activePracticeSet && viewMode !== 'dashboard' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 mx-1.5 shrink-0" />
                <span className="text-indigo-600 font-semibold truncate max-w-[200px]">
                  {activePracticeSet.title}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Quick Stats & Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Error Notebook Shortcut */}
          <button
            onClick={onOpenErrorNotebook}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'error-notebook'
                ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                : recurringMistakesCount > 0
                ? 'bg-gradient-to-r from-rose-50 to-amber-50 text-rose-950 border-rose-300 hover:border-rose-400'
                : weakSpotsCount > 0
                ? 'bg-rose-50/70 text-rose-900 border-rose-200 hover:border-rose-300'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="Error Notebook: Track mistakes, blind spots, and drill weaknesses"
          >
            <Flame
              className={`w-4 h-4 ${
                viewMode === 'error-notebook'
                  ? 'text-white'
                  : recurringMistakesCount > 0
                  ? 'text-rose-600 fill-current'
                  : weakSpotsCount > 0
                  ? 'text-rose-500'
                  : 'text-slate-400'
              }`}
            />
            <span className="hidden sm:inline">Error Notebook</span>
            {recurringMistakesCount > 0 ? (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  viewMode === 'error-notebook'
                    ? 'bg-rose-800 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {recurringMistakesCount} Recurring
              </span>
            ) : weakSpotsCount > 0 ? (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  viewMode === 'error-notebook'
                    ? 'bg-rose-800 text-white'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {weakSpotsCount} Errors
              </span>
            ) : (
              <span className="text-[10px] text-emerald-600 font-bold hidden md:inline">Clean</span>
            )}
          </button>

          {/* Bookmarks shortcut */}
          <button
            onClick={onOpenBookmarks}
            className={`p-2 rounded-xl border transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'bookmarks'
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
            title="Bookmarked & Flagged Questions"
          >
            <Bookmark className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Bookmarks</span>
            {bookmarkedCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                viewMode === 'bookmarks' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {bookmarkedCount}
              </span>
            )}
          </button>

          {/* Attempts History */}
          <button
            onClick={onOpenHistory}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            title="View History & Scores"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">History</span>
          </button>

          {/* Import / Add New Set Button */}
          <button
            onClick={onOpenImport}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-semibold text-xs flex items-center gap-2 shadow-sm shadow-indigo-200 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Import / Add Test</span>
          </button>
        </div>
      </div>
    </header>
  );
};
