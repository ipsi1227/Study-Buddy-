import React from 'react';
import {
  Sun,
  Moon,
  Clock,
  BookOpen,
  Calendar,
  Award,
  ListTodo,
  Sparkles,
  Repeat,
  Settings2,
  User,
  CheckSquare,
  Music,
  Bell,
  Gamepad2,
  Square,
  Droplets,
} from 'lucide-react';
import { StudentProfile } from '../types';
import { BunnyBuddy } from './BunnyBuddy';

interface HeaderProps {
  profile: StudentProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onOpenAuth: () => void;
  onOpenSubjects: () => void;
  onOpenEmailModal?: () => void;
  onOpenWaterModal?: () => void;
  timerActive: boolean;
  timerFormattedTime: string;
  onStopTimerAndMusic?: () => void;
  urgentCount: number;
  uncompletedTodosCount: number;
  upcomingExams1WeekCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  onOpenAuth,
  onOpenSubjects,
  onOpenEmailModal,
  onOpenWaterModal,
  timerActive,
  timerFormattedTime,
  onStopTimerAndMusic,
  urgentCount,
  uncompletedTodosCount,
  upcomingExams1WeekCount,
}) => {
  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: BookOpen },
    {
      id: 'todos',
      label: 'To-Do List',
      icon: CheckSquare,
      badge: uncompletedTodosCount > 0 ? uncompletedTodosCount : undefined,
      badgeColor: 'emerald',
    },
    { id: 'notes', label: 'Make Notes', icon: Sparkles },
    { id: 'timer', label: 'Focus & Rain', icon: Clock },
    { id: 'break-game', label: 'Bunny Break 🎮', icon: Gamepad2 },
    {
      id: 'exams',
      label: 'Exams',
      icon: Award,
      badge: upcomingExams1WeekCount > 0 ? '1-Wk' : undefined,
      badgeColor: 'red', // Urgent exam warning in RED
    },
    {
      id: 'assignments',
      label: 'Assignments',
      icon: ListTodo,
      badge: urgentCount > 0 ? `${urgentCount} Urgent` : undefined,
      badgeColor: 'red', // Urgent assignments in RED
    },
    { id: 'schedule', label: 'Timetable', icon: Calendar },
    { id: 'sessions', label: 'Study Sessions', icon: Repeat },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors border-blue-100/70 dark:border-neutral-800/80 bg-white/95 dark:bg-[#0c0e14]/95 shadow-2xs">
      {/* Top Banner with STUDY BUDDY Branding, Mascot & Quick Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* STUDY BUDDY Logo & Bunny Mascot */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center p-1 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-900/50 shadow-xs">
              <BunnyBuddy mood="study" size="sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                  STUDY BUDDY
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-mono-code border border-blue-200/60 dark:border-blue-900/40">
                  CSE Self-Study
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-mono-code">
                  10 CGPA Target: {profile.targetCGPA || 9.5}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-[240px] sm:max-w-xs">
                {profile.university || 'Indian Institute of Technology'}
              </p>
            </div>
          </div>

          {/* Quick Badges & Controls (Streaks removed per user request!) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Urgent Alert Pill if any urgent items exist */}
            {urgentCount > 0 && (
              <button
                onClick={() => setActiveTab('assignments')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-600 text-white text-xs font-bold font-mono-code shadow-xs animate-pulse hover:bg-red-700 transition"
                title={`${urgentCount} urgent assignment(s) require attention`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>{urgentCount} Urgent</span>
              </button>
            )}

            {/* Email Reminders Alert Toggle Button */}
            {onOpenEmailModal && (
              <button
                onClick={onOpenEmailModal}
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition ${
                  profile.emailAlertsEnabled !== false
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border-neutral-200 dark:border-neutral-700'
                }`}
                title="Task completion daily email reminders"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{profile.emailAlertsEnabled !== false ? 'Mail Alert: ON' : 'Mail Alert: OFF'}</span>
              </button>
            )}

            {/* Hydration Water Break Check Button */}
            {onOpenWaterModal && (
              <button
                onClick={onOpenWaterModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-sky-300/80 dark:border-sky-800/80 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition shadow-2xs"
                title={`Hydration: ${profile.waterGlassesToday || 0} glasses logged. Click to log water or change 15-20 min alert.`}
              >
                <Droplets className="w-3.5 h-3.5 text-sky-500" />
                <span className="font-mono-code font-bold">{profile.waterGlassesToday || 0}💧</span>
                <span className="hidden lg:inline text-[11px] text-sky-600 dark:text-sky-400">Water Break</span>
              </button>
            )}

            {/* Quick Focus Button / Pill */}
            {timerActive ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                <button
                  onClick={() => setActiveTab('timer')}
                  className="flex items-center gap-1.5 hover:opacity-80 transition"
                  title="Focus session in progress - click to view timer"
                >
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                  <span className="font-mono-code font-bold">{timerFormattedTime}</span>
                  <Music className="w-3 h-3 text-blue-500 animate-pulse" />
                </button>
                {onStopTimerAndMusic && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStopTimerAndMusic();
                    }}
                    className="ml-1 px-1.5 py-0.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold font-mono-code transition flex items-center gap-1"
                    title="Stop focus timer and music immediately"
                  >
                    <Square className="w-2.5 h-2.5 fill-white" />
                    <span>Stop</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('timer')}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition border border-blue-200 dark:border-blue-800"
              >
                <Music className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Focus & Rain</span>
              </button>
            )}

            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition border border-neutral-200/80 dark:border-neutral-800"
              title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4 text-blue-400" />
              )}
            </button>

            {/* Subjects Manager */}
            <button
              onClick={onOpenSubjects}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              title="Manage semester subjects"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Subjects</span>
            </button>

            {/* Student Login / Profile Setup */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-700 bg-neutral-50/80 dark:bg-neutral-900/60 transition group text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-display font-bold text-xs">
                {profile.name ? profile.name.charAt(0) : 'S'}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-neutral-900 dark:text-white leading-tight">
                  {profile.name}
                </div>
                <div className="text-[10px] text-neutral-400 font-mono-code">
                  CGPA: {profile.currentCGPA || 9.14}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Blue / Green / Red Collegiate Tab Navigation Strip */}
      <nav className="border-t border-neutral-200/70 dark:border-neutral-800/70 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex space-x-1 sm:space-x-2 overflow-x-auto py-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs dark:bg-blue-500'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-neutral-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-1 text-[10px] font-mono-code font-bold px-1.5 py-0.5 rounded-full ${
                      item.badgeColor === 'red'
                        ? 'bg-red-600 text-white' // Urgent always in RED
                        : isActive
                        ? 'bg-white text-blue-700'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
