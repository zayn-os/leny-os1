
import React from 'react';
import { X, Flame, TrendingUp, CheckCircle, AlertTriangle, Crosshair, Lock, Activity, Shield, Calendar, Clock, Repeat, LayoutGrid, Bell, Timer } from 'lucide-react';
import { useHabits } from '../../contexts/HabitContext';
import { getHabitLevel, LEVELS, calculateFall } from '../../utils/habitEngine';
import { STAT_COLORS } from '../../types/constants';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const HabitDetails: React.FC = () => {
    const { habitState, habitDispatch } = useHabits();
    const { habits, activeHabitId } = habitState;

    const habit = habits.find(h => h.id === activeHabitId);
    if (!habit) return null;

    const levelData = getHabitLevel(habit.streak);
    const statColor = STAT_COLORS[habit.stat];
    
    // 🔮 FALL PREDICTION LOGIC
    const potentialFallStreak = calculateFall(habit.streak);
    const streakLoss = habit.streak - potentialFallStreak;

    // 🗓️ 30-DAY CALENDAR GENERATOR
    const generateCalendar = () => {
        const days = [];
        const today = new Date();
        
        // Generate last 29 days + today
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const isoDate = d.toISOString().split('T')[0];
            const isDone = habit.history.some(h => h.startsWith(isoDate));
            const isToday = i === 0;
            
            let status = 'neutral';
            if (isDone) status = 'done';
            else if (isToday) {
                if (habit.status === 'completed') status = 'done';
                else if (habit.status === 'failed') status = 'failed';
                else status = 'pending';
            }

            days.push({ date: d, status, isToday });
        }
        return days;
    };

    const calendarData = generateCalendar();
    const completionCount = habit.history.length + (habit.status === 'completed' ? 1 : 0);
    const createdDate = new Date(habit.createdAt);
    const daysActive = Math.max(1, Math.floor((new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));
    const consistency = Math.round((completionCount / daysActive) * 100);

    // 🕵️‍♀️ FREQUENCY RENDERER
    const renderFrequencyDetails = () => {
        switch (habit.type) {
            case 'daily':
                return (
                    <div className="flex items-center gap-2 text-life-text font-medium">
                        <Repeat size={14} className="text-life-gold" />
                        <span>Daily Protocol</span>
                    </div>
                );
            case 'interval':
                return (
                    <div className="flex items-center gap-2 text-life-text font-medium">
                        <Activity size={14} className="text-life-gold" />
                        <span>Every <span className="text-life-gold font-bold">{habit.intervalValue}</span> Days</span>
                    </div>
                );
            case 'specific_days':
                return (
                    <div className="w-full">
                        <div className="flex items-center gap-2 mb-2 text-life-text font-medium">
                            <Calendar size={14} className="text-life-gold" />
                            <span>Weekly Schedule</span>
                        </div>
                        <div className="flex justify-between gap-1 bg-life-black p-1.5 rounded-lg border border-life-muted/20">
                            {WEEKDAYS.map((day, idx) => {
                                const isActive = habit.specificDays?.includes(idx);
                                return (
                                    <div 
                                        key={idx} 
                                        className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${isActive ? 'bg-life-gold text-life-black' : 'text-life-muted/30'}`}
                                    >
                                        {day}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            case 'custom':
                return (
                    <div className="w-full">
                        <div className="flex items-center gap-2 mb-2 text-life-text font-medium">
                            <LayoutGrid size={14} className="text-life-gold" />
                            <span>The Matrix ({habit.pattern?.length} Day Loop)</span>
                        </div>
                        <div className="flex flex-wrap gap-0.5">
                            {habit.pattern?.split('').map((bit, idx) => (
                                <div 
                                    key={idx} 
                                    className={`w-2 h-4 rounded-sm ${bit === '1' ? 'bg-life-gold' : 'bg-life-muted/20'}`} 
                                    title={bit === '1' ? 'Active' : 'Rest'}
                                />
                            ))}
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div 
            onClick={() => habitDispatch.setActiveHabit(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                className="bg-life-paper w-full max-w-md rounded-2xl border border-life-muted/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8 duration-500"
            >
                
                {/* 🟢 HEADER */}
                <div className="relative p-6 border-b border-life-muted/20 overflow-hidden bg-life-black">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-current opacity-5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ color: statColor }} />
                    
                    <button 
                        onClick={() => habitDispatch.setActiveHabit(null)}
                        className="absolute top-4 right-4 text-life-muted hover:text-white transition-colors z-10"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-start gap-4 relative z-10">
                        <div className="flex flex-col items-center">
                            <div className="text-4xl font-black text-life-gold leading-none mb-1 drop-shadow-lg font-mono">
                                {habit.streak}
                            </div>
                            <div className="text-[9px] uppercase font-bold text-life-muted tracking-widest flex items-center gap-1">
                                <Flame size={10} className="text-life-gold" fill="currentColor" /> Streak
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-bold text-life-text leading-tight mb-1 truncate">{habit.title}</h2>
                            <div className={`inline-flex items-center px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest ${levelData.phaseColor} bg-black/50`}>
                                Phase: {levelData.phase}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-y-auto p-6 space-y-6">
                    
                    {/* 🕰️ CONFIGURATION & SCHEDULE CARD */}
                    <div className="bg-life-black/40 border border-life-muted/10 rounded-xl p-4">
                        <h4 className="text-[10px] text-life-muted uppercase font-bold tracking-widest mb-3 flex items-center gap-2">
                            <Clock size={12} /> Execution Parameters
                        </h4>
                        
                        <div className="space-y-4">
                            {/* Frequency */}
                            <div className="text-xs">
                                {renderFrequencyDetails()}
                            </div>

                            {/* Time & Duration */}
                            <div className="flex items-center gap-4 pt-3 border-t border-life-muted/10">
                                {habit.scheduledTime ? (
                                    <div className="flex items-center gap-2 bg-life-gold/10 px-3 py-1.5 rounded border border-life-gold/20 text-xs font-mono font-bold text-life-gold">
                                        <Bell size={12} />
                                        {habit.scheduledTime}
                                    </div>
                                ) : (
                                    <div className="text-xs text-life-muted italic">No set time</div>
                                )}

                                {habit.isTimed && (
                                    <div className="flex items-center gap-2 text-xs text-life-muted">
                                        <Timer size={12} />
                                        <span>Duration: {habit.durationMinutes}m</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 🪜 THE GOLDEN LADDER (Scrollable) */}
                    <div>
                        <div className="flex items-center justify-between mb-4 px-1">
                            <div className="flex items-center gap-2 text-life-muted/50">
                                <TrendingUp size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Fibonacci Sequence</span>
                            </div>
                            <span className="text-[9px] font-mono text-life-gold">{levelData.progress}% to Next Checkpoint</span>
                        </div>
                        
                        <div className="relative py-4">
                             {/* Connecting Line */}
                             <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-life-muted/10 -translate-y-1/2 z-0" />
                             
                             <div className="flex items-center gap-4 relative z-10 overflow-x-auto no-scrollbar pb-4 px-2 snap-x">
                                {LEVELS.map((lvl) => {
                                    const isPassed = habit.streak >= lvl;
                                    const isNext = !isPassed && habit.streak < lvl && (habit.streak >= (LEVELS[LEVELS.indexOf(lvl)-1] || 0));
                                    const isSafetyNet = lvl === levelData.prevCheckpoint;

                                    return (
                                        <div key={lvl} className="flex flex-col items-center gap-2 min-w-[50px] snap-center shrink-0">
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
                                                        <Shield size={10} className="text-life-text" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`text-[10px] font-mono font-bold ${isPassed || isNext ? 'text-life-text' : 'text-life-muted/30'}`}>
                                                {lvl}
                                            </span>
                                        </div>
                                    );
                                })}
                             </div>
                        </div>
                        
                        {/* ⚠️ FALL SIMULATOR */}
                        <div className="bg-life-black rounded-lg p-3 border border-life-muted/20 flex items-start gap-3 relative overflow-hidden group">
                             {/* Warning Strip */}
                             <div className="absolute left-0 top-0 bottom-0 w-1 bg-life-hard/50" />
                             
                             <AlertTriangle size={16} className="text-life-hard shrink-0 mt-0.5" />
                             <div className="flex-1">
                                 <div className="flex justify-between items-center mb-1">
                                     <span className="text-[10px] font-bold uppercase text-life-muted">Failure Consequence</span>
                                     <span className="text-[10px] font-black text-life-hard uppercase">Streak -{streakLoss}</span>
                                 </div>
                                 <div className="text-xs text-life-text">
                                     If you miss today, your streak will fall to <span className="font-mono font-bold text-life-gold">{potentialFallStreak}</span>.
                                 </div>
                                 <div className="text-[9px] text-life-muted/50 mt-1">
                                     Reaching <span className="text-life-text">{levelData.nextCheckpoint}</span> will secure your next safety net.
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* 🗓️ CONSISTENCY HEATMAP */}
                    <div>
                        <div className="flex items-center justify-between mb-4 px-1">
                            <div className="flex items-center gap-2 text-life-muted/50">
                                <Activity size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">30-Day Consistency</span>
                            </div>
                            <span className="text-[10px] font-mono text-life-text">{consistency}%</span>
                        </div>
                        
                        <div className="grid grid-cols-7 gap-1">
                            {calendarData.map((day, idx) => (
                                <div 
                                    key={idx}
                                    className={`
                                        aspect-square rounded flex items-center justify-center text-[9px] font-mono
                                        ${day.status === 'done' ? 'bg-life-easy text-life-black' :
                                          day.status === 'failed' ? 'bg-life-hard/20 text-life-hard border border-life-hard/30' :
                                          day.isToday ? 'bg-life-gold/20 text-life-gold border border-life-gold/30 animate-pulse' :
                                          'bg-life-black border border-life-muted/10 text-life-muted/20'}
                                    `}
                                    title={day.date.toLocaleDateString()}
                                >
                                    {day.date.getDate()}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default HabitDetails;
