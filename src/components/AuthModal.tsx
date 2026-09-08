import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  User,
  Building,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { StudentProfile } from '../types';
import { DEFAULT_PROFILE } from '../utils/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onSaveProfile: (updated: StudentProfile) => void;
  onStartOnboarding: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onStartOnboarding,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'profile'>('login');
  const [email, setEmail] = useState(profile.email || '');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(profile.name || '');
  const [university, setUniversity] = useState(profile.university || 'Harvard Collegiate Institute');
  const [major, setMajor] = useState(profile.major || 'Computer Science');
  const [semester, setSemester] = useState(profile.semester || 'Semester 4 (Sophomore Spring)');
  const [targetGPA, setTargetGPA] = useState(profile.targetGPA || '3.90');

  if (!isOpen) return null;

  const handleDemoSignIn = (demoType: 'cs' | 'premed' | 'business') => {
    let demo: StudentProfile;
    if (demoType === 'cs') {
      demo = { ...DEFAULT_PROFILE };
    } else if (demoType === 'premed') {
      demo = {
        id: 'student-premed',
        name: 'Julian Sterling',
        email: 'j.sterling@med.collegium.edu',
        university: 'Johns Hopkins Collegiate Division',
        major: 'Pre-Medicine & Molecular Biology',
        semester: 'Semester 3 (Sophomore Fall)',
        targetCGPA: 9.8,
        currentCGPA: 9.6,
        targetGPA: '3.96',
        avatarSeed: 'caduceus',
        onboardingCompleted: true,
      };
    } else {
      demo = {
        id: 'student-econ',
        name: 'Maya Chen',
        email: 'm.chen@stern.edu',
        university: 'London School of Economics',
        major: 'Economics & Quantitative Finance',
        semester: 'Semester 6 (Junior Spring)',
        targetCGPA: 9.5,
        currentCGPA: 9.2,
        targetGPA: '3.88',
        avatarSeed: 'finance',
        onboardingCompleted: true,
      };
    }
    onSaveProfile(demo);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StudentProfile = {
      ...profile,
      name: name || 'Student Scholar',
      email: email || 'student@university.edu',
      university: university || 'University',
      major: major || 'General Sciences',
      semester: semester || 'Semester 1',
      targetGPA: targetGPA || '4.0',
    };
    onSaveProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121620] shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {mode === 'login' && 'Sign In to Academia'}
                {mode === 'register' && 'Create Student Account'}
                {mode === 'profile' && 'Academic Profile Settings'}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Personalized study planner for college scholars
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mt-3 flex rounded-lg p-0.5 bg-neutral-200/60 dark:bg-neutral-800">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-1 text-xs font-semibold rounded-md transition ${
                mode === 'login'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-1 text-xs font-semibold rounded-md transition ${
                mode === 'register'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => setMode('profile')}
              className={`flex-1 py-1 text-xs font-semibold rounded-md transition ${
                mode === 'profile'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Quick Demo Accounts Banner */}
        <div className="px-6 py-3 bg-amber-500/5 dark:bg-amber-500/10 border-b border-amber-500/10">
          <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Quick Demo Student Profiles:
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleDemoSignIn('cs')}
              className="text-[11px] px-2.5 py-1 rounded-md bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:border-amber-500 transition"
            >
              💻 CS (Sem 4)
            </button>
            <button
              type="button"
              onClick={() => handleDemoSignIn('premed')}
              className="text-[11px] px-2.5 py-1 rounded-md bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:border-amber-500 transition"
            >
              🔬 Pre-Med (Sem 3)
            </button>
            <button
              type="button"
              onClick={() => handleDemoSignIn('business')}
              className="text-[11px] px-2.5 py-1 rounded-md bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:border-amber-500 transition"
            >
              📊 Finance (Sem 6)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode !== 'login' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              University Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          {mode === 'login' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>
          )}

          {(mode === 'register' || mode === 'profile') && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  University / College
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="e.g. Oxford Collegiate University"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Major / Program
                  </label>
                  <input
                    type="text"
                    required
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Current Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
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
                    <option value="Graduate / Postgrad">Graduate / Postgrad</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  Target GPA
                </label>
                <input
                  type="text"
                  value={targetGPA}
                  onChange={(e) => setTargetGPA(e.target.value)}
                  placeholder="e.g. 3.95"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </>
          )}

          {/* Submit Action */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-white bg-neutral-900 dark:bg-amber-500 dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-amber-400 shadow-md transition flex items-center justify-center gap-2"
            >
              <span>
                {mode === 'login' && 'Sign In to Workspace'}
                {mode === 'register' && 'Continue to Subject Setup'}
                {mode === 'profile' && 'Save Profile'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Launch Onboarding Wizard Button */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onStartOnboarding();
              }}
              className="w-full py-2 text-xs text-amber-700 dark:text-amber-400 hover:underline flex items-center justify-center gap-1.5 font-medium"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Subject Enrollment & Recommendations Wizard</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
