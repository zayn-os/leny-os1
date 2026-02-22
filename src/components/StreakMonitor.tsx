
import React from 'react';
import { Shield, Flame, CheckCircle, XCircle, AlertTriangle, ArrowRight, Zap } from 'lucide-react';
import { useLifeOS } from '../contexts/LifeOSContext';
import { DailyMode } from '../types/types';
import { DAILY_TARGETS } from '../types/constants';
const StreakMonitor: React.FC = () => {
    const { state, dispatch } = useLifeOS();
    const { user } = state;

    // 1. CIRCLE CONFIGURATION
    const radius = 55;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    
    // Percentage needed to save streak (Daily XP vs Target)
    const progressPercent = Math.min(100, (user.dailyXP / user.dailyTarget) * 100);
    const strokeDashoffset = circumference - (progressPercent / 100) * circumference;
    const isSafe = progressPercent >= 100;

    // 2. WEEKLY CALENDAR LOGIC
    const today = new Date();
    const dayOfWeek = today.getDay(); 
    const currentDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDayIndex);

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const isoKey = d.toISOString().split('T')[0];
        
        let outcome: 'pending' | 'success' | 'shield' | 'fail' | 'future' = 'future';
        
        if (i > currentDayIndex) {
            outcome = 'future';
        } else if (i === currentDayIndex) {
            if (user.dailyXP >= user.dailyTarget) outcome = 'success';
            else outcome = 'pending';
        } else {
            const historyStatus = user.streakHistory?.[isoKey];
            if (historyStatus) outcome = historyStatus as any;
            else outcome = 'fail'; 
        }

        return {
            label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
            date: d.getDate(),
            outcome
        };
    });

    // 3. MODE SELECTOR HANDLER
    const handleSetMode = (mode: DailyMode) => {
        dispatch.updateUser({ pendingMode: mode });
        dispatch.addToast(`Protocol Updated for Tomorrow: ${mode.toUpperCase()}`, 'info');
    };

    return (
        <div className="bg-life-black border border-life-gold/20 rounded-2xl p-6 relative overflow-hidden mb-6 shadow-2xl group">
            
            {/* Background Glow */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 blur-[60px] rounded-full pointer-events-none transition-colors duration-1000 ${isSafe ? 'bg-life-easy/10' : 'bg-life-gold/5'}`} />

            <div className="flex flex-col items-center relative z-10">
                
                {/* 🔴 1. THE GOLDEN RING */}
                <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                    <svg
                        height={radius * 2.5}
                        width={radius * 2.5}
                        className="transform -rotate-90"
                    >
                        {/* Track */}
                        <circle
                            stroke="#333"
                            strokeWidth={stroke}
                            fill="transparent"
                            r={normalizedRadius}
                            cx={radius * 1.25}
                            cy={radius * 1.25}
                            opacity={0.3}
                        />
                        {/* Progress */}
                        <circle
                            stroke={isSafe ? "var(--color-life-easy)" : "var(--color-life-gold)"}
                            strokeWidth={stroke}
                            strokeDasharray={circumference + ' ' + circumference}
                            style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
                            strokeLinecap="round"
                            fill="transparent"
                            r={normalizedRadius}
                            cx={radius * 1.25}
                            cy={radius * 1.25}
                            className={isSafe ? 'drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]'}
                        />
                    </svg>

                    {/* Center Stats */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className={`text-5xl font-black drop-shadow-md flex items-center gap-1 ${isSafe ? 'text-life-easy' : 'text-life-gold'}`}>
                            {user.streak} <Flame size={32} className={`animate-pulse ${isSafe ? 'fill-life-easy' : 'fill-life-gold'}`} />
                        </div>
                        <div className="text-[10px] font-bold text-life-muted uppercase tracking-widest mt-1">
                            Day Streak
                        </div>
                        <div className="mt-2 text-xs font-mono font-bold">
                            <span className={isSafe ? "text-life-easy" : "text-life-text"}>
                                {user.dailyXP}
                            </span>
                            <span className="text-life-muted mx-1">/</span>
                            <span className="text-life-muted">{user.dailyTarget} XP</span>
                        </div>
                    </div>
                </div>

                {/* 🔴 2. WEEKLY SHIELD LOG */}
                <div className="w-full mb-6">
                    <div className="flex justify-between items-center mb-3 px-2">
                        <span className="text-[9px] text-life-muted uppercase font-bold tracking-widest">
                            Weekly Survival
                        </span>
                        {/* 🛡️ SHIELD DISPLAY (FIXED) */}
                        <div className="flex items-center gap-2">
                            <Shield size={10} className="text-life-diamond" />
                            <span className="text-[9px] text-life-diamond font-bold font-mono">
                                {user.shields} Stock
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-between bg-life-paper/30 p-2 rounded-xl border border-life-muted/10">
                        {weekDays.map((day, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                                <div className={`
                                    w-8 h-8 rounded-lg flex items-center justify-center border transition-all
                                    ${day.outcome === 'success' ? 'bg-life-gold/10 border-life-gold text-life-gold' :
                                      day.outcome === 'shield' ? 'bg-life-diamond/10 border-life-diamond text-life-diamond' :
                                      day.outcome === 'fail' ? 'bg-life-hard/10 border-life-hard text-life-hard' :
                                      day.outcome === 'pending' ? 'bg-life-black border-life-muted/30 text-life-muted animate-pulse' :
                                      'bg-transparent border-transparent text-life-muted/20'}
                                `}>
                                    {day.outcome === 'success' && <CheckCircle size={14} />}
                                    {day.outcome === 'shield' && <Shield size={14} />}
                                    {day.outcome === 'fail' && <XCircle size={14} />}
                                    {day.outcome === 'pending' && <div className="w-1.5 h-1.5 bg-life-gold rounded-full" />}
                                    {day.outcome === 'future' && <div className="w-1 h-1 bg-life-muted/20 rounded-full" />}
                                </div>
                                <span className={`text-[8px] font-bold uppercase ${day.outcome === 'future' ? 'text-life-muted/30' : 'text-life-muted'}`}>
                                    {day.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 🔴 3. NEXT CYCLE PROTOCOL (Planning Tomorrow) */}
                <div className="w-full pt-4 border-t border-life-muted/10">
                    <div className="flex items-center gap-2 mb-3 text-life-muted/80">
                        <Zap size={12} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Next Cycle Protocol (Tomorrow)</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                        {Object.values(DailyMode).map((mode) => {
                            const isSelected = user.pendingMode === mode;
                            let colorClass = '';
                            let label = '';
                            let xp = DAILY_TARGETS[mode];
                            let salary = 50;

                            if (mode === DailyMode.EASY) { colorClass = 'text-life-easy border-life-easy'; label = 'Recover'; salary = 50; }
                            if (mode === DailyMode.NORMAL) { colorClass = 'text-life-normal border-life-normal'; label = 'Maintain'; salary = 100; }
                            if (mode === DailyMode.HARD) { colorClass = 'text-life-hard border-life-hard'; label = 'War'; salary = 200; }

                            return (
                                <button
                                    key={mode}
                                    onClick={() => handleSetMode(mode)}
                                    className={`
                                        relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-300
                                        ${isSelected 
                                            ? `bg-opacity-10 ${colorClass} bg-current shadow-[0_0_10px_currentColor] scale-105` 
                                            : 'bg-life-black border-life-muted/20 text-life-muted hover:border-life-muted/50'}
                                    `}
                                >
                                    <span className="text-[9px] font-black uppercase tracking-wider mb-1">{label}</span>
                                    <span className="text-xs font-mono font-bold">{xp} XP</span>
                                    {isSelected && <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${colorClass.split(' ')[0].replace('text-', 'bg-')}`} />}
                                    
                                    <div className="mt-1 text-[8px] opacity-60 font-mono">
                                        +{salary} G
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StreakMonitor;
