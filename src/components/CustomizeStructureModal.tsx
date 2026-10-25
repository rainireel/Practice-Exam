import React, { useState } from 'react';
import {
  SchoolYear,
  Semester,
  AcademicTerm,
  DEFAULT_SCHOOL_YEARS,
  DEFAULT_SEMESTERS,
  DEFAULT_TERMS,
} from '../types/exam';
import {
  X,
  Settings2,
  Calendar,
  Layers,
  GraduationCap,
  Edit2,
  Trash2,
  Plus,
  Check,
  RotateCcw,
  ArrowUpDown,
  GripVertical,
} from 'lucide-react';

interface CustomizeStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolYears: SchoolYear[];
  semesters: Semester[];
  terms: AcademicTerm[];
  onSaveYears: (newYears: SchoolYear[]) => void;
  onSaveSemesters: (newSemesters: Semester[]) => void;
  onSaveTerms: (newTerms: AcademicTerm[]) => void;
}

export const CustomizeStructureModal: React.FC<CustomizeStructureModalProps> = ({
  isOpen,
  onClose,
  schoolYears,
  semesters,
  terms,
  onSaveYears,
  onSaveSemesters,
  onSaveTerms,
}) => {
  const [activeTab, setActiveTab] = useState<'years' | 'semesters' | 'terms'>('years');

  // School Years local state
  const [localYears, setLocalYears] = useState<SchoolYear[]>(schoolYears);
  const [editingYearId, setEditingYearId] = useState<string | null>(null);
  const [editYearName, setEditYearName] = useState('');
  const [newYearName, setNewYearName] = useState('');
  const [draggedYearIndex, setDraggedYearIndex] = useState<number | null>(null);
  const [dragOverYearIndex, setDragOverYearIndex] = useState<number | null>(null);

  // Semesters local state (2 per year)
  const [localSemesters, setLocalSemesters] = useState<Semester[]>(semesters);
  const [editingSemId, setEditingSemId] = useState<string | null>(null);
  const [editSemTitle, setEditSemTitle] = useState('');
  const [newSemTitle, setNewSemTitle] = useState('');

  // Terms local state (4 per semester: Prelims, Midterms, Prefinals, Finals)
  const [localTerms, setLocalTerms] = useState<AcademicTerm[]>(terms);
  const [editingTermId, setEditingTermId] = useState<string | null>(null);
  const [editTermName, setEditTermName] = useState('');
  const [editTermCode, setEditTermCode] = useState('');
  const [newTermName, setNewTermName] = useState('');
  const [newTermCode, setNewTermCode] = useState('');

  if (!isOpen) return null;

  const handleSaveAll = () => {
    onSaveYears(localYears);
    onSaveSemesters(localSemesters);
    onSaveTerms(localTerms);
    onClose();
  };

  // Rearrange / Move Helpers for School Years
  const handleMoveYear = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= localYears.length) return;
    const updated = [...localYears];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setLocalYears(updated);
  };

  // Rearrange / Move Helpers for Terms
  const handleMoveTerm = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= localTerms.length) return;
    const updated = [...localTerms];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setLocalTerms(updated);
  };

  // Rearrange / Move Helpers for Semesters
  const handleMoveSem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= localSemesters.length) return;
    const updated = [...localSemesters];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setLocalSemesters(updated);
  };

  // School Years handlers
  const handleSaveEditYear = (id: string) => {
    if (!editYearName.trim()) return;
    setLocalYears((prev) =>
      prev.map((y) => (y.id === id ? { ...y, name: editYearName.trim() } : y))
    );
    setEditingYearId(null);
  };

  const handleAddYear = () => {
    if (!newYearName.trim()) return;
    const id = `year-${Date.now().toString(36)}`;
    setLocalYears([...localYears, { id, name: newYearName.trim() }]);
    setNewYearName('');
  };

  const handleDeleteYear = (id: string) => {
    if (localYears.length <= 1) {
      alert('You must have at least one School Year.');
      return;
    }
    setLocalYears((prev) => prev.filter((y) => y.id !== id));
  };

  // Semesters handlers
  const handleSaveEditSem = (id: string) => {
    if (!editSemTitle.trim()) return;
    setLocalSemesters((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: editSemTitle.trim() } : s))
    );
    setEditingSemId(null);
  };

  const handleAddSem = () => {
    if (!newSemTitle.trim()) return;
    const id = `sem-${Date.now().toString(36)}`;
    setLocalSemesters([
      ...localSemesters,
      { id, number: localSemesters.length + 1, title: newSemTitle.trim() },
    ]);
    setNewSemTitle('');
  };

  const handleDeleteSem = (id: string) => {
    if (localSemesters.length <= 1) {
      alert('You must have at least one semester.');
      return;
    }
    setLocalSemesters((prev) => prev.filter((s) => s.id !== id));
  };

  // Terms handlers
  const handleSaveEditTerm = (id: string) => {
    if (!editTermName.trim()) return;
    setLocalTerms((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              name: editTermName.trim(),
              code: (editTermCode.trim() || editTermName.trim().substring(0, 3)).toUpperCase(),
            }
          : t
      )
    );
    setEditingTermId(null);
  };

  const handleAddTerm = () => {
    if (!newTermName.trim()) return;
    const id = `term-${Date.now().toString(36)}`;
    const code = (newTermCode.trim() || newTermName.trim().substring(0, 3)).toUpperCase();
    const colors = ['violet', 'indigo', 'amber', 'emerald', 'cyan', 'rose'];
    const color = colors[localTerms.length % colors.length];

    setLocalTerms([...localTerms, { id, name: newTermName.trim(), code, color }]);
    setNewTermName('');
    setNewTermCode('');
  };

  const handleDeleteTerm = (id: string) => {
    if (localTerms.length <= 1) {
      alert('You must keep at least one term.');
      return;
    }
    setLocalTerms((prev) => prev.filter((t) => t.id !== id));
  };

  const handleResetToStandard = () => {
    setLocalYears(DEFAULT_SCHOOL_YEARS);
    setLocalSemesters(DEFAULT_SEMESTERS);
    setLocalTerms(DEFAULT_TERMS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Rearrange & Customize Academic Structure
              </h3>
              <p className="text-xs text-slate-500">
                Rearrange academic years, 2 semesters per year, and 4 terms per semester.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('years')}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'years'
                ? 'bg-white text-indigo-600 font-bold shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Academic Years</span>
          </button>
          <button
            onClick={() => setActiveTab('semesters')}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'semesters'
                ? 'bg-white text-indigo-600 font-bold shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2 Semesters</span>
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-white text-indigo-600 font-bold shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>4 Terms</span>
          </button>
        </div>

        {/* TAB 1: ACADEMIC YEARS (Rearrange, slide, reorder, add) */}
        {activeTab === 'years' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">
                Academic Years ({localYears.length})
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setLocalYears([...localYears].reverse())}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                  title="Swap order of academic years"
                >
                  <ArrowUpDown className="w-3 h-3" />
                  <span>Swap Order (⇅)</span>
                </button>
                <button
                  onClick={() => setLocalYears(DEFAULT_SCHOOL_YEARS)}
                  className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {localYears.map((year, index) => {
                const isDragging = draggedYearIndex === index;
                const isDragOver = dragOverYearIndex === index;

                return (
                  <div
                    key={year.id}
                    draggable={editingYearId !== year.id}
                    onDragStart={() => setDraggedYearIndex(index)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragOverYearIndex !== index) {
                        setDragOverYearIndex(index);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedYearIndex === null || draggedYearIndex === index) {
                        setDraggedYearIndex(null);
                        setDragOverYearIndex(null);
                        return;
                      }
                      const updated = [...localYears];
                      const [moved] = updated.splice(draggedYearIndex, 1);
                      updated.splice(index, 0, moved);
                      setLocalYears(updated);
                      setDraggedYearIndex(null);
                      setDragOverYearIndex(null);
                    }}
                    onDragEnd={() => {
                      setDraggedYearIndex(null);
                      setDragOverYearIndex(null);
                    }}
                    className={`p-3 bg-slate-50 border rounded-xl flex items-center justify-between gap-3 transition-all ${
                      isDragging
                        ? 'opacity-40 border-dashed border-indigo-400 bg-indigo-50/50'
                        : isDragOver
                        ? 'border-2 border-indigo-500 bg-indigo-50'
                        : 'border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    {editingYearId === year.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editYearName}
                          onChange={(e) => setEditYearName(e.target.value)}
                          className="px-2 py-1 text-xs rounded-lg border border-indigo-300 bg-white flex-1"
                          placeholder="Year Name (e.g. 3rd Year)"
                        />
                        <button
                          onClick={() => handleSaveEditYear(year.id)}
                          className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5">
                          {/* Grip handle to slide/reorder on their own */}
                          <div
                            className="p-1 text-slate-400 hover:text-indigo-600 cursor-grab active:cursor-grabbing"
                            title="Drag to rearrange on your own"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center font-mono">
                            {index + 1}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              {year.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              2 Semesters (1st & 2nd Sem)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingYearId(year.id);
                              setEditYearName(year.name);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                            title="Rename year"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteYear(year.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Delete year"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add School Year */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                value={newYearName}
                onChange={(e) => setNewYearName(e.target.value)}
                placeholder="New Academic Year (e.g. 4th Year, 1st Year)"
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300"
              />
              <button
                onClick={handleAddYear}
                disabled={!newYearName.trim()}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Year</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: 2 SEMESTERS PER YEAR */}
        {activeTab === 'semesters' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">
                2 Semesters per Year ({localSemesters.length})
              </span>
              <button
                onClick={() => setLocalSemesters(DEFAULT_SEMESTERS)}
                className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset (1st & 2nd Sem)</span>
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {localSemesters.map((sem, index) => (
                <div
                  key={sem.id}
                  className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3"
                >
                  {editingSemId === sem.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editSemTitle}
                        onChange={(e) => setEditSemTitle(e.target.value)}
                        className="px-2 py-1 text-xs rounded-lg border border-indigo-300 bg-white flex-1"
                        placeholder="Semester Title (e.g. 1st Semester)"
                      />
                      <button
                        onClick={() => handleSaveEditSem(sem.id)}
                        className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center font-mono">
                          {index + 1}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            {sem.title}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Includes 4 Terms (Prelims, Midterms, Prefinals, Finals)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingSemId(sem.id);
                            setEditSemTitle(sem.title);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                          title="Rename semester"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSem(sem.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          title="Delete semester"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Add Semester */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                value={newSemTitle}
                onChange={(e) => setNewSemTitle(e.target.value)}
                placeholder="Add Session (e.g. Summer Term)"
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300"
              />
              <button
                onClick={handleAddSem}
                disabled={!newSemTitle.trim()}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: 4 TERMS (Prelims, Midterms, Prefinals, Finals) */}
        {activeTab === 'terms' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">
                4 Exam Terms ({localTerms.length})
              </span>
              <button
                onClick={() => setLocalTerms(DEFAULT_TERMS)}
                className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Standard 4 Terms</span>
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {localTerms.map((term, index) => (
                <div
                  key={term.id}
                  className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3"
                >
                  {editingTermId === term.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editTermName}
                        onChange={(e) => setEditTermName(e.target.value)}
                        className="px-2 py-1 text-xs rounded-lg border border-indigo-300 bg-white flex-1"
                        placeholder="Term Name"
                      />
                      <input
                        type="text"
                        value={editTermCode}
                        onChange={(e) => setEditTermCode(e.target.value)}
                        className="px-2 py-1 text-xs rounded-lg border border-indigo-300 bg-white w-20 uppercase font-mono"
                        placeholder="Code"
                      />
                      <button
                        onClick={() => handleSaveEditTerm(term.id)}
                        className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center font-mono">
                          {index + 1}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            {term.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 uppercase">
                            Badge: {term.code}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingTermId(term.id);
                            setEditTermName(term.name);
                            setEditTermCode(term.code);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                          title="Edit term name"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTerm(term.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          title="Delete term"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Add Custom Term */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                value={newTermName}
                onChange={(e) => setNewTermName(e.target.value)}
                placeholder="Add Extra Term (e.g. Diagnostic / Removal Exam)"
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300"
              />
              <input
                type="text"
                value={newTermCode}
                onChange={(e) => setNewTermCode(e.target.value)}
                placeholder="Code"
                className="w-20 px-2 py-1.5 text-xs rounded-xl border border-slate-300 uppercase font-mono"
              />
              <button
                onClick={handleAddTerm}
                disabled={!newTermName.trim()}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={handleResetToStandard}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Save Structure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
