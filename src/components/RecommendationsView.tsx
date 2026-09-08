import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Brain,
  Zap,
  Heart,
  ArrowRight,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { StudyRecommendation, StudentProfile, Subject, Exam, Assignment } from '../types';

interface RecommendationsViewProps {
  recommendations: StudyRecommendation[];
  profile: StudentProfile;
  subjects: Subject[];
  exams: Exam[];
  assignments: Assignment[];
  onStartTimerWithSubject: (subjectId: string) => void;
  onNavigateToSessions: () => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  recommendations,
  profile,
  subjects,
  exams,
  assignments,
  onStartTimerWithSubject,
  onNavigateToSessions,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [completedRecIds, setCompletedRecIds] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
  const recommendedWeeklyHours = totalCredits * 2; // 2:1 rule

  const categories = [
    { id: 'all', label: 'All Insights' },
    { id: 'methodology', label: 'Study Methodology' },
    { id: 'exam_prep', label: 'Exam Defense' },
    { id: 'schedule', label: 'Schedule & Pacing' },
    { id: 'career', label: 'Semester Trajectory' },
    { id: 'wellness', label: 'Cognitive Wellness' },
  ];

  const filtered = recommendations.filter((r) => {
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
    return true;
  });

  const toggleCompleted = (id: string) => {
    if (completedRecIds.includes(id)) {
      setCompletedRecIds(completedRecIds.filter((i) => i !== id));
    } else {
      setCompletedRecIds([...completedRecIds, id]);
    }
  };

  const handleSimulateRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Personalized Intelligence
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">
            Academic Study Recommendations
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Calibrated for <strong>{profile.major}</strong> in <strong>{profile.semester}</strong> with{' '}
            {subjects.length} enrolled subjects.
          </p>
        </div>

        <button
          onClick={handleSimulateRefresh}
          disabled={isRefreshing}
          className="px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-white dark:bg-[#121620] text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Recalibrate Strategy</span>
        </button>
      </div>

      {/* Strategic Profile Banner */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Enrolled Program
            </span>
            <div className="text-sm font-bold text-neutral-900 dark:text-white truncate">
              {profile.major}
            </div>
            <div className="text-xs text-amber-700 dark:text-amber-400">{profile.semester}</div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Target Academic Bar
            </span>
            <div className="text-sm font-bold text-neutral-900 dark:text-white">
              {profile.targetGPA || '4.0'} Cumulative GPA
            </div>
            <div className="text-xs text-neutral-500">{totalCredits} credits in flight</div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Weekly Study Quota
            </span>
            <div className="text-sm font-bold text-neutral-900 dark:text-white font-mono-code">
              ~{recommendedWeeklyHours} hours / week
            </div>
            <div className="text-xs text-neutral-500">2:1 Collegiate Study-to-Credit ratio</div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Optimal Pomodoro Split
            </span>
            <div className="text-sm font-bold text-neutral-900 dark:text-white font-mono-code">
              50 min Deep / 10 min Break
            </div>
            <div className="text-xs text-neutral-500">Max retention for analytical subjects</div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat.id
                ? 'bg-neutral-900 text-white dark:bg-amber-500 dark:text-neutral-950 shadow-xs'
                : 'bg-white dark:bg-[#121620] text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((rec) => {
          const isDone = completedRecIds.includes(rec.id);
          const relatedSubject = subjects.find(
            (s) => rec.targetSubject && s.name.toLowerCase().includes(rec.targetSubject.toLowerCase())
          );

          return (
            <div
              key={rec.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                isDone
                  ? 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20 opacity-70'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121620] shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div>
                {/* Category & Impact Pill */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-mono-code">
                    {rec.category.replace('_', ' ')}
                  </span>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      rec.impact === 'high'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {rec.impact} leverage
                  </span>
                </div>

                <h3 className="font-display text-base font-bold text-neutral-900 dark:text-white leading-snug">
                  {rec.title}
                </h3>

                <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-2 leading-relaxed">
                  {rec.description}
                </p>

                {/* Actionable Callout Box */}
                <div className="mt-4 p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    Recommended Action Step:
                  </div>
                  <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 leading-relaxed">
                    {rec.actionableStep}
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                <button
                  onClick={() => toggleCompleted(rec.id)}
                  className={`text-xs font-semibold flex items-center gap-1.5 transition ${
                    isDone
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isDone ? 'Strategy Implemented' : 'Mark as Practiced'}</span>
                </button>

                <div className="flex items-center gap-2">
                  {relatedSubject ? (
                    <button
                      onClick={() => onStartTimerWithSubject(relatedSubject.id)}
                      className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Study {relatedSubject.code}</span>
                    </button>
                  ) : (
                    <button
                      onClick={onNavigateToSessions}
                      className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <span>Plan Session</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
