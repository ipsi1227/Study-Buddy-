import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Music,
  ExternalLink,
  Radio,
  Sliders,
  Check,
  Square,
} from 'lucide-react';
import { Subject, TimerMode, StudyLog } from '../types';
import { soundFx } from '../utils/audio';
import { BunnyBuddy } from './BunnyBuddy';

interface TimerViewProps {
  subjects: Subject[];
  selectedSubjectId: string;
  onSelectSubject: (id: string) => void;
  onLogStudySession: (log: StudyLog) => void;
  studyLogs: StudyLog[];
  onTimerStateChange?: (isRunning: boolean, formattedTime: string) => void;
}

interface SoothingTrack {
  id: string;
  name: string;
  type: 'ambient' | 'youtube' | 'spotify';
  genre: string;
  url?: string;
  embedUrl?: string;
}

const SOOTHING_PLAYLIST: SoothingTrack[] = [
  {
    id: 'ambient-rain',
    name: 'Monsoon Study Rain & Warm Library (Default)',
    type: 'ambient',
    genre: 'Calm Rain',
  },
  {
    id: 'yt-lofi',
    name: 'Lofi Girl - Relaxing Beats to Study/Code to',
    type: 'youtube',
    genre: 'Lofi Chill',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    embedUrl: 'https://www.youtube-nocookie.com/embed/jfKfPfyJRdk?autoplay=1',
  },
  {
    id: 'yt-flute',
    name: 'Indian Classical Bansuri Flute for Deep Coding & Focus',
    type: 'youtube',
    genre: 'Classical Bansuri',
    url: 'https://www.youtube.com/watch?v=BqB3_XQjNzs',
    embedUrl: 'https://www.youtube-nocookie.com/embed/BqB3_XQjNzs?autoplay=1',
  },
  {
    id: 'spotify-focus',
    name: 'Deep Focus & Brain Food (Spotify)',
    type: 'spotify',
    genre: 'Electronic Ambient',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0',
  },
  {
    id: 'spotify-lofi',
    name: 'Late Night Coding Lofi Beats (Spotify)',
    type: 'spotify',
    genre: 'Chilled Hip Hop',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM?utm_source=generator&theme=0',
  },
];

export const TimerView: React.FC<TimerViewProps> = ({
  subjects,
  selectedSubjectId,
  onSelectSubject,
  onLogStudySession,
  studyLogs,
  onTimerStateChange,
}) => {
  // Mode: 'countdown' or 'free'
  const [timerType, setTimerType] = useState<'countdown' | 'free'>('countdown');
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [isRunning, setIsRunning] = useState(false);

  // Time counters
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notes, setNotes] = useState('');
  const [logSuccessToast, setLogSuccessToast] = useState(false);

  // Audio state - default to Monsoon Rain
  const [isMusicActive, setIsMusicActive] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<SoothingTrack>(SOOTHING_PLAYLIST[0]);
  const [rainVolume, setRainVolume] = useState(0.08);
  const [showMusicDrawer, setShowMusicDrawer] = useState(false);
  const [customLinkInput, setCustomLinkInput] = useState('');

  const timerRef = useRef<number | null>(null);

  const getSubject = (id: string) => subjects.find((s) => s.id === id);
  const activeSubject = getSubject(selectedSubjectId) || subjects[0];

  // Switch between Free Focus and Choose Duration Countdown
  const handleSelectTimerType = (type: 'free' | 'countdown') => {
    stopTimer();
    setTimerType(type);
    if (type === 'free') {
      setMode('stopwatch');
    } else {
      setMode('pomodoro');
      setSecondsLeft(customMinutes * 60);
    }
  };

  // Switch countdown sub-modes
  const switchMode = (newMode: TimerMode) => {
    stopTimer();
    setMode(newMode);
    if (newMode === 'pomodoro') {
      setTimerType('countdown');
      setSecondsLeft(25 * 60);
      setCustomMinutes(25);
    } else if (newMode === 'shortBreak') {
      setTimerType('countdown');
      setSecondsLeft(5 * 60);
      setCustomMinutes(5);
    } else if (newMode === 'longBreak') {
      setTimerType('countdown');
      setSecondsLeft(15 * 60);
      setCustomMinutes(15);
    } else {
      setTimerType('free');
    }
  };

  // Dedicated Stop Timer & Silence Music method
  // "as soon as i click on stop in tht timer then i want the music to stop too"
  const stopTimer = () => {
    setIsRunning(false);
    soundFx.toggleAmbientFocus(false);
    setIsMusicActive(false);
  };

  // Timer Tick Engine
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        if (timerType === 'free' || mode === 'stopwatch') {
          setStopwatchSeconds((prev) => prev + 1);
        } else {
          setSecondsLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current!);
              setIsRunning(false);
              soundFx.toggleAmbientFocus(false);
              setIsMusicActive(false);
              soundFx.playCompletionBell();

              if (activeSubject) {
                onLogStudySession({
                  id: `log-${Date.now()}`,
                  subjectId: activeSubject.id,
                  durationMinutes: customMinutes,
                  timestamp: new Date().toISOString(),
                  mode: mode,
                  notes: notes || 'Completed study session',
                });
                setLogSuccessToast(true);
                setTimeout(() => setLogSuccessToast(false), 3500);
              }
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timerType, mode, customMinutes, activeSubject, notes, onLogStudySession]);

  // Notify parent state change
  useEffect(() => {
    const formatted =
      timerType === 'free'
        ? formatHoursMinsSecs(stopwatchSeconds)
        : formatHoursMinsSecs(secondsLeft);
    onTimerStateChange?.(isRunning, formatted);
  }, [isRunning, stopwatchSeconds, secondsLeft, timerType, onTimerStateChange]);

  // Start / Pause toggle
  const toggleTimer = () => {
    soundFx.playTick();
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);

    if (nextRunning) {
      // Auto-start soothing rain sound if starting
      soundFx.toggleAmbientFocus(true, rainVolume);
      setIsMusicActive(true);
      if (!selectedTrack) setSelectedTrack(SOOTHING_PLAYLIST[0]);
    } else {
      // Stop timer also stops music!
      stopTimer();
    }
  };

  const resetTimer = () => {
    stopTimer();
    if (timerType === 'free') {
      setStopwatchSeconds(0);
    } else {
      setSecondsLeft(customMinutes * 60);
    }
  };

  // Log session for Free Focus
  const handleLogFreeSession = () => {
    const minutes = Math.max(1, Math.round(stopwatchSeconds / 60));
    if (activeSubject) {
      onLogStudySession({
        id: `log-${Date.now()}`,
        subjectId: activeSubject.id,
        durationMinutes: minutes,
        timestamp: new Date().toISOString(),
        mode: 'stopwatch',
        notes: notes || `Free-fledged focus session (${minutes}m)`,
      });
      setStopwatchSeconds(0);
      stopTimer();
      soundFx.playCompletionBell();
      setLogSuccessToast(true);
      setTimeout(() => setLogSuccessToast(false), 3500);
    }
  };

  // Toggle or switch music
  const toggleSoothingMusic = (track?: SoothingTrack) => {
    const target = track || selectedTrack;
    if (target.type === 'ambient') {
      const nextState = !isMusicActive;
      soundFx.toggleAmbientFocus(nextState, rainVolume);
      setIsMusicActive(nextState);
    } else {
      setIsMusicActive(!isMusicActive);
      soundFx.toggleAmbientFocus(false);
    }
  };

  const handleSelectTrack = (track: SoothingTrack) => {
    setSelectedTrack(track);
    if (track.type === 'ambient') {
      soundFx.toggleAmbientFocus(true, rainVolume);
      setIsMusicActive(true);
    } else {
      soundFx.toggleAmbientFocus(false);
      setIsMusicActive(true);
    }
  };

  const handleApplyCustomLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLinkInput.trim()) return;

    let embed = '';
    const val = customLinkInput.trim();
    if (val.includes('spotify.com')) {
      embed = val.replace('/playlist/', '/embed/playlist/').replace('/track/', '/embed/track/');
    } else if (val.includes('youtube.com/watch?v=')) {
      const vidId = val.split('v=')[1]?.split('&')[0];
      embed = `https://www.youtube-nocookie.com/embed/${vidId}?autoplay=1`;
    } else if (val.includes('youtu.be/')) {
      const vidId = val.split('youtu.be/')[1]?.split('?')[0];
      embed = `https://www.youtube-nocookie.com/embed/${vidId}?autoplay=1`;
    }

    if (embed) {
      const newTrack: SoothingTrack = {
        id: `custom-${Date.now()}`,
        name: 'Custom Study Stream',
        type: val.includes('spotify.com') ? 'spotify' : 'youtube',
        genre: 'User Linked Audio',
        embedUrl: embed,
        url: val,
      };
      setSelectedTrack(newTrack);
      setIsMusicActive(true);
      soundFx.toggleAmbientFocus(false);
      setCustomLinkInput('');
    }
  };

  const formatHoursMinsSecs = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const todayMinutes = studyLogs
    .filter((l) => new Date(l.timestamp).toDateString() === new Date().toDateString())
    .reduce((sum, l) => sum + l.durationMinutes, 0);

  return (
    <div
      className={`space-y-6 animate-fadeIn ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#0c0e14] text-white flex flex-col justify-center items-center p-8'
          : ''
      }`}
    >
      {/* Header (when not fullscreen) */}
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono-code">
                STUDY BUDDY Chamber
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                Free-Fledge Timer & Rain Audio
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold text-neutral-900 dark:text-white mt-0.5">
              Focus Timer & Soothing Ambient Rain
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Study at your own pace without fixed limits, guided by calming monsoon rain or linked Spotify/YouTube tracks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle & Drawer Button */}
            <button
              onClick={() => setShowMusicDrawer(!showMusicDrawer)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${
                isMusicActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white dark:bg-[#131620] text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100'
              }`}
            >
              {isMusicActive ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
              <span>{isMusicActive ? `Playing: ${selectedTrack.genre}` : 'Audio Controls'}</span>
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#131620] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
              title="Full screen distraction-free mode"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SOOTHING MUSIC DRAWER */}
      {showMusicDrawer && (
        <div className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-gradient-to-r from-blue-50/80 via-white to-emerald-50/80 dark:from-blue-950/30 dark:via-[#131620] dark:to-emerald-950/20 p-5 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Soothing Study Sounds
                </h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Defaults to gentle monsoon rain on focus start. You can change tracks or link YouTube/Spotify anytime.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Rain volume slider if ambient rain */}
              {selectedTrack.type === 'ambient' && isMusicActive && (
                <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                  <Sliders className="w-3.5 h-3.5" />
                  <input
                    type="range"
                    min="0.01"
                    max="0.25"
                    step="0.01"
                    value={rainVolume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setRainVolume(v);
                      soundFx.toggleAmbientFocus(true, v);
                    }}
                    className="w-20 accent-blue-600"
                    title="Rain sound volume"
                  />
                </div>
              )}

              <button
                onClick={() => toggleSoothingMusic()}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isMusicActive
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isMusicActive ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isMusicActive ? 'Mute Sound' : 'Play Soothing Sound'}</span>
              </button>
            </div>
          </div>

          {/* Sound Presets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {SOOTHING_PLAYLIST.map((track) => (
              <button
                key={track.id}
                onClick={() => handleSelectTrack(track)}
                className={`p-3 rounded-xl border text-left transition flex items-start justify-between gap-2 ${
                  selectedTrack.id === track.id && isMusicActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 font-semibold ring-1 ring-blue-500'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 text-neutral-700 dark:text-neutral-300 hover:border-blue-300'
                }`}
              >
                <div>
                  <div className="text-[10px] uppercase font-bold font-mono-code text-blue-600 dark:text-blue-400">
                    {track.genre}
                  </div>
                  <div className="text-xs truncate max-w-[200px] font-medium">{track.name}</div>
                </div>
                {track.url && (
                  <a
                    href={track.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 p-0.5"
                    title="Open stream"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </button>
            ))}
          </div>

          {/* Custom Link to YouTube / Spotify */}
          <form onSubmit={handleApplyCustomLink} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={customLinkInput}
              onChange={(e) => setCustomLinkInput(e.target.value)}
              placeholder="Paste custom YouTube video URL or Spotify playlist link..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 shadow-xs"
            >
              Link Stream
            </button>
          </form>

          {/* Embedded player if YouTube / Spotify active */}
          {isMusicActive && selectedTrack.embedUrl && (
            <div className="pt-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Active External Stream: {selectedTrack.name}
              </div>
              <iframe
                src={selectedTrack.embedUrl}
                title="Soothing Study Audio"
                className="w-full h-24 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs"
                allow="autoplay; encrypted-media"
              />
            </div>
          )}
        </div>
      )}

      {/* Success Toast */}
      {logSuccessToast && (
        <div className="p-3.5 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-md flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Awesome job! Study session logged successfully to your CSE profile.</span>
          </div>
          <span className="font-mono-code text-xs bg-white/20 px-2 py-0.5 rounded">
            +Self Study
          </span>
        </div>
      )}

      {/* MAIN TIMER CARD WITH BUNNY MASCOT */}
      <div
        className={`rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#131620] p-6 sm:p-10 shadow-sm relative overflow-hidden ${
          isFullscreen ? 'w-full max-w-2xl bg-[#0c0e14] border-neutral-800' : ''
        }`}
      >
        {isFullscreen && (
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 p-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white transition"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        )}

        {/* Mode Selector Tabs: Choose Duration Timer vs Free-Fledge */}
        <div className="flex flex-col items-center justify-center mb-6 gap-3">
          <div className="inline-flex rounded-xl p-1 bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 flex-wrap justify-center">
            <button
              onClick={() => handleSelectTimerType('countdown')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                timerType === 'countdown' && mode === 'pomodoro'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Choose Duration Timer</span>
            </button>

            <button
              onClick={() => handleSelectTimerType('free')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                timerType === 'free'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free Focus (Open-Ended / No Limit)</span>
            </button>

            <button
              onClick={() => switchMode('shortBreak')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                mode === 'shortBreak'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Chai Break (5m)
            </button>

            <button
              onClick={() => switchMode('longBreak')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                mode === 'longBreak'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Long Break (15m)
            </button>
          </div>

          {/* Duration Selector for Countdown Mode */}
          {timerType === 'countdown' && (
            <div className="w-full max-w-xl p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 animate-fadeIn flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 font-mono-code">
                  Choose Time:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[15, 20, 25, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        if (!isRunning) {
                          setCustomMinutes(mins);
                          setSecondsLeft(mins * 60);
                          soundFx.playTick();
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition font-mono-code ${
                        customMinutes === mins
                          ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-400'
                          : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-blue-400'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-neutral-400">Custom:</span>
                <input
                  type="number"
                  min={1}
                  max={240}
                  value={customMinutes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val > 0 && val <= 300) {
                      setCustomMinutes(val);
                      if (!isRunning) setSecondsLeft(val * 60);
                    }
                  }}
                  className="w-16 px-2 py-1 text-xs font-mono-code rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-bold text-center"
                />
                <span className="text-[11px] text-neutral-400 font-mono-code">mins</span>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Bunny Mascot Near Timer + Display */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 my-4">
          {/* Bunny Mascot Right Near the Timer as requested */}
          <div className="flex flex-col items-center justify-center">
            <BunnyBuddy
              mood={isRunning ? 'listening' : stopwatchSeconds > 0 ? 'study' : 'study'}
              size="xl"
              showSpeech={true}
              speechText={
                isRunning
                  ? "In deep focus! I'm timing you 🐾"
                  : stopwatchSeconds > 0
                  ? 'Taking a breather? 🐰'
                  : 'Click Start to begin free focus! 🌿'
              }
            />
            <span className="mt-2 text-xs font-bold text-neutral-600 dark:text-neutral-400 font-display">
              Study Buddy Bunny
            </span>
          </div>

          {/* Time Display Circle */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="115"
                className="stroke-neutral-200 dark:stroke-neutral-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="50%"
                cy="50%"
                r="115"
                className={`transition-all duration-700 ${
                  isRunning ? 'stroke-blue-600 dark:stroke-blue-500' : 'stroke-neutral-300 dark:stroke-neutral-700'
                }`}
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 115}
                strokeDashoffset={
                  timerType === 'free'
                    ? 0
                    : ((customMinutes * 60 - secondsLeft) / (customMinutes * 60)) * (2 * Math.PI * 115)
                }
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <span className="font-display text-4xl sm:text-5xl font-bold tracking-tight font-mono-code text-neutral-900 dark:text-white">
                {timerType === 'free'
                  ? formatHoursMinsSecs(stopwatchSeconds)
                  : formatHoursMinsSecs(secondsLeft)}
              </span>

              <div className="mt-2">
                <span className="text-[11px] uppercase tracking-widest font-bold font-mono-code px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
                  {timerType === 'free'
                    ? isRunning
                      ? 'Free Focus Active'
                      : 'Free Focus Paused'
                    : isRunning
                    ? 'Countdown Active'
                    : 'Sprint Paused'}
                </span>
              </div>

              {/* Soothing Sound Active Badge */}
              {isMusicActive && (
                <span className="mt-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>🌧️ Rain Audio On</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Assigned Subject Picker */}
        <div className="max-w-md mx-auto my-5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
            Credit Focus Hours To Subject:
          </label>
          <div className="flex justify-center flex-wrap gap-2">
            {subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectSubject(s.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeSubject?.id === s.id
                    ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: s.accentColor }}
                />
                <span>{s.code}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <button
            onClick={resetTimer}
            className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            title="Reset timer and stop music"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className={`px-8 py-3.5 rounded-2xl font-display font-bold text-sm text-white shadow-md transition flex items-center gap-2 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Pause (Stops Music)</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>
                  {timerType === 'free' ? 'Start Free Focus (Plays Rain)' : `Start ${customMinutes}m Focus (Plays Rain)`}
                </span>
              </>
            )}
          </button>

          {/* Explicit STOP button: halts timer and silences music */}
          {isRunning && (
            <button
              onClick={stopTimer}
              className="px-5 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md transition flex items-center gap-2 animate-fadeIn"
              title="Stop timer and immediately stop music"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Stop & Silence</span>
            </button>
          )}

          {/* If in free focus and seconds > 30, allow finishing and logging session */}
          {timerType === 'free' && stopwatchSeconds >= 30 && (
            <button
              onClick={handleLogFreeSession}
              className="px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Finish & Log ({Math.round(stopwatchSeconds / 60)}m)</span>
            </button>
          )}
        </div>
      </div>

      {/* Focus History & Stats without Streaks */}
      {!isFullscreen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#131620] p-5 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono-code">
              Today's Self-Study
            </span>
            <div className="text-3xl font-display font-bold text-neutral-900 dark:text-white mt-1">
              {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Total focus time logged across your CSE subjects today.
            </p>
          </div>

          <div className="md:col-span-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#131620] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Recent Focus Sessions
              </span>
              <span className="text-xs text-neutral-400 font-mono-code">
                {studyLogs.length} total logged
              </span>
            </div>

            {studyLogs.length === 0 ? (
              <p className="text-xs text-neutral-400 italic py-4 text-center">
                No focus logs yet. Start your free timer and click Finish to log hours!
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {studyLogs.slice(0, 4).map((log) => {
                  const sub = getSubject(log.subjectId);
                  return (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/40 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: sub?.accentColor || '#3b82f6' }}
                        />
                        <span className="font-bold font-mono-code text-neutral-900 dark:text-white">
                          {sub?.code || 'CSE'}
                        </span>
                        <span className="text-neutral-500 truncate max-w-xs">{log.notes}</span>
                      </div>

                      <div className="text-right font-mono-code font-bold text-emerald-600 dark:text-emerald-400">
                        +{log.durationMinutes} min
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
