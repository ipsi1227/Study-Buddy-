import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  Check,
  Plus,
  Trash2,
  Award,
  ArrowRight,
  Code2,
} from 'lucide-react';
import { StudentProfile, Subject } from '../types';

interface IndianCseLoginModalProps {
  isOpen: boolean;
  onComplete: (profile: StudentProfile, subjects: Subject[]) => void;
  currentProfile: StudentProfile;
  currentSubjects: Subject[];
}

const INDIAN_COLLEGES = [
  'IIT Delhi',
  'IIT Bombay',
  'IIT Madras',
  'BITS Pilani',
  'NIT Trichy',
  'NIT Surathkal',
  'IIIT Hyderabad',
  'VIT Vellore',
  'DTU Delhi',
  'SRM Institute of Science & Tech',
  'Manipal Institute of Technology',
  'Anna University',
  'Jadavpur University',
];

const PRESET_CSE_SUBJECTS = [
  { code: 'CS 301', name: 'Data Structures & Algorithms', credits: 4, color: 'emerald', accentColor: '#10b981' },
  { code: 'CS 302', name: 'Operating Systems & Concurrency', credits: 4, color: 'indigo', accentColor: '#6366f1' },
  { code: 'CS 303', name: 'Database Management Systems (DBMS)', credits: 3, color: 'amber', accentColor: '#f59e0b' },
  { code: 'CS 304', name: 'Computer Networks & Protocols', credits: 4, color: 'cyan', accentColor: '#06b6d4' },
  { code: 'CS 305', name: 'Discrete Mathematical Structures', credits: 3, color: 'violet', accentColor: '#8b5cf6' },
  { code: 'CS 306', name: 'Theory of Computation & Automata', credits: 4, color: 'rose', accentColor: '#f43f5e' },
  { code: 'CS 307', name: 'Compiler Design', credits: 4, color: 'emerald', accentColor: '#10b981' },
  { code: 'CS 308', name: 'Artificial Intelligence & Machine Learning', credits: 4, color: 'indigo', accentColor: '#6366f1' },
];

export const IndianCseLoginModal: React.FC<IndianCseLoginModalProps> = ({
  isOpen,
  onComplete,
  currentProfile,
  currentSubjects,
}) => {
  if (!isOpen) return null;

  // Form states
  const [name, setName] = useState(currentProfile.name || 'Aarav Sharma');
  const [email, setEmail] = useState(currentProfile.email || 'aarav.cse@iitd.ac.in');
  const [university, setUniversity] = useState(currentProfile.university || 'IIT Delhi');
  const [semester, setSemester] = useState(currentProfile.semester || 'Semester 5 (3rd Year)');
  const [targetCGPA, setTargetCGPA] = useState<number>(currentProfile.targetCGPA || 9.5);
  const [currentCGPA, setCurrentCGPA] = useState<number>(currentProfile.currentCGPA || 9.14);
  const [numSubjects, setNumSubjects] = useState<number>(currentSubjects.length || 5);

  // Subject list state
  const [subjectsList, setSubjectsList] = useState<
    { id: string; code: string; name: string; credits: number; color: string; accentColor: string }[]
  >(
    currentSubjects.length > 0
      ? currentSubjects.map((s) => ({
          id: s.id,
          code: s.code,
          name: s.name,
          credits: s.credits,
          color: s.color,
          accentColor: s.accentColor,
        }))
      : PRESET_CSE_SUBJECTS.slice(0, 5).map((s, idx) => ({
          id: `sub-${idx + 1}`,
          ...s,
        }))
  );

  // When number of subjects changes, adapt the list length
  const handleNumSubjectsChange = (n: number) => {
    const val = Math.max(1, Math.min(10, n));
    setNumSubjects(val);

    if (val > subjectsList.length) {
      const addedCount = val - subjectsList.length;
      const newItems = [];
      for (let i = 0; i < addedCount; i++) {
        const nextIdx = subjectsList.length + i;
        const preset = PRESET_CSE_SUBJECTS[nextIdx % PRESET_CSE_SUBJECTS.length];
        newItems.push({
          id: `sub-${Date.now()}-${i}`,
          code: preset.code,
          name: preset.name,
          credits: preset.credits,
          color: preset.color,
          accentColor: preset.accentColor,
        });
      }
      setSubjectsList([...subjectsList, ...newItems]);
    } else if (val < subjectsList.length) {
      setSubjectsList(subjectsList.slice(0, val));
    }
  };

  const handleSubjectChange = (index: number, field: 'name' | 'code' | 'credits', value: string | number) => {
    const updated = [...subjectsList];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setSubjectsList(updated);
  };

  const handleApplyIndianCsePreset = () => {
    setNumSubjects(5);
    setSubjectsList(
      PRESET_CSE_SUBJECTS.slice(0, 5).map((s, idx) => ({
        id: `sub-preset-${idx + 1}`,
        ...s,
      }))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !university.trim()) return;

    const formattedSubjects: Subject[] = subjectsList.map((s, idx) => ({
      id: s.id || `sub-${Date.now()}-${idx}`,
      code: s.code.trim() || `CS ${301 + idx}`,
      name: s.name.trim() || `Subject ${idx + 1}`,
      credits: Number(s.credits) || 4,
      color: s.color || 'emerald',
      accentColor: s.accentColor || '#10b981',
      instructor: 'Department Faculty',
      targetGrade: '10 (O Grade)',
    }));

    const updatedProfile: StudentProfile = {
      ...currentProfile,
      name: name.trim(),
      email: email.trim(),
      university: university.trim(),
      major: 'Computer Science & Engineering',
      semester,
      targetCGPA: Number(targetCGPA) || 9.5,
      currentCGPA: Number(currentCGPA) || 9.0,
      onboardingCompleted: true,
      leetcodeStreak: 45,
      gateAspirant: true,
    };

    onComplete(updatedProfile, formattedSubjects);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#10141e] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Banner Header */}
        <div className="p-6 sm:p-7 border-b border-neutral-100 dark:border-neutral-800 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono-code border border-amber-500/30">
              Indian CSE Self-Study Suite
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono-code">
              10.0 CGPA System
            </span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
            Welcome to Your CSE Self-Study Planner
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Configure your college details, 10-point CGPA target, and enter your active subjects to generate personalized quizzes and exam countdowns.
          </p>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {/* Student Info & College Section */}
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-amber-500" />
              <span>1. Student Profile & College Info</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  University / College Name *
                </label>
                <input
                  type="text"
                  required
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. IIT Delhi, BITS Pilani, NIT..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 outline-none"
                />
              </div>
            </div>

            {/* Quick College Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-neutral-400">Quick pick:</span>
              {INDIAN_COLLEGES.slice(0, 6).map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setUniversity(col)}
                  className={`text-[11px] px-2 py-0.5 rounded-lg border transition ${
                    university === col
                      ? 'bg-neutral-900 text-white dark:bg-amber-500 dark:text-neutral-950 font-bold border-transparent'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>

            {/* Semester & 10 CGPA Target Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Current Semester *
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none"
                >
                  <option value="Semester 1 (1st Year)">Semester 1 (1st Year)</option>
                  <option value="Semester 2 (1st Year)">Semester 2 (1st Year)</option>
                  <option value="Semester 3 (2nd Year)">Semester 3 (2nd Year)</option>
                  <option value="Semester 4 (2nd Year)">Semester 4 (2nd Year)</option>
                  <option value="Semester 5 (3rd Year)">Semester 5 (3rd Year)</option>
                  <option value="Semester 6 (3rd Year)">Semester 6 (3rd Year)</option>
                  <option value="Semester 7 (Final Year)">Semester 7 (Final Year)</option>
                  <option value="Semester 8 (Final Year)">Semester 8 (Final Year)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Target CGPA (out of 10.0) *
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="5.0"
                  max="10.0"
                  value={targetCGPA}
                  onChange={(e) => setTargetCGPA(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white font-mono-code font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Current CGPA (out of 10.0)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="4.0"
                  max="10.0"
                  value={currentCGPA}
                  onChange={(e) => setCurrentCGPA(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white font-mono-code outline-none"
                />
              </div>
            </div>
          </div>

          {/* Subjects Entry Section */}
          <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-500" />
                <span>2. Enter Enrolled Subjects</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplyIndianCsePreset}
                  className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Autofill Core CSE Curriculum</span>
                </button>
              </div>
            </div>

            {/* Number of subjects selector */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Number of Subjects this Semester:
              </span>
              <div className="flex items-center gap-1.5">
                {[3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleNumSubjectsChange(num)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold font-mono-code transition ${
                      numSubjects === num
                        ? 'bg-neutral-900 text-white dark:bg-amber-500 dark:text-neutral-950 shadow-xs'
                        : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Inputs Stack */}
            <div className="space-y-3">
              {subjectsList.map((sub, idx) => (
                <div
                  key={sub.id || idx}
                  className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex items-center gap-2 w-full sm:w-28 shrink-0">
                    <span
                      className="w-2.5 h-8 rounded-full shrink-0"
                      style={{ backgroundColor: sub.accentColor || '#10b981' }}
                    />
                    <input
                      type="text"
                      required
                      value={sub.code}
                      onChange={(e) => handleSubjectChange(idx, 'code', e.target.value)}
                      placeholder="Code (e.g. CS 301)"
                      className="w-full px-2.5 py-1.5 text-xs font-mono-code font-bold rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white"
                    />
                  </div>

                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      value={sub.name}
                      onChange={(e) => handleSubjectChange(idx, 'name', e.target.value)}
                      placeholder="Course Name (e.g. Data Structures & Algorithms)"
                      className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white"
                    />
                  </div>

                  <div className="w-24 shrink-0 flex items-center gap-1 text-xs">
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={sub.credits}
                      onChange={(e) => handleSubjectChange(idx, 'credits', Number(e.target.value))}
                      className="w-12 px-2 py-1 text-xs text-center font-mono-code font-bold rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white"
                    />
                    <span className="text-[11px] text-neutral-400">credits</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 font-display font-bold text-sm hover:bg-neutral-800 dark:hover:bg-amber-400 shadow-lg transition flex items-center justify-center gap-2"
            >
              <span>Launch My CSE Self-Study Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-center text-neutral-400 mt-2">
              You can modify your subjects and CGPA targets anytime from the top bar.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
