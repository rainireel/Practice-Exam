import React from 'react';
import { ExamAttemptRecord, PracticeSet } from '../types/exam';
import {
  X,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Trash2,
  Award,
} from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  attempts: ExamAttemptRecord[];
  practiceSets: PracticeSet[];
  onReviewAttempt: (set: PracticeSet, attempt: ExamAttemptRecord) => void;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  attempts,
  practiceSets,
  onReviewAttempt,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const practiceSetMap = new Map(practiceSets.map((p) => [p.id, p]));

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Exam Attempt History & Records
              </h2>
              <p className="text-xs text-slate-500">
                Review your scores, timestamps, and answer rationales across all semesters.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {attempts.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Award className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No Attempts Logged Yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Take a practice exam to track your accuracy and study progress here.
              </p>
            </div>
          ) : (
            attempts.map((attempt) => {
              const matchingSet = practiceSetMap.get(attempt.practiceSetId);

              return (
                <div
                  key={attempt.id}
                  className="bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                        {attempt.subjectTitle}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          attempt.passed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {attempt.passed ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {attempt.percentage}% • {attempt.passed ? 'Passed' : 'Needs Review'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {attempt.practiceSetTitle}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                      <span>
                        {attempt.correctCount} / {attempt.totalQuestions} Correct
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatTime(attempt.timeSpentSeconds)}
                      </span>
                      <span>•</span>
                      <span>{new Date(attempt.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {matchingSet ? (
                      <button
                        onClick={() => {
                          onReviewAttempt(matchingSet, attempt);
                          onClose();
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-600 border border-slate-200 hover:border-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Open Review</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Original set deleted</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {attempts.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={onClearHistory}
              className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
