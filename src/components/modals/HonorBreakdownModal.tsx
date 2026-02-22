
import React, { useMemo, useState } from 'react';
import { X, Award, CheckCircle, AlertCircle, Dumbbell, Target, Crosshair, TrendingUp, Calendar, ArrowLeft } from 'lucide-react';
import { useLifeOS } from '../../contexts/LifeOSContext';
import { useTasks } from '../../contexts/TaskContext';
import { useHabits } from '../../contexts/HabitContext';
import { useRaids } from '../../contexts/RaidContext';
import { getDailyHonorBreakdown, HonorItem } from '../../utils/honorSystem';
import { Difficulty } from '../../types/types';
import { DIFFICULTY_COLORS } from '../../types/constants';

const HonorBreakdownModal: React.FC = () => {
    const { state, dispatch } = useLifeOS();
    const { user } = state;
    const { taskState } = useTasks();
    const { habitState } = useHabits();
    const { raidState } = useRaids();
    
    const [view, setView] = useState<'today' | 'history'>('today');

    // 🗓️ MONTHLY HISTORY DATA
    const { historyData, monthAverage, monthName, year, startOffset, daysInMonth } = useMemo(() => {
        const log = user.honorDailyLog || {};
        const now = state.ui.debugDate ? new Date(state.ui.debugDate) : new Date();
        const y = now.getFullYear();
        const m = now.getMonth(); // 0-indexed
        
        const data = [];
        const daysInM = new Date(y, m + 1, 0).getDate();
        
        // Loop for all days in month to show full calendar structure
        for (let d = 1; d <= daysInM; d++) {
            const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const score = log[dateStr]; 
            // Only include score if day has passed or is today (simple check: if score exists)
            data.push({ date: d, score: score, fullDate: dateStr });
        }

        const scores = data.filter(d => d.score !== undefined).map(d => d.score as number);
        const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

        return {
            historyData: data,
            monthAverage: avg,
            monthName: now.toLocaleString('default', { month: 'long' }),
            year: y,
            startOffset: new Date(y, m, 1).getDay(),
            daysInMonth: daysInM
        };
    }, [user.honorDailyLog, state.ui.debugDate]);

    // 🕵️‍♀️ CALCULATE BREAKDOWN LIVE (For Today)
    const { items, totalWeight } = useMemo(() => {
        return getDailyHonorBreakdown(
            taskState.tasks, 
            habitState.habits, 
            raidState.raids, 
            state.ui.debugDate
        );
    }, [taskState.tasks, habitState.habits, raidState.raids, state.ui.debugDate]);

    const handleClose = () => {
        dispatch.setModal('none');
    };

    const getTypeIcon = (type: string) => {
        if (type === 'task') return <Target size={12} />;
        if (type === 'habit') return <Dumbbell size={12} />;
        return <Crosshair size={12} />;
    };

    // Calculate current day's score purely based on completed items
    const completedWeight = items.filter(i => i.isCompleted).reduce((sum, i) => sum + i.weight, 0);
    const currentScore = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 100;

    const getScoreColor = (score: number | undefined) => {
        if (score === undefined) return 'bg-life-muted/5 border-life-muted/10 text-life-muted/30';
        if (score >= 100) return 'bg-life-crimson/20 border-life-crimson text-life-crimson shadow-[0_0_10px_rgba(220,38,38,0.2)]';
        if (score >= 90) return 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.2)]';
        if (score >= 80) return 'bg-life-gold/20 border-life-gold text-life-gold';
        if (score >= 60) return 'bg-indigo-500/20 border-indigo-500 text-indigo-400';
        return 'bg-red-500/20 border-red-500 text-red-500';
    };

    return (
        <div 
            onClick={handleClose} 
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
        >
            <div 
                onClick={(e) => e.stopPropagation()} 
                className="bg-life-black border border-indigo-500/30 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 flex flex-col max-h-[85vh]"
            >
                {/* 🔴 HEADER */}
                <div className="p-5 border-b border-indigo-500/10 bg-indigo-950/20 flex justify-between items-start">
                    <div>
                        <h2 className="text-lg font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                            <Award size={20} /> Honor Protocol
                        </h2>
                        <p className="text-[10px] text-indigo-300/60 mt-1 uppercase tracking-wider">
                            {view === 'today' ? 'Daily Integrity Breakdown' : 'Monthly Integrity Log'}
                        </p>
                    </div>
                    <button onClick={handleClose} className="text-life-muted hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* 🔄 VIEW SWITCHER CONTENT */}
                {view === 'today' ? (
                    <>
                        {/* 📊 TODAY'S SUMMARY CIRCLE */}
                        <div className="p-6 flex flex-col items-center border-b border-life-muted/10 bg-life-black/50 animate-in slide-in-from-left-4 duration-300">
                            <div className="text-4xl font-black text-white font-mono mb-2">
                                {currentScore}%
                            </div>
                            <div className="text-[9px] text-life-muted uppercase font-bold tracking-widest mb-4">
                                Projected Daily Score
                            </div>
                            <div className="w-full max-w-[200px] h-1.5 bg-life-muted/20 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-indigo-500 transition-all duration-700" 
                                    style={{ width: `${currentScore}%` }}
                                />
                            </div>
                            
                            <button 
                                onClick={() => setView('history')}
                                className="mt-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-life-paper border border-life-muted/20 hover:border-indigo-500/50 hover:text-indigo-400 transition-all text-[10px] font-bold uppercase tracking-wider"
                            >
                                <Calendar size={14} />
                                View Monthly History
                            </button>
                        </div>

                        {/* 📜 TODAY'S BREAKDOWN LIST */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 animate-in slide-in-from-bottom-4 duration-300">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-life-muted">Today's Obligations</span>
                            </div>

                            {items.length === 0 ? (
                                <div className="text-center py-8 text-life-muted/50 italic text-xs">
                                    No obligations scheduled for today.
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div 
                                        key={`${item.type}-${item.id}`} 
                                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${item.isCompleted ? 'bg-life-black border-life-muted/10 opacity-50' : 'bg-life-paper border-life-muted/20'}`}
                                    >
                                        {/* Percentage Badge */}
                                        <div className="flex flex-col items-center justify-center w-10 h-10 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold font-mono">
                                            <span className="text-xs">{item.percentage}%</span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <div className={`text-[9px] uppercase font-black px-1.5 py-px rounded border ${DIFFICULTY_COLORS[item.difficulty]}`}>
                                                    {item.difficulty}
                                                </div>
                                                <div className="text-life-muted/50 flex items-center gap-1 text-[9px] uppercase font-bold">
                                                    {getTypeIcon(item.type)} {item.type}
                                                </div>
                                            </div>
                                            <div className={`text-xs font-bold truncate ${item.isCompleted ? 'line-through text-life-muted' : 'text-life-text'}`}>
                                                {item.title}
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div>
                                            {item.isCompleted ? (
                                                <CheckCircle size={16} className="text-life-easy" />
                                            ) : (
                                                <AlertCircle size={16} className="text-life-hard animate-pulse" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        {/* 📊 MONTHLY CALENDAR VIEW */}
                        <div className="flex-1 flex flex-col p-4 animate-in slide-in-from-right-4 duration-300">
                            
                            {/* Navigation & Stats */}
                            <div className="flex items-center justify-between mb-6">
                                <button 
                                    onClick={() => setView('today')}
                                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-life-muted hover:text-white transition-colors"
                                >
                                    <ArrowLeft size={14} /> Back
                                </button>
                                
                                <div className="flex flex-col items-end">
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-life-muted">Month Average</span>
                                    <span className={`text-lg font-black font-mono ${monthAverage >= 90 ? 'text-life-gold' : 'text-indigo-400'}`}>
                                        {monthAverage}%
                                    </span>
                                </div>
                            </div>

                            {/* Calendar Header */}
                            <div className="mb-4 text-center">
                                <h3 className="text-sm font-black uppercase tracking-widest text-white">{monthName} {year}</h3>
                            </div>
                            
                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-2 mb-4">
                                {/* Weekday Headers */}
                                {['S','M','T','W','T','F','S'].map((d, i) => (
                                    <div key={i} className="text-center text-[8px] font-bold text-life-muted/30">{d}</div>
                                ))}

                                {/* Empty Slots for Offset */}
                                {Array.from({ length: startOffset }).map((_, i) => (
                                    <div key={`empty-${i}`} className="aspect-square" />
                                ))}

                                {/* Days */}
                                {historyData.map((day) => (
                                    <div 
                                        key={day.date} 
                                        className={`
                                            aspect-square rounded-lg border flex flex-col items-center justify-center relative group cursor-default
                                            ${getScoreColor(day.score)}
                                        `}
                                    >
                                        <span className="text-[10px] font-bold">{day.date}</span>
                                        
                                        {day.score !== undefined && (
                                            <span className="text-[8px] font-mono opacity-80">{day.score}%</span>
                                        )}

                                        {/* Tooltip */}
                                        {day.score !== undefined && (
                                            <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-life-black border border-life-muted/20 p-2 rounded-lg z-10 shadow-xl whitespace-nowrap pointer-events-none">
                                                <span className="text-[10px] font-bold text-white">{day.fullDate}</span>
                                                <span className={`text-xs font-black ${day.score >= 100 ? 'text-life-gold' : 'text-life-muted'}`}>
                                                    {day.score}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto p-3 bg-indigo-950/20 border border-indigo-500/10 rounded-lg text-[10px] text-indigo-300/60 text-center">
                                Calendar reflects recorded daily integrity scores.
                            </div>
                        </div>
                    </>
                )}

                {/* ℹ️ FOOTER INFO */}
                <div className="p-3 bg-indigo-950/20 border-t border-indigo-500/10 text-[9px] text-indigo-300/60 text-center">
                    {view === 'today' ? 'Harder tasks carry more weight. Failure hurts more.' : 'Consistency builds the strongest alloy.'}
                </div>
            </div>
        </div>
    );
};

export default HonorBreakdownModal;
