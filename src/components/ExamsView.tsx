import React, { useState } from 'react';
import {
  Award,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  Play,
  Calendar,
  AlertCircle,
  Bell,
  BellRing,
  Brain,
  Sparkles,
} from 'lucide-react';
import { Exam, Subject, ExamType } from '../types';
import { soundFx } from '../utils/audio';

interface ExamsViewProps {
  exams: Exam[];
  subjects: Subject[];
  onAddExam: (exam: Exam) => void;
  onUpdateExam: (exam: Exam) => void;
  onDeleteExam: (id: string) => void;
  onStartTimerWithSubject: (subjectId: string) => void;
  onNavigateToQuiz?: () => void;
}

export const ExamsView: React.FC<ExamsViewProps> = ({
  exams,
  subjects,
  onAddExam,
  onUpdateExam,
  onDeleteExam,
  onStartTimerWithSubject,
  onNavigateToQuiz,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [reminderNotifiedExamIds, setReminderNotifiedExamIds] = useState<string[]>([]);
  const [activeAlertMsg, setActiveAlertMsg] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || '');
  const [formExamType, setFormExamType] = useState<ExamType>('midsem');
  const [formDate, setFormDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('09:30');
  const [formDuration, setFormDuration] = useState<number>(120);
  const [formRoom, setFormRoom] = useState('LHC Hall 101');
  const [formCoverage, setFormCoverage] = useState<number>(60);
  const [formWeight, setFormWeight] = useState<number>(30);
  const [formFormat, setFormFormat] = useState('Written Theory & Coding (30% weight for 10 CGPA)');
  const [formTopics, setFormTopics] = useState<string[]>([]);
  const [newTopicInput, setNewTopicInput] = useState('');

  const getSubject = (id: string) => subjects.find((s) => s.id === id);
  const now = new Date();

  const getExamCountdown = (dateStr: string, timeStr: string) => {
    const examDateTime = new Date(`${dateStr}T${timeStr || '09:00'}:00`);
    const diff = examDateTime.getTime() - now.getTime();

    if (diff < 0) {
      return { passed: true, days: 0, hours: 0, totalHours: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const totalHours = Math.floor(diff / (1000 * 60 * 60));
    return { passed: false, days, hours, totalHours };
  };

  // Find all exams that are within 1 week (<= 7 days and not passed)
  const oneWeekReminderExams = exams.filter((e) => {
    const cd = getExamCountdown(e.date, e.startTime);
    return !cd.passed && cd.days <= 7;
  });

  const handleSetReminderNotification = (exam: Exam) => {
    soundFx.playTick();
    setReminderNotifiedExamIds((prev) => [...prev, exam.id]);

    const countdown = getExamCountdown(exam.date, exam.startTime);
    const msg = `🔔 1-Week Exam Alert Armed: "${exam.title}" is in ${countdown.days} days and ${countdown.hours} hours. Daily revision reminder scheduled!`;
    setActiveAlertMsg(msg);

    // Try browser notification if granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          new Notification(`1-Week Exam Alert: ${exam.title}`, {
            body: `Your exam starts in ${countdown.days} days. Review your university notes!`,
          });
        }
      });
    } else if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`1-Week Exam Alert: ${exam.title}`, {
        body: `Your exam starts in ${countdown.days} days. Review your university notes!`,
      });
    }

    setTimeout(() => setActiveAlertMsg(null), 5000);
  };

  const openNewModal = () => {
    setEditingExam(null);
    setFormTitle('');
    setFormSubjectId(subjects[0]?.id || '');
    setFormExamType('midsem');
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setFormDate(d.toISOString().split('T')[0]);
    setFormStartTime('09:30');
    setFormDuration(120);
    setFormRoom('LHC Hall 101');
    setFormCoverage(50);
    setFormWeight(30);
    setFormFormat('Written Theory (30% weight for 10 CGPA)');
    setFormTopics(['Unit 1 & Unit 2 Proofs', 'Numerical Problem Sets', 'Past Midsem Papers']);
    setIsModalOpen(true);
  };

  const openEditModal = (exam: Exam) => {
    setEditingExam(exam);
    setFormTitle(exam.title);
    setFormSubjectId(exam.subjectId);
    setFormExamType(exam.examType || 'midsem');
    setFormDate(exam.date);
    setFormStartTime(exam.startTime);
    setFormDuration(exam.durationMinutes);
    setFormRoom(exam.room);
    setFormCoverage(exam.syllabusCoveragePercent);
    setFormWeight(exam.weightPercent);
    setFormFormat(exam.format || '');
    setFormTopics([...exam.topics]);
    setIsModalOpen(true);
  };

  const handleAddTopic = () => {
    if (!newTopicInput.trim()) return;
    setFormTopics([...formTopics, newTopicInput.trim()]);
    setNewTopicInput('');
  };

  const handleRemoveTopic = (idx: number) => {
    setFormTopics(formTopics.filter((_, i) => i !== idx));
  };

  const handleCoverageSliderChange = (exam: Exam, newCoverage: number) => {
    onUpdateExam({
      ...exam,
      syllabusCoveragePercent: newCoverage,
    });
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingExam) {
      onUpdateExam({
        ...editingExam,
        title: formTitle.trim(),
        subjectId: formSubjectId,
        examType: formExamType,
        date: formDate,
        startTime: formStartTime,
        durationMinutes: Number(formDuration) || 120,
        room: formRoom.trim(),
        syllabusCoveragePercent: Number(formCoverage) || 0,
        weightPercent: Number(formWeight) || 0,
        format: formFormat.trim(),
        topics: formTopics,
      });
    } else {
      const newExam: Exam = {
        id: `exam-${Date.now()}`,
        title: formTitle.trim(),
        subjectId: formSubjectId,
        examType: formExamType,
        date: formDate,
        startTime: formStartTime,
        durationMinutes: Number(formDuration) || 120,
        room: formRoom.trim(),
        syllabusCoveragePercent: Number(formCoverage) || 0,
        weightPercent: Number(formWeight) || 0,
        format: formFormat.trim(),
        topics: formTopics,
        status: 'upcoming',
      };
      onAddExam(newExam);
    }
    setIsModalOpen(false);
  };

  // Sort upcoming exams chronologically
  const sortedExams = [...exams].sort(
    (a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime()
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-mono-code">
              Exam Milestones & 1-Week Early Warnings
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">
            Examinations & 1-Week Reminders
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Set your exam dates. The system automatically triggers high-priority alerts exactly 1 week before each exam starts.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-amber-400 text-xs font-semibold flex items-center gap-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Exam Date</span>
        </button>
      </div>

      {/* Floating Alert Toast if triggered */}
      {activeAlertMsg && (
        <div className="p-4 rounded-2xl bg-amber-500 text-neutral-950 font-semibold text-xs flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
          <BellRing className="w-4 h-4 shrink-0 animate-bounce" />
          <span>{activeAlertMsg}</span>
        </div>
      )}

      {/* 1-WEEK EXAM REMINDERS BANNER */}
      {oneWeekReminderExams.length > 0 && (
        <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-r from-rose-500/15 via-orange-500/10 to-amber-500/10 p-5 sm:p-6 shadow-md space-y-3">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold shrink-0 animate-pulse">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 font-mono-code px-2 py-0.5 rounded-md bg-rose-500/20">
                    1-Week Early Exam Warning ({oneWeekReminderExams.length} Approaching)
                  </span>
                </div>
                <h3 className="font-display text-base sm:text-lg font-bold text-neutral-900 dark:text-white mt-0.5">
                  Critical Revision Window Active!
                </h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {oneWeekReminderExams.map((exam) => {
              const sub = getSubject(exam.subjectId);
              const cd = getExamCountdown(exam.date, exam.startTime);
              const isNotified = reminderNotifiedExamIds.includes(exam.id);

              return (
                <div
                  key={exam.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#10141e] border border-rose-500/20 dark:border-rose-500/30 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold font-mono-code text-rose-600 dark:text-rose-400">
                        {cd.days === 0 ? 'Starts Today!' : `Starts in ${cd.days} days, ${cd.hours} hours`}
                      </span>
                      <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                        {sub?.code}
                      </span>
                    </div>

                    <h4 className="font-display text-sm font-bold text-neutral-900 dark:text-white">
                      {exam.title}
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      {new Date(exam.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      at {exam.startTime} • {exam.room}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <button
                      onClick={() => handleSetReminderNotification(exam)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                        isNotified
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20'
                      }`}
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>{isNotified ? 'Reminder Armed' : 'Send Reminder'}</span>
                    </button>

                    <button
                      onClick={() => onStartTimerWithSubject(exam.subjectId)}
                      className="px-3 py-1 text-xs font-bold bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 rounded-lg hover:bg-neutral-800 dark:hover:bg-amber-400 transition"
                    >
                      Focus Sprint
                    </button>

                    {onNavigateToQuiz && (
                      <button
                        onClick={onNavigateToQuiz}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center gap-1"
                      >
                        <Brain className="w-3 h-3 text-amber-500" />
                        <span>Quiz Notes</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Exams Grid */}
      {sortedExams.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121620]">
          <Award className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            No exams currently scheduled
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Add your midterms, final examinations, or lab vivas to receive automatic 1-week countdown alerts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedExams.map((exam) => {
            const sub = getSubject(exam.subjectId);
            const countdown = getExamCountdown(exam.date, exam.startTime);
            const isCritical = !countdown.passed && countdown.days <= 7;

            return (
              <div
                key={exam.id}
                className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121620] p-6 shadow-2xs flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition"
              >
                <div>
                  {/* Top Bar: Subject, Exam Type & Countdown */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: sub?.accentColor || '#f59e0b' }}
                      />
                      <span className="text-xs font-bold font-mono-code text-neutral-900 dark:text-white">
                        {sub?.code || 'COURSE'}
                      </span>
                      {exam.examType && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono-code">
                          {exam.examType}
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 font-mono-code">
                        {exam.weightPercent}% weight
                      </span>
                    </div>

                    {/* Countdown Badge */}
                    <div
                      className={`text-xs font-mono-code font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                        countdown.passed
                          ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                          : isCritical
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {countdown.passed ? (
                        <span>Concluded</span>
                      ) : countdown.days === 0 ? (
                        <span>Today! ({countdown.hours}h left)</span>
                      ) : (
                        <span>
                          {countdown.days}d {countdown.hours}h remaining
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Logistics */}
                  <h3 className="font-display text-lg font-bold text-neutral-900 dark:text-white leading-tight">
                    {exam.title}
                  </h3>

                  <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(exam.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span>•</span>
                    <span className="font-mono-code">
                      {exam.startTime} ({exam.durationMinutes} mins)
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {exam.room}
                    </span>
                  </div>

                  {exam.format && (
                    <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 italic">
                      Format: {exam.format}
                    </div>
                  )}

                  {/* Syllabus Readiness Slider */}
                  <div className="mt-5 p-3.5 rounded-2xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-900/40 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                        Syllabus Mastery / Readiness
                      </span>
                      <span className="font-mono-code font-bold text-amber-700 dark:text-amber-400">
                        {exam.syllabusCoveragePercent}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={exam.syllabusCoveragePercent}
                      onChange={(e) => handleCoverageSliderChange(exam, Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />

                    <div className="flex justify-between text-[10px] text-neutral-400 font-mono-code">
                      <span>Unprepared</span>
                      <span>Reviewing</span>
                      <span>Exam Ready</span>
                    </div>
                  </div>

                  {/* Key Topics Checklist */}
                  {exam.topics.length > 0 && (
                    <div className="mt-4 space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        Exam Focus Topics:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {exam.topics.map((topic, i) => (
                          <span
                            key={i}
                            className="text-xs px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1 font-medium"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onStartTimerWithSubject(exam.subjectId)}
                      className="px-3.5 py-1.5 rounded-xl bg-neutral-900 text-white dark:bg-amber-500 dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-amber-400 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Study Now</span>
                    </button>

                    {isCritical && (
                      <button
                        onClick={() => handleSetReminderNotification(exam)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 transition flex items-center gap-1"
                        title="Arm 1-week notification"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Reminder</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(exam)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition"
                      title="Edit exam"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteExam(exam.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 transition"
                      title="Delete exam"
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

      {/* ADD / EDIT EXAM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121620] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-neutral-900 dark:text-white">
                  {editingExam ? 'Edit Examination' : 'Schedule University Exam'}
                </h3>
                <p className="text-xs text-neutral-500">
                  Provide exam details so the system can calculate syllabus pacing and 1-week reminders.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-5 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Exam Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Midsem Exam: Operating Systems"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Associated Subject *
                  </label>
                  <select
                    value={formSubjectId}
                    onChange={(e) => setFormSubjectId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Exam Type *
                  </label>
                  <select
                    value={formExamType}
                    onChange={(e) => setFormExamType(e.target.value as ExamType)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none"
                  >
                    <option value="midsem">Midsem (Midterm Exam)</option>
                    <option value="endsem">Endsem (Final Comprehensive)</option>
                    <option value="lab_viva">Lab Viva / Machine Test</option>
                    <option value="class_test">Class Test / Unit Assessment</option>
                    <option value="gate_mock">GATE CSE Mock Test</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Exam Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none font-mono-code"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none font-mono-code"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    min={30}
                    max={360}
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none font-mono-code"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Examination Hall / Room
                  </label>
                  <input
                    type="text"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    placeholder="e.g. LHC Hall 101"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Weightage (% towards CGPA)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formWeight}
                    onChange={(e) => setFormWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none font-mono-code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Topics to Cover (Add individually)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTopicInput}
                    onChange={(e) => setNewTopicInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTopic();
                      }
                    }}
                    placeholder="e.g. Banker's Algorithm, Semaphore proofs..."
                    className="flex-1 px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTopic}
                    className="px-3 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-700 text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {formTopics.map((top, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5"
                    >
                      <span>{top}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTopic(idx)}
                        className="text-neutral-400 hover:text-rose-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 font-bold text-xs hover:bg-neutral-800 dark:hover:bg-amber-400 transition"
                >
                  {editingExam ? 'Update Exam' : 'Schedule Exam & Enable 1-Week Alerts'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
