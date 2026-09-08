import React, { useState } from 'react';
import {
  ListTodo,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
  X,
  ChevronDown,
} from 'lucide-react';
import { Assignment, Subject, Priority, AssignmentStatus, AssignmentSubtask } from '../types';

interface AssignmentsViewProps {
  assignments: Assignment[];
  subjects: Subject[];
  onAddAssignment: (assignment: Assignment) => void;
  onUpdateAssignment: (assignment: Assignment) => void;
  onDeleteAssignment: (id: string) => void;
  onStartTimerWithSubject: (subjectId: string) => void;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  assignments,
  subjects,
  onAddAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
  onStartTimerWithSubject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || '');
  const [formDueDate, setFormDueDate] = useState('');
  const [formPriority, setFormPriority] = useState<Priority>('high');
  const [formStatus, setFormStatus] = useState<AssignmentStatus>('todo');
  const [formWeight, setFormWeight] = useState<number>(15);
  const [formDescription, setFormDescription] = useState('');
  const [formSubtasks, setFormSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  const getSubject = (id: string) => subjects.find((s) => s.id === id);

  const openNewModal = () => {
    setEditingAssignment(null);
    setFormTitle('');
    setFormSubjectId(subjects[0]?.id || '');
    // Default due date: tomorrow 23:59
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    tomorrow.setHours(23, 59, 0, 0);
    setFormDueDate(tomorrow.toISOString().slice(0, 16));
    setFormPriority('high');
    setFormStatus('todo');
    setFormWeight(15);
    setFormDescription('');
    setFormSubtasks([
      { id: 'st-1', title: 'Review rubric & compile sources', completed: false },
      { id: 'st-2', title: 'Complete first draft / implementation', completed: false },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (assn: Assignment) => {
    setEditingAssignment(assn);
    setFormTitle(assn.title);
    setFormSubjectId(assn.subjectId);
    setFormDueDate(assn.dueDate.slice(0, 16));
    setFormPriority(assn.priority);
    setFormStatus(assn.status);
    setFormWeight(assn.weightPercent || 10);
    setFormDescription(assn.description || '');
    setFormSubtasks([...assn.subtasks]);
    setIsModalOpen(true);
  };

  const handleAddSubtask = () => {
    if (!newSubtaskInput.trim()) return;
    setFormSubtasks([
      ...formSubtasks,
      {
        id: `st-${Date.now()}`,
        title: newSubtaskInput.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskInput('');
  };

  const handleToggleSubtaskInList = (assignment: Assignment, subtaskId: string) => {
    const updatedSubtasks = assignment.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed);
    onUpdateAssignment({
      ...assignment,
      subtasks: updatedSubtasks,
      status: allDone ? 'completed' : assignment.status === 'completed' ? 'in_progress' : assignment.status,
    });
  };

  const handleStatusChange = (assignment: Assignment, newStatus: AssignmentStatus) => {
    onUpdateAssignment({ ...assignment, status: newStatus });
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingAssignment) {
      onUpdateAssignment({
        ...editingAssignment,
        title: formTitle.trim(),
        subjectId: formSubjectId,
        dueDate: new Date(formDueDate).toISOString(),
        priority: formPriority,
        status: formStatus,
        weightPercent: Number(formWeight) || 0,
        description: formDescription.trim(),
        subtasks: formSubtasks,
      });
    } else {
      const newAssn: Assignment = {
        id: `assn-${Date.now()}`,
        title: formTitle.trim(),
        subjectId: formSubjectId,
        dueDate: new Date(formDueDate).toISOString(),
        priority: formPriority,
        status: formStatus,
        weightPercent: Number(formWeight) || 0,
        description: formDescription.trim(),
        subtasks: formSubtasks,
      };
      onAddAssignment(newAssn);
    }
    setIsModalOpen(false);
  };

  // Filter logic
  const filteredAssignments = assignments.filter((a) => {
    if (selectedSubjectFilter !== 'all' && a.subjectId !== selectedSubjectFilter) return false;
    if (selectedStatusFilter !== 'all' && a.status !== selectedStatusFilter) return false;
    if (selectedPriorityFilter !== 'all' && a.priority !== selectedPriorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const sub = getSubject(a.subjectId);
      return (
        a.title.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q)) ||
        (sub && (sub.name.toLowerCase().includes(q) || sub.code.toLowerCase().includes(q)))
      );
    }
    return true;
  });

  const now = new Date();
  const getDaysLeft = (dueDateStr: string) => {
    const diff = new Date(dueDateStr).getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const completedCount = assignments.filter((a) => a.status === 'completed').length;
  const progressPercent = assignments.length > 0 ? Math.round((completedCount / assignments.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Overview Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Deliverables Tracker
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">
            Assignment Deadlines & Rubrics
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Keep track of problem sets, lab writeups, term essays, and project milestones.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-amber-400 text-xs font-semibold flex items-center gap-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Progress Metric Banner */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121620] p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            Semester Completion Rate
          </div>
          <div className="text-lg font-display font-bold text-neutral-900 dark:text-white">
            {completedCount} of {assignments.length} assignments submitted ({progressPercent}%)
          </div>
        </div>

        <div className="w-full sm:w-64">
          <div className="w-full h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Controls / Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assignments by title or course..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Subject Filter */}
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriorityFilter}
            onChange={(e) => setSelectedPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121620]">
          <ListTodo className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            No assignments match your active filters
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Try resetting your search query or add a new assignment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAssignments.map((assn) => {
            const sub = getSubject(assn.subjectId);
            const daysLeft = getDaysLeft(assn.dueDate);
            const isCompleted = assn.status === 'completed';
            const completedSubtasks = assn.subtasks.filter((st) => st.completed).length;

            return (
              <div
                key={assn.id}
                className={`rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                  isCompleted
                    ? 'border-neutral-200 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/20 opacity-75'
                    : assn.priority === 'urgent'
                    ? 'border-2 border-red-500 bg-red-50/80 dark:bg-red-950/30 ring-1 ring-red-500/20 shadow-xs' // URGENT IN RED!
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121620] shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: sub?.accentColor || '#3b82f6' }}
                      />
                      <span className="text-xs font-bold font-mono-code text-neutral-900 dark:text-white">
                        {sub?.code || 'GEN'}
                      </span>
                      {assn.weightPercent && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono-code">
                          {assn.weightPercent}% grade
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Priority Tag */}
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          assn.priority === 'urgent'
                            ? 'bg-red-600 text-white font-bold' // URGENT IN RED
                            : assn.priority === 'high'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                            : 'bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {assn.priority === 'urgent' ? '🔥 URGENT' : assn.priority}
                      </span>

                      {/* Due date badge */}
                      <span
                        className={`text-[11px] font-bold font-mono-code px-2 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : daysLeft < 0
                            ? 'bg-rose-500 text-white'
                            : daysLeft <= 2
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        {isCompleted
                          ? 'Completed'
                          : daysLeft < 0
                          ? 'Overdue'
                          : daysLeft === 0
                          ? 'Due Today'
                          : `${daysLeft}d left`}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3
                    className={`font-display text-base font-bold leading-snug ${
                      isCompleted
                        ? 'line-through text-neutral-500 dark:text-neutral-500'
                        : 'text-neutral-900 dark:text-white'
                    }`}
                  >
                    {assn.title}
                  </h3>

                  {assn.description && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                      {assn.description}
                    </p>
                  )}

                  {/* Subtasks Checklist */}
                  {assn.subtasks.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 space-y-1.5">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                        Subtasks ({completedSubtasks}/{assn.subtasks.length}):
                      </div>
                      {assn.subtasks.map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => handleToggleSubtaskInList(assn, st.id)}
                          className="w-full flex items-center gap-2 text-left text-xs text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white group"
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition ${
                              st.completed
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-neutral-300 dark:border-neutral-600 group-hover:border-neutral-400'
                            }`}
                          >
                            {st.completed && <CheckCircle2 className="w-3 h-3" />}
                          </span>
                          <span className={st.completed ? 'line-through text-neutral-400' : ''}>
                            {st.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={assn.status}
                      onChange={(e) => handleStatusChange(assn, e.target.value as AssignmentStatus)}
                      className="px-2 py-1 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>

                    <button
                      onClick={() => onStartTimerWithSubject(assn.subjectId)}
                      className="px-2 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                      title="Focus on this course with study timer"
                    >
                      <Clock className="w-3 h-3" />
                      <span>Focus</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(assn)}
                      className="p-1.5 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                      title="Edit assignment"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteAssignment(assn.id)}
                      className="p-1.5 rounded text-neutral-400 hover:text-rose-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                      title="Delete assignment"
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

      {/* Add / Edit Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121620] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-neutral-900 dark:text-white">
                {editingAssignment ? 'Edit Assignment' : 'New Assignment Deliverable'}
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
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Red-Black Tree Implementation"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 outline-none"
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
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 outline-none"
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
                    Due Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 outline-none"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as AssignmentStatus)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 outline-none"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Weight %
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formWeight}
                    onChange={(e) => setFormWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  Description / Rubric Notes
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Key instructions, rubric criteria, submission link..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 outline-none"
                />
              </div>

              {/* Subtasks Builder */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  Subtask Milestones
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSubtaskInput}
                    onChange={(e) => setNewSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtask();
                      }
                    }}
                    placeholder="Add step (e.g. Write test suite)..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1">
                  {formSubtasks.map((st, idx) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 text-xs"
                    >
                      <span className="text-neutral-800 dark:text-neutral-200">{st.title}</span>
                      <button
                        type="button"
                        onClick={() => setFormSubtasks(formSubtasks.filter((_, i) => i !== idx))}
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
                  {editingAssignment ? 'Save Changes' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
