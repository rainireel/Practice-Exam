import React, { useState, useEffect } from 'react';
import { SchoolYear, Semester, Subject } from '../types/exam';
import { X, FolderPlus, BookOpen, Check } from 'lucide-react';

interface CreateSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolYears: SchoolYear[];
  semesters: Semester[];
  activeYearId: string;
  activeSemesterId: string;
  onSaveSubject: (newSubject: Subject) => void;
}

const AVAILABLE_ICONS = [
  'BookOpen',
  'Code2',
  'Binary',
  'Radio',
  'Cpu',
  'Database',
  'Network',
  'Terminal',
  'Shield',
  'Layers',
];

const AVAILABLE_COLORS = ['indigo', 'emerald', 'amber', 'violet', 'cyan', 'rose'];

export const CreateSubjectModal: React.FC<CreateSubjectModalProps> = ({
  isOpen,
  onClose,
  schoolYears,
  semesters,
  activeYearId,
  activeSemesterId,
  onSaveSubject,
}) => {
  const [yearId, setYearId] = useState<string>(activeYearId || schoolYears[0]?.id || 'year-3');
  const [semesterId, setSemesterId] = useState<string>(activeSemesterId || semesters[0]?.id || 'sem-1');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState('BookOpen');
  const [color, setColor] = useState('indigo');
  const [error, setError] = useState('');

  // Re-synchronize state whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setYearId(activeYearId || schoolYears[0]?.id || 'year-3');
      setSemesterId(activeSemesterId || semesters[0]?.id || 'sem-1');
      setTitle('');
      setDescription('');
      setError('');
    }
  }, [isOpen, activeYearId, activeSemesterId, schoolYears, semesters]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Subject title is required.');
      return;
    }

    const newSubject: Subject = {
      id: `sub-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      yearId,
      semesterId,
      title: title.trim(),
      description: description.trim() || 'Custom academic subject module.',
      iconName,
      color,
    };

    onSaveSubject(newSubject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FolderPlus className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Add New Subject</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && (
            <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 font-medium">
              {error}
            </div>
          )}

          {/* 1. School Year Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              1. School Year
            </label>
            <div className="grid grid-cols-2 gap-2">
              {schoolYears.map((y) => {
                const isSelected = yearId === y.id;
                return (
                  <button
                    key={y.id}
                    type="button"
                    onClick={() => setYearId(y.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-2xs ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{y.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Choose Semester (Clickable button pills so you can easily choose!) */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              2. Semester (Select Semester)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {semesters.map((s) => {
                const isSelected = semesterId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSemesterId(s.id)}
                    className={`py-2.5 px-3 rounded-xl border-2 text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span>{s.title}</span>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Subject Title (Course code completely removed per user request!) */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Subject Name
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Communication Systems, Web Development"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-500 outline-hidden"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key topics, syllabus coverage, or lecture summary..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-hidden"
            />
          </div>

          {/* Theme Color */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Theme Color
            </label>
            <div className="flex items-center gap-2">
              {AVAILABLE_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    c === 'indigo'
                      ? 'bg-indigo-600'
                      : c === 'emerald'
                      ? 'bg-emerald-600'
                      : c === 'amber'
                      ? 'bg-amber-600'
                      : c === 'violet'
                      ? 'bg-violet-600'
                      : c === 'cyan'
                      ? 'bg-cyan-600'
                      : 'bg-rose-600'
                  } ${color === c ? 'scale-115 ring-2 ring-slate-900 ring-offset-2' : 'opacity-80'}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Save Subject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
