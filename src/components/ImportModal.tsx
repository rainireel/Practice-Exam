import React, { useState } from 'react';
import {
  Semester,
  Subject,
  PracticeSet,
  Question,
  AcademicTerm,
} from '../types/exam';
import {
  parseTextAssessment,
  parseJsonAssessment,
  SAMPLE_TEXT_TEMPLATE,
  SAMPLE_JSON_TEMPLATE,
  AI_PROMPT_TEMPLATE,
} from '../utils/parser';
import {
  X,
  FileText,
  Code,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Plus,
  HelpCircle,
  Clock,
  Layers,
  Calendar,
} from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  semesters: Semester[];
  subjects: Subject[];
  terms: AcademicTerm[];
  initialSemesterId?: string;
  initialSubjectId?: string;
  onImportSuccess: (practiceSet: PracticeSet) => void;
  onAddNewSubject: (semesterId: string, title: string, code?: string) => Subject;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  semesters,
  subjects,
  terms,
  initialSemesterId,
  initialSubjectId,
  onImportSuccess,
  onAddNewSubject,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'json' | 'aiPrompt'>('text');
  const [inputText, setInputText] = useState(SAMPLE_TEXT_TEMPLATE);
  const [inputJson, setInputJson] = useState(SAMPLE_JSON_TEMPLATE);

  // Target assignment
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(
    initialSemesterId && initialSemesterId !== 'all' ? initialSemesterId : semesters[0]?.id || 'sem-1'
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || subjects[0]?.id || 'sub-comm'
  );
  const [selectedTermId, setSelectedTermId] = useState<string>(terms[0]?.id || 'prelims');

  // Custom subject modal within import if needed
  const [isCreatingNewSubject, setIsCreatingNewSubject] = useState(false);
  const [newSubjectTitle, setNewSubjectTitle] = useState('');

  // Assessment metadata
  const [examTitle, setExamTitle] = useState('');
  const [examDescription, setExamDescription] = useState('Assessment set with verbatim rationale.');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(20);

  // Parsing state & preview
  const [parsedQuestions, setParsedQuestions] = useState<Question[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [hasPreviewed, setHasPreviewed] = useState(false);

  // AI Prompt generator fields
  const [aiTopic, setAiTopic] = useState('Communication Systems Fourier Analysis & Modulation');
  const [aiQuestionCount, setAiQuestionCount] = useState(8);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  if (!isOpen) return null;

  const currentSubjectObj = subjects.find((s) => s.id === selectedSubjectId);
  const currentSemesterObj = semesters.find((s) => s.id === selectedSemesterId);

  // Filter subjects by selected semester
  const availableSubjects = subjects.filter((s) => s.semesterId === selectedSemesterId);

  const handleParse = () => {
    setParseError(null);
    let result;
    if (activeTab === 'text') {
      result = parseTextAssessment(inputText);
    } else {
      result = parseJsonAssessment(inputJson);
    }

    if (result.success && result.questions.length > 0) {
      setParsedQuestions(result.questions);
      if (!examTitle && result.inferredTitle) {
        setExamTitle(result.inferredTitle);
      }
      if (result.inferredDescription) {
        setExamDescription(result.inferredDescription);
      }
      setHasPreviewed(true);
    } else {
      setParsedQuestions(null);
      setParseError(result.error || 'Failed to parse assessment content.');
      setHasPreviewed(true);
    }
  };

  const handleSaveAssessment = () => {
    let questionsToSave = parsedQuestions;
    if (!questionsToSave) {
      const result = activeTab === 'text' ? parseTextAssessment(inputText) : parseJsonAssessment(inputJson);
      if (result.success && result.questions.length > 0) {
        questionsToSave = result.questions;
      } else {
        setParseError(result.error || 'Please parse valid questions before saving.');
        return;
      }
    }

    let finalSubjectId = selectedSubjectId;
    if (isCreatingNewSubject && newSubjectTitle.trim()) {
      const created = onAddNewSubject(selectedSemesterId, newSubjectTitle.trim());
      finalSubjectId = created.id;
    }

    const termObj = terms.find((t) => t.id === selectedTermId);
    const prefix = termObj ? `${termObj.name}: ` : '';

    const newSet: PracticeSet = {
      id: `custom-set-${Date.now()}`,
      subjectId: finalSubjectId,
      semesterId: selectedSemesterId,
      termId: selectedTermId,
      title: examTitle.trim() || `${prefix}Practice Assessment (${questionsToSave.length} Questions)`,
      description: examDescription.trim() || 'Custom practice test bank.',
      timeLimitMinutes: timeLimitMinutes > 0 ? timeLimitMinutes : undefined,
      passingScorePercent: 60,
      questions: questionsToSave,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    onImportSuccess(newSet);
    onClose();
  };

  const handleCopyPrompt = () => {
    const prompt = AI_PROMPT_TEMPLATE(
      currentSubjectObj?.title || 'Engineering',
      aiTopic,
      aiQuestionCount
    );
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full my-8 p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Import Assessment Question Bank
              </h2>
              <p className="text-xs text-slate-500">
                Paste Q&A sets or JSON to add exams under Prelims, Midterms, Prefinals, or Finals.
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

        {/* Format Selector Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl text-xs font-semibold text-slate-600">
          <button
            onClick={() => {
              setActiveTab('text');
              setHasPreviewed(false);
            }}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'text'
                ? 'bg-white text-indigo-600 font-bold shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Structured Text / Markdown</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('json');
              setHasPreviewed(false);
            }}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'json'
                ? 'bg-white text-indigo-600 font-bold shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>JSON Format</span>
          </button>
          <button
            onClick={() => setActiveTab('aiPrompt')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'aiPrompt'
                ? 'bg-white text-indigo-600 font-bold shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Prompt Generator</span>
          </button>
        </div>

        {/* Tab 1: Text / Markdown */}
        {activeTab === 'text' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Paste Q&A text below (Questions, choices A-D, Answer & Explanation):</span>
              <button
                onClick={() => {
                  setInputText(SAMPLE_TEXT_TEMPLATE);
                  setHasPreviewed(false);
                }}
                className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
              >
                Load Sample Text
              </button>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setHasPreviewed(false);
              }}
              rows={8}
              className="w-full p-3.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden bg-slate-50/50 leading-relaxed"
              placeholder="1. Question...&#10;A) Choice&#10;B) Choice&#10;Answer: B&#10;Explanation: ..."
            />
          </div>
        )}

        {/* Tab 2: JSON */}
        {activeTab === 'json' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Paste JSON array or practice set object:</span>
              <button
                onClick={() => {
                  setInputJson(SAMPLE_JSON_TEMPLATE);
                  setHasPreviewed(false);
                }}
                className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
              >
                Load Sample JSON
              </button>
            </div>
            <textarea
              value={inputJson}
              onChange={(e) => {
                setInputJson(e.target.value);
                setHasPreviewed(false);
              }}
              rows={8}
              className="w-full p-3.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden bg-slate-50/50 leading-relaxed"
            />
          </div>
        )}

        {/* Tab 3: AI Prompt Generator */}
        {activeTab === 'aiPrompt' && (
          <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Generate Compatible Questions with Gemini or ChatGPT
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Copy this pre-tuned prompt into your AI model, then paste the generated output into the "Structured Text" tab above!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
                  Topic / Exam Subject
                </label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  placeholder="e.g. Distributed Database Sharding"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
                  Question Count
                </label>
                <input
                  type="number"
                  min={2}
                  max={25}
                  value={aiQuestionCount}
                  onChange={(e) => setAiQuestionCount(parseInt(e.target.value, 10) || 5)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Ready Prompt:</span>
                <button
                  onClick={handleCopyPrompt}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? 'Copied Prompt!' : 'Copy AI Prompt'}</span>
                </button>
              </div>
              <pre className="p-3 bg-white border border-slate-200 rounded-xl text-[11px] font-mono text-slate-700 max-h-36 overflow-y-auto whitespace-pre-wrap">
                {AI_PROMPT_TEMPLATE(currentSubjectObj?.title || 'Computer Science', aiTopic, aiQuestionCount)}
              </pre>
            </div>
          </div>
        )}

        {/* Target Destination & Details */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Semester Select */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Target Semester
              </label>
              <select
                value={selectedSemesterId}
                onChange={(e) => setSelectedSemesterId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
              >
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Term Select (Prelims, Midterms, Prefinals, Finals) */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Exam Term
              </label>
              <select
                value={selectedTermId}
                onChange={(e) => setSelectedTermId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white text-indigo-700"
              >
                {terms.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Select */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Target Subject</label>
                <button
                  onClick={() => setIsCreatingNewSubject(!isCreatingNewSubject)}
                  className="text-[11px] text-indigo-600 font-semibold hover:underline cursor-pointer"
                >
                  {isCreatingNewSubject ? 'Cancel' : '+ New'}
                </button>
              </div>

              {isCreatingNewSubject ? (
                <div>
                  <input
                    type="text"
                    value={newSubjectTitle}
                    onChange={(e) => setNewSubjectTitle(e.target.value)}
                    placeholder="Enter Subject Name"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-indigo-300 bg-indigo-50/50 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>
              ) : (
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                >
                  {availableSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Test Name & Time Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Assessment Title
              </label>
              <input
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="e.g. Prelims: Signal Spectra and Modulation Analysis"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Time Limit (Minutes)
              </label>
              <input
                type="number"
                min={0}
                max={180}
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(parseInt(e.target.value, 10) || 0)}
                placeholder="0 = Untimed"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Validation / Parse Status */}
        {hasPreviewed && (
          <div>
            {parseError ? (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Parsing Error</strong>
                  <span>{parseError}</span>
                </div>
              </div>
            ) : parsedQuestions ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    Successfully parsed <strong>{parsedQuestions.length} questions</strong> across{' '}
                    <strong>
                      {new Set(parsedQuestions.map((q) => q.sectionTitle)).size} sections
                    </strong>.
                  </span>
                </div>
                <span className="font-semibold text-emerald-700">Ready to save</span>
              </div>
            ) : null}
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 flex-wrap gap-3">
          <button
            onClick={handleParse}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Preview & Validate Questions
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAssessment}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-200 transition-colors cursor-pointer"
            >
              Add Assessment to Vault
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
