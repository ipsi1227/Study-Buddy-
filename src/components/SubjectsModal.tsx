import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, BookOpen, Check } from 'lucide-react';
import { Subject } from '../types';

interface SubjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onAddSubject: (subject: Subject) => void;
  onUpdateSubject: (subject: Subject) => void;
  onDeleteSubject: (id: string) => void;
}

const COLOR_PALETTES = [
  { label: 'Emerald', value: 'emerald', hex: '#10b981' },
  { label: 'Indigo', value: 'indigo', hex: '#6366f1' },
  { label: 'Amber', value: 'amber', hex: '#f59e0b' },
  { label: 'Rose', value: 'rose', hex: '#f43f5e' },
  { label: 'Cyan', value: 'cyan', hex: '#06b6d4' },
  { label: 'Violet', value: 'violet', hex: '#8b5cf6' },
];

export const SubjectsModal: React.FC<SubjectsModalProps> = ({
  isOpen,
  onClose,
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [instructor, setInstructor] = useState('');
  const [room, setRoom] = useState('');
  const [credits, setCredits] = useState(3);
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTES[0]);

  if (!isOpen) return null;

  const startEdit = (s: Subject) => {
    setEditingId(s.id);
    setCode(s.code);
    setName(s.name);
    setInstructor(s.instructor);
    setRoom(s.room || '');
    setCredits(s.credits);
    const matched = COLOR_PALETTES.find((c) => c.value === s.color) || COLOR_PALETTES[0];
    setSelectedColor(matched);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setCode('');
    setName('');
    setInstructor('');
    setRoom('');
    setCredits(3);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    if (editingId) {
      const existing = subjects.find((s) => s.id === editingId);
      if (existing) {
        onUpdateSubject({
          ...existing,
          code: code.trim(),
          name: name.trim(),
          instructor: instructor.trim() || 'Faculty Staff',
          room: room.trim() || 'TBA',
          credits: Number(credits) || 3,
          color: selectedColor.value,
          accentColor: selectedColor.hex,
        });
      }
    } else {
      const newSubject: Subject = {
        id: `sub-${Date.now()}`,
        code: code.trim(),
        name: name.trim(),
        instructor: instructor.trim() || 'Faculty Staff',
        room: room.trim() || 'TBA',
        credits: Number(credits) || 3,
        color: selectedColor.value,
        accentColor: selectedColor.hex,
        targetGrade: 'A',
      };
      onAddSubject(newSubject);
    }
    cancelEdit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121620] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <h2 className="font-display text-lg font-bold text-neutral-900 dark:text-white">
              Manage Enrolled Subjects
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* Add / Edit Form */}
          <form
            onSubmit={handleSave}
            className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 space-y-3"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              {editingId ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{editingId ? 'Edit Subject Details' : 'Add New Enrolled Subject'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                  Code *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="CS 204"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                  Course Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Algorithms & Data Structures"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                  Professor / Instructor
                </label>
                <input
                  type="text"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  placeholder="Prof. Thorne"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                  Lecture Room
                </label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Turing 302"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                  Credits
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={credits}
                  onChange={(e) => setCredits(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            {/* Color Selector */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-neutral-500">Color:</span>
                <div className="flex gap-1.5">
                  {COLOR_PALETTES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      style={{ backgroundColor: c.hex }}
                      className={`w-5 h-5 rounded-full transition-transform ${
                        selectedColor.value === c.value
                          ? 'scale-125 ring-2 ring-offset-2 ring-neutral-400'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-amber-400 transition flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingId ? 'Update Subject' : 'Save Subject'}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Subjects List */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Active Courses ({subjects.length})
            </div>

            <div className="space-y-2">
              {subjects.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-3 h-10 rounded-full shrink-0"
                      style={{ backgroundColor: s.accentColor }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white">
                          {s.code}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono-code">
                          {s.credits} credits
                        </span>
                      </div>
                      <div className="text-xs text-neutral-700 dark:text-neutral-300 truncate">
                        {s.name}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {s.instructor} • {s.room || 'TBA'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(s)}
                      className="p-1.5 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                      title="Edit subject"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteSubject(s.id)}
                      className="p-1.5 rounded text-neutral-400 hover:text-rose-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                      title="Delete subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
