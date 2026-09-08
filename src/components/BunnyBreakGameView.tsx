import React, { useState, useEffect, useRef } from 'react';
import {
  Gamepad2,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Coffee,
  CheckCircle2,
  Play,
  Pause,
  Trophy,
  Lock,
  Unlock,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../utils/audio';
import { BunnyBuddy } from './BunnyBuddy';

interface BunnyBreakGameViewProps {
  onBackToStudy?: () => void;
  onNavigateToStudy?: () => void;
  onNavigateToNotes?: () => void;
  onNavigateToTodos?: () => void;
  isUnlocked?: boolean;
  maxFocusMinutesCompleted?: number;
  onUnlockManually?: () => void;
  onStart60MinFocus?: () => void;
}

export const BunnyBreakGameView: React.FC<BunnyBreakGameViewProps> = ({
  onBackToStudy,
  onNavigateToStudy,
  onNavigateToNotes,
  onNavigateToTodos,
  isUnlocked = false,
  maxFocusMinutesCompleted = 0,
  onUnlockManually,
  onStart60MinFocus,
}) => {
  // Break session duration selector (2 to 5 mins strictly!)
  const [breakMinutes, setBreakMinutes] = useState<number>(3);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(3 * 60);
  const [isBreakActive, setIsBreakActive] = useState<boolean>(false);
  const [isBreakCompleted, setIsBreakCompleted] = useState<boolean>(false);

  // Game state
  const [score, setScore] = useState(0);
  const [carrotsCollected, setCarrotsCollected] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('bunny_game_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const breakTimerRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Game internal variables
  const gameStateRef = useRef({
    bunnyY: 180,
    bunnyVY: 0,
    isGrounded: true,
    jumpsAvailable: 2,
    carrots: [] as { x: number; y: number; collected: boolean; rotation: number }[],
    obstacles: [] as { x: number; width: number; height: number; type: 'rock' | 'puddle' }[],
    groundOffset: 0,
    clouds: [
      { x: 50, y: 30, speed: 0.3, size: 40 },
      { x: 260, y: 55, speed: 0.45, size: 55 },
      { x: 480, y: 25, speed: 0.25, size: 35 },
    ],
    gameSpeed: 3.5,
    frameCount: 0,
  });

  // Handle Break Duration Selection
  const handleSelectDuration = (mins: number) => {
    if (isBreakActive) return;
    setBreakMinutes(mins);
    setSecondsRemaining(mins * 60);
    setIsBreakCompleted(false);
  };

  // Start Break Session
  const handleStartBreak = () => {
    setIsBreakActive(true);
    setIsBreakCompleted(false);
    soundFx.playTick();
  };

  // Pause Break
  const handlePauseBreak = () => {
    setIsBreakActive(false);
  };

  // Reset Break Session
  const handleResetBreak = () => {
    setIsBreakActive(false);
    setSecondsRemaining(breakMinutes * 60);
    setIsBreakCompleted(false);
    setScore(0);
    setCarrotsCollected(0);
  };

  // Break Countdown Timer (Stops completely when timer hits 0)
  useEffect(() => {
    if (isBreakActive && secondsRemaining > 0) {
      breakTimerRef.current = window.setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(breakTimerRef.current!);
            setIsBreakActive(false);
            setIsBreakCompleted(true);
            soundFx.playCompletionBell();
            try {
              confetti({
                particleCount: 75,
                spread: 70,
                origin: { y: 0.6 },
              });
            } catch {
              // ignore
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (breakTimerRef.current) clearInterval(breakTimerRef.current);
    }

    return () => {
      if (breakTimerRef.current) clearInterval(breakTimerRef.current);
    };
  }, [isBreakActive, secondsRemaining]);

  // Jump trigger
  const triggerJump = () => {
    if (!isBreakActive || isBreakCompleted) return;
    const s = gameStateRef.current;
    if (s.jumpsAvailable > 0) {
      s.bunnyVY = -9.2;
      s.isGrounded = false;
      s.jumpsAvailable -= 1;
      soundFx.playTick();
    }
  };

  // Listen to keyboard for jump
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        triggerJump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBreakActive, isBreakCompleted]);

  // Save High Score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem('bunny_game_highscore', score.toString());
      } catch {
        // ignore
      }
    }
  }, [score, highScore]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const state = gameStateRef.current;
      const width = canvas.width;
      const height = canvas.height;
      const groundY = height - 55;

      // Update positions if game is actively running
      if (isBreakActive && !isBreakCompleted) {
        state.frameCount += 1;

        // Apply physics
        state.bunnyY += state.bunnyVY;
        state.bunnyVY += 0.48; // Gravity

        if (state.bunnyY >= groundY - 32) {
          state.bunnyY = groundY - 32;
          state.bunnyVY = 0;
          state.isGrounded = true;
          state.jumpsAvailable = 2; // Allow double jump
        }

        // Spawn carrots
        if (state.frameCount % 90 === 0) {
          state.carrots.push({
            x: width + 20,
            y: groundY - 45 - Math.random() * 55,
            collected: false,
            rotation: 0,
          });
        }

        // Spawn obstacles
        if (state.frameCount % 170 === 0) {
          state.obstacles.push({
            x: width + 30,
            width: 22,
            height: 20,
            type: Math.random() > 0.5 ? 'rock' : 'puddle',
          });
        }

        // Move carrots
        state.carrots.forEach((c) => {
          c.x -= state.gameSpeed;
          c.rotation += 0.04;

          // Collision detection with bunny (bunny at x=80, y=state.bunnyY)
          const bx = 80;
          const by = state.bunnyY;
          if (!c.collected && Math.hypot(c.x - (bx + 16), c.y - (by + 16)) < 26) {
            c.collected = true;
            setScore((s) => s + 10);
            setCarrotsCollected((count) => count + 1);
            soundFx.playTick();
          }
        });

        // Move obstacles
        state.obstacles.forEach((o) => {
          o.x -= state.gameSpeed;
          // When safely cleared, bonus score
          if (Math.abs(o.x - 80) < state.gameSpeed / 2) {
            setScore((s) => s + 5);
          }
        });

        // Cleanup off-screen entities
        state.carrots = state.carrots.filter((c) => c.x > -40);
        state.obstacles = state.obstacles.filter((o) => o.x > -40);

        // Move ground & clouds
        state.groundOffset = (state.groundOffset + state.gameSpeed) % 40;
        state.clouds.forEach((cl) => {
          cl.x -= cl.speed;
          if (cl.x < -70) cl.x = width + 50;
        });
      }

      // DRAWING
      ctx.clearRect(0, 0, width, height);

      // 1. Sky Gradient
      const isDark = document.documentElement.classList.contains('dark');
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (isDark) {
        skyGrad.addColorStop(0, '#0f172a');
        skyGrad.addColorStop(1, '#1e293b');
      } else {
        skyGrad.addColorStop(0, '#e0f2fe');
        skyGrad.addColorStop(1, '#f0fdf4');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Floating Clouds
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)';
      state.clouds.forEach((cl) => {
        ctx.beginPath();
        ctx.arc(cl.x, cl.y, cl.size * 0.4, 0, Math.PI * 2);
        ctx.arc(cl.x + cl.size * 0.35, cl.y - cl.size * 0.1, cl.size * 0.45, 0, Math.PI * 2);
        ctx.arc(cl.x + cl.size * 0.7, cl.y, cl.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Rolling Background Hills
      ctx.fillStyle = isDark ? '#143826' : '#bbf7d0';
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.quadraticCurveTo(width * 0.25, groundY - 35, width * 0.5, groundY - 10);
      ctx.quadraticCurveTo(width * 0.75, groundY + 15, width, groundY - 25);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.fill();

      // 4. Ground
      ctx.fillStyle = isDark ? '#166534' : '#22c55e';
      ctx.fillRect(0, groundY, width, height - groundY);

      // Ground grass blades pattern
      ctx.fillStyle = isDark ? '#15803d' : '#16a34a';
      for (let gx = -state.groundOffset; gx < width; gx += 30) {
        ctx.beginPath();
        ctx.moveTo(gx, groundY);
        ctx.lineTo(gx + 6, groundY - 8);
        ctx.lineTo(gx + 12, groundY);
        ctx.fill();
      }

      // 5. Obstacles (puddle or garden stone)
      state.obstacles.forEach((o) => {
        if (o.type === 'rock') {
          ctx.fillStyle = isDark ? '#475569' : '#64748b';
          ctx.beginPath();
          ctx.ellipse(o.x + 10, groundY - 6, 12, 8, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = isDark ? '#1e3a8a' : '#60a5fa';
          ctx.beginPath();
          ctx.ellipse(o.x + 10, groundY - 2, 14, 4, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 6. Carrots
      state.carrots.forEach((c) => {
        if (c.collected) return;
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotation);

        // Orange Carrot body
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(7, 10);
        ctx.lineTo(-7, 10);
        ctx.closePath();
        ctx.fill();

        // Green Carrot top
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(-4, -16);
        ctx.lineTo(0, -13);
        ctx.lineTo(4, -16);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });

      // 7. Draw the Cute Bunny Mascot!
      const bx = 80;
      const by = state.bunnyY;

      ctx.save();
      ctx.translate(bx, by);

      // Bunny Body (White / soft cream)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(16, 20, 14, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bunny Head
      ctx.beginPath();
      ctx.arc(16, 10, 10, 0, Math.PI * 2);
      ctx.fill();

      // Bunny Ears (with inner pink)
      // Left ear
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(11, -2, 4, 10, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f472b6'; // pink inner
      ctx.beginPath();
      ctx.ellipse(11, -2, 2, 7, -0.15, 0, Math.PI * 2);
      ctx.fill();

      // Right ear
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(21, -2, 4, 10, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.ellipse(21, -2, 2, 7, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Eye
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(19, 9, 2, 0, Math.PI * 2);
      ctx.fill();

      // Pink Nose
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(24, 11, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Little Cotton Tail
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(1, 20, 4, 0, Math.PI * 2);
      ctx.fill();

      // Cute paws
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(12, 30, 4, 3, 0, 0, Math.PI * 2);
      ctx.ellipse(20, 30, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Loop animation
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isBreakActive, isBreakCompleted]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Locked Screen if User Has Not Completed a >60m Focus Session
  if (!isUnlocked) {
    const progressPercent = Math.min(100, Math.round(((maxFocusMinutesCompleted || 0) / 60) * 100));
    const minsNeeded = Math.max(0, 60 - (maxFocusMinutesCompleted || 0));

    return (
      <div className="max-w-2xl mx-auto my-8 p-6 sm:p-10 rounded-3xl border border-amber-200/80 dark:border-neutral-800 bg-white dark:bg-[#131620] shadow-xl text-center space-y-6">
        <div className="relative inline-block">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/15 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-700/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
            <Lock className="w-10 h-10 animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-2">
            <BunnyBuddy mood="study" size="sm" showSpeech={false} />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider font-mono-code px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
            Study Reward Locked 🔒
          </span>
          <h1 className="text-2xl font-display font-bold text-neutral-900 dark:text-white">
            Bunny Break Mini-Game is Locked
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
            Study Buddy rule: Complete any focus timer session of{' '}
            <strong className="text-neutral-900 dark:text-white font-bold">&gt; 60 minutes</strong> to
            unlock your 2–5 minute bunny break reward!
          </p>
        </div>

        {/* Focus Progress towards 60 minutes */}
        <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 max-w-md mx-auto text-left space-y-2.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-neutral-600 dark:text-neutral-300">Your Longest Focus Sprint</span>
            <span className="font-mono-code font-bold text-amber-600 dark:text-amber-400">
              {maxFocusMinutesCompleted || 0} / 60 Mins
            </span>
          </div>
          <div className="h-3 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
            <span>{minsNeeded > 0 ? `${minsNeeded} more minutes of deep focus needed` : 'Goal reached!'}</span>
            <span className="font-mono-code font-bold">{progressPercent}% unlocked</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              if (onStart60MinFocus) onStart60MinFocus();
              else if (onBackToStudy) onBackToStudy();
              else if (onNavigateToStudy) onNavigateToStudy();
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4" />
            <span>Start 60m Deep Focus Sprint ⏱️</span>
          </button>

          {onUnlockManually && (
            <button
              onClick={onUnlockManually}
              className="w-full sm:w-auto px-4 py-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-semibold transition flex items-center justify-center gap-1.5"
              title="Test mode / I studied offline"
            >
              <Unlock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Mark 60m Studied (Test Unlock)</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-3xl border border-emerald-200/70 dark:border-neutral-800 bg-white dark:bg-[#131620] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-display font-bold text-neutral-900 dark:text-white">
                  Bunny Break 🐰
                </h1>
                <span className="text-[10px] uppercase font-mono-code font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  Strict 2–5 Min Break Session
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Rest your eyes and refresh your mind between study sprints. The game automatically locks when your break time ends!
              </p>
            </div>
          </div>

          {/* Break Session Duration Picker (2 - 5 mins) */}
          <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800/80 p-1.5 rounded-2xl border border-neutral-200 dark:border-neutral-700">
            <span className="text-xs font-bold text-neutral-500 px-2 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Break Time:</span>
            </span>
            {[2, 3, 5].map((m) => (
              <button
                key={m}
                onClick={() => handleSelectDuration(m)}
                disabled={isBreakActive}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  breakMinutes === m
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-white/60 dark:hover:bg-neutral-700 disabled:opacity-50'
                }`}
              >
                {m} Mins
              </button>
            ))}
          </div>
        </div>

        {/* Live Break Countdown Timer Strip */}
        <div className="mt-5 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 font-mono-code">
                Break Session Remaining
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono-code font-bold text-3xl text-emerald-600 dark:text-emerald-400">
                  {formatTimer(secondsRemaining)}
                </span>
                <span className="text-xs text-neutral-500">
                  ({breakMinutes}m limit)
                </span>
              </div>
            </div>

            {/* Status badge */}
            <div className="hidden sm:block pl-4 border-l border-neutral-200 dark:border-neutral-800">
              {isBreakCompleted ? (
                <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Break Complete! Time to study.</span>
                </span>
              ) : isBreakActive ? (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Break in progress (relax!)</span>
                </span>
              ) : (
                <span className="text-xs text-neutral-400">
                  Press Start Break to play
                </span>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {!isBreakActive ? (
              <button
                onClick={handleStartBreak}
                disabled={isBreakCompleted}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                <span>{secondsRemaining < breakMinutes * 60 ? 'Resume Break' : 'Start Break Game'}</span>
              </button>
            ) : (
              <button
                onClick={handlePauseBreak}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition flex items-center gap-2"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={handleResetBreak}
              className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              title="Reset Break Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Quick Exit to Study */}
            <button
              onClick={onNavigateToStudy}
              className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800 transition flex items-center gap-1.5"
            >
              <span>Done Early (Back to Study)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* GAME CANVAS CONTAINER */}
      <div className="relative rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#131620] overflow-hidden shadow-sm">
        {/* Game Stats Overlay Bar */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="px-3.5 py-1.5 rounded-xl bg-white/90 dark:bg-[#0c0e14]/90 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex items-center gap-2">
              <span className="text-base">🥕</span>
              <span className="font-mono-code font-bold text-sm text-neutral-900 dark:text-white">
                {carrotsCollected} Carrots
              </span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-white/90 dark:bg-[#0c0e14]/90 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="font-mono-code font-bold text-xs text-neutral-700 dark:text-neutral-300">
                Score: {score}
              </span>
            </div>
          </div>

          <div className="px-3 py-1 rounded-xl bg-white/90 dark:bg-[#0c0e14]/90 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800 text-[11px] font-mono-code text-neutral-500 font-bold">
            Best: {highScore}
          </div>
        </div>

        {/* HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          width={800}
          height={320}
          className="w-full h-[320px] sm:h-[360px] block cursor-pointer"
          onClick={triggerJump}
        />

        {/* Floating Tap/Hop Button for Mobile or Touch */}
        {isBreakActive && !isBreakCompleted && (
          <div className="absolute bottom-4 right-4 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerJump();
              }}
              className="px-6 py-3 rounded-2xl bg-emerald-600 active:scale-95 hover:bg-emerald-700 text-white font-display font-bold text-sm shadow-lg flex items-center gap-2 transition"
            >
              <span>HOP 🐾</span>
              <span className="text-[10px] font-mono-code bg-white/20 px-1.5 py-0.5 rounded">
                Space / Click
              </span>
            </button>
          </div>
        )}

        {/* Break Completed Lockout Overlay */}
        {isBreakCompleted && (
          <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <div className="max-w-md w-full bg-white dark:bg-[#131620] rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-700 shadow-xl space-y-4">
              <div className="flex justify-center">
                <BunnyBuddy mood="study" size="lg" showSpeech={false} />
              </div>

              <div>
                <h2 className="text-xl font-display font-bold text-neutral-900 dark:text-white">
                  ⏰ Break Session Complete!
                </h2>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
                  You munched <strong>{carrotsCollected} carrots</strong> with a score of <strong>{score}</strong>! Your {breakMinutes}-minute break has ended.
                </p>
                <div className="mt-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-800 dark:text-blue-300 font-medium">
                  🐾 Bunny Buddy says: <em>"Brain refreshed! Let's get back to your study goals and conquer your CSE subjects for that 10 CGPA!"</em>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={onNavigateToStudy}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  <span>Back to Study Timer</span>
                </button>
                <button
                  onClick={onNavigateToNotes}
                  className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs transition"
                >
                  Make Notes
                </button>
                <button
                  onClick={onNavigateToTodos}
                  className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs transition"
                >
                  To-Dos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Start Game Prompt Overlay when not started */}
        {!isBreakActive && !isBreakCompleted && (
          <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white/95 dark:bg-[#131620]/95 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-md max-w-sm">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Ready for a Quick Refresh?
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 mb-4">
                Click anywhere or press Space to jump. Double jump allowed! Break limit: {breakMinutes} minutes.
              </p>
              <button
                onClick={handleStartBreak}
                className="w-full px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                <span>Start {breakMinutes}-Minute Break Game</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions & Study Break Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#131620]">
          <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 mb-1">
            <span>🎮</span>
            <span>Simple Controls</span>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400">
            Press <strong>Spacebar</strong>, <strong>Up Arrow</strong>, or tap screen to hop. Tap again mid-air for a double jump!
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#131620]">
          <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 mb-1">
            <span>⏱️</span>
            <span>Strict Anti-Procrastination</span>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400">
            Capped at 2–5 minutes. Once time expires, the game pauses immediately so your study schedule stays uninterrupted.
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#131620]">
          <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 mb-1">
            <span>☕</span>
            <span>Cognitive Recharge</span>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400">
            Grab water, do a quick posture stretch, and give your eyes a rest from code before returning to focus!
          </p>
        </div>
      </div>
    </div>
  );
};
