import React from 'react';
import { Play, Pause } from 'lucide-react';

interface FocusTimerProps {
    timeLeft: number;
    isPaused: boolean;
    onTogglePause: () => void;
    durationMinutes: number;
}

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const FocusTimer: React.FC<FocusTimerProps> = ({ timeLeft, isPaused, onTogglePause, durationMinutes }) => {
    return (
        <div className="relative mb-12">
            <svg className="w-64 h-64 md:w-80 md:h-80 transform -rotate-90">
                <circle cx="50%" cy="50%" r="48%" className="stroke-life-muted/10 fill-none" strokeWidth="4" />
                <circle cx="50%" cy="50%" r="48%" className={`fill-none transition-all duration-1000 ${isPaused ? 'stroke-life-muted' : 'stroke-life-gold'}`} strokeWidth="4" strokeDasharray="301.59" strokeDashoffset={301.59 * (1 - timeLeft / (durationMinutes * 60))} pathLength="301.59" strokeLinecap="round" style={{ filter: isPaused ? 'none' : 'drop-shadow(0 0 15px rgba(251,191,36,0.5))' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-6xl md:text-8xl font-mono font-bold tracking-tighter tabular-nums">{formatTime(timeLeft)}</div>
                <button onClick={onTogglePause} className="mt-4 px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-zinc-800 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all">
                    {isPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />} {isPaused ? "Resume" : "Pause"}
                </button>
            </div>
        </div>
    );
};