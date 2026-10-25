/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  SchoolYear,
  Semester,
  AcademicTerm,
  Subject,
  PracticeSet,
  ExamAttemptRecord,
  ViewMode,
  UserExamResponse,
  Question,
  ConfidenceLevel,
  WeakSpotQuestionItem,
} from './types/exam';
import {
  getStoredSchoolYears,
  saveSchoolYears,
  getStoredSemesters,
  saveSemesters,
  getStoredTerms,
  saveTerms,
  getStoredSubjects,
  saveSubjects,
  getStoredPracticeSets,
  savePracticeSets,
  getStoredAttempts,
  saveAttempt,
  getStoredBookmarks,
  toggleBookmarkStorage,
  resetAllData,
} from './utils/storage';
import {
  compileWeakSpots,
  createMasterMyMistakesDrill,
} from './utils/weakSpots';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ExamView } from './components/ExamView';
import { ReviewView } from './components/ReviewView';
import { BookmarksView } from './components/BookmarksView';
import { ErrorNotebookView } from './components/ErrorNotebookView';
import { ImportModal } from './components/ImportModal';
import { HistoryModal } from './components/HistoryModal';
import { CreateSubjectModal } from './components/CreateSubjectModal';
import { CustomizeStructureModal } from './components/CustomizeStructureModal';

export default function App() {
  // Primary Academic Data State
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [practiceSets, setPracticeSets] = useState<PracticeSet[]>([]);
  const [attempts, setAttempts] = useState<ExamAttemptRecord[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  // Navigation State
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [activeYearId, setActiveYearId] = useState<string>('year-3');
  const [activeSemesterId, setActiveSemesterId] = useState<string>('sem-1');
  const [activeSubjectId, setActiveSubjectId] = useState<string>('sub-comm');
  const [activePracticeSet, setActivePracticeSet] = useState<PracticeSet | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<ExamAttemptRecord | null>(null);

  // Modals & Drawers
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isCreateSubjectModalOpen, setIsCreateSubjectModalOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

  // Notification Banner
  const [notification, setNotification] = useState<string | null>(null);

  // Load Initial Data from Storage
  useEffect(() => {
    const loadedYears = getStoredSchoolYears();
    const loadedSemesters = getStoredSemesters();
    const loadedTerms = getStoredTerms();
    const loadedSubjects = getStoredSubjects();
    const loadedSets = getStoredPracticeSets();
    const loadedAttempts = getStoredAttempts();
    const loadedBookmarks = getStoredBookmarks();

    setSchoolYears(loadedYears);
    setSemesters(loadedSemesters);
    setTerms(loadedTerms);
    setSubjects(loadedSubjects);
    setPracticeSets(loadedSets);
    setAttempts(loadedAttempts);
    setBookmarkedIds(loadedBookmarks);

    if (loadedYears.length > 0 && !loadedYears.some((y) => y.id === 'year-3')) {
      setActiveYearId(loadedYears[0].id);
    }
    if (loadedSemesters.length > 0 && !loadedSemesters.some((s) => s.id === 'sem-1')) {
      setActiveSemesterId(loadedSemesters[0].id);
    }
    if (loadedSubjects.length > 0 && !loadedSubjects.some((s) => s.id === 'sub-comm')) {
      setActiveSubjectId(loadedSubjects[0].id);
    }
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Find active year, semester, and subject objects
  const activeSchoolYear = useMemo(
    () => schoolYears.find((y) => y.id === activeYearId) || schoolYears[0],
    [schoolYears, activeYearId]
  );

  const activeSemester = useMemo(
    () => semesters.find((s) => s.id === activeSemesterId) || semesters[0],
    [semesters, activeSemesterId]
  );

  const activeSubject = useMemo(
    () => subjects.find((s) => s.id === activeSubjectId) || subjects[0],
    [subjects, activeSubjectId]
  );

  // Computed global stats
  const averageAccuracy = useMemo(() => {
    if (attempts.length === 0) return 0;
    const totalPercentage = attempts.reduce((acc, a) => acc + a.percentage, 0);
    return Math.round(totalPercentage / attempts.length);
  }, [attempts]);

  // Compile all weak spots from attempts
  const allWeakSpots = useMemo(() => {
    return compileWeakSpots(attempts, practiceSets, subjects);
  }, [attempts, practiceSets, subjects]);

  const blindSpotsCount = useMemo(() => {
    return allWeakSpots.filter((w) => w.isDangerousBlindSpot && !w.isResolved).length;
  }, [allWeakSpots]);

  const recurringMistakesCount = useMemo(() => {
    return allWeakSpots.filter((w) => w.missCount >= 2 && !w.isResolved).length;
  }, [allWeakSpots]);

  // Handle Exam Start
  const handleStartExam = (set: PracticeSet) => {
    setActivePracticeSet(set);
    setCurrentAttempt(null);
    setViewMode('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Exam Submission & Instant Grading + Confidence Logging
  const handleSubmitExam = (
    answers: UserExamResponse,
    flaggedIds: string[],
    timeSpentSeconds: number,
    confidences?: Record<string, ConfidenceLevel>
  ) => {
    if (!activePracticeSet) return;

    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;

    activePracticeSet.questions.forEach((q) => {
      const userAns = answers[q.id];
      if (userAns === undefined || userAns === null) {
        skippedCount++;
      } else if (userAns === q.correctIndex) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });

    const totalQuestions = activePracticeSet.questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passingThreshold = activePracticeSet.passingScorePercent || 60;
    const passed = percentage >= passingThreshold;

    const termObj = terms.find((t) => t.id === activePracticeSet.termId);

    const newAttempt: ExamAttemptRecord = {
      id: `attempt-${Date.now()}`,
      practiceSetId: activePracticeSet.id,
      practiceSetTitle: activePracticeSet.title,
      subjectId: activePracticeSet.subjectId,
      subjectTitle: activeSubject?.title || 'Subject',
      yearName: activeSchoolYear?.name || 'School Year',
      semesterTitle: activeSemester?.title || 'Semester',
      termName: termObj?.name || 'Term',
      timestamp: new Date().toISOString(),
      score: correctCount,
      totalQuestions,
      correctCount,
      incorrectCount,
      skippedCount,
      percentage,
      passed,
      timeSpentSeconds,
      answers,
      flaggedQuestionIds: flaggedIds,
      confidences,
    };

    saveAttempt(newAttempt);
    setAttempts((prev) => [newAttempt, ...prev]);
    setCurrentAttempt(newAttempt);

    setViewMode('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Launch Master My Mistakes drill
  const handleStartMistakesDrill = (
    spots?: WeakSpotQuestionItem[],
    customTitle?: string
  ) => {
    const targetSpots =
      spots && spots.length > 0
        ? spots
        : allWeakSpots.filter((w) => !w.isResolved);

    if (targetSpots.length === 0) {
      showNotification('No unresolved mistakes logged yet. Complete an exam first!');
      return;
    }

    const drillSet = createMasterMyMistakesDrill(
      targetSpots,
      customTitle || `Master My Mistakes Drill (${targetSpots.length} Questions)`,
      activeSubjectId,
      activeSemesterId,
      'midterms'
    );

    setActivePracticeSet(drillSet);
    setCurrentAttempt(null);
    setViewMode('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showNotification(`Started Master My Mistakes drill with ${drillSet.questions.length} questions!`);
  };

  // Retake full exam
  const handleRetakeFull = (shuffle: boolean = false) => {
    if (!activePracticeSet) return;

    let targetQuestions = [...activePracticeSet.questions];
    if (shuffle) {
      targetQuestions = targetQuestions.sort(() => Math.random() - 0.5);
    }

    const retakeSet: PracticeSet = {
      ...activePracticeSet,
      questions: targetQuestions,
    };

    setActivePracticeSet(retakeSet);
    setViewMode('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Retake missed questions only (Adaptive Drill)
  const handleRetakeMissed = (missedQuestions: Question[]) => {
    if (!activePracticeSet || missedQuestions.length === 0) return;

    const focusedSet: PracticeSet = {
      id: `${activePracticeSet.id}-missed-${Date.now()}`,
      subjectId: activePracticeSet.subjectId,
      yearId: activePracticeSet.yearId,
      semesterId: activePracticeSet.semesterId,
      termId: activePracticeSet.termId,
      title: `${activePracticeSet.title} (Reinforcement Drill)`,
      description: `Targeted review of ${missedQuestions.length} missed/skipped questions.`,
      timeLimitMinutes: Math.max(5, Math.ceil(missedQuestions.length * 1.5)),
      passingScorePercent: 80,
      questions: missedQuestions,
      isCustom: true,
    };

    setActivePracticeSet(focusedSet);
    setViewMode('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // View historical review
  const handleViewReview = (set: PracticeSet, attempt: ExamAttemptRecord) => {
    setActivePracticeSet(set);
    setCurrentAttempt(attempt);
    setViewMode('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle Bookmark
  const handleToggleBookmark = (questionId: string) => {
    const updated = toggleBookmarkStorage(questionId);
    setBookmarkedIds(updated);
  };

  // Import New Practice Set
  const handleImportSuccess = (newSet: PracticeSet) => {
    const updated = [newSet, ...practiceSets];
    setPracticeSets(updated);
    savePracticeSets(updated);

    setActiveSubjectId(newSet.subjectId);
    setActiveSemesterId(newSet.semesterId);
    setViewMode('dashboard');
    showNotification(`Added "${newSet.title}" with ${newSet.questions.length} questions!`);
  };

  // Add Custom Subject
  const handleAddNewSubject = (newSub: Subject) => {
    const updated = [...subjects, newSub];
    setSubjects(updated);
    saveSubjects(updated);
    setActiveSubjectId(newSub.id);
    setActiveSemesterId(newSub.semesterId);
    showNotification(`Created subject: ${newSub.title}`);
  };

  // Save customized years
  const handleSaveYears = (newYears: SchoolYear[]) => {
    setSchoolYears(newYears);
    saveSchoolYears(newYears);
    if (!newYears.some((y) => y.id === activeYearId)) {
      setActiveYearId(newYears[0]?.id || 'year-3');
    }
    showNotification('Updated school years.');
  };

  // Save customized semesters
  const handleSaveSemesters = (newSemesters: Semester[]) => {
    setSemesters(newSemesters);
    saveSemesters(newSemesters);
    if (!newSemesters.some((s) => s.id === activeSemesterId)) {
      setActiveSemesterId(newSemesters[0]?.id || 'sem-1');
    }
    showNotification('Updated semester structure (2 Semesters per year).');
  };

  // Save customized terms
  const handleSaveTerms = (newTerms: AcademicTerm[]) => {
    setTerms(newTerms);
    saveTerms(newTerms);
    showNotification('Updated 4 exam terms (Prelims, Midterms, Prefinals, Finals).');
  };

  // Delete Practice Set (Any Set)
  const handleDeletePracticeSet = (setId: string) => {
    const setToDelete = practiceSets.find((p) => p.id === setId);
    if (!setToDelete) return;

    if (
      !window.confirm(
        `Are you sure you want to delete "${setToDelete.title}"? This will permanently remove this practice set, its question pool, and any past attempt scores.`
      )
    ) {
      return;
    }

    const updatedPracticeSets = practiceSets.filter((p) => p.id !== setId);
    setPracticeSets(updatedPracticeSets);
    savePracticeSets(updatedPracticeSets);

    // Clean up attempts
    const updatedAttempts = attempts.filter((a) => a.practiceSetId !== setId);
    setAttempts(updatedAttempts);
    localStorage.setItem('reviseiq_attempts_v3', JSON.stringify(updatedAttempts));

    showNotification(`Practice test "${setToDelete.title}" deleted.`);
  };

  // Delete Subject
  const handleDeleteSubject = (subjectId: string) => {
    const subjectToDelete = subjects.find((s) => s.id === subjectId);
    if (!subjectToDelete) return;

    const countSets = practiceSets.filter((p) => p.subjectId === subjectId).length;
    const confirmMsg =
      countSets > 0
        ? `Are you sure you want to delete "${subjectToDelete.title}"? This will permanently delete the subject and its ${countSets} practice test(s).`
        : `Are you sure you want to delete "${subjectToDelete.title}"?`;

    if (!window.confirm(confirmMsg)) return;

    // Remove subject
    const updatedSubjects = subjects.filter((s) => s.id !== subjectId);
    setSubjects(updatedSubjects);
    saveSubjects(updatedSubjects);

    // Remove associated practice sets
    const setsToDelete = practiceSets.filter((p) => p.subjectId === subjectId);
    const setsToDeleteIds = new Set(setsToDelete.map((p) => p.id));
    const questionIdsToDelete = new Set(
      setsToDelete.flatMap((p) => p.questions.map((q) => q.id))
    );

    const updatedPracticeSets = practiceSets.filter((p) => p.subjectId !== subjectId);
    setPracticeSets(updatedPracticeSets);
    savePracticeSets(updatedPracticeSets);

    // Clean up attempts
    const updatedAttempts = attempts.filter(
      (a) => !setsToDeleteIds.has(a.practiceSetId)
    );
    setAttempts(updatedAttempts);
    localStorage.setItem('reviseiq_attempts_v3', JSON.stringify(updatedAttempts));

    // Select next available subject in current semester / year
    const nextSubject =
      updatedSubjects.find(
        (s) =>
          s.semesterId === activeSemesterId &&
          (!s.yearId || s.yearId === activeYearId)
      ) || updatedSubjects[0];

    if (nextSubject) {
      setActiveSubjectId(nextSubject.id);
      if (nextSubject.semesterId !== activeSemesterId) {
        setActiveSemesterId(nextSubject.semesterId);
      }
      if (nextSubject.yearId && nextSubject.yearId !== activeYearId) {
        setActiveYearId(nextSubject.yearId);
      }
    } else {
      setActiveSubjectId('');
    }

    showNotification(`Subject "${subjectToDelete.title}" deleted.`);
  };

  // Reset to defaults
  const handleResetData = () => {
    if (window.confirm('Reset all custom exams, semesters, and terms to defaults?')) {
      resetAllData();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-slate-900">
      {/* Top Navigation */}
      <Navbar
        viewMode={viewMode}
        onNavigateHome={() => setViewMode('dashboard')}
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenBookmarks={() => setViewMode('bookmarks')}
        onOpenErrorNotebook={() => setViewMode('error-notebook')}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        activeSchoolYear={activeSchoolYear}
        activeSemester={activeSemester}
        activeSubject={activeSubject}
        activePracticeSet={activePracticeSet || undefined}
        completedAttemptsCount={attempts.length}
        averageAccuracy={averageAccuracy}
        bookmarkedCount={bookmarkedIds.length}
        weakSpotsCount={allWeakSpots.length}
        blindSpotsCount={blindSpotsCount}
        recurringMistakesCount={recurringMistakesCount}
        onResetData={handleResetData}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {notification}
        </div>
      )}

      {/* Main Workspace: Left Sidebar + Center View */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar (hidden during live exam to avoid distraction) */}
        {viewMode !== 'exam' && (
          <Sidebar
            schoolYears={schoolYears}
            semesters={semesters}
            subjects={subjects}
            practiceSets={practiceSets}
            attempts={attempts}
            activeYearId={activeYearId}
            activeSemesterId={activeSemesterId}
            activeSubjectId={activeSubjectId}
            onSelectYear={(yearId) => {
              setActiveYearId(yearId);
              // Switch to first subject in current semester and this year
              const matchingSub = subjects.find(
                (s) => s.semesterId === activeSemesterId && (!s.yearId || s.yearId === yearId)
              );
              if (matchingSub) setActiveSubjectId(matchingSub.id);
              setViewMode('dashboard');
            }}
            onSelectSemester={(semId) => {
              setActiveSemesterId(semId);
              const matchingSub = subjects.find(
                (s) => s.semesterId === semId && (!s.yearId || s.yearId === activeYearId)
              );
              if (matchingSub) setActiveSubjectId(matchingSub.id);
              setViewMode('dashboard');
            }}
            onSelectSubject={(subId) => {
              setActiveSubjectId(subId);
              const sub = subjects.find((s) => s.id === subId);
              if (sub) {
                if (sub.semesterId !== activeSemesterId) setActiveSemesterId(sub.semesterId);
                if (sub.yearId && sub.yearId !== activeYearId) setActiveYearId(sub.yearId);
              }
              setViewMode('dashboard');
            }}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            onOpenCreateSubject={() => setIsCreateSubjectModalOpen(true)}
            onOpenCustomizeStructure={() => setIsCustomizeModalOpen(true)}
            onRearrangeYears={handleSaveYears}
            onDeleteSubject={handleDeleteSubject}
          />
        )}

        {/* Dynamic Center Main Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {viewMode === 'dashboard' && (
            <DashboardView
              currentSubject={activeSubject}
              currentSemester={activeSemester}
              practiceSets={practiceSets}
              attempts={attempts}
              terms={terms}
              weakSpotsCount={allWeakSpots.length}
              blindSpotsCount={blindSpotsCount}
              recurringMistakesCount={recurringMistakesCount}
              onStartExam={handleStartExam}
              onViewReview={handleViewReview}
              onOpenImport={() => setIsImportModalOpen(true)}
              onOpenErrorNotebook={() => setViewMode('error-notebook')}
              onStartMistakesDrill={() => handleStartMistakesDrill()}
              onOpenCustomizeStructure={() => setIsCustomizeModalOpen(true)}
              onDeleteCustomSet={handleDeletePracticeSet}
              onDeletePracticeSet={handleDeletePracticeSet}
              onDeleteSubject={handleDeleteSubject}
            />
          )}

          {viewMode === 'exam' && activePracticeSet && (
            <ExamView
              practiceSet={activePracticeSet}
              onSubmitExam={handleSubmitExam}
              onExitExam={() => {
                if (window.confirm('Leave test? Your current progress on this attempt will not be recorded.')) {
                  setViewMode('dashboard');
                }
              }}
            />
          )}

          {viewMode === 'review' && activePracticeSet && currentAttempt && (
            <ReviewView
              practiceSet={activePracticeSet}
              attempt={currentAttempt}
              bookmarkedQuestionIds={bookmarkedIds}
              onToggleBookmark={handleToggleBookmark}
              onRetakeFull={handleRetakeFull}
              onRetakeMissed={handleRetakeMissed}
              onBackToDashboard={() => setViewMode('dashboard')}
              onOpenErrorNotebook={() => setViewMode('error-notebook')}
            />
          )}

          {viewMode === 'bookmarks' && (
            <BookmarksView
              practiceSets={practiceSets}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={handleToggleBookmark}
              onBackToDashboard={() => setViewMode('dashboard')}
            />
          )}

          {(viewMode === 'error-notebook' || viewMode === 'spaced-review' || viewMode === 'weak-spots') && (
            <ErrorNotebookView
              weakSpots={allWeakSpots}
              allPracticeSets={practiceSets}
              subjects={subjects}
              currentSubjectId={activeSubjectId}
              onBackToDashboard={() => setViewMode('dashboard')}
              onStartMistakesDrill={(spots, title) => handleStartMistakesDrill(spots, title)}
              bookmarkedQuestionIds={bookmarkedIds}
              onToggleBookmark={handleToggleBookmark}
            />
          )}
        </main>
      </div>

      {/* Import Assessment Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        semesters={semesters}
        subjects={subjects}
        terms={terms}
        initialSemesterId={activeSemesterId}
        initialSubjectId={activeSubjectId}
        onImportSuccess={handleImportSuccess}
        onAddNewSubject={(semesterId, title) => {
          const newSub: Subject = {
            id: `sub-${Date.now().toString(36)}`,
            yearId: activeYearId,
            semesterId,
            title,
            description: 'Custom imported subject module.',
            iconName: 'BookOpen',
            color: 'indigo',
          };
          handleAddNewSubject(newSub);
          return newSub;
        }}
      />

      {/* History & Attempts Modal */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        attempts={attempts}
        practiceSets={practiceSets}
        onReviewAttempt={handleViewReview}
        onClearHistory={() => {
          if (window.confirm('Clear all past attempt records?')) {
            localStorage.removeItem('reviseiq_attempts_v3');
            setAttempts([]);
            showNotification('History cleared.');
          }
        }}
      />

      {/* Create Subject Modal */}
      <CreateSubjectModal
        isOpen={isCreateSubjectModalOpen}
        onClose={() => setIsCreateSubjectModalOpen(false)}
        schoolYears={schoolYears}
        semesters={semesters}
        activeYearId={activeYearId}
        activeSemesterId={activeSemesterId}
        onSaveSubject={handleAddNewSubject}
      />

      {/* Customize Structure Modal (School Years, 2 Semesters per Year, 4 Terms per Semester) */}
      <CustomizeStructureModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
        schoolYears={schoolYears}
        semesters={semesters}
        terms={terms}
        onSaveYears={handleSaveYears}
        onSaveSemesters={handleSaveSemesters}
        onSaveTerms={handleSaveTerms}
      />
    </div>
  );
}
