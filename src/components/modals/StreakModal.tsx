
import React from 'react';
import { Shield, Flame, CheckCircle, XCircle, Zap, X, TrendingUp, Crosshair, Lock, AlertTriangle } from 'lucide-react';
import { useLifeOS } from '../../contexts/LifeOSContext';
import { DailyMode } from '../../types/types';
import { DAILY_TARGETS } from '../../types/constants';
import { getHabitLevel, LEVELS, calculateFall } from '../../utils/habitEngine'; // 👈 Import Habit Engine Logic

const StreakModal: React.FC = () => {
    const { state, dispatch } = useLifeOS();
    const { user } = state;

    // 1. FIBONACCI LOGIC CALCULATION
    const levelData = getHabitLevel(user.streak);
    const potentialFallStreak = calculateFall(user.streak);
    const streakLoss = user.streak - potentialFallStreak;

    // 2. CIRCLE CONFIGURATION
    const radius = 100; // Slightly reduced to fit new UI
    const stroke = 10;  
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    
    const progressPercent = Math.min(100, (user.dailyXP / user.dailyTarget) * 100);
    const strokeDashoffset = circumference - (progressPercent / 100) * circumference;
    const isSafe = progressPercent >= 100;

    // Colors
    const themeColor = isSafe ? "#10b981" : "#fbbf24"; 
    
    const glowStyle = {
        filter: isSafe 
            ? 'drop-shadow(0 0 10px rgba(16,185,129,0.6))' 
            : 'drop-shadow(0 0 10px rgba(251,191,36,0.6))',
        transition: 'stroke-dashoffset 1s ease-in-out, filter 0.5s ease'
    };

    // 3. WEEKLY CALENDAR LOGIC
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

    const handleSetMode = (mode: DailyMode) => {
        dispatch.updateUser({ pendingMode: mode });
        dispatch.addToast(`Protocol Updated: ${mode.toUpperCase()}`, 'info');
    };

    const handleClose = () => {
        dispatch.setModal('none');
    };

    return (
        <div 
            onClick={handleClose}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
        >
            <div 
                onClick={(e) => e.stopPropagation()} 
                className="bg-life-black border border-life-gold/20 w-full max-w-sm rounded-[2rem] relative overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 flex flex-col max-h-[90vh]"
            >
                
                {/* Background Glow */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 blur-[90px] rounded-full pointer-events-none transition-colors duration-1000 ${isSafe ? 'bg-life-easy/5' : 'bg-life-gold/5'}`} />

                {/* Close Button */}
                <button 
                    onClick={handleClose}
                    className="absolute top-5 right-5 text-life-muted hover:text-white transition-colors z-20 bg-black/40 rounded-full p-1.5 backdrop-blur-sm"
                >
                    <X size={20} />
                </button>

                <div className="p-6 flex flex-col items-center relative z-10 overflow-y-auto no-scrollbar">
                    
                    <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-life-muted mb-4 opacity-60">
                        System Integrity
                    </h2>

                    {/* 🔴 1. THE GOLDEN RING */}
                    <div className="relative flex items-center justify-center mb-6" style={{ width: radius * 2.2, height: radius * 2.2 }}>
                        <svg
                            height={radius * 2.2}
                            width={radius * 2.2}
                            className="overflow-visible transform rotate-90"
                        >
                            <circle
                                stroke="#1a1a1a"
                                strokeWidth={stroke}
                                fill="transparent"
                                r={normalizedRadius}
                                cx={radius * 1.1}
                                cy={radius * 1.1}
                            />
                            <circle
                                stroke={themeColor}
                                strokeWidth={stroke}
                                strokeDasharray={circumference + ' ' + circumference}
                                style={{ strokeDashoffset, ...glowStyle }}
                                strokeLinecap="round"
                                fill="transparent"
                                r={normalizedRadius}
                                cx={radius * 1.1}
                                cy={radius * 1.1}
                            />
                        </svg>

                        {/* Center Stats */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                            <div className={`text-6xl font-black drop-shadow-md flex items-center gap-1 leading-[0.8] tracking-tighter ${isSafe ? 'text-life-easy' : 'text-life-gold'}`}>
                                {user.streak} 
                            </div>
                            
                            <div className="flex items-center gap-1.5 text-life-muted mt-2 mb-2">
                                <Flame size={14} className={isSafe ? 'fill-life-easy text-life-easy' : 'fill-life-gold text-life-gold'} />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Days Active</span>
                            </div>

                            {/* Phase Badge (Using Habit Engine Phase) */}
                            <div className={`inline-flex items-center px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest ${levelData.phaseColor} bg-black/50 backdrop-blur-sm`}>
                                {user.dailyXP} / {user.dailyTarget} XP
                            </div>
                        </div>
                    </div>

                    {/* 🪜 2. THE GOLDEN LADDER (Fibonacci Gates) */}
                    <div className="w-full mb-6">
                        <div className="flex items-center justify-between mb-2 px-1">
                            <div className="flex items-center gap-2 text-life-muted/50">
                                <TrendingUp size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Evolution Gate</span>
                            </div>
                            <span className="text-[9px] font-mono text-life-gold">{levelData.progress}% to Next</span>
                        </div>
                        
                        <div className="relative py-4 bg-life-black/30 rounded-xl border border-life-muted/10">
                             {/* Connecting Line */}
                             <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-life-muted/10 -translate-y-1/2 z-0" />
                             
                             <div className="flex items-center gap-4 relative z-10 overflow-x-auto no-scrollbar pb-2 px-4 snap-x">
                                {LEVELS.map((lvl) => {
                                    const isPassed = user.streak >= lvl;
                                    const isNext = !isPassed && user.streak < lvl && (user.streak >= (LEVELS[LEVELS.indexOf(lvl)-1] || 0));
                                    const isSafetyNet = lvl === levelData.prevCheckpoint;

                                    return (
                                        <div key={lvl} className="flex flex-col items-center gap-2 min-w-[40px] snap-center shrink-0">
                                            <div 
                                                className={`
                                                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all relative
                                                    ${isPassed 
                                                        ? 'bg-life-gold border-life-gold text-life-black shadow-[0_0_10px_rgba(251,191,36,0.3)]' 
                                                        : isNext
                                                            ? 'bg-life-black border-life-gold text-life-gold animate-pulse scale-110 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                                                            : 'bg-life-black border-life-muted/20 text-life-muted/30'}
                                                `}
                                            >
                                                {isPassed ? <CheckCircle size={14} /> : isNext ? <Crosshair size={14} /> : <Lock size={12} />}
                                                
                                                {/* Safety Net Indicator */}
                                                {isSafetyNet && (
                                                    <div className="absolute -bottom-2 -right-2 bg-life-black border border-life-muted/50 rounded-full p-0.5" title="Safety Net">
                                                        <Shield size={8} className="text-life-text" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`text-[9px] font-mono font-bold ${isPassed || isNext ? 'text-life-text' : 'text-life-muted/30'}`}>
                                                {lvl}
                                            </span>
                                        </div>
                                    );
                                })}
                             </div>
                        </div>
                    </div>

                    {/* ⚠️ 3. FALL SIMULATOR */}
                    <div className="w-full bg-life-black rounded-lg p-3 border border-life-muted/20 flex items-start gap-3 relative overflow-hidden group mb-6">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-life-hard/50" />
                            <AlertTriangle size={16} className="text-life-hard shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold uppercase text-life-muted">Failure Consequence</span>
                                    <span className="text-[10px] font-black text-life-hard uppercase">Streak -{streakLoss}</span>
                                </div>
                                <div className="text-xs text-life-text">
                                    If daily target is missed, streak falls to <span className="font-mono font-bold text-life-gold">{potentialFallStreak}</span> (Safety Net).
                                </div>
                            </div>
                    </div>

                    {/* 🔴 4. WEEKLY LOG & SHIELDS */}
                    <div className="w-full mb-6">
                        <div className="flex justify-between items-center mb-3 px-2">
                            <span className="text-[9px] text-life-muted uppercase font-bold tracking-widest">
                                Weekly Survival Log
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-life-diamond/10 border border-life-diamond/20">
                                    <Shield size={12} className="text-life-diamond fill-life-diamond/20" />
                                    <span className="text-[10px] text-life-diamond font-bold font-mono">
                                        {user.shields} <span className="text-life-diamond/50 text-[8px] uppercase">Stock</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between bg-life-black/50 p-2.5 rounded-2xl border border-life-muted/10 backdrop-blur-sm">
                            {weekDays.map((day, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                                    <div className={`
                                        w-7 h-7 rounded-full flex items-center justify-center border transition-all shadow-sm
                                        ${day.outcome === 'success' ? 'bg-life-easy/10 border-life-easy text-life-easy shadow-[0_0_8px_rgba(16,185,129,0.15)]' :
                                          day.outcome === 'shield' ? 'bg-life-diamond/10 border-life-diamond text-life-diamond' :
                                          day.outcome === 'fail' ? 'bg-life-hard/10 border-life-hard text-life-hard' :
                                          day.outcome === 'pending' ? 'bg-life-gold/5 border-life-gold text-life-gold animate-pulse' :
                                          'bg-transparent border-transparent text-life-muted/10'}
                                    `}>
                                        {day.outcome === 'success' && <CheckCircle size={12} />}
                                        {day.outcome === 'shield' && <Shield size={12} />}
                                        {day.outcome === 'fail' && <XCircle size={12} />}
                                        {day.outcome === 'pending' && <div className="w-1.5 h-1.5 bg-life-gold rounded-full shadow-[0_0_5px_currentColor]" />}
                                        {day.outcome === 'future' && <div className="w-1 h-1 bg-life-muted/10 rounded-full" />}
                                    </div>
                                    <span className={`text-[7px] font-black uppercase tracking-wider ${day.outcome === 'future' ? 'text-life-muted/20' : 'text-life-muted'}`}>
                                        {day.label[0]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 🔴 5. NEXT CYCLE PROTOCOL */}
                    <div className="w-full pt-6 border-t border-life-muted/10">
                        <div className="flex items-center justify-center gap-2 mb-5 text-life-muted/60">
                            <Zap size={12} />
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Next Cycle Protocol</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                            {Object.values(DailyMode).map((mode) => {
                                const isSelected = user.pendingMode === mode;
                                const styles = {
                                    [DailyMode.EASY]: { color: 'text-life-easy', border: 'border-life-easy', shadow: 'shadow-life-easy/20' },
                                    [DailyMode.NORMAL]: { color: 'text-life-normal', border: 'border-life-normal', shadow: 'shadow-life-normal/20' },
                                    [DailyMode.HARD]: { color: 'text-life-hard', border: 'border-life-hard', shadow: 'shadow-life-hard/20' },
                                };
                                const theme = styles[mode];
                                let label = '', xp = DAILY_TARGETS[mode], salary = 50;
                                if (mode === DailyMode.EASY) { label = 'Recover'; salary = 50; }
                                if (mode === DailyMode.NORMAL) { label = 'Maintain'; salary = 100; }
                                if (mode === DailyMode.HARD) { label = 'War'; salary = 200; }

                                return (
                                    <button
                                        key={mode}
                                        onClick={() => handleSetMode(mode)}
                                        className={`
                                            relative flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-300
                                            ${isSelected 
                                                ? `bg-transparent border-2 ${theme.border} ${theme.color} shadow-[0_0_20px_-5px] ${theme.shadow} scale-105` 
                                                : 'bg-life-black border border-life-muted/10 text-life-muted/50 hover:border-life-muted/30 hover:text-life-muted'}
                                        `}
                                    >
                                        <span className="text-[8px] font-black uppercase tracking-widest mb-1.5">{label}</span>
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-black font-mono tracking-tight">{xp} XP</span>
                                            <span className="text-[9px] opacity-60 font-mono mt-0.5">+{salary} G</span>
                                        </div>
                                        {isSelected && <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${theme.color.replace('text-', 'bg-')} shadow-[0_0_5px_currentColor] animate-pulse`} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StreakModal;
