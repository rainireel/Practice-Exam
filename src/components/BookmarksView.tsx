import React, { useState } from 'react';
import { PracticeSet, Question } from '../types/exam';
import {
  Bookmark,
  ArrowLeft,
  Lightbulb,
  Check,
  Trash2,
  BookOpen,
} from 'lucide-react';

interface BookmarksViewProps {
  practiceSets: PracticeSet[];
  bookmarkedIds: string[];
  onToggleBookmark: (questionId: string) => void;
  onBackToDashboard: () => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  practiceSets,
  bookmarkedIds,
  onToggleBookmark,
  onBackToDashboard,
}) => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // Find all questions matching bookmarked IDs
  const bookmarkedQuestions: { question: Question; practiceSetTitle: string; subjectId: string }[] = [];
  const bookmarkSet = new Set(bookmarkedIds);

  practiceSets.forEach((pset) => {
    pset.questions.forEach((q) => {
      if (bookmarkSet.has(q.id)) {
        bookmarkedQuestions.push({
          question: q,
          practiceSetTitle: pset.title,
          subjectId: pset.subjectId,
        });
      }
    });
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <span className="text-xs text-slate-500">
          <strong>{bookmarkedQuestions.length}</strong> Questions Bookmarked
        </span>
      </div>

      {/* Hero */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Bookmark className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Bookmarked & Flagged Questions
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Targeted revision bank of tricky questions, correct answers, and verbatim rationale.
            </p>
          </div>
        </div>
      </div>

      {/* Bookmarked Questions List */}
      {bookmarkedQuestions.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Bookmarked Questions Yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            While taking a test or reviewing your answers, tap the flag/save icon to keep tough questions here.
          </p>
          <button
            onClick={onBackToDashboard}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Go to Practice Exams
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarkedQuestions.map(({ question: q, practiceSetTitle }, idx) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-500">#{idx + 1}</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {practiceSetTitle}
                  </span>
                  {q.sectionTitle && (
                    <span className="text-[11px] text-slate-400">• {q.sectionTitle}</span>
                  )}
                </div>

                <button
                  onClick={() => onToggleBookmark(q.id)}
                  className="text-xs text-amber-600 hover:text-amber-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                  <span>Remove</span>
                </button>
              </div>

              {/* Question Text */}
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                {q.questionText}
              </h3>

              {q.codeSnippet && (
                <div className="rounded-xl overflow-hidden bg-slate-900 text-slate-100 font-mono text-xs p-3.5 border border-slate-800">
                  <pre className="overflow-x-auto">
                    <code>{q.codeSnippet}</code>
                  </pre>
                </div>
              )}

              {/* Choices */}
              <div className="space-y-2">
                {q.options.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isCorrect = q.correctIndex === optIdx;

                  return (
                    <div
                      key={optIdx}
                      className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-3 ${
                        isCorrect
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium'
                          : 'border-slate-200/80 bg-slate-50/50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {letter}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isCorrect && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                          ✓ Correct Choice
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                  <Lightbulb className="w-4 h-4 text-indigo-600" />
                  <span>Verbatim Explanation</span>
                  {q.keyConcept && (
                    <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-200/60 text-indigo-800">
                      {q.keyConcept}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-indigo-950 leading-relaxed pt-1">
                  {q.explanation}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
