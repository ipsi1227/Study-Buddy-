import React from 'react';

export type BunnyMood =
  | 'study'      // Reading a book with glasses
  | 'listening'  // Wearing headphones enjoying soothing sounds
  | 'cheering'   // Cheering, arms up with stars
  | 'timer'      // Sitting near stopwatch/timer looking attentive
  | 'thinking'   // Question mark / pondering
  | 'alert';     // Red alert / urgent

interface BunnyBuddyProps {
  mood?: BunnyMood;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSpeech?: boolean;
  speechText?: string;
}

export const BunnyBuddy: React.FC<BunnyBuddyProps> = ({
  mood = 'study',
  className = '',
  size = 'md',
  showSpeech = false,
  speechText,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-14 h-14',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Optional Speech Bubble */}
      {showSpeech && speechText && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-blue-600 text-white text-[11px] font-medium px-2.5 py-1 rounded-full shadow-md z-10 border border-blue-400/30 animate-bounce">
          {speechText}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-blue-600" />
        </div>
      )}

      {/* SVG Bunny Mascot */}
      <svg
        className={`${sizeClasses[size]} transition-transform duration-300 hover:scale-105 select-none`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft background glow based on mood */}
        <circle
          cx="50"
          cy="55"
          r="38"
          className={
            mood === 'alert'
              ? 'fill-red-500/10 dark:fill-red-500/20'
              : mood === 'listening'
              ? 'fill-blue-500/10 dark:fill-blue-500/20'
              : 'fill-emerald-500/10 dark:fill-emerald-500/20'
          }
        />

        {/* Left Ear */}
        <path
          d="M32 42C26 26 28 8 36 6C43 4 45 22 41 40"
          fill="#FFF"
          stroke="#3B82F6"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Left Inner Ear (Pink) */}
        <path
          d="M34 36C30 24 31 12 36 11C40 10 41 22 39 34"
          fill="#FDA4AF"
        />

        {/* Right Ear */}
        <path
          d="M68 42C74 26 72 8 64 6C57 4 55 22 59 40"
          fill="#FFF"
          stroke="#3B82F6"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right Inner Ear (Pink) */}
        <path
          d="M66 36C70 24 69 12 64 11C60 10 59 22 61 34"
          fill="#FDA4AF"
        />

        {/* Head */}
        <ellipse
          cx="50"
          cy="52"
          rx="32"
          ry="28"
          fill="#FFFFFF"
          stroke="#3B82F6"
          strokeWidth="3.5"
        />

        {/* Cheeks */}
        <circle cx="30" cy="58" r="5" fill="#FCA5A5" fillOpacity="0.6" />
        <circle cx="70" cy="58" r="5" fill="#FCA5A5" fillOpacity="0.6" />

        {/* Eyes based on mood */}
        {mood === 'listening' ? (
          // Happy closed curving focus eyes ^_^
          <>
            <path
              d="M34 50C36 46 40 46 42 50"
              stroke="#1E3A8A"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M58 50C60 46 64 46 66 50"
              stroke="#1E3A8A"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        ) : mood === 'alert' ? (
          // Wide attentive alert eyes
          <>
            <ellipse cx="38" cy="48" rx="4.5" ry="5.5" fill="#EF4444" />
            <circle cx="36" cy="46" r="1.8" fill="#FFF" />
            <ellipse cx="62" cy="48" rx="4.5" ry="5.5" fill="#EF4444" />
            <circle cx="60" cy="46" r="1.8" fill="#FFF" />
          </>
        ) : (
          // Sparkly cute curious eyes
          <>
            <ellipse cx="38" cy="49" rx="4" ry="5" fill="#1E3A8A" />
            <circle cx="36.5" cy="47.5" r="1.8" fill="#FFFFFF" />
            <circle cx="39.5" cy="51" r="1" fill="#FFFFFF" />

            <ellipse cx="62" cy="49" rx="4" ry="5" fill="#1E3A8A" />
            <circle cx="60.5" cy="47.5" r="1.8" fill="#FFFFFF" />
            <circle cx="63.5" cy="51" r="1" fill="#FFFFFF" />
          </>
        )}

        {/* Nose & Mouth */}
        <polygon points="50,56 47,53 53,53" fill="#F43F5E" />
        <path
          d="M46 59C48 61 50 61 50 59C50 61 52 61 54 59"
          stroke="#1E3A8A"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Paws */}
        <ellipse
          cx="38"
          cy="75"
          rx="7"
          ry="5"
          fill="#FFFFFF"
          stroke="#3B82F6"
          strokeWidth="2.5"
        />
        <ellipse
          cx="62"
          cy="75"
          rx="7"
          ry="5"
          fill="#FFFFFF"
          stroke="#3B82F6"
          strokeWidth="2.5"
        />

        {/* Accessories depending on mood */}
        {mood === 'listening' && (
          // Headphones with glowing music wave
          <g>
            {/* Headband */}
            <path
              d="M20 50 C20 28, 80 28, 80 50"
              fill="none"
              stroke="#059669"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Ear cups */}
            <rect
              x="15"
              y="44"
              width="8"
              height="15"
              rx="4"
              fill="#10B981"
              stroke="#047857"
              strokeWidth="2"
            />
            <rect
              x="77"
              y="44"
              width="8"
              height="15"
              rx="4"
              fill="#10B981"
              stroke="#047857"
              strokeWidth="2"
            />
            {/* Music note */}
            <path
              d="M78 26 C78 24, 82 24, 84 26 L84 32 C84 33, 82 34, 81 33"
              fill="#10B981"
            />
          </g>
        )}

        {mood === 'study' && (
          // Smart student glasses
          <g>
            <circle
              cx="38"
              cy="49"
              r="7.5"
              fill="none"
              stroke="#0284C7"
              strokeWidth="2"
            />
            <circle
              cx="62"
              cy="49"
              r="7.5"
              fill="none"
              stroke="#0284C7"
              strokeWidth="2"
            />
            <line
              x1="45.5"
              y1="49"
              x2="54.5"
              y2="49"
              stroke="#0284C7"
              strokeWidth="2"
            />
          </g>
        )}

        {mood === 'timer' && (
          // Mini stopwatch badge held in front
          <g>
            <circle cx="50" cy="74" r="7" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
            <circle cx="50" cy="74" r="5" fill="#FFFFFF" />
            <line x1="50" y1="74" x2="50" y2="71" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="50" y1="74" x2="52" y2="74" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        )}

        {mood === 'alert' && (
          // Red urgent badge on ear
          <g>
            <circle cx="72" cy="18" r="7" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
            <path d="M72 15 L72 19 M72 21 L72 22" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
};
