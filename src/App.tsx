import React, { useState, useEffect } from 'react';
import {
  StudentProfile,
  Subject,
  Assignment,
  LectureSlot,
  Exam,
  StudySession,
  StudyLog,
  UniNote,
  ConciseNote,
  UpcomingTodo,
  QuizResult,
} from './types';
import {
  loadStoredData,
  saveStoredData,
  DEFAULT_PROFILE,
  DEFAULT_SUBJECTS,
  DEFAULT_NOTES,
  DEFAULT_CONCISE_NOTES,
  DEFAULT_TODOS,
  DEFAULT_ASSIGNMENTS,
  DEFAULT_LECTURES,
  DEFAULT_EXAMS,
  DEFAULT_STUDY_SESSIONS,
  DEFAULT_STUDY_LOGS,
  DEFAULT_QUIZ_RESULTS,
  resetToAcademicDemo,
} from './utils/storage';
import { generatePersonalizedRecommendations } from './utils/recommendations';
import { Header } from './components/Header';
import { IndianCseLoginModal } from './components/IndianCseLoginModal';
import { DashboardView } from './components/DashboardView';
import { MakeNotesView } from './components/MakeNotesView';
import { UpcomingTodosView } from './components/UpcomingTodosView';
import { AssignmentsView } from './components/AssignmentsView';
import { ScheduleView } from './components/ScheduleView';
import { ExamsView } from './components/ExamsView';
import { TimerView } from './components/TimerView';
import { BunnyBreakGameView } from './components/BunnyBreakGameView';
import { StudySessionsView } from './components/StudySessionsView';
import { RecommendationsView } from './components/RecommendationsView';
import { SubjectsModal } from './components/SubjectsModal';
import { EmailReminderModal } from './components/EmailReminderModal';
import { WaterBreakModal } from './components/WaterBreakModal';
import { soundFx } from './utils/audio';

export default function App() {
  const initial = loadStoredData();

  // Core Persistent State
  const [profile, setProfile] = useState<StudentProfile>(initial.profile);
  const [subjects, setSubjects] = useState<Subject[]>(initial.subjects);
  const [notes, setNotes] = useState<UniNote[]>(initial.notes);
  const [conciseNotes, setConciseNotes] = useState<ConciseNote[]>(initial.conciseNotes || DEFAULT_CONCISE_NOTES);
  const [todos, setTodos] = useState<UpcomingTodo[]>(initial.todos);
  const [quizResults, setQuizResults] = useState<QuizResult[]>(initial.quizResults);
  const [assignments, setAssignments] = useState<Assignment[]>(initial.assignments);
  const [lectures, setLectures] = useState<LectureSlot[]>(initial.lectures);
  const [exams, setExams] = useState<Exam[]>(initial.exams);
  const [studySessions, setStudySessions] = useState<StudySession[]>(initial.sessions);
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>(initial.logs);
  const [theme, setTheme] = useState<'light' | 'dark'>(initial.theme);

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  // First time popup: opens if not completed onboarding
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(!initial.profile.onboardingCompleted);
  const [isSubjectsModalOpen, setIsSubjectsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isWaterBreakModalOpen, setIsWaterBreakModalOpen] = useState(false);

  // Timer Integration in Header & Audio Persistence
  const [selectedTimerSubjectId, setSelectedTimerSubjectId] = useState<string>(
    initial.subjects[0]?.id || ''
  );
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [timerFormattedTime, setTimerFormattedTime] = useState<string>('25:00');

  const handleStopTimerAndMusic = () => {
    soundFx.toggleAmbientFocus(false);
    setTimerActive(false);
  };

  // Sync Theme to HTML class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveStoredData('THEME', theme);
  }, [theme]);

  // Persist State Changes
  useEffect(() => {
    saveStoredData('PROFILE', profile);
  }, [profile]);

  useEffect(() => {
    saveStoredData('SUBJECTS', subjects);
  }, [subjects]);

  useEffect(() => {
    saveStoredData('NOTES', notes);
  }, [notes]);

  useEffect(() => {
    saveStoredData('CONCISE_NOTES', conciseNotes);
  }, [conciseNotes]);

  useEffect(() => {
    saveStoredData('TODOS', todos);
  }, [todos]);

  useEffect(() => {
    saveStoredData('QUIZ_RESULTS', quizResults);
  }, [quizResults]);

  useEffect(() => {
    saveStoredData('ASSIGNMENTS', assignments);
  }, [assignments]);

  useEffect(() => {
    saveStoredData('LECTURES', lectures);
  }, [lectures]);

  useEffect(() => {
    saveStoredData('EXAMS', exams);
  }, [exams]);

  useEffect(() => {
    saveStoredData('SESSIONS', studySessions);
  }, [studySessions]);

  useEffect(() => {
    saveStoredData('LOGS', studyLogs);
  }, [studyLogs]);

  // Generated recommendations based on current profile, subjects, exams, assignments
  const recommendations = generatePersonalizedRecommendations(
    profile.major,
    profile.semester,
    subjects,
    assignments,
    exams
  );

  // Counts for badge alerts
  const urgentAssignmentsCount = assignments.filter(
    (a) => a.status !== 'completed' && a.priority === 'urgent'
  ).length;

  const uncompletedTodosCount = todos.filter((t) => !t.completed).length;

  const now = new Date();
  const upcomingExams1WeekCount = exams.filter((e) => {
    const examDate = new Date(`${e.date}T${e.startTime || '09:00'}:00`);
    const diff = examDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return diff > 0 && days <= 7;
  }).length;

  // Actions
  const handleStartTimerWithSubject = (subjectId: string) => {
    setSelectedTimerSubjectId(subjectId);
    setActiveTab('timer');
  };

  const handleToggleAssignmentStatus = (id: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextStatus = a.status === 'completed' ? 'todo' : 'completed';
          return {
            ...a,
            status: nextStatus,
            subtasks: a.subtasks.map((st) => ({ ...st, completed: nextStatus === 'completed' })),
          };
        }
        return a;
      })
    );
  };

  const handleAddAssignment = (newAssn: Assignment) => {
    setAssignments((prev) => [newAssn, ...prev]);
  };

  const handleUpdateAssignment = (updated: Assignment) => {
    setAssignments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  // Concise Notes actions ("Make Notes" feature)
  const handleSaveConciseNote = (newNote: ConciseNote) => {
    setConciseNotes((prev) => [newNote, ...prev.filter((n) => n.id !== newNote.id)]);
  };

  const handleDeleteConciseNote = (id: string) => {
    setConciseNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // To-Do Actions
  const handleAddTodo = (newTodo: UpcomingTodo) => {
    setTodos((prev) => [newTodo, ...prev]);
  };

  const handleToggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const handleMoveToToday = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, dayBucket: 'today' } : t))
    );
  };

  // Lectures actions
  const handleAddLecture = (newLec: LectureSlot) => {
    setLectures((prev) => [...prev, newLec]);
  };

  const handleUpdateLecture = (updated: LectureSlot) => {
    setLectures((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  };

  const handleDeleteLecture = (id: string) => {
    setLectures((prev) => prev.filter((l) => l.id !== id));
  };

  // Exams actions
  const handleAddExam = (newExam: Exam) => {
    setExams((prev) => [...prev, newExam]);
  };

  const handleUpdateExam = (updated: Exam) => {
    setExams((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  const handleDeleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  // Study sessions & logs
  const handleAddSession = (newSess: StudySession) => {
    setStudySessions((prev) => [...prev, newSess]);
  };

  const handleUpdateSession = (updated: StudySession) => {
    setStudySessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleDeleteSession = (id: string) => {
    setStudySessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleLogStudySession = (newLog: StudyLog) => {
    setStudyLogs((prev) => [newLog, ...prev]);
  };

  // Subjects actions
  const handleAddSubject = (newSubject: Subject) => {
    setSubjects((prev) => [...prev, newSubject]);
  };

  const handleUpdateSubject = (updated: Subject) => {
    setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleDeleteSubject = (id: string) => {
    if (subjects.length <= 1) {
      alert('You must retain at least one subject.');
      return;
    }
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  // Login Onboarding completed
  const handleCompleteLoginOnboarding = (updatedProfile: StudentProfile, updatedSubjects: Subject[]) => {
    setProfile(updatedProfile);
    setSubjects(updatedSubjects);
    setIsLoginModalOpen(false);
  };

  // Day Check-in update
  const handleUpdateCheckIn = (checkIn: { date: string; mood: string; energy: string; note?: string }) => {
    setProfile((prev) => ({
      ...prev,
      dayCheckIn: checkIn,
    }));
  };

  // Email alerts update
  const handleUpdateEmailSettings = (enabled: boolean, emailAddress: string) => {
    setProfile((prev) => ({
      ...prev,
      emailAlertsEnabled: enabled,
      emailAlertsAddress: emailAddress,
    }));
  };

  // Water Break Prompt Logic (Every 15-20 minutes)
  useEffect(() => {
    const intervalMins = profile.waterBreakIntervalMinutes || 18;
    const intervalMs = intervalMins * 60 * 1000;

    const intervalTimer = setInterval(() => {
      const lastCheck = profile.lastWaterBreakTime || Date.now();
      const elapsed = Date.now() - lastCheck;

      if (elapsed >= intervalMs) {
        setIsWaterBreakModalOpen(true);
      }
    }, 20000); // Poll every 20 seconds

    return () => clearInterval(intervalTimer);
  }, [profile.waterBreakIntervalMinutes, profile.lastWaterBreakTime]);

  const handleLogWater = () => {
    setProfile((prev) => ({
      ...prev,
      waterGlassesToday: (prev.waterGlassesToday || 0) + 1,
      lastWaterBreakTime: Date.now(),
    }));
  };

  const handleChangeWaterInterval = (mins: number) => {
    setProfile((prev) => ({
      ...prev,
      waterBreakIntervalMinutes: mins,
      lastWaterBreakTime: Date.now(),
    }));
  };

  const handleSnoozeWater = (mins: number) => {
    const currentInterval = profile.waterBreakIntervalMinutes || 18;
    const offsetMs = Math.max(0, (currentInterval - mins) * 60 * 1000);
    setProfile((prev) => ({
      ...prev,
      lastWaterBreakTime: Date.now() - offsetMs,
    }));
  };

  // Calculate today's study minutes
  const todayDateStr = new Date().toDateString();
  const todayStudyMinutes = studyLogs
    .filter((l) => new Date(l.timestamp).toDateString() === todayDateStr)
    .reduce((sum, l) => sum + l.durationMinutes, 0);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0c0e14] text-neutral-900 dark:text-neutral-100 transition-colors duration-200 flex flex-col font-body antialiased">
      {/* Top Navigation Bar */}
      <Header
        profile={profile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        setTheme={setTheme}
        onOpenAuth={() => setIsLoginModalOpen(true)}
        onOpenSubjects={() => setIsSubjectsModalOpen(true)}
        onOpenEmailModal={() => setIsEmailModalOpen(true)}
        onOpenWaterModal={() => setIsWaterBreakModalOpen(true)}
        timerActive={timerActive}
        timerFormattedTime={timerFormattedTime}
        onStopTimerAndMusic={handleStopTimerAndMusic}
        urgentCount={urgentAssignmentsCount}
        uncompletedTodosCount={uncompletedTodosCount}
        upcomingExams1WeekCount={upcomingExams1WeekCount}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            profile={profile}
            subjects={subjects}
            assignments={assignments}
            lectures={lectures}
            exams={exams}
            studySessions={studySessions}
            recommendations={recommendations}
            todos={todos}
            notes={notes}
            onNavigate={setActiveTab}
            onStartTimerWithSubject={handleStartTimerWithSubject}
            onToggleAssignmentStatus={handleToggleAssignmentStatus}
            onToggleTodo={handleToggleTodo}
            onOpenNewAssignment={() => setActiveTab('assignments')}
            onOpenNewExam={() => setActiveTab('exams')}
            onUpdateCheckIn={handleUpdateCheckIn}
            onOpenEmailModal={() => setIsEmailModalOpen(true)}
          />
        )}

        {activeTab === 'todos' && (
          <UpcomingTodosView
            todos={todos}
            subjects={subjects}
            onAddTodo={handleAddTodo}
            onToggleTodo={handleToggleTodo}
            onDeleteTodo={handleDeleteTodo}
            onMoveToToday={handleMoveToToday}
            onStartTimerWithSubject={handleStartTimerWithSubject}
            onOpenEmailModal={() => setIsEmailModalOpen(true)}
            emailAlertsEnabled={profile.emailAlertsEnabled !== false}
          />
        )}

        {(activeTab === 'notes' || activeTab === 'quiz') && (
          <MakeNotesView
            subjects={subjects}
            conciseNotes={conciseNotes}
            notes={notes}
            onSaveConciseNote={handleSaveConciseNote}
            onDeleteConciseNote={handleDeleteConciseNote}
            onStartTimerWithSubject={handleStartTimerWithSubject}
          />
        )}

        {/* Focus Timer & Soothing Audio View (Persistent in DOM so rain sound & countdown don't cut off when switching tabs!) */}
        <div className={activeTab === 'timer' ? 'block' : 'hidden'}>
          <TimerView
            subjects={subjects}
            selectedSubjectId={selectedTimerSubjectId}
            onSelectSubject={setSelectedTimerSubjectId}
            onLogStudySession={handleLogStudySession}
            studyLogs={studyLogs}
            onTimerStateChange={(isRunning, formatted) => {
              setTimerActive(isRunning);
              setTimerFormattedTime(formatted);
            }}
          />
        </div>

        {/* 2-5 Min Bunny Break Mini Game */}
        {activeTab === 'break-game' && (
          <BunnyBreakGameView
            onBackToStudy={() => setActiveTab('timer')}
          />
        )}

        {activeTab === 'exams' && (
          <ExamsView
            exams={exams}
            subjects={subjects}
            onAddExam={handleAddExam}
            onUpdateExam={handleUpdateExam}
            onDeleteExam={handleDeleteExam}
            onStartTimerWithSubject={handleStartTimerWithSubject}
            onNavigateToQuiz={() => setActiveTab('notes')}
          />
        )}

        {activeTab === 'assignments' && (
          <AssignmentsView
            assignments={assignments}
            subjects={subjects}
            onAddAssignment={handleAddAssignment}
            onUpdateAssignment={handleUpdateAssignment}
            onDeleteAssignment={handleDeleteAssignment}
            onStartTimerWithSubject={handleStartTimerWithSubject}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleView
            lectures={lectures}
            subjects={subjects}
            onAddLecture={handleAddLecture}
            onUpdateLecture={handleUpdateLecture}
            onDeleteLecture={handleDeleteLecture}
            onStartTimerWithSubject={handleStartTimerWithSubject}
          />
        )}

        {activeTab === 'sessions' && (
          <StudySessionsView
            sessions={studySessions}
            subjects={subjects}
            onAddSession={handleAddSession}
            onUpdateSession={handleUpdateSession}
            onDeleteSession={handleDeleteSession}
            onStartTimerWithSubject={handleStartTimerWithSubject}
          />
        )}

        {activeTab === 'recommendations' && (
          <RecommendationsView
            recommendations={recommendations}
            profile={profile}
            subjects={subjects}
            exams={exams}
            assignments={assignments}
            onStartTimerWithSubject={handleStartTimerWithSubject}
            onNavigateToSessions={() => setActiveTab('sessions')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200/80 dark:border-neutral-800 bg-white/50 dark:bg-[#0c0e14]/50 py-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-neutral-800 dark:text-neutral-200">
              STUDY BUDDY 🐾 CSE Self-Study Suite
            </span>
            <span>•</span>
            <span>{profile.university}</span>
            <span>•</span>
            <span className="font-mono-code font-bold text-blue-600 dark:text-blue-400">
              10.0 CGPA System
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Update College & Subjects
            </button>
            <span>•</span>
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Email Alert Settings
            </button>
            <span>•</span>
            <button
              onClick={() => resetToAcademicDemo()}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Reset Sample CSE Data
            </button>
          </div>
        </div>
      </footer>

      {/* Indian CSE Login & Subject Onboarding Modal */}
      <IndianCseLoginModal
        isOpen={isLoginModalOpen}
        onComplete={handleCompleteLoginOnboarding}
        currentProfile={profile}
        currentSubjects={subjects}
      />

      {/* Subjects Manager Modal */}
      <SubjectsModal
        isOpen={isSubjectsModalOpen}
        onClose={() => setIsSubjectsModalOpen(false)}
        subjects={subjects}
        onAddSubject={handleAddSubject}
        onUpdateSubject={handleUpdateSubject}
        onDeleteSubject={handleDeleteSubject}
      />

      {/* Email Reminders & Notifications Modal */}
      <EmailReminderModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        profile={profile}
        uncompletedTodos={todos.filter((t) => t.dayBucket === 'today' && !t.completed)}
        onUpdateEmailSettings={handleUpdateEmailSettings}
      />

      {/* Water Break 15-20 Min Hydration Modal */}
      <WaterBreakModal
        isOpen={isWaterBreakModalOpen}
        onClose={() => setIsWaterBreakModalOpen(false)}
        glassesCount={profile.waterGlassesToday || 0}
        onLogWater={handleLogWater}
        intervalMinutes={profile.waterBreakIntervalMinutes || 18}
        onChangeInterval={handleChangeWaterInterval}
        onSnooze={handleSnoozeWater}
      />
    </div>
  );
}
