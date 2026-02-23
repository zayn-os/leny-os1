
import React, { useState, useRef, useEffect } from 'react';
import { Clock, CheckSquare, Dumbbell, Brain, Zap, Shield, Heart, Activity, ChevronRight, Folder, BookOpen, Bell, X, Trash2, Plus, Palette, CalendarPlus, Repeat, Minus } from 'lucide-react';
import { useHabits } from '../../contexts/HabitContext';
import { useSkills } from '../../contexts/SkillContext';
import { useLifeOS } from '../../contexts/LifeOSContext'; 
import { Difficulty, Stat, Reminder } from '../../types/types';
import { HabitType } from '../../types/habitTypes';
import { STAT_COLORS, DIFFICULTY_COLORS, DIFFICULTY_BG } from '../../types/constants';
import { openInGoogleCalendar } from '../../utils/googleCalendar';
import { HabitFrequencySection } from './parts/HabitFrequencySection'; // 👈 IMPORT

interface HabitFormProps {
    onClose: () => void;
}

const HabitForm: React.FC<HabitFormProps> = ({ onClose }) => {
    const { state } = useLifeOS(); 
    const { habitDispatch, habitState } = useHabits();
    const { skillState } = useSkills(); 
    const { categories } = habitState;
    const showCalendarSync = state.user.preferences.showCalendarSync ?? true; 
    
    const [title, setTitle] = useState('');
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
    const [stat, setStat] = useState<Stat>(Stat.DIS);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedSkillId, setSelectedSkillId] = useState<string>('');
    
    // 🟢 REWARD TYPE TOGGLE
    const [rewardType, setRewardType] = useState<'skill' | 'stat'>('stat');
    
    // Habit Specifics
    const [habitType, setHabitType] = useState<HabitType>('daily');
    const [habitDescription, setHabitDescription] = useState(''); 
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [intervalVal, setIntervalVal] = useState<number>(2);
    const [pattern, setPattern] = useState<string>("10101010101010"); 
    
    const [reps, setReps] = useState<number>(1);
    const [isTimed, setIsTimed] = useState(false);
    const [duration, setDuration] = useState<number>(30);
    const [scheduledTime, setScheduledTime] = useState(''); 
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [syncCalendar, setSyncCalendar] = useState(false);
    const [subtasks, setSubtasks] = useState<string[]>([]);
    
    const subtaskRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [focusLastSubtask, setFocusLastSubtask] = useState(false);

    useEffect(() => {
        if (focusLastSubtask && subtasks.length > 0) {
            const lastIdx = subtasks.length - 1;
            subtaskRefs.current[lastIdx]?.focus();
            setFocusLastSubtask(false);
        }
    }, [subtasks, focusLastSubtask]);

    // 🛡️ Auto-enable calendar sync ONLY if preference is ON
    useEffect(() => {
        if (scheduledTime && showCalendarSync) {
            setSyncCalendar(true);
        } else if (!showCalendarSync) {
            setSyncCalendar(false);
        }
    }, [scheduledTime, showCalendarSync]);

    const toggleDay = (dayIndex: number) => {
        if (selectedDays.includes(dayIndex)) setSelectedDays(selectedDays.filter(d => d !== dayIndex));
        else setSelectedDays([...selectedDays, dayIndex].sort());
    };

    const handleAddReminder = (minutes: number) => {
        if (minutes === -1) return;
        if (!reminders.some(r => r.minutesBefore === minutes)) {
            setReminders([...reminders, { id: `rem_${Date.now()}`, minutesBefore: minutes, isSent: false }].sort((a,b) => a.minutesBefore - b.minutesBefore));
        }
    };

    const handleRemoveReminder = (id: string) => setReminders(reminders.filter(r => r.id !== id));

    const handleAddSubtask = () => { setSubtasks([...subtasks, '']); setFocusLastSubtask(true); };
    const handleSubtaskChange = (index: number, val: string) => { const newSub = [...subtasks]; newSub[index] = val; setSubtasks(newSub); };
    const handleRemoveSubtask = (index: number) => setSubtasks(subtasks.filter((_, i) => i !== index));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        const formattedSubtasks = subtasks.filter(st => st.trim() !== '').map((st, idx) => ({ id: `st_${Date.now()}_${idx}`, title: st, isCompleted: false }));

        habitDispatch.addHabit({
            title, description: habitDescription, skillId: rewardType === 'skill' ? (selectedSkillId || undefined) : undefined, difficulty, stat, type: habitType,
            categoryId: selectedCategory || undefined, specificDays: habitType === 'specific_days' ? selectedDays : undefined,
            intervalValue: habitType === 'interval' ? intervalVal : undefined, pattern: habitType === 'custom' ? pattern : undefined,
            isTimed, durationMinutes: isTimed ? duration : undefined, scheduledTime: scheduledTime || undefined, reminders, subtasks: formattedSubtasks, dailyTarget: reps
        });

        // 🛡️ Check BOTH local state AND global preference
        if (syncCalendar && scheduledTime && showCalendarSync) {
            const now = new Date();
            const [hours, minutes] = scheduledTime.split(':').map(Number);
            const eventDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
            openInGoogleCalendar(`[Protocol] ${title}`, `${habitDescription}\n\nGenerated by LifeOS`, eventDate.toISOString(), isTimed ? duration : 30);
        }
        onClose();
    };

    const StatIcon = ({ type }: { type: Stat }) => {
        switch (type) {
          case Stat.STR: return <Dumbbell size={18} />;
          case Stat.INT: return <Brain size={18} />;
          case Stat.DIS: return <Zap size={18} />;
          case Stat.PCE: return <Shield size={18} />;
          case Stat.EMT: return <Heart size={18} />;
          case Stat.CAM: return <Activity size={18} />;
          case Stat.CRT: return <Palette size={18} />;
          default: return <Activity size={18} />;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">Protocol Name</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Read 20 pages..." autoFocus className="w-full bg-life-black border border-zinc-800 rounded-lg p-3 text-life-text placeholder:text-life-muted/50 focus:outline-none focus:border-life-gold/50 transition-all font-medium" />
                </div>

                <div>
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2 flex items-center gap-1"><Clock size={10} /> Daily Time</label>
                    <input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="w-full bg-life-black border border-zinc-800 rounded-lg p-2 text-xs text-life-text focus:outline-none focus:border-life-gold/50" />
                </div>

                {/* 🛡️ Calendar Sync Toggle (Only shows if time is set AND feature is enabled) */}
                {scheduledTime && showCalendarSync && (
                    <div onClick={() => setSyncCalendar(!syncCalendar)} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${syncCalendar ? 'bg-blue-500/10 border-blue-500/50' : 'bg-life-black border-zinc-800'}`}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${syncCalendar ? 'bg-blue-500 border-blue-500 text-white' : 'border-zinc-800'}`}>{syncCalendar && <CalendarPlus size={10} />}</div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${syncCalendar ? 'text-blue-400' : 'text-life-muted'}`}>Sync to Google Calendar (Daily Event)</span>
                    </div>
                )}

                {/* Subtasks */}
                <div>
                    <div className="flex items-center justify-between mb-2"><label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest">Side Missions (Routine Steps)</label><button type="button" onClick={handleAddSubtask} className="text-[10px] uppercase font-bold text-life-gold flex items-center gap-1"><Plus size={12} /> Add Step</button></div>
                    <div className="space-y-2">
                        {subtasks.map((st, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-life-black/40 px-2 py-1 rounded-lg border border-zinc-800 focus-within:border-life-gold/50 transition-colors">
                                <span className="text-[10px] text-life-muted font-mono w-4">{idx + 1}.</span>
                                <input ref={(el) => { subtaskRefs.current[idx] = el; }} type="text" value={st} onChange={(e) => handleSubtaskChange(idx, e.target.value)} className="flex-1 bg-transparent text-xs text-life-text focus:outline-none py-1" />
                                <button type="button" onClick={() => handleRemoveSubtask(idx)} className="text-life-muted hover:text-life-hard p-1"><Trash2 size={12} /></button>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Category */}
                <div>
                     <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">Category / Section</label>
                    <div className="relative">
                        <Folder className="absolute left-3 top-1/2 -translate-y-1/2 text-life-muted" size={16} />
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full bg-life-black border border-zinc-800 rounded-lg p-3 pl-10 text-sm text-life-text appearance-none focus:outline-none focus:border-life-gold/50"><option value="">(Uncategorized)</option>{categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.title}</option>))}</select>
                         <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-life-muted rotate-90" size={16} />
                    </div>
                </div>
            </div>

            {/* 🟢 NEW SPLIT COMPONENT */}
            <HabitFrequencySection 
                habitType={habitType} setHabitType={setHabitType} selectedDays={selectedDays} toggleDay={toggleDay}
                intervalVal={intervalVal} setIntervalVal={setIntervalVal} pattern={pattern} setPattern={setPattern}
                reps={reps} setReps={setReps}
            />

            {/* 🆕 DAILY REPETITIONS */}
            <div className="p-4 bg-life-black/40 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex justify-between items-center">
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest flex items-center gap-2"><Repeat size={12} /> Daily Iterations</label>
                    <div className="flex items-center gap-3 bg-life-black rounded-lg border border-zinc-800 p-1">
                        <button type="button" onClick={() => setReps(Math.max(1, reps - 1))} className="w-8 h-8 rounded border border-zinc-800 flex items-center justify-center hover:bg-life-muted/10 text-life-muted hover:text-white transition-colors"><Minus size={14} /></button>
                        <span className="text-sm font-mono font-bold text-life-gold w-6 text-center">{reps}</span>
                        <button type="button" onClick={() => setReps(Math.min(99, reps + 1))} className="w-8 h-8 rounded border border-zinc-800 flex items-center justify-center hover:bg-life-muted/10 text-life-muted hover:text-white transition-colors"><Plus size={14} /></button>
                    </div>
                </div>
            </div>

            {/* Difficulty & Stat */}
            <div>
                <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">Threat Level</label>
                <div className="grid grid-cols-3 gap-2">{Object.values(Difficulty).map((diff) => (<button key={diff} type="button" onClick={() => setDifficulty(diff)} className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${difficulty === diff ? `${DIFFICULTY_COLORS[diff]} ${DIFFICULTY_BG[diff]} shadow-[0_0_10px_rgba(0,0,0,0.5)] scale-105` : 'border-zinc-800 text-life-muted hover:bg-life-muted/5'}`}>{diff}</button>))}</div>
            </div>
            
            {/* Timer */}
            <div className="flex bg-life-black rounded-lg border border-zinc-800 p-1 mb-2"><button type="button" onClick={() => setIsTimed(false)} className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase ${!isTimed ? 'bg-life-muted/30 text-white' : 'text-life-muted'}`}>No Timer</button><button type="button" onClick={() => setIsTimed(true)} className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase ${isTimed ? 'bg-life-gold text-life-black' : 'text-life-muted'}`}>With Timer</button></div>
            {isTimed && <div className="flex items-center gap-2"><Clock size={14} className="text-life-gold" /><input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 0)} className="w-16 bg-life-black border border-zinc-800 rounded p-1 text-center text-sm font-bold focus:border-life-gold outline-none" /><span className="text-xs text-life-muted">mins</span></div>}

            {/* Reward Type Toggle & Selection */}
            <div>
                <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">
                    Reward Source
                </label>
                
                {/* Toggle Switch */}
                <div className="flex bg-life-black rounded-lg border border-zinc-800 p-1 mb-4">
                    <button
                        type="button"
                        onClick={() => setRewardType('stat')}
                        className={`flex-1 py-2 rounded-md text-[10px] font-bold uppercase transition-all ${rewardType === 'stat' ? 'bg-life-gold text-life-black shadow-sm' : 'text-life-muted hover:text-white hover:bg-white/5'}`}
                    >
                        Attribute Focus
                    </button>
                    <button
                        type="button"
                        onClick={() => setRewardType('skill')}
                        className={`flex-1 py-2 rounded-md text-[10px] font-bold uppercase transition-all ${rewardType === 'skill' ? 'bg-life-gold text-life-black shadow-sm' : 'text-life-muted hover:text-white hover:bg-white/5'}`}
                    >
                        Skill Link
                    </button>
                </div>

                {/* Conditional Render */}
                {rewardType === 'stat' ? (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-7 gap-2">
                            {Object.values(Stat).map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setStat(s)}
                                    className={`
                                        flex flex-col items-center justify-center p-2 rounded-lg border transition-all aspect-square
                                        ${stat === s 
                                            ? 'bg-life-muted/10 border-current shadow-lg scale-110' 
                                            : 'border-zinc-800 text-life-muted opacity-70 hover:opacity-100 hover:bg-life-muted/5'}
                                    `}
                                    style={{ color: stat === s ? STAT_COLORS[s] : undefined }}
                                >
                                    <StatIcon type={s} />
                                    <span className="text-[9px] font-bold mt-1">{s}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-2">
                        <div className="relative">
                            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-life-muted" size={16} />
                            <select 
                                value={selectedSkillId}
                                onChange={(e) => {
                                    const newSkillId = e.target.value;
                                    setSelectedSkillId(newSkillId);
                                    // Auto-update stat based on skill
                                    const skill = skillState.skills.find(s => s.id === newSkillId);
                                    if (skill && skill.relatedStats.length > 0) {
                                        setStat(skill.relatedStats[0]);
                                    }
                                }}
                                className="w-full bg-life-black border border-zinc-800 rounded-lg p-3 pl-10 text-xs text-life-text appearance-none focus:outline-none focus:border-life-gold/50"
                            >
                                <option value="">Select a Skill...</option>
                                {skillState.skills.map(skill => (
                                    <option key={skill.id} value={skill.id}>{skill.title} (Lvl {skill.level})</option>
                                ))}
                            </select>
                            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-life-muted rotate-90" size={14} />
                        </div>
                        
                        {selectedSkillId && (
                            <div className="p-3 bg-life-gold/10 border border-life-gold/20 rounded-lg flex items-center gap-3">
                                <div className="p-2 bg-life-gold/20 rounded-full text-life-gold">
                                    <Zap size={14} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] text-life-gold font-bold uppercase tracking-wider">Auto-Linked Attribute</p>
                                    <p className="text-xs text-life-text font-mono">{stat}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <button type="submit" className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all mt-4 ${title ? 'bg-life-gold text-life-black hover:bg-yellow-400 shadow-[0_0_20px_rgba(251,191,36,0.3)]' : 'bg-life-muted/20 text-life-muted cursor-not-allowed'}`} disabled={!title}>Install Protocol <ChevronRight size={16} /></button>
        </form>
    );
};

export default HabitForm;
