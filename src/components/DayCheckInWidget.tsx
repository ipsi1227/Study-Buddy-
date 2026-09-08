import React, { useState } from 'react';
import { Sparkles, CheckCircle2, RefreshCw, Send, ArrowRight, Sun, Moon } from 'lucide-react';
import { BunnyBuddy } from './BunnyBuddy';
import { StudentProfile } from '../types';

interface DayCheckInWidgetProps {
  profile: StudentProfile;
  onUpdateCheckIn: (checkIn: { date: string; mood: string; energy: string; note?: string }) => void;
  onStartFocus: () => void;
  urgentCount: number;
}

const MOOD_OPTIONS = [
  { id: 'energetic', label: 'High Energy & Ready', emoji: '⚡', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
  { id: 'lectures', label: 'Long Day of Lectures', emoji: '📚', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30' },
  { id: 'tired', label: 'A Bit Tired / Need Light Work', emoji: '😴', color: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30' },
  { id: 'urgent_mode', label: 'Crushing Urgent Deadlines', emoji: '🎯', color: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30' },
];

export const DayCheckInWidget: React.FC<DayCheckInWidgetProps> = ({
  profile,
  onUpdateCheckIn,
  onStartFocus,
  urgentCount,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const existingCheckIn = profile.dayCheckIn?.date === todayStr ? profile.dayCheckIn : null;

  const [selectedMood, setSelectedMood] = useState<string>(existingCheckIn?.mood || 'energetic');
  const [dayNote, setDayNote] = useState<string>(existingCheckIn?.note || '');
  const [isEditing, setIsEditing] = useState<boolean>(!existingCheckIn);
  const [justSaved, setJustSaved] = useState<boolean>(false);

  const handleSaveCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const moodObj = MOOD_OPTIONS.find((m) => m.id === selectedMood) || MOOD_OPTIONS[0];
    onUpdateCheckIn({
      date: todayStr,
      mood: selectedMood,
      energy: moodObj.label,
      note: dayNote.trim() || undefined,
    });
    setIsEditing(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 3000);
  };

  const getBunnyAdvice = () => {
    if (selectedMood === 'urgent_mode' || urgentCount > 0) {
      return `You have ${urgentCount} urgent item(s) highlighted in red. Let's put on the soothing rain sounds, turn off all distractions, and conquer them first! 🐾`;
    }
    if (selectedMood === 'tired') {
      return "You've had a demanding day! Let's do a relaxed 20-minute open-ended self-study with calming rain audio, review concise notes, and call it an early night. 🐰";
    }
    if (selectedMood === 'lectures') {
      return 'Great job getting through all those college lectures! Convert your lecture scribbles into concise notes in the Make Notes tab so it sticks for midsems. 💡';
    }
    return 'Awesome energy today! Your 10-CGPA self-study momentum is looking unstoppable. Grab your water, start your free focus timer, and let’s crush it! 🚀';
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#131620] border-2 border-blue-500/30 dark:border-blue-500/20 p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Side: Bunny & Question */}
        <div className="flex items-start sm:items-center gap-3.5">
          <BunnyBuddy
            mood={selectedMood === 'urgent_mode' ? 'alert' : selectedMood === 'tired' ? 'study' : 'listening'}
            size="md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono-code">
                Daily Study Check-In
              </span>
              {existingCheckIn && !isEditing && (
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Checked In for Today
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white font-display mt-0.5">
              How was your day, {profile.name.split(' ')[0]}? Let's get started!
            </h2>
          </div>
        </div>

        {/* Right Action: Edit or Start Focus */}
        {!isEditing && (
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Update Check-In</span>
            </button>
            <button
              onClick={onStartFocus}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <span>Start Free Focus</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Form or Result */}
      {isEditing ? (
        <form onSubmit={handleSaveCheckIn} className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-4 animate-fadeIn">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              How are you feeling right now?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MOOD_OPTIONS.map((mood) => {
                const isSelected = selectedMood === mood.id;
                return (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => setSelectedMood(mood.id)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold border text-left transition flex items-center gap-2 ${
                      isSelected
                        ? `${mood.color} ring-2 ring-blue-500`
                        : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-base select-none">{mood.emoji}</span>
                    <span className="truncate">{mood.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={dayNote}
              onChange={(e) => setDayNote(e.target.value)}
              placeholder="What happened today or what do you want to conquer tonight? (optional)"
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Let's Get Started 🐾</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-3.5 pt-3.5 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/50 dark:border-blue-900/50">
              {MOOD_OPTIONS.find((m) => m.id === selectedMood)?.emoji} {profile.dayCheckIn?.energy || 'Ready to Study'}
            </span>
            {profile.dayCheckIn?.note && (
              <span className="italic text-neutral-600 dark:text-neutral-400">
                "{profile.dayCheckIn.note}"
              </span>
            )}
          </div>

          <p className="text-xs font-medium text-blue-800 dark:text-blue-300 bg-blue-50/70 dark:bg-blue-950/30 px-3 py-1.5 rounded-xl border border-blue-200/50 dark:border-blue-900/30">
            {getBunnyAdvice()}
          </p>
        </div>
      )}
    </div>
  );
};
