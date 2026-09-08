import React from 'react';
import {
  Calendar,
  Clock,
  Award,
  ListTodo,
  ChevronRight,
  Sparkles,
  CheckSquare,
  Music,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  Play,
  Mail,
  Flame,
} from 'lucide-react';
import {
  StudentProfile,
  Subject,
  Assignment,
  LectureSlot,
  Exam,
  StudySession,
  StudyRecommendation,
  UpcomingTodo,
  UniNote,
} from '../types';
import { DayCheckInWidget } from './DayCheckInWidget';
import { BunnyBuddy } from './BunnyBuddy';

interface DashboardViewProps {
  profile: StudentProfile;
  subjects: Subject[];
  assignments: Assignment[];
  lectures: LectureSlot[];
  exams: Exam[];
  studySessions: StudySession[];
  recommendations: StudyRecommendation[];
  todos: UpcomingTodo[];
  notes: UniNote[];
  onNavigate: (tab: string) => void;
  onStartTimerWithSubject: (subjectId: string) => void;
  onToggleAssignmentStatus: (assignmentId: string) => void;
  onToggleTodo: (todoId: string) => void;
  onOpenNewAssignment: () => void;
  onOpenNewExam: () => void;
  onUpdateCheckIn: (checkIn: { date: string; mood: string; energy: string; note?: string }) => void;
  onOpenEmailModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  subjects,
  assignments,
  lectures,
  exams,
  studySessions,
  recommendations,
  todos,
  notes,
  onNavigate,
  onStartTimerWithSubject,
  onToggleAssignmentStatus,
  onToggleTodo,
  onOpenNewAssignment,
  onOpenNewExam,
  onUpdateCheckIn,
  onOpenEmailModal,
}) => {
  const getSubject = (id: string) => subjects.find((s) => s.id === id);

  // Today's day of week (0=Sun, 1=Mon, ..., 6=Sat)
  const todayDayOfWeek = new Date().getDay();
  const todayLectures = lectures
    .filter((l) => l.dayOfWeek === todayDayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Upcoming assignments sorted by due date
  const now = new Date();
  const pendingAssignments = assignments
    .filter((a) => a.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // Upcoming exams
  const upcomingExams = exams
    .filter((e) => e.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Check for 1-Week exam warnings (<= 7 days away)
  const oneWeekAlertExams = upcomingExams.filter((e) => {
    const examDate = new Date(`${e.date}T${e.startTime || '09:00'}:00`);
    const diff = examDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return diff > 0 && days <= 7;
  });

  const todayTodos = todos.filter((t) => t.dayBucket === 'today');
  const upcomingTodos = todos.filter((t) => t.dayBucket === 'upcoming');

  const uncompletedToday = todayTodos.filter((t) => !t.completed);
  const urgentTasksCount =
    uncompletedToday.filter((t) => t.priority === 'urgent').length +
    pendingAssignments.filter((a) => a.priority === 'urgent').length;

  const formatHoursMinutes = (totalMinutes: number) => {
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  };

  const getDaysDiff = (dateStr: string) => {
    const target = new Date(dateStr);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. "ASK ABOUT MY DAY" WIDGET (Prominently at the top as requested!) */}
      <DayCheckInWidget
        profile={profile}
        onUpdateCheckIn={onUpdateCheckIn}
        onStartFocus={() => onNavigate('timer')}
        urgentCount={urgentTasksCount}
      />

      {/* 2. 1-WEEK EXAM REMINDER ALERT BANNER (IN URGENT RED) */}
      {oneWeekAlertExams.length > 0 && (
        <div className="rounded-2xl border-2 border-red-500/40 bg-red-50 dark:bg-red-950/30 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-300 font-mono-code px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/50">
                  CRITICAL: 1-Week Exam Alert
                </span>
                <span className="text-xs font-mono-code font-bold text-red-600 dark:text-red-400">
                  Starts in {getDaysDiff(oneWeekAlertExams[0].date)} days!
                </span>
              </div>
              <h3 className="font-display text-base font-bold text-neutral-900 dark:text-white mt-0.5">
                {oneWeekAlertExams[0].title}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-300">
                Scheduled for {new Date(oneWeekAlertExams[0].date).toLocaleDateString()} at{' '}
                {oneWeekAlertExams[0].startTime}. Get concise notes ready and start your free focus timer!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onStartTimerWithSubject(oneWeekAlertExams[0].subjectId)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Free Focus</span>
            </button>
            <button
              onClick={() => onNavigate('notes')}
              className="px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-semibold text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Make Notes</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. WELCOME & ACADEMIC STANDING (No streaks per user request!) */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#131620] p-6 sm:p-7 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono-code">
                {profile.semester}
              </span>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                {profile.university}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Welcome Back to STUDY BUDDY, {profile.name}! 🐾
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 max-w-xl leading-relaxed">
              Striving toward your <strong className="text-blue-600 dark:text-blue-400">{profile.targetCGPA || 9.5} / 10.0 CGPA</strong>.{' '}
              You have <strong className="text-neutral-900 dark:text-white">{uncompletedToday.length} pending task(s)</strong> for today and{' '}
              <strong className="text-neutral-900 dark:text-white">{upcomingExams.length} upcoming exam(s)</strong>.
            </p>

            {/* Email Alert Status Bar */}
            <div className="pt-1 flex items-center gap-2">
              <button
                onClick={onOpenEmailModal}
                className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 font-medium transition"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>
                  Unfinished task email reminder: {profile.emailAlertsEnabled !== false ? 'Active' : 'Disabled'}
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 underline font-semibold">
                  (Change or Stop)
                </span>
              </button>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            {/* 10 CGPA Metric */}
            <div className="p-3.5 rounded-2xl border border-blue-100 dark:border-neutral-800 bg-blue-50/50 dark:bg-neutral-900/50 min-w-[110px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono-code">
                Target CGPA
              </span>
              <div className="text-xl font-bold font-mono-code text-neutral-900 dark:text-white mt-0.5">
                {profile.targetCGPA || 9.5} / 10
              </div>
              <div className="text-[10px] text-neutral-500 font-medium">
                Current: {profile.currentCGPA || 9.14}
              </div>
            </div>

            {/* Active Subjects Load */}
            <div className="p-3.5 rounded-2xl border border-emerald-100 dark:border-neutral-800 bg-emerald-50/50 dark:bg-neutral-900/50 min-w-[110px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono-code">
                Active Courses
              </span>
              <div className="text-xl font-bold font-mono-code text-neutral-900 dark:text-white mt-0.5">
                {subjects.length} Subjects
              </div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                Sem {profile.semester || 5} CSE
              </div>
            </div>

            {/* Urgent Items in RED */}
            <div className={`p-3.5 rounded-2xl border min-w-[110px] ${
              urgentTasksCount > 0
                ? 'border-red-300 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30'
                : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50'
            }`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider font-mono-code ${
                urgentTasksCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-neutral-400'
              }`}>
                Urgent Tasks
              </span>
              <div className={`text-xl font-bold font-mono-code mt-0.5 ${
                urgentTasksCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-neutral-900 dark:text-white'
              }`}>
                {urgentTasksCount}
              </div>
              <div className={`text-[10px] font-medium ${urgentTasksCount > 0 ? 'text-red-600' : 'text-neutral-500'}`}>
                {urgentTasksCount > 0 ? 'Due soon!' : 'All clear'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. QUICK LAUNCH BAR: "MAKE NOTES" & "FREE FOCUS TIMER" */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Make Notes Launch Card */}
        <div
          onClick={() => onNavigate('notes')}
          className="rounded-2xl border-2 border-blue-500/30 hover:border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 p-5 shadow-xs cursor-pointer transition group flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 font-mono-code">
                  Make Notes Column
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Concise Summaries & Q&A
                </span>
              </div>
              <h3 className="font-display text-base font-bold text-neutral-900 dark:text-white mt-0.5">
                Turn Raw Notes into Concise Bullet Points
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-300">
                Paste university notes, ask questions, and get rapid, crisp summaries for exam prep.
              </p>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 group-hover:translate-x-1 transition">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>

        {/* Free Focus Timer & Soothing Audio Card */}
        <div
          onClick={() => onNavigate('timer')}
          className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#131620] hover:border-blue-300 dark:hover:border-blue-800 p-5 shadow-xs cursor-pointer transition group flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono-code">
                  Free-Fledge Focus
                </span>
                <span className="text-[10px] font-semibold text-neutral-500">
                  🌧️ Rain Audio Auto-Start
                </span>
              </div>
              <h3 className="font-display text-base font-bold text-neutral-900 dark:text-white mt-0.5">
                Open-Ended Study Timer with Bunny Buddy
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                No fixed timer limits. Starts with calming monsoon rain, Spotify, and YouTube integration.
              </p>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 group-hover:translate-x-1 transition">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 5. TWO-COLUMN GRID: TODAY'S TO-DO LIST & UPCOMING DEADLINES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's To-Do List with Red Urgent Highlight */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#131620] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-display text-lg font-bold text-neutral-900 dark:text-white">
                    Today's To-Do Agenda
                  </h3>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Write upcoming tasks and tick them off. Unfinished tasks will be included in your evening email digest.
                </p>
              </div>

              <button
                onClick={() => onNavigate('todos')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Full Planner ({todos.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Task Cards */}
            <div className="space-y-2.5">
              {todayTodos.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 text-xs text-neutral-400">
                  No tasks added for today yet.{' '}
                  <button
                    onClick={() => onNavigate('todos')}
                    className="text-blue-600 underline font-semibold"
                  >
                    Add upcoming tasks now
                  </button>
                </div>
              ) : (
                todayTodos.slice(0, 5).map((todo) => {
                  const sub = getSubject(todo.subjectId);
                  const isUrgent = todo.priority === 'urgent';

                  return (
                    <div
                      key={todo.id}
                      className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        todo.completed
                          ? 'border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/50 dark:bg-neutral-900/20 opacity-60'
                          : isUrgent
                          ? 'border-2 border-red-500 bg-red-50/80 dark:bg-red-950/30 ring-1 ring-red-500/20' // Urgent in RED as requested!
                          : 'border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => onToggleTodo(todo.id)}
                          className="text-neutral-400 hover:text-emerald-600 transition"
                        >
                          <CheckCircle2
                            className={`w-5 h-5 ${
                              todo.completed ? 'text-emerald-500' : 'text-neutral-300 dark:text-neutral-700'
                            }`}
                          />
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: sub?.accentColor || '#3b82f6' }}
                            />
                            <span className="text-[11px] font-mono-code font-bold text-neutral-700 dark:text-neutral-300">
                              {sub?.code || 'General'}
                            </span>
                            {/* Urgent badge in RED */}
                            {isUrgent && (
                              <span className="text-[10px] font-mono-code font-bold px-1.5 py-0.2 rounded-full bg-red-600 text-white flex items-center gap-0.5">
                                <Flame className="w-2.5 h-2.5 fill-current" />
                                URGENT
                              </span>
                            )}
                            {todo.estimatedMinutes && (
                              <span className="text-[10px] text-neutral-400 font-mono-code">
                                • {todo.estimatedMinutes}m
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-xs truncate font-semibold ${
                              todo.completed
                                ? 'line-through text-neutral-400'
                                : isUrgent
                                ? 'text-red-900 dark:text-red-200'
                                : 'text-neutral-900 dark:text-white'
                            }`}
                          >
                            {todo.title}
                          </p>
                        </div>
                      </div>

                      {!todo.completed && sub && (
                        <button
                          onClick={() => onStartTimerWithSubject(sub.id)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-600 text-white hover:bg-blue-700 transition shadow-xs"
                        >
                          Focus
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Upcoming Day Preview teaser */}
            {upcomingTodos.length > 0 && (
              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                <span>
                  <strong>{upcomingTodos.length} task(s)</strong> queued for upcoming day
                </span>
                <button
                  onClick={() => onNavigate('todos')}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View Upcoming Agenda →
                </button>
              </div>
            )}
          </div>

          {/* Academic Assignments (Urgent highlighted in RED) */}
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121620] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-neutral-900 dark:text-white">
                  Assignments & Lab Benchmarks
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Critical problem sets and submissions. Urgent deadlines appear in bright red.
                </p>
              </div>
              <button
                onClick={() => onNavigate('assignments')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>View All ({assignments.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {pendingAssignments.slice(0, 3).map((assn) => {
                const sub = getSubject(assn.subjectId);
                const daysDiff = getDaysDiff(assn.dueDate);
                const isUrgent = assn.priority === 'urgent' || daysDiff <= 1;

                return (
                  <div
                    key={assn.id}
                    className={`p-3.5 rounded-2xl border transition flex items-start justify-between gap-3 ${
                      isUrgent
                        ? 'border-2 border-red-500 bg-red-50/80 dark:bg-red-950/30'
                        : 'border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => onToggleAssignmentStatus(assn.id)}
                        className="mt-0.5 text-neutral-400 hover:text-emerald-600 transition"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: sub?.accentColor || '#3b82f6' }}
                          />
                          <span className="text-[11px] font-mono-code font-bold text-neutral-900 dark:text-white">
                            {sub?.code}
                          </span>
                          <span
                            className={`text-[10px] font-mono-code font-bold px-2 py-0.5 rounded-full ${
                              isUrgent
                                ? 'bg-red-600 text-white' // Urgent in RED
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                            }`}
                          >
                            {daysDiff <= 0 ? 'Due Today' : `Due in ${daysDiff}d`}
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white truncate">
                          {assn.title}
                        </h4>
                      </div>
                    </div>

                    <button
                      onClick={() => onStartTimerWithSubject(assn.subjectId)}
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shrink-0"
                    >
                      Focus
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Upcoming Exams & Today's Schedule */}
        <div className="space-y-6">
          {/* Upcoming Exams Card */}
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121620] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-display text-base font-bold text-neutral-900 dark:text-white">
                  Semester Exams
                </h3>
              </div>
              <button
                onClick={() => onNavigate('exams')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                All Exams →
              </button>
            </div>

            <div className="space-y-3">
              {upcomingExams.slice(0, 3).map((exam) => {
                const sub = getSubject(exam.subjectId);
                const daysDiff = getDaysDiff(exam.date);
                const isCritical = daysDiff <= 7;

                return (
                  <div
                    key={exam.id}
                    className={`p-3.5 rounded-2xl border transition ${
                      isCritical
                        ? 'border-2 border-red-500/50 bg-red-50/60 dark:bg-red-950/30' // 1-week critical in RED
                        : 'border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold font-mono-code text-neutral-900 dark:text-white">
                        {sub?.code}
                      </span>
                      <span
                        className={`text-[10px] font-mono-code font-bold px-2 py-0.5 rounded-full ${
                          isCritical
                            ? 'bg-red-600 text-white' // Urgent badge in RED
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {daysDiff <= 0 ? 'Today!' : `${daysDiff} days left`}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                      {exam.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-2">
                      <span>{new Date(exam.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      <span className="font-mono-code">{exam.syllabusCoveragePercent}% ready</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Timetable with Self Study indicator */}
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121620] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neutral-500" />
                <h3 className="font-display text-base font-bold text-neutral-900 dark:text-white">
                  Today's Timetable
                </h3>
              </div>
              <button
                onClick={() => onNavigate('schedule')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Schedule →
              </button>
            </div>

            {todayLectures.length === 0 ? (
              <p className="text-xs text-neutral-400 italic py-4 text-center">
                No university lectures scheduled today. Perfect for uninterrupted self-study!
              </p>
            ) : (
              <div className="space-y-2">
                {todayLectures.map((lec) => {
                  const sub = getSubject(lec.subjectId);
                  const isSelfStudy = lec.type === 'self_study';

                  return (
                    <div
                      key={lec.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                        isSelfStudy
                          ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : 'border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                          <span>{sub?.code} - {sub?.name}</span>
                          {isSelfStudy && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-600 text-white font-bold">
                              Self Study
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-500">{lec.room}</div>
                      </div>
                      <span className="text-[11px] font-mono-code font-bold text-neutral-700 dark:text-neutral-300">
                        {lec.startTime}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
