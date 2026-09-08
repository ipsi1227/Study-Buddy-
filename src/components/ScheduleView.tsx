import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  User,
  Trash2,
  Edit2,
  X,
  BookOpen,
} from 'lucide-react';
import { LectureSlot, Subject, LectureType } from '../types';

interface ScheduleViewProps {
  lectures: LectureSlot[];
  subjects: Subject[];
  onAddLecture: (lecture: LectureSlot) => void;
  onUpdateLecture: (lecture: LectureSlot) => void;
  onDeleteLecture: (id: string) => void;
  onStartTimerWithSubject: (subjectId: string) => void;
}

const DAYS = [
  { day: 1, name: 'Monday', short: 'Mon' },
  { day: 2, name: 'Tuesday', short: 'Tue' },
  { day: 3, name: 'Wednesday', short: 'Wed' },
  { day: 4, name: 'Thursday', short: 'Thu' },
  { day: 5, name: 'Friday', short: 'Fri' },
  { day: 6, name: 'Saturday', short: 'Sat' },
  { day: 0, name: 'Sunday', short: 'Sun' },
];

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  lectures,
  subjects,
  onAddLecture,
  onUpdateLecture,
  onDeleteLecture,
  onStartTimerWithSubject,
}) => {
  const currentDayOfWeek = new Date().getDay();
  const [activeDay, setActiveDay] = useState<number>(currentDayOfWeek === 0 ? 1 : currentDayOfWeek);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<LectureSlot | null>(null);
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || '');
  const [formDayOfWeek, setFormDayOfWeek] = useState<number>(1);
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formEndTime, setFormEndTime] = useState('10:30');
  const [formRoom, setFormRoom] = useState('Turing Hall 302');
  const [formBuilding, setFormBuilding] = useState('Computer Science Complex');
  const [formType, setFormType] = useState<LectureType>('lecture');
  const [formNotes, setFormNotes] = useState('');

  const getSubject = (id: string) => subjects.find((s) => s.id === id);

  const openNewModal = (presetDay?: number) => {
    setEditingLecture(null);
    setFormSubjectId(subjects[0]?.id || '');
    setFormDayOfWeek(presetDay !== undefined ? presetDay : activeDay);
    setFormStartTime('10:00');
    setFormEndTime('11:30');
    setFormRoom('Hall 101');
    setFormBuilding('Main Academic Quad');
    setFormType('lecture');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (lec: LectureSlot) => {
    setEditingLecture(lec);
    setFormSubjectId(lec.subjectId);
    setFormDayOfWeek(lec.dayOfWeek);
    setFormStartTime(lec.startTime);
    setFormEndTime(lec.endTime);
    setFormRoom(lec.room);
    setFormBuilding(lec.building || '');
    setFormType(lec.type);
    setFormNotes(lec.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLecture) {
      onUpdateLecture({
        ...editingLecture,
        subjectId: formSubjectId,
        dayOfWeek: formDayOfWeek,
        startTime: formStartTime,
        endTime: formEndTime,
        room: formRoom,
        building: formBuilding,
        type: formType,
        notes: formNotes,
      });
    } else {
      const newLec: LectureSlot = {
        id: `lec-${Date.now()}`,
        subjectId: formSubjectId,
        dayOfWeek: formDayOfWeek,
        startTime: formStartTime,
        endTime: formEndTime,
        room: formRoom,
        building: formBuilding,
        type: formType,
        notes: formNotes,
      };
      onAddLecture(newLec);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Timetable & Venues
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">
            Lecture Schedules & Recitations
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Organize lectures, lab practicals, discussion seminars, and professor office hours.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex rounded-xl p-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Weekly Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                viewMode === 'day'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Day by Day
            </button>
          </div>

          <button
            onClick={() => openNewModal()}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-amber-400 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lecture Slot</span>
          </button>
        </div>
      </div>

      {/* WEEKLY GRID VIEW */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-5 gap-4">
          {DAYS.slice(0, 5).map((d) => {
            const dayLectures = lectures
              .filter((l) => l.dayOfWeek === d.day)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));
            const isToday = currentDayOfWeek === d.day;

            return (
              <div
                key={d.day}
                className={`rounded-2xl border flex flex-col transition-all ${
                  isToday
                    ? 'border-amber-500/50 bg-amber-500/5 dark:bg-amber-500/5 ring-1 ring-amber-500/30'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121620]'
                }`}
              >
                {/* Day Header */}
                <div className="p-4 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <span>{d.name}</span>
                      {isToday && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500 text-neutral-950 font-bold">
                          Today
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                      {dayLectures.length} scheduled
                    </div>
                  </div>

                  <button
                    onClick={() => openNewModal(d.day)}
                    className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
                    title={`Add class to ${d.name}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Day Lectures Stack */}
                <div className="p-3 space-y-2.5 flex-1 min-h-[220px]">
                  {dayLectures.length === 0 ? (
                    <div className="h-full flex items-center justify-center p-4 text-center">
                      <p className="text-[11px] text-neutral-400 italic">No classes</p>
                    </div>
                  ) : (
                    dayLectures.map((lec) => {
                      const sub = getSubject(lec.subjectId);
                      return (
                        <div
                          key={lec.id}
                          className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 hover:border-neutral-300 dark:hover:border-neutral-700 transition relative group"
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span
                              className="text-[11px] font-bold font-mono-code truncate"
                              style={{ color: sub?.accentColor || '#10b981' }}
                            >
                              {sub?.code || 'COURSE'}
                            </span>
                            <span
                              className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                lec.type === 'self_study'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/60 font-bold'
                                  : 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                              }`}
                            >
                              {lec.type === 'self_study' ? 'Self Study' : lec.type}
                            </span>
                          </div>

                          <div className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                            {sub?.name}
                          </div>

                          <div className="mt-2 text-[11px] font-mono-code font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-neutral-400" />
                            <span>
                              {lec.startTime} – {lec.endTime}
                            </span>
                          </div>

                          <div className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-1 truncate">
                            <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                            <span className="truncate">{lec.room}</span>
                          </div>

                          {/* Hover Edit / Delete actions */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex items-center gap-1 bg-white/90 dark:bg-neutral-800/90 rounded-md p-0.5 shadow-xs">
                            <button
                              onClick={() => openEditModal(lec)}
                              className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                              title="Edit"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onDeleteLecture(lec.id)}
                              className="p-1 text-neutral-400 hover:text-rose-500"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DAY-BY-DAY VIEW */}
      {viewMode === 'day' && (
        <div className="space-y-4">
          {/* Day Selector Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {DAYS.map((d) => (
              <button
                key={d.day}
                onClick={() => setActiveDay(d.day)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  activeDay === d.day
                    ? 'bg-neutral-900 text-white dark:bg-amber-500 dark:text-neutral-950'
                    : 'bg-white dark:bg-[#121620] text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800'
                }`}
              >
                {d.name} {currentDayOfWeek === d.day && '(Today)'}
              </button>
            ))}
          </div>

          {/* Active Day Slots */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121620] p-6 shadow-2xs space-y-4">
            {lectures.filter((l) => l.dayOfWeek === activeDay).length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  No classes scheduled for {DAYS.find((d) => d.day === activeDay)?.name}.
                </p>
                <button
                  onClick={() => openNewModal(activeDay)}
                  className="mt-3 px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950"
                >
                  + Add class to this day
                </button>
              </div>
            ) : (
              lectures
                .filter((l) => l.dayOfWeek === activeDay)
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((lec) => {
                  const sub = getSubject(lec.subjectId);
                  return (
                    <div
                      key={lec.id}
                      className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div
                          className="w-3 h-12 rounded-full shrink-0"
                          style={{ backgroundColor: sub?.accentColor || '#10b981' }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-mono-code text-neutral-900 dark:text-white">
                              {sub?.code}
                            </span>
                            <span
                              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                lec.type === 'self_study'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/60 font-bold'
                                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                              }`}
                            >
                              {lec.type === 'self_study' ? 'Self Study 💡' : lec.type}
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                            {sub?.name}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {lec.room} {lec.building && `(${lec.building})`}
                            </span>
                            {sub?.instructor && (
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                {sub.instructor}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-200 dark:border-neutral-800">
                        <div className="text-right">
                          <div className="text-sm font-mono-code font-bold text-neutral-900 dark:text-white">
                            {lec.startTime} – {lec.endTime}
                          </div>
                          <button
                            onClick={() => onStartTimerWithSubject(lec.subjectId)}
                            className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline font-medium mt-0.5"
                          >
                            Prepare for class →
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(lec)}
                            className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteLecture(lec.id)}
                            className="p-2 text-neutral-400 hover:text-rose-500 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Lecture Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121620] shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-neutral-900 dark:text-white">
                {editingLecture ? 'Edit Lecture Slot' : 'Add Class / Lecture Slot'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  Enrolled Course *
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Day of Week *
                  </label>
                  <select
                    value={formDayOfWeek}
                    onChange={(e) => setFormDayOfWeek(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none"
                  >
                    {DAYS.map((d) => (
                      <option key={d.day} value={d.day}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Format / Type *
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as LectureType)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="self_study">SELF STUDY Session 💡 (Dedicated Deep Work)</option>
                    <option value="lecture">Lecture (Classroom)</option>
                    <option value="lab">Lab Practical</option>
                    <option value="seminar">Seminar</option>
                    <option value="tutorial">Tutorial / Recitation</option>
                    <option value="office_hours">Office Hours</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Room / Hall *
                  </label>
                  <input
                    type="text"
                    required
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    placeholder="Turing 302"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Building
                  </label>
                  <input
                    type="text"
                    value={formBuilding}
                    onChange={(e) => setFormBuilding(e.target.value)}
                    placeholder="Engineering Wing"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  Notes / Links
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Zoom link, attendance requirement..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 font-semibold text-xs hover:bg-neutral-800 dark:hover:bg-amber-400 transition"
                >
                  {editingLecture ? 'Save Lecture' : 'Add to Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
