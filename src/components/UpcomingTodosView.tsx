import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Flame,
  Check,
  Mail,
  Bell,
  AlertTriangle,
} from 'lucide-react';
import { UpcomingTodo, Subject, Priority } from '../types';
import { soundFx } from '../utils/audio';

interface UpcomingTodosViewProps {
  todos: UpcomingTodo[];
  subjects: Subject[];
  onAddTodo: (todo: UpcomingTodo) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onMoveToToday: (id: string) => void;
  onStartTimerWithSubject: (subjectId: string) => void;
  onOpenEmailModal?: () => void;
  emailAlertsEnabled?: boolean;
}

export const UpcomingTodosView: React.FC<UpcomingTodosViewProps> = ({
  todos,
  subjects,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  onMoveToToday,
  onStartTimerWithSubject,
  onOpenEmailModal,
  emailAlertsEnabled = true,
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming'>('today');

  // Quick Add input state
  const [newTitle, setNewTitle] = useState('');
  const [newSubjectId, setNewSubjectId] = useState(subjects[0]?.id || '');
  const [newPriority, setNewPriority] = useState<Priority>('urgent'); // defaults to urgent
  const [newEstMinutes, setNewEstMinutes] = useState(45);
  const [newNotes, setNewNotes] = useState('');
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);

  const getSubject = (id: string) => subjects.find((s) => s.id === id);

  const filteredTodos = todos.filter((t) => t.dayBucket === activeTab);
  const completedCount = filteredTodos.filter((t) => t.completed).length;
  const totalCount = filteredTodos.length;
  const isAllCompleted = totalCount > 0 && completedCount === totalCount;
  const uncompletedCount = totalCount - completedCount;

  const handleToggle = (id: string) => {
    soundFx.playTick();
    onToggleTodo(id);

    const target = todos.find((t) => t.id === id);
    if (target && !target.completed) {
      const remainingUncompleted = filteredTodos.filter((t) => !t.completed && t.id !== id);
      if (remainingUncompleted.length === 0) {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
        });
        soundFx.playCompletionBell();
      }
    }
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTodo: UpcomingTodo = {
      id: `todo-${Date.now()}`,
      title: newTitle.trim(),
      subjectId: newSubjectId || subjects[0]?.id || 'general',
      dayBucket: activeTab,
      completed: false,
      priority: newPriority,
      estimatedMinutes: Number(newEstMinutes) || 30,
      notes: newNotes.trim(),
      createdAt: new Date().toISOString(),
    };

    onAddTodo(newTodo);
    setNewTitle('');
    setNewNotes('');
    setShowAdvancedFields(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono-code">
              Day Planner & Next Day Conquering
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">
            Daily & Upcoming Day To-Do List
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Write down what to conquer for your upcoming day and tick items off as you finish. Urgent tasks appear in red.
          </p>
        </div>

        {/* Tab switcher: Today vs Upcoming Day */}
        <div className="flex rounded-2xl p-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'today'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>Today's Plan</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-code font-bold ${
              activeTab === 'today' ? 'bg-white/20 text-white' : 'bg-neutral-200 dark:bg-neutral-700'
            }`}>
              {todos.filter((t) => t.dayBucket === 'today' && !t.completed).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'upcoming'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>Upcoming Day (Tomorrow)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-code font-bold ${
              activeTab === 'upcoming' ? 'bg-white/20 text-white' : 'bg-neutral-200 dark:bg-neutral-700'
            }`}>
              {todos.filter((t) => t.dayBucket === 'upcoming' && !t.completed).length}
            </span>
          </button>
        </div>
      </div>

      {/* Automated Email Digest Info Banner */}
      <div className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <span>Task Incompletion Email Alerts:</span>
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                emailAlertsEnabled
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}>
                {emailAlertsEnabled ? 'Active (9:00 PM)' : 'Stopped'}
              </span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 text-[11px]">
              {uncompletedCount > 0
                ? `${uncompletedCount} unfinished task(s) currently queued for the evening email reminder.`
                : 'All tasks completed! No reminder emails needed.'}
            </p>
          </div>
        </div>

        {onOpenEmailModal && (
          <button
            onClick={onOpenEmailModal}
            className="px-3 py-1.5 rounded-xl border border-blue-300 dark:border-blue-800 hover:bg-blue-100/50 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold transition whitespace-nowrap"
          >
            {emailAlertsEnabled ? 'Stop or Edit Email' : 'Resume Daily Email'}
          </button>
        )}
      </div>

      {/* Progress & Milestone Bar */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#131620] p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            {activeTab === 'today' ? "Today's Task Completion" : 'Upcoming Day Preparation'}:
          </div>
          <div className="w-36 h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs font-mono-code font-bold text-neutral-900 dark:text-white">
            {completedCount} / {totalCount} Done
          </span>
        </div>

        {isAllCompleted && (
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-bounce">
            <Sparkles className="w-4 h-4" />
            <span>All tasks checked off! Outstanding focus!</span>
          </div>
        )}
      </div>

      {/* Quick Add To-Do Input Card */}
      <form
        onSubmit={handleQuickAdd}
        className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#131620] p-4 shadow-xs space-y-3"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            required
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={`Add a study task for ${activeTab === 'today' ? 'today' : 'upcoming day'} (e.g. Practice 3 DP problems, Revise OS Semaphores)...`}
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1.5 shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Priority, Subject, and Minutes Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={newSubjectId}
              onChange={(e) => setNewSubjectId(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs outline-none"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>

            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as Priority)}
              className="px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs outline-none font-semibold"
            >
              <option value="urgent">Urgent Priority (Red Highlight)</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            <div className="flex items-center gap-1 text-neutral-500">
              <Clock className="w-3.5 h-3.5" />
              <input
                type="number"
                min={10}
                max={240}
                value={newEstMinutes}
                onChange={(e) => setNewEstMinutes(Number(e.target.value))}
                className="w-12 px-1.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs text-center"
              />
              <span className="text-[11px]">mins</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvancedFields(!showAdvancedFields)}
            className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            {showAdvancedFields ? 'Hide Notes' : '+ Add Study Notes'}
          </button>
        </div>

        {showAdvancedFields && (
          <div>
            <input
              type="text"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Any specific note / problem link (e.g., LeetCode #72 Edit Distance)..."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none"
            />
          </div>
        )}
      </form>

      {/* Task List Stack */}
      <div className="space-y-3">
        {filteredTodos.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#131620]">
            <CheckCircle2 className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              No tasks listed for {activeTab === 'today' ? 'today' : 'upcoming day'}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Add upcoming tasks above to keep your daily study flow organized.
            </p>
          </div>
        ) : (
          filteredTodos.map((todo) => {
            const sub = getSubject(todo.subjectId);
            const isUrgent = todo.priority === 'urgent';

            return (
              <div
                key={todo.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  todo.completed
                    ? 'border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/20 opacity-60'
                    : isUrgent
                    ? 'border-2 border-red-500 bg-red-50/80 dark:bg-red-950/30 ring-1 ring-red-500/20 shadow-xs' // URGENT HIGHLIGHTED IN RED!
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#131620] shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  {/* Interactive Tick Box */}
                  <button
                    type="button"
                    onClick={() => handleToggle(todo.id)}
                    className="mt-0.5 text-neutral-400 hover:text-emerald-600 transition"
                    title={todo.completed ? 'Mark as incomplete' : 'Mark as completed'}
                  >
                    {todo.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: sub?.accentColor || '#3b82f6' }}
                      />
                      <span className="text-xs font-bold font-mono-code text-neutral-900 dark:text-white">
                        {sub?.code || 'CSE'}
                      </span>

                      {/* Urgent Badge in RED */}
                      {isUrgent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white font-mono-code uppercase flex items-center gap-1 shadow-xs">
                          <Flame className="w-3 h-3 fill-current" />
                          URGENT
                        </span>
                      )}

                      {todo.estimatedMinutes && (
                        <span className="text-[11px] text-neutral-400 flex items-center gap-1 font-mono-code">
                          <Clock className="w-3 h-3" />
                          {todo.estimatedMinutes}m
                        </span>
                      )}
                    </div>

                    <p
                      className={`text-xs sm:text-sm font-semibold ${
                        todo.completed
                          ? 'line-through text-neutral-400'
                          : isUrgent
                          ? 'text-red-900 dark:text-red-200'
                          : 'text-neutral-900 dark:text-white'
                      }`}
                    >
                      {todo.title}
                    </p>

                    {todo.notes && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 italic">
                        {todo.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {activeTab === 'upcoming' && !todo.completed && (
                    <button
                      onClick={() => onMoveToToday(todo.id)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition flex items-center gap-1"
                      title="Move to Today's Agenda"
                    >
                      <span>Move to Today</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}

                  {!todo.completed && sub && (
                    <button
                      onClick={() => onStartTimerWithSubject(sub.id)}
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs"
                      title="Start Focus Timer for this subject"
                    >
                      Focus
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteTodo(todo.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 transition rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
