import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { StudentProfile, Subject } from '../types';

interface OnboardingWizardProps {
  isOpen: boolean;
  onComplete: (profile: StudentProfile, subjects: Subject[]) => void;
  initialProfile: StudentProfile;
  initialSubjects: Subject[];
}

const COLOR_OPTIONS = [
  { label: 'Emerald', value: 'emerald', hex: '#10b981' },
  { label: 'Indigo', value: 'indigo', hex: '#6366f1' },
  { label: 'Amber', value: 'amber', hex: '#f59e0b' },
  { label: 'Rose', value: 'rose', hex: '#f43f5e' },
  { label: 'Cyan', value: 'cyan', hex: '#06b6d4' },
  { label: 'Violet', value: 'violet', hex: '#8b5cf6' },
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onComplete,
  initialProfile,
  initialSubjects,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [profile, setProfile] = useState<StudentProfile>(initialProfile);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);

  // New subject input form state
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newInstructor, setNewInstructor] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [newCredits, setNewCredits] = useState(3);
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0]);

  if (!isOpen) return null;

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    const newSub: Subject = {
      id: `sub-${Date.now()}`,
      code: newCode.trim(),
      name: newName.trim(),
      instructor: newInstructor.trim() || 'Staff Faculty',
      room: newRoom.trim() || 'Lecture Hall',
      credits: Number(newCredits) || 3,
      color: newColor.value,
      accentColor: newColor.hex,
      targetGrade: 'A',
    };

    setSubjects([...subjects, newSub]);
    setNewCode('');
    setNewName('');
    setNewInstructor('');
    setNewRoom('');
    // Cycle to next color
    const nextIdx = (COLOR_OPTIONS.findIndex((c) => c.value === newColor.value) + 1) % COLOR_OPTIONS.length;
    setNewColor(COLOR_OPTIONS[nextIdx]);
  };

  const handleRemoveSubject = (id: string) => {
    if (subjects.length <= 1) {
      alert('Please keep at least one subject in your curriculum.');
      return;
    }
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  const loadPresetCurriculum = (preset: 'cs' | 'premed' | 'econ' | 'eng') => {
    if (preset === 'cs') {
      setProfile((prev) => ({
        ...prev,
        major: 'Computer Science & Software Systems',
        semester: 'Semester 4 (Sophomore Spring)',
      }));
      setSubjects([
        {
          id: 'sub-cs1',
          code: 'CS 204',
          name: 'Algorithms & Data Structures',
          color: 'emerald',
          accentColor: '#10b981',
          instructor: 'Prof. David Thorne',
          room: 'Turing Hall 302',
          credits: 4,
          targetGrade: 'A',
        },
        {
          id: 'sub-cs2',
          code: 'MATH 310',
          name: 'Linear Algebra & Vector Spaces',
          color: 'indigo',
          accentColor: '#6366f1',
          instructor: 'Dr. Clara Beauchamp',
          room: 'Newton Math Wing 105',
          credits: 3,
          targetGrade: 'A',
        },
        {
          id: 'sub-cs3',
          code: 'CS 218',
          name: 'Computer Systems Architecture',
          color: 'amber',
          accentColor: '#f59e0b',
          instructor: 'Prof. Marcus Vance',
          room: 'Edison Lab 4',
          credits: 4,
          targetGrade: 'A-',
        },
      ]);
    } else if (preset === 'premed') {
      setProfile((prev) => ({
        ...prev,
        major: 'Pre-Medicine & Molecular Biology',
        semester: 'Semester 3 (Sophomore Fall)',
      }));
      setSubjects([
        {
          id: 'sub-med1',
          code: 'CHEM 241',
          name: 'Organic Chemistry I & Mechanisms',
          color: 'rose',
          accentColor: '#f43f5e',
          instructor: 'Prof. Alistair Finch',
          room: 'Curie Laboratory 201',
          credits: 4,
          targetGrade: 'A',
        },
        {
          id: 'sub-med2',
          code: 'BIO 210',
          name: 'Cellular & Molecular Genetics',
          color: 'emerald',
          accentColor: '#10b981',
          instructor: 'Dr. Sarah Lin',
          room: 'Franklin Bioscience 102',
          credits: 4,
          targetGrade: 'A',
        },
        {
          id: 'sub-med3',
          code: 'PHYS 150',
          name: 'Physics for Life Sciences',
          color: 'indigo',
          accentColor: '#6366f1',
          instructor: 'Dr. Robert Oppen',
          room: 'Galileo Hall B',
          credits: 3,
          targetGrade: 'A-',
        },
      ]);
    } else if (preset === 'econ') {
      setProfile((prev) => ({
        ...prev,
        major: 'Economics & Quantitative Finance',
        semester: 'Semester 6 (Junior Spring)',
      }));
      setSubjects([
        {
          id: 'sub-ec1',
          code: 'ECON 320',
          name: 'Econometrics & Regression Analysis',
          color: 'indigo',
          accentColor: '#6366f1',
          instructor: 'Prof. Thomas Keynes',
          room: 'Smith Hall 401',
          credits: 4,
          targetGrade: 'A',
        },
        {
          id: 'sub-ec2',
          code: 'FIN 410',
          name: 'Corporate Valuation & M&A',
          color: 'amber',
          accentColor: '#f59e0b',
          instructor: 'Dr. Miriam Roth',
          room: 'Wall Street Suite 12',
          credits: 3,
          targetGrade: 'A',
        },
        {
          id: 'sub-ec3',
          code: 'MATH 280',
          name: 'Probability & Stochastic Processes',
          color: 'cyan',
          accentColor: '#06b6d4',
          instructor: 'Prof. Alan Bayes',
          room: 'Gauss Auditorium',
          credits: 3,
          targetGrade: 'A-',
        },
      ]);
    } else {
      setProfile((prev) => ({
        ...prev,
        major: 'Mechanical & Aerospace Engineering',
        semester: 'Semester 5 (Junior Fall)',
      }));
      setSubjects([
        {
          id: 'sub-eng1',
          code: 'ME 302',
          name: 'Thermodynamics & Heat Transfer',
          color: 'amber',
          accentColor: '#f59e0b',
          instructor: 'Dr. James Carnot',
          room: 'Watt Pavilion 204',
          credits: 4,
          targetGrade: 'A',
        },
        {
          id: 'sub-eng2',
          code: 'ME 340',
          name: 'Fluid Dynamics & Aerodynamics',
          color: 'cyan',
          accentColor: '#06b6d4',
          instructor: 'Prof. Elena Bernoulli',
          room: 'Wind Tunnel Facility',
          credits: 4,
          targetGrade: 'A',
        },
        {
          id: 'sub-eng3',
          code: 'ENGR 220',
          name: 'Mechanics of Deformable Solids',
          color: 'violet',
          accentColor: '#8b5cf6',
          instructor: 'Dr. Carl Hooke',
          room: 'Euler Hall 108',
          credits: 3,
          targetGrade: 'A-',
        },
      ]);
    }
  };

  const handleFinish = () => {
    onComplete({ ...profile, onboardingCompleted: true }, subjects);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121620] shadow-2xl overflow-hidden">
        {/* Step Indicator Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="font-display font-bold text-neutral-900 dark:text-white">
                Academic Onboarding
              </span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              Step {step} of 3
            </span>
          </div>

          <div className="mt-3 flex gap-2">
            <div
              className={`h-1.5 flex-1 rounded-full transition-all ${
                step >= 1 ? 'bg-amber-600 dark:bg-amber-400' : 'bg-neutral-200 dark:bg-neutral-700'
              }`}
            />
            <div
              className={`h-1.5 flex-1 rounded-full transition-all ${
                step >= 2 ? 'bg-amber-600 dark:bg-amber-400' : 'bg-neutral-200 dark:bg-neutral-700'
              }`}
            />
            <div
              className={`h-1.5 flex-1 rounded-full transition-all ${
                step >= 3 ? 'bg-amber-600 dark:bg-amber-400' : 'bg-neutral-200 dark:bg-neutral-700'
              }`}
            />
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: MAJOR & SEMESTER */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h3 className="font-display text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  Tell us about your collegiate trajectory
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  We use your major and current semester to personalize your study recommendations,
                  optimal study-break intervals, and exam preparation pacing.
                </p>
              </div>

              {/* Quick Template Presets */}
              <div className="rounded-xl p-3 border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Quick Curriculum Presets (One-click fill):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => loadPresetCurriculum('cs')}
                    className="p-2 text-left rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-amber-500 text-xs transition"
                  >
                    <div className="font-bold text-neutral-800 dark:text-neutral-200">CS & Math</div>
                    <div className="text-[10px] text-neutral-500">Sem 4 (Sophomore)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPresetCurriculum('premed')}
                    className="p-2 text-left rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-amber-500 text-xs transition"
                  >
                    <div className="font-bold text-neutral-800 dark:text-neutral-200">Pre-Med Bio</div>
                    <div className="text-[10px] text-neutral-500">Sem 3 (Organic Chem)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPresetCurriculum('econ')}
                    className="p-2 text-left rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-amber-500 text-xs transition"
                  >
                    <div className="font-bold text-neutral-800 dark:text-neutral-200">Economics</div>
                    <div className="text-[10px] text-neutral-500">Sem 6 (Econometrics)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPresetCurriculum('eng')}
                    className="p-2 text-left rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-amber-500 text-xs transition"
                  >
                    <div className="font-bold text-neutral-800 dark:text-neutral-200">Mech Eng</div>
                    <div className="text-[10px] text-neutral-500">Sem 5 (Fluids & Thermo)</div>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                      Academic Major / Field of Study *
                    </label>
                    <input
                      type="text"
                      required
                      value={profile.major}
                      onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                      placeholder="e.g. Computer Science & Mathematics"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                      Current Semester / Standing *
                    </label>
                    <select
                      value={profile.semester}
                      onChange={(e) => setProfile({ ...profile, semester: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                      <option value="Semester 1 (Freshman Fall)">Semester 1 (Freshman Fall)</option>
                      <option value="Semester 2 (Freshman Spring)">Semester 2 (Freshman Spring)</option>
                      <option value="Semester 3 (Sophomore Fall)">Semester 3 (Sophomore Fall)</option>
                      <option value="Semester 4 (Sophomore Spring)">Semester 4 (Sophomore Spring)</option>
                      <option value="Semester 5 (Junior Fall)">Semester 5 (Junior Fall)</option>
                      <option value="Semester 6 (Junior Spring)">Semester 6 (Junior Spring)</option>
                      <option value="Semester 7 (Senior Fall)">Semester 7 (Senior Fall)</option>
                      <option value="Semester 8 (Senior Spring)">Semester 8 (Senior Spring)</option>
                      <option value="Graduate / Master’s">Graduate / Master’s</option>
                      <option value="Doctoral / PhD Candidate">Doctoral / PhD Candidate</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                      University or College Name
                    </label>
                    <input
                      type="text"
                      value={profile.university}
                      onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                      placeholder="e.g. Oxford Collegiate University"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                      Target Semester GPA
                    </label>
                    <input
                      type="text"
                      value={profile.targetGPA}
                      onChange={(e) => setProfile({ ...profile, targetGPA: e.target.value })}
                      placeholder="e.g. 3.90"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ENTER SUBJECTS */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h3 className="font-display text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  Enrolled Subjects & Courses
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Enter your current semester courses. Each subject will track assignments, lecture timetables,
                  exams, and dedicated focus study logs.
                </p>
              </div>

              {/* Add Subject Card Form */}
              <form
                onSubmit={handleAddSubject}
                className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 space-y-3"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-amber-500" />
                  Add Course / Subject
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                      Course Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      placeholder="e.g. CS 204"
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
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Algorithms & Data Structures"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                      Instructor / Professor
                    </label>
                    <input
                      type="text"
                      value={newInstructor}
                      onChange={(e) => setNewInstructor(e.target.value)}
                      placeholder="Prof. David Thorne"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                      Lecture Room / Hall
                    </label>
                    <input
                      type="text"
                      value={newRoom}
                      onChange={(e) => setNewRoom(e.target.value)}
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
                      value={newCredits}
                      onChange={(e) => setNewCredits(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Color Selector */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-neutral-500">Color Tag:</span>
                    <div className="flex gap-1.5">
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setNewColor(c)}
                          style={{ backgroundColor: c.hex }}
                          className={`w-5 h-5 rounded-full transition-transform ${
                            newColor.value === c.value
                              ? 'scale-125 ring-2 ring-offset-2 ring-neutral-400'
                              : 'opacity-70 hover:opacity-100'
                          }`}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-amber-400 transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Curriculum</span>
                  </button>
                </div>
              </form>

              {/* Current Subjects List */}
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Enrolled Courses ({subjects.length})
                </div>

                {subjects.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-4 text-center italic">
                    No subjects added yet. Use the form above to add your courses.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {subjects.map((s) => (
                      <div
                        key={s.id}
                        className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850 flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-3 h-10 rounded-full shrink-0"
                            style={{ backgroundColor: s.accentColor }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                                {s.code}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono-code">
                                {s.credits} cr
                              </span>
                            </div>
                            <div className="text-xs text-neutral-600 dark:text-neutral-300 truncate">
                              {s.name}
                            </div>
                            <div className="text-[10px] text-neutral-400 truncate">
                              {s.instructor} • {s.room || 'TBA'}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(s.id)}
                          className="p-1.5 rounded text-neutral-400 hover:text-rose-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                          title="Remove subject"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW PERSONALIZED RECOMMENDATIONS */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Tailored Academic Strategy Ready
                </div>
                <h3 className="font-display text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  Personalized Study Roadmap for {profile.name}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Calibrated for <strong>{profile.major}</strong> in{' '}
                  <strong>{profile.semester}</strong> with {subjects.length} enrolled courses.
                </p>
              </div>

              {/* Personalized Strategy Cards */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                      Optimal Weekly Study Budget
                    </span>
                    <span className="text-xs font-mono-code font-semibold text-neutral-700 dark:text-neutral-300">
                      ~
                      {subjects.reduce((sum, s) => sum + s.credits, 0) * 2} hrs/week
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300">
                    Following the collegiate 2:1 credit standard, allocate approximately 2 hours of self-directed deep focus per enrolled credit hour outside of lectures.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850">
                  <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Major Focus Methodology
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    Given your focus in <strong>{profile.major}</strong>, your primary leverage comes from
                    structured synthesis and active problem-solving rather than passive slide rereading. We have configured your Pomodoro timer with 50-minute deep blocks and automated recurring reminders.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850">
                  <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 mb-1">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    Semester Phase Recommendation ({profile.semester})
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    Protect your target GPA of <strong>{profile.targetGPA || '4.0'}</strong> by synchronizing lecture notes into your study sessions within 24 hours of each class slot.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/50 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !profile.major.trim()) {
                  alert('Please enter your academic major.');
                  return;
                }
                if (step === 2 && subjects.length === 0) {
                  alert('Please enter at least one enrolled subject.');
                  return;
                }
                setStep((s) => (s + 1) as 2 | 3);
              }}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-amber-400 transition flex items-center gap-1.5 shadow-xs"
            >
              <span>{step === 1 ? 'Configure Subjects' : 'Generate Recommendations'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-500 hover:to-amber-400 shadow-md transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Enter Academia Workspace</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
