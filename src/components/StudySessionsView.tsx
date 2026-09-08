import React, { useState } from 'react';
import {
  Repeat,
  Plus,
  Clock,
  Flame,
  Bell,
  BellOff,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  Play,
  Calendar,
} from 'lucide-react';
import { StudySession, Subject, RecurrenceType } from '../types';
import { requestNotificationPermission, sendStudyReminder } from '../utils/notifications';

interface StudySessionsViewProps {
  sessions: StudySession[];
  subjects: Subject[];
  onAddSession: (session: StudySession) => void;
  onUpdateSession: (session: StudySession) => void;
  onDeleteSession: (id: string) => void;
  onStartTimerWithSubject: (subjectId: string) => void;
}

const DAYS_MAP = [
  { day: 1, short: 'M', label: 'Mon' },
  { day: 2, short: 'T', label: 'Tue' },
  { day: 3, short: 'W', label: 'Wed' },
  { day: 4, short: 'T', label: 'Thu' },
  { day: 5, short: 'F', label: 'Fri' },
  { day: 6, short: 'S', label: 'Sat' },
  { day: 0, short: 'S', label: 'Sun' },
];

export const StudySessionsView: React.FC<StudySessionsViewProps> = ({
  sessions,
  subjects,
  onAddSession,
  onUpdateSession,
  onDeleteSession,
  onStartTimerWithSubject,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || '');
  const [formDuration, setFormDuration] = useState(60);
  const [formFrequency, setFormFrequency] = useState<RecurrenceType>('weekdays');
  const [formSelectedDays, setFormSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [formScheduledTime, setFormScheduledTime] = useState('17:00');
  const [formReminderEnabled, setFormReminderEnabled] = useState(true);
  const [formGoals, setFormGoals] = useState<string[]>([]);
  const [newGoalInput, setNewGoalInput] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const getSubject = (id: string) => subjects.find((s) => s.id === id);

  const openNewModal = () => {
    setEditingSession(null);
    setFormTitle('');
    setFormSubjectId(subjects[0]?.id || '');
    setFormDuration(60);
    setFormFrequency('weekdays');
    setFormSelectedDays([1, 2, 3, 4, 5]);
    setFormScheduledTime('17:00');
    setFormReminderEnabled(true);
    setFormGoals(['Solve 2 benchmark problems', 'Review lecture notes summary']);
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (sess: StudySession) => {
    setEditingSession(sess);
    setFormTitle(sess.title);
    setFormSubjectId(sess.subjectId);
    setFormDuration(sess.durationMinutes);
    setFormFrequency(sess.frequency);
    setFormSelectedDays(sess.selectedDays || [1, 2, 3, 4, 5]);
    setFormScheduledTime(sess.scheduledTime);
    setFormReminderEnabled(sess.reminderEnabled);
    setFormGoals([...sess.goals]);
    setFormNotes(sess.notes || '');
    setIsModalOpen(true);
  };

  const handleToggleReminder = async (session: StudySession) => {
    if (!session.reminderEnabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        alert('Browser notifications are not enabled. Please allow notifications in your browser settings.');
      }
    }
    const updated = { ...session, reminderEnabled: !session.reminderEnabled };
    onUpdateSession(updated);
    if (!session.reminderEnabled) {
      sendStudyReminder(
        `Academia Study Reminder Set: ${session.title}`,
        `Recurring reminder enabled for ${session.scheduledTime}. We will alert you before focus time!`
      );
    }
  };

  const handleCompleteSessionToday = (session: StudySession) => {
    const todayStr = new Date().toDateString();
    if (session.lastCompletedDate === todayStr) {
      alert('You have already logged completion for today’s session!');
      return;
    }

    const updated: StudySession = {
      ...session,
      streak: session.streak + 1,
      lastCompletedDate: todayStr,
    };
    onUpdateSession(updated);
  };

  const handleAddGoal = () => {
    if (!newGoalInput.trim()) return;
    setFormGoals([...formGoals, newGoalInput.trim()]);
    setNewGoalInput('');
  };

  const toggleDaySelection = (day: number) => {
    if (formSelectedDays.includes(day)) {
      if (formSelectedDays.length <= 1) return;
      setFormSelectedDays(formSelectedDays.filter((d) => d !== day));
    } else {
      setFormSelectedDays([...formSelectedDays, day]);
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingSession) {
      onUpdateSession({
        ...editingSession,
        title: formTitle.trim(),
        subjectId: formSubjectId,
        durationMinutes: Number(formDuration) || 60,
        frequency: formFrequency,
        selectedDays: formSelectedDays,
        scheduledTime: formScheduledTime,
        reminderEnabled: formReminderEnabled,
        goals: formGoals,
        notes: formNotes,
      });
    } else {
      const newSess: StudySession = {
        id: `sess-${Date.now()}`,
        title: formTitle.trim(),
        subjectId: formSubjectId,
        durationMinutes: Number(formDuration) || 60,
        frequency: formFrequency,
        selectedDays: formSelectedDays,
        scheduledTime: formScheduledTime,
        reminderEnabled: formReminderEnabled,
        goals: formGoals,
        streak: 0,
        notes: formNotes,
      };
      onAddSession(newSess);
    }
    setIsModalOpen(false);
  };

  const todayStr = new Date().toDateString();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Recurring Habits & Habit Loops
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">
            Organized Study Sessions & Recurring Reminders
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Lock in dependable academic study rhythms with scheduled reminders and goal tracking.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-amber-400 text-xs font-semibold flex items-center gap-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Plan Recurring Study Session</span>
        </button>
      </div>

      {/* Sessions Grid */}
      {sessions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121620]">
          <Repeat className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            No recurring study sessions planned
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Build consistency by scheduling recurring study sessions (e.g. daily LeetCode or weekly bio flashcards).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((sess) => {
            const sub = getSubject(sess.subjectId);
            const isCompletedToday = sess.lastCompletedDate === todayStr;

            return (
              <div
                key={sess.id}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121620] p-5 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: sub?.accentColor || '#10b981' }}
                      />
                      <span className="text-xs font-bold font-mono-code text-neutral-900 dark:text-white">
                        {sub?.code || 'COURSE'}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                        {sess.frequency}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Reminder Toggle Button */}
                      <button
                        onClick={() => handleToggleReminder(sess)}
                        className={`p-1.5 rounded-lg border transition ${
                          sess.reminderEnabled
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                            : 'text-neutral-400 border-neutral-200 dark:border-neutral-800'
                        }`}
                        title={sess.reminderEnabled ? 'Reminder Active' : 'Reminder Muted'}
                      >
                        {sess.reminderEnabled ? (
                          <Bell className="w-3.5 h-3.5" />
                        ) : (
                          <BellOff className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Streak Pill */}
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold font-mono-code">
                        <Flame className="w-3.5 h-3.5" />
                        <span>{sess.streak}d</span>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-base font-bold text-neutral-900 dark:text-white">
                    {sess.title}
                  </h3>

                  {/* Time & Duration */}
                  <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 font-mono-code">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      {sess.scheduledTime}
                    </span>
                    <span>•</span>
                    <span>{sess.durationMinutes} minutes</span>
                  </div>

                  {/* Days Active Pill Matrix */}
                  <div className="mt-3 flex gap-1">
                    {DAYS_MAP.map((d) => {
                      const isActive =
                        sess.frequency === 'daily' ||
                        (sess.frequency === 'weekdays' && d.day >= 1 && d.day <= 5) ||
                        (sess.selectedDays && sess.selectedDays.includes(d.day));

                      return (
                        <span
                          key={d.day}
                          className={`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center font-mono-code ${
                            isActive
                              ? 'bg-neutral-900 text-white dark:bg-amber-500 dark:text-neutral-950'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {d.short}
                        </span>
                      );
                    })}
                  </div>

                  {/* Goals Checklist */}
                  {sess.goals.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 space-y-1">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                        Session Checkpoints:
                      </div>
                      {sess.goals.map((g, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-300"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span className="truncate">{g}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onStartTimerWithSubject(sess.subjectId)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-900 text-white dark:bg-amber-500 dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-amber-400 transition flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      <span>Start Focus</span>
                    </button>

                    <button
                      onClick={() => handleCompleteSessionToday(sess)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition flex items-center gap-1 ${
                        isCompletedToday
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                      title="Log today’s session done"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isCompletedToday ? 'Done Today' : 'Log Done'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(sess)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      title="Edit session"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteSession(sess.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      title="Delete session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Study Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121620] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-neutral-900 dark:text-white">
                {editingSession ? 'Edit Recurring Study Session' : 'Plan Recurring Study Session'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-5 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  Session Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Algorithms LeetCode & Red-Black Trees"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Subject Course *
                  </label>
                  <select
                    value={formSubjectId}
                    onChange={(e) => setFormSubjectId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={240}
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Recurrence Cadence
                  </label>
                  <select
                    value={formFrequency}
                    onChange={(e) => setFormFrequency(e.target.value as RecurrenceType)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekdays">Every Weekday (Mon - Fri)</option>
                    <option value="weekly">Weekly</option>
                    <option value="custom">Custom Days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formScheduledTime}
                    onChange={(e) => setFormScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* Custom Days Selector */}
              {formFrequency === 'custom' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Repeat on Days:
                  </label>
                  <div className="flex gap-2">
                    {DAYS_MAP.map((d) => (
                      <button
                        key={d.day}
                        type="button"
                        onClick={() => toggleDaySelection(d.day)}
                        className={`w-9 h-9 rounded-lg text-xs font-bold font-mono-code transition ${
                          formSelectedDays.includes(d.day)
                            ? 'bg-neutral-900 text-white dark:bg-amber-500 dark:text-neutral-950'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                        }`}
                      >
                        {d.short}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reminder Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60">
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <div>
                    <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                      Automated Reminder Alert
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      Dispatches notification chime at {formScheduledTime}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formReminderEnabled}
                  onChange={(e) => setFormReminderEnabled(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </div>

              {/* Goals list */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  Session Milestones / Checklist
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newGoalInput}
                    onChange={(e) => setNewGoalInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddGoal();
                      }
                    }}
                    placeholder="Add milestone (e.g. solve 3 problems)..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddGoal}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1">
                  {formGoals.map((g, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 text-xs"
                    >
                      <span className="text-neutral-800 dark:text-neutral-200">{g}</span>
                      <button
                        type="button"
                        onClick={() => setFormGoals(formGoals.filter((_, i) => i !== idx))}
                        className="text-neutral-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 font-semibold text-xs hover:bg-neutral-800 dark:hover:bg-amber-400 transition"
                >
                  {editingSession ? 'Save Changes' : 'Schedule Recurring Study'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
