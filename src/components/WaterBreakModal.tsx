import React, { useState } from 'react';
import {
  Droplets,
  CheckCircle2,
  Clock,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Heart,
  Coffee,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BunnyBuddy } from './BunnyBuddy';
import { soundFx } from '../utils/audio';

interface WaterBreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  glassesCount: number;
  onLogWater: () => void;
  intervalMinutes: number;
  onChangeInterval: (mins: number) => void;
  onSnooze: (mins: number) => void;
}

export const WaterBreakModal: React.FC<WaterBreakModalProps> = ({
  isOpen,
  onClose,
  glassesCount,
  onLogWater,
  intervalMinutes,
  onChangeInterval,
  onSnooze,
}) => {
  const [justLogged, setJustLogged] = useState(false);

  if (!isOpen) return null;

  const handleDrankWater = () => {
    onLogWater();
    soundFx.playSuccess();
    setJustLogged(true);

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#0284c7', '#60a5fa', '#93c5fd'],
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      setJustLogged(false);
      onClose();
    }, 1200);
  };

  const handleSnooze = (mins: number) => {
    soundFx.playTick();
    onSnooze(mins);
    onClose();
  };

  return (
    <div
      id="water-break-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md rounded-3xl border border-sky-200 dark:border-sky-900/60 bg-white dark:bg-[#101726] shadow-2xl overflow-hidden">
        {/* Sky gradient header banner */}
        <div className="relative bg-gradient-to-r from-sky-500 via-blue-500 to-teal-500 p-6 text-white overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-inner">
                <Droplets className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full font-mono-code">
                  15–20 Min Hydration Check
                </span>
                <h2 className="text-xl font-display font-bold text-white mt-0.5">
                  Have You Taken a Water Break? 💧
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-xl bg-white/15 hover:bg-white/30 text-white transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Bunny mascot advice */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50">
            <BunnyBuddy mood="happy" size="md" showSpeech={false} />
            <div className="text-xs text-sky-900 dark:text-sky-200 leading-relaxed">
              <span className="font-bold">Bunny Buddy says:</span> You've been focusing for{' '}
              <span className="font-bold underline text-sky-700 dark:text-sky-300">
                {intervalMinutes} minutes
              </span>
              ! Taking a 30-second water break replenishes brain oxygen, boosts recall for exams, and avoids headaches.
            </div>
          </div>

          {/* Daily Glasses Tracker */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50 dark:bg-neutral-900/60">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-neutral-600 dark:text-neutral-300">
                Today's Water Goal
              </span>
              <span className="font-mono-code font-bold text-sky-600 dark:text-sky-400">
                {glassesCount} / 8 Glasses
              </span>
            </div>
            {/* Visual droplets bar */}
            <div className="grid grid-cols-8 gap-1.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-7 rounded-lg flex items-center justify-center transition-all ${
                    i < glassesCount
                      ? 'bg-sky-500 text-white shadow-xs scale-105'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400'
                  }`}
                  title={`Glass ${i + 1}`}
                >
                  <Droplets className={`w-3.5 h-3.5 ${i < glassesCount ? 'fill-white' : ''}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Interval Selector (15m vs 20m) */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Remind me every:</span>
            </span>
            <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
              <button
                onClick={() => onChangeInterval(15)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  intervalMinutes === 15
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                15 Mins
              </button>
              <button
                onClick={() => onChangeInterval(20)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  intervalMinutes === 20
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                20 Mins
              </button>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              id="water-confirm-drank-button"
              onClick={handleDrankWater}
              disabled={justLogged}
              className="w-full py-3.5 px-4 rounded-2xl bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white font-display font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              {justLogged ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Hydrated! Logged +1 Glass 💧</span>
                </>
              ) : (
                <>
                  <Droplets className="w-4 h-4 fill-white" />
                  <span>Yes, Just Drank Water! (+1 Glass)</span>
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSnooze(5)}
                className="py-2.5 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold text-xs transition"
              >
                Snooze 5 Mins ⏳
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold text-xs transition"
              >
                Dismiss for Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
