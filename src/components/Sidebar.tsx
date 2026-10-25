import React, { useState, useRef } from 'react';
import {
  SchoolYear,
  Semester,
  Subject,
  PracticeSet,
  ExamAttemptRecord,
} from '../types/exam';
import { SubjectIcon, COLOR_CLASSES } from './SubjectIcon';
import {
  Layers,
  ChevronRight,
  ChevronDown,
  FolderPlus,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  X,
  Settings2,
  Calendar,
  GraduationCap,
  ArrowUpDown,
  GripVertical,
  Check,
  Trash2,
} from 'lucide-react';

interface SidebarProps {
  schoolYears: SchoolYear[];
  semesters: Semester[];
  subjects: Subject[];
  practiceSets: PracticeSet[];
  attempts: ExamAttemptRecord[];
  activeYearId: string;
  activeSemesterId: string;
  activeSubjectId: string;
  onSelectYear: (yearId: string) => void;
  onSelectSemester: (semesterId: string) => void;
  onSelectSubject: (subjectId: string) => void;
  onDeleteSubject?: (subjectId: string) => void;
  onRearrangeYears?: (newYears: SchoolYear[]) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenCreateSubject: () => void;
  onOpenCustomizeStructure: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  schoolYears,
  semesters,
  subjects,
  practiceSets,
  attempts,
  activeYearId,
  activeSemesterId,
  activeSubjectId,
  onSelectYear,
  onSelectSemester,
  onSelectSubject,
  onDeleteSubject,
  onRearrangeYears,
  isOpenMobile,
  onCloseMobile,
  onOpenCreateSubject,
  onOpenCustomizeStructure,
}) => {
  const currentYearObj = schoolYears.find((y) => y.id === activeYearId) || schoolYears[0];
  const currentSemesterObj = semesters.find((s) => s.id === activeSemesterId) || semesters[0];

  // Minimalist Academic Year Toggle state (hidden by default)
  const [isYearToggleOpen, setIsYearToggleOpen] = useState(false);

  // Drag-and-drop state for manual rearrangement on user's own
  const [draggedYearIndex, setDraggedYearIndex] = useState<number | null>(null);
  const [dragOverYearIndex, setDragOverYearIndex] = useState<number | null>(null);

  // Touch drag support for mobile sliding
  const touchStartYRef = useRef<number | null>(null);
  const touchYearIndexRef = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedYearIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${index}`);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverYearIndex !== index) {
      setDragOverYearIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedYearIndex === null || draggedYearIndex === targetIndex) {
      setDraggedYearIndex(null);
      setDragOverYearIndex(null);
      return;
    }

    const reordered = [...schoolYears];
    const [movedItem] = reordered.splice(draggedYearIndex, 1);
    reordered.splice(targetIndex, 0, movedItem);

    setDraggedYearIndex(null);
    setDragOverYearIndex(null);

    if (onRearrangeYears) {
      onRearrangeYears(reordered);
    }
  };

  const handleDragEnd = () => {
    setDraggedYearIndex(null);
    setDragOverYearIndex(null);
  };

  // Touch slide/reorder handling
  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
    touchYearIndexRef.current = index;
    setDraggedYearIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchYearIndexRef.current === null) return;
    const touch = e.touches[0];
    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
    const yearContainer = targetEl?.closest('[data-year-index]');
    if (yearContainer) {
      const targetIndex = Number(yearContainer.getAttribute('data-year-index'));
      if (!isNaN(targetIndex) && targetIndex !== dragOverYearIndex) {
        setDragOverYearIndex(targetIndex);
      }
    }
  };

  const handleTouchEnd = () => {
    if (
      touchYearIndexRef.current !== null &&
      dragOverYearIndex !== null &&
      touchYearIndexRef.current !== dragOverYearIndex
    ) {
      const reordered = [...schoolYears];
      const [movedItem] = reordered.splice(touchYearIndexRef.current, 1);
      reordered.splice(dragOverYearIndex, 0, movedItem);

      if (onRearrangeYears) {
        onRearrangeYears(reordered);
      }
    }
    touchStartYRef.current = null;
    touchYearIndexRef.current = null;
    setDraggedYearIndex(null);
    setDragOverYearIndex(null);
  };

  // Filter subjects by selected semester and year
  const filteredSubjects = subjects.filter((s) => {
    const matchesSem = s.semesterId === activeSemesterId;
    const matchesYear = !s.yearId || s.yearId === activeYearId;
    return matchesSem && matchesYear;
  });

  // Calculate stats for a subject
  const getSubjectStats = (subjectId: string) => {
    const sets = practiceSets.filter((p) => p.subjectId === subjectId);
    const setIds = new Set(sets.map((p) => p.id));
    const subjectAttempts = attempts.filter((a) => setIds.has(a.practiceSetId));

    const completedSetIds = new Set(subjectAttempts.map((a) => a.practiceSetId));
    const completedCount = completedSetIds.size;
    const totalSets = sets.length;

    let bestPercentage: number | null = null;
    if (subjectAttempts.length > 0) {
      bestPercentage = Math.max(...subjectAttempts.map((a) => a.percentage));
    }

    return { totalSets, completedCount, bestPercentage };
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 w-72 border-r border-slate-800">
      {/* 1. Academic Year Minimalist Toggle & Self-Service Reorder */}
      <div className="p-3 border-b border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <span>Academic Year</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenCustomizeStructure}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Customize School Years & Terms"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>
            {isOpenMobile && (
              <button
                onClick={onCloseMobile}
                className="md:hidden p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Minimalist Toggle Button: Displays current year cleanly */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsYearToggleOpen(!isYearToggleOpen)}
            className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
              isYearToggleOpen
                ? 'bg-slate-800 border-indigo-500/50 text-white shadow-xs'
                : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
              <span className="text-xs font-bold truncate">
                {currentYearObj?.name || 'Select Year'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                {isYearToggleOpen ? 'Close' : 'Change'}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isYearToggleOpen ? 'rotate-180 text-indigo-400' : ''
                }`}
              />
            </div>
          </button>

          {/* Toggle Panel: Reveals Academic Years with self-service drag-and-drop / slide reorder */}
          {isYearToggleOpen && (
            <div className="mt-2 p-2 bg-slate-950/90 rounded-2xl border border-slate-700/80 shadow-xl space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-1.5 pb-1 text-[10px] text-slate-400 font-medium border-b border-slate-800/80">
                <span className="flex items-center gap-1">
                  <ArrowUpDown className="w-2.5 h-2.5 text-indigo-400" />
                  Drag ⠿ to slide & rearrange
                </span>
                <span className="text-slate-500">{schoolYears.length} Years</span>
              </div>

              <div className="space-y-1 max-h-48 overflow-y-auto">
                {schoolYears.map((year, index) => {
                  const isActive = activeYearId === year.id;
                  const isBeingDragged = draggedYearIndex === index;
                  const isDragOver = dragOverYearIndex === index;

                  return (
                    <div
                      key={year.id}
                      data-year-index={index}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      onTouchStart={(e) => handleTouchStart(index, e)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      className={`flex items-center justify-between p-2 rounded-xl transition-all select-none ${
                        isBeingDragged
                          ? 'opacity-40 scale-95 border border-dashed border-indigo-400 bg-slate-800/50'
                          : isDragOver
                          ? 'border-2 border-indigo-500 bg-indigo-950/40 translate-y-0.5'
                          : isActive
                          ? 'bg-indigo-600/20 border border-indigo-500/50 text-white'
                          : 'bg-slate-800/60 hover:bg-slate-800 border border-slate-700/40 text-slate-300'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onSelectYear(year.id);
                          setIsYearToggleOpen(false);
                        }}
                        className="flex items-center gap-2 flex-1 text-left cursor-pointer min-w-0"
                      >
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold ${
                            isActive
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="text-xs font-bold truncate">{year.name}</span>
                        {isActive && <Check className="w-3.5 h-3.5 text-indigo-400 ml-auto shrink-0" />}
                      </button>

                      {/* Grip handle to grab & slide/rearrange on own */}
                      <div
                        className="p-1 text-slate-500 hover:text-indigo-400 cursor-grab active:cursor-grabbing touch-none shrink-0"
                        title="Drag / slide to rearrange order on your own"
                      >
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. Exactly 2 Semesters Toggle (Pill tabs) */}
        <div className="pt-1 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-1">
            <span>Semester</span>
            <span className="text-[10px] text-indigo-400 font-mono">2 Sems · 4 Terms</span>
          </div>

          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-800/80 rounded-xl border border-slate-700/70">
            {semesters.map((sem) => {
              const isActive = activeSemesterId === sem.id;
              return (
                <button
                  key={sem.id}
                  onClick={() => onSelectSemester(sem.id)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer truncate ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
                  title={`${sem.title} (Prelims, Midterms, Prefinals, Finals)`}
                >
                  {sem.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Subjects List for the selected Semester (NO Course Code) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="flex items-center justify-between px-2 pt-1 pb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>{currentSemesterObj?.title} Subjects</span>
          <span className="text-[11px] font-mono text-slate-500">
            {filteredSubjects.length}
          </span>
        </div>

        {filteredSubjects.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 rounded-lg border border-dashed border-slate-800">
            No subjects in {currentSemesterObj?.title} yet.
          </div>
        ) : (
          filteredSubjects.map((subject) => {
            const isActive = subject.id === activeSubjectId;
            const stats = getSubjectStats(subject.id);

            return (
              <button
                key={subject.id}
                onClick={() => {
                  onSelectSubject(subject.id);
                  if (isOpenMobile) onCloseMobile();
                }}
                className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer group flex flex-col gap-1.5 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                      }`}
                    >
                      <SubjectIcon name={subject.iconName} className="w-4 h-4" />
                    </div>
                    {/* Clean Subject Title - Course code removed per user request */}
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold truncate leading-tight text-white">
                        {subject.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {onDeleteSubject && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSubject(subject.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                            onDeleteSubject(subject.id);
                          }
                        }}
                        className={`p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-rose-500/30 text-slate-400 hover:text-rose-300 transition-all cursor-pointer ${
                          isActive ? 'opacity-60 hover:opacity-100' : ''
                        }`}
                        title={`Delete subject "${subject.title}"`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <ChevronRight
                      className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                        isActive ? 'text-white translate-x-0.5' : 'text-slate-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Sub-bar showing completion & test count */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/10 text-slate-400">
                  <span className={isActive ? 'text-indigo-100' : 'text-slate-400'}>
                    {stats.totalSets} {stats.totalSets === 1 ? 'Test Set' : 'Test Sets'}
                  </span>
                  {stats.completedCount > 0 ? (
                    <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      {stats.completedCount}/{stats.totalSets} Completed
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">Ready</span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Sidebar Footer: Add Subject & Customize */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <button
          onClick={onOpenCreateSubject}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-medium text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
        >
          <FolderPlus className="w-4 h-4 text-indigo-400" />
          <span>Add Custom Subject</span>
        </button>

        <button
          onClick={onOpenCustomizeStructure}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] text-indigo-400 hover:text-indigo-300 hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>Rearrange / Customize Years</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:block shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {content}
      </aside>

      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-72 h-full shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
