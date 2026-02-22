
import React, { useState, useRef, useEffect } from 'react';
import { Dumbbell, Brain, Zap, Shield, Heart, Activity, ChevronRight, BookOpen, Clock, Calendar, AlignLeft, Folder, Plus, Trash2, Target, Bell, X, Palette, CalendarPlus } from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';
import { useSkills } from '../../contexts/SkillContext';
import { useLifeOS } from '../../contexts/LifeOSContext';
import { Difficulty, Stat, Reminder } from '../../types/types';
import { EnergyLevel } from '../../types/taskTypes';
import { STAT_COLORS, DIFFICULTY_COLORS, DIFFICULTY_BG } from '../../types/constants';
import { openInGoogleCalendar } from '../../utils/googleCalendar';

interface TaskFormProps {
    onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onClose }) => {
    const { state } = useLifeOS(); 
    const { taskDispatch, taskState } = useTasks();
    const { skillState } = useSkills();
    const { categories } = taskState;
    const showCalendarSync = state.user.preferences.showCalendarSync ?? true;
    
    // 1. ANATOMY INPUTS
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState(''); 
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
    const [energyLevel] = useState<EnergyLevel>('medium'); 
    const [stat, setStat] = useState<Stat>(Stat.DIS);
    const [selectedSkillId, setSelectedSkillId] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>(''); 
    
    // Subtasks
    const [subtasks, setSubtasks] = useState<string[]>([]);
    
    // 🟢 Refs & Focus Logic for Subtasks
    const subtaskRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [focusLastSubtask, setFocusLastSubtask] = useState(false);

    useEffect(() => {
        if (focusLastSubtask && subtasks.length > 0) {
            const lastIdx = subtasks.length - 1;
            subtaskRefs.current[lastIdx]?.focus();
            setFocusLastSubtask(false);
        }
    }, [subtasks, focusLastSubtask]);

    // 🕰️ SCHEDULING LOGIC (UPDATED)
    const modalData = state.ui.modalData || {};
    const initialDate = modalData.date || '';
    
    // If coming from Calendar, default to 09:00 AM on that day
    const defaultScheduledTime = initialDate ? `${initialDate}T09:00` : '';

    const [deadline, setDeadline] = useState(initialDate);
    const [scheduledTime, setScheduledTime] = useState(defaultScheduledTime);
    
    // 🗓️ GOOGLE CALENDAR SYNC TOGGLE
    const [syncCalendar, setSyncCalendar] = useState(false);

    // ⏰ REMINDERS ARRAY (Auto-add if date selected)
    const [reminders, setReminders] = useState<Reminder[]>(() => {
        if (initialDate) {
            return [{ 
                id: `auto_rem_${Date.now()}`, 
                minutesBefore: 0, // Alert at time of event
                isSent: false 
            }];
        }
        return [];
    });

    // 🟢 ORIGIN DETECTION
    // Check where the form was opened from (Calendar vs Campaign vs Default)
    const origin = modalData.origin; // 'calendar' | 'campaign'
    
    // Campaign: Explicitly from CampaignView (Indigo)
    const isG12Origin = origin === 'campaign'; 
    
    // Calendar: Explicitly from CalendarView (Blue)
    const isC30Origin = origin === 'calendar';

    // Timer Logic
    const [isTimed, setIsTimed] = useState(false);
    const [duration, setDuration] = useState<number>(25); // 🟢 Updated Default to 25

    // Auto-enable calendar sync if time is set AND PREFERENCE IS ON
    useEffect(() => {
        if (scheduledTime && showCalendarSync) {
            setSyncCalendar(true);
        } else if (!showCalendarSync) {
            setSyncCalendar(false);
        }
    }, [scheduledTime, showCalendarSync]);

    const handleAddSubtask = () => {
        setSubtasks([...subtasks, '']);
        setFocusLastSubtask(true);
    };

    const handleSubtaskChange = (index: number, val: string) => {
        const newSubtasks = [...subtasks];
        newSubtasks[index] = val;
        setSubtasks(newSubtasks);
    };

    const handleSubtaskKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Enter' || e.key === 'Shift') {
            e.preventDefault();
            if (index < subtasks.length - 1) {
                subtaskRefs.current[index + 1]?.focus();
            } else {
                handleAddSubtask();
            }
        } else if (e.key === 'Backspace' && subtasks[index] === '' && subtasks.length > 0) {
            e.preventDefault();
            handleRemoveSubtask(index);
            if (index > 0) setTimeout(() => subtaskRefs.current[index - 1]?.focus(), 0);
        }
    };

    const handleRemoveSubtask = (index: number) => {
        setSubtasks(subtasks.filter((_, i) => i !== index));
    };

    const handleAddReminder = (minutes: number) => {
        if (minutes === -1) return;
        const exists = reminders.some(r => r.minutesBefore === minutes);
        if (!exists) {
            setReminders([...reminders, { id: `rem_${Date.now()}`, minutesBefore: minutes, isSent: false }].sort((a,b) => a.minutesBefore - b.minutesBefore));
        }
    };

    const handleRemoveReminder = (id: string) => {
        setReminders(reminders.filter(r => r.id !== id));
    };

    const getReminderLabel = (minutes: number) => {
        if (minutes === 0) return 'At time of event';
        if (minutes === 5) return '5 mins before';
        if (minutes === 15) return '15 mins before';
        if (minutes === 30) return '30 mins before';
        if (minutes === 60) return '1 hour before';
        if (minutes === 120) return '2 hours before';
        if (minutes === 1440) return '1 day before';
        return `${minutes} mins before`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        const validSubtasks = subtasks.filter(st => st.trim() !== '');
        const formattedSubtasks = validSubtasks.map((st, idx) => ({
            id: `st_${Date.now()}_${idx}`,
            title: st,
            isCompleted: false
        }));

        taskDispatch.addTask({
            title,
            description,
            difficulty,
            energyLevel,
            stat,
            isTimed,
            durationMinutes: isTimed ? duration : undefined,
            deadline: deadline || undefined,
            scheduledTime: scheduledTime || undefined,
            reminders: reminders,
            skillId: selectedSkillId || undefined,
            categoryId: selectedCategory || undefined,
            subtasks: formattedSubtasks,
            isCampaign: isG12Origin, // 🟢 G12 Only
            isCalendarEvent: isC30Origin // 🟢 C30 Only
        });

        // 🗓️ TRIGGER GOOGLE CALENDAR
        // Check BOTH local state AND global preference
        if (syncCalendar && scheduledTime && showCalendarSync) {
            // Construct detailed description
            let fullDesc = description;
            if (formattedSubtasks.length > 0) {
                fullDesc += "\n\nSubtasks:\n" + formattedSubtasks.map(s => `- [ ] ${s.title}`).join('\n');
            }
            
            openInGoogleCalendar(
                title,
                fullDesc,
                scheduledTime,
                isTimed ? duration : 60
            );
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
            
            {/* 🟢 ORIGIN INDICATORS (G12 vs C30) */}
            {isG12Origin && (
                <div className="bg-indigo-500/10 border border-indigo-500/30 p-2 rounded-lg flex items-center gap-2 mb-2">
                    <Target size={16} className="text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">
                        Linked to Campaign (G12)
                    </span>
                </div>
            )}

            {isC30Origin && (
                <div className="bg-blue-500/10 border border-blue-500/30 p-2 rounded-lg flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-blue-400" />
                    <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">
                        Linked to Calendar (C30)
                    </span>
                </div>
            )}

            {/* Title & Description */}
            <div className="space-y-3">
                <div>
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">
                        Mission Objective
                    </label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Physics Homework..."
                        autoFocus
                        className="w-full bg-life-black border border-life-muted/30 rounded-lg p-3 text-life-text placeholder:text-life-muted/50 focus:outline-none focus:border-life-gold/50 font-medium"
                    />
                </div>
                
                {/* ⏰ TIME & DEADLINE GROUP */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2 flex items-center gap-1">
                            <Clock size={10} /> Schedule Time
                        </label>
                        <input 
                            type="datetime-local" 
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="w-full bg-life-black border border-life-muted/30 rounded-lg p-2 text-xs text-life-text focus:outline-none focus:border-life-gold/50"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2 flex items-center gap-1">
                            <Calendar size={10} /> Deadline
                        </label>
                        <input 
                            type="date" 
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="w-full bg-life-black border border-life-muted/30 rounded-lg p-2 text-xs text-life-text focus:outline-none focus:border-life-gold/50"
                        />
                    </div>
                </div>

                {/* 🗓️ GOOGLE CALENDAR TOGGLE */}
                {scheduledTime && showCalendarSync && (
                    <div 
                        onClick={() => setSyncCalendar(!syncCalendar)}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${syncCalendar ? 'bg-blue-500/10 border-blue-500/50' : 'bg-life-black border-life-muted/20'}`}
                    >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${syncCalendar ? 'bg-blue-500 border-blue-500 text-white' : 'border-life-muted'}`}>
                            {syncCalendar && <CalendarPlus size={10} />}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${syncCalendar ? 'text-blue-400' : 'text-life-muted'}`}>
                            Sync to Google Calendar
                        </span>
                    </div>
                )}

                {/* 🔔 REMINDERS LIST */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest flex items-center gap-1">
                            <Bell size={10} /> Notifications
                        </label>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                        {reminders.map(rem => (
                            <div key={rem.id} className="flex items-center gap-1 px-2 py-1 bg-life-gold/10 border border-life-gold/30 rounded text-[10px] text-life-gold">
                                <span>{getReminderLabel(rem.minutesBefore)}</span>
                                <button type="button" onClick={() => handleRemoveReminder(rem.id)} className="hover:text-life-text">
                                    <X size={10} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <select 
                        value={-1}
                        onChange={(e) => handleAddReminder(Number(e.target.value))}
                        className="w-full bg-life-black border border-life-muted/30 rounded-lg p-2 text-xs text-life-muted focus:outline-none focus:border-life-gold/50"
                    >
                        <option value={-1}>+ Add Reminder...</option>
                        <option value={0}>At time of event</option>
                        <option value={5}>5 mins before</option>
                        <option value={15}>15 mins before</option>
                        <option value={30}>30 mins before</option>
                        <option value={60}>1 hour before</option>
                        <option value={120}>2 hours before</option>
                        <option value={1440}>1 day before</option>
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <AlignLeft size={10} /> Details / Intel
                    </label>
                    <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. Chapter 1, Exercises 1-5..."
                        rows={2}
                        className="w-full bg-life-black border border-life-muted/30 rounded-lg p-3 text-sm text-life-text placeholder:text-life-muted/50 focus:outline-none focus:border-life-gold/50 resize-none"
                    />
                </div>
            </div>

            {/* Subtasks - 🟢 UPDATED FOR FAST ENTRY */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest">
                        Tactical Steps (Sub-objectives)
                    </label>
                    <button 
                        type="button" 
                        onClick={handleAddSubtask} 
                        className="text-[10px] flex items-center gap-1 text-life-gold hover:text-white uppercase font-bold"
                    >
                        <Plus size={12} /> Add Step
                    </button>
                </div>
                
                <div className="space-y-2">
                    {subtasks.map((st, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-life-black px-2 py-1 rounded-lg border border-life-muted/20 focus-within:border-life-gold/50 transition-colors">
                            <span className="text-[10px] text-life-muted font-mono w-4">{idx + 1}.</span>
                            <input 
                                ref={(el) => { subtaskRefs.current[idx] = el; }}
                                type="text"
                                value={st}
                                onChange={(e) => handleSubtaskChange(idx, e.target.value)}
                                onKeyDown={(e) => handleSubtaskKeyDown(e, idx)}
                                placeholder="Sub-objective..."
                                enterKeyHint="next"
                                className="flex-1 bg-transparent text-xs text-life-text focus:outline-none py-1"
                            />
                            <button type="button" onClick={() => handleRemoveSubtask(idx)} className="text-life-muted hover:text-life-hard p-1">
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                    {subtasks.length === 0 && (
                        <div onClick={handleAddSubtask} className="text-[10px] text-life-muted/40 italic border border-dashed border-life-muted/20 rounded p-2 text-center cursor-pointer hover:bg-life-muted/5 hover:text-life-muted/60">
                            No sub-objectives. Tap 'Add Step' or press + to start planning.
                        </div>
                    )}
                </div>
            </div>

            {/* Difficulty */}
            <div>
                <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">
                    Difficulty
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {Object.values(Difficulty).map((diff) => (
                        <button
                            key={diff}
                            type="button"
                            onClick={() => setDifficulty(diff)}
                            className={`
                                py-3 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all
                                ${difficulty === diff 
                                    ? `${DIFFICULTY_COLORS[diff]} ${DIFFICULTY_BG[diff]} shadow-[0_0_10px_rgba(0,0,0,0.5)] scale-105` 
                                    : 'border-life-muted/20 text-life-muted hover:bg-life-muted/5'}
                            `}
                        >
                            {diff}
                        </button>
                    ))}
                </div>
            </div>

            {/* Timer Toggle */}
            <div>
                <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">
                    Focus Timer
                </label>
                <div className="flex bg-life-black rounded-lg border border-life-muted/30 p-1 mb-2">
                    <button
                        type="button"
                        onClick={() => setIsTimed(false)}
                        className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase ${!isTimed ? 'bg-life-muted/30 text-white' : 'text-life-muted'}`}
                    >
                        No Timer
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsTimed(true)}
                        className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase ${isTimed ? 'bg-life-gold text-life-black' : 'text-life-muted'}`}
                    >
                        With Timer
                    </button>
                </div>
                {isTimed && (
                    <div className="flex items-center gap-2 animate-in slide-in-from-top-2">
                        <Clock size={14} className="text-life-gold" />
                        <input 
                            type="number" 
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                            className="w-16 bg-life-black border border-life-muted/30 rounded p-1 text-center text-sm font-bold focus:border-life-gold outline-none"
                        />
                        <span className="text-xs text-life-muted">minutes duration</span>
                    </div>
                )}
            </div>

            {/* Extras: Category, Skill, Deadline */}
            <div className="grid grid-cols-2 gap-3">
                {/* Category Selector */}
                <div>
                     <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">
                        Category
                    </label>
                    <div className="relative">
                        <Folder className="absolute left-3 top-1/2 -translate-y-1/2 text-life-muted" size={16} />
                        <select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full bg-life-black border border-life-muted/30 rounded-lg p-2 pl-9 text-xs text-life-text appearance-none focus:outline-none focus:border-life-gold/50"
                        >
                            <option value="">(Uncategorized)</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.title}</option>
                            ))}
                        </select>
                         <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-life-muted rotate-90" size={14} />
                    </div>
                </div>

                {/* Skill Link */}
                <div>
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">
                        Skill Link
                    </label>
                    <div className="relative">
                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-life-muted" size={16} />
                        <select 
                            value={selectedSkillId}
                            onChange={(e) => setSelectedSkillId(e.target.value)}
                            className="w-full bg-life-black border border-life-muted/30 rounded-lg p-2 pl-9 text-xs text-life-text appearance-none focus:outline-none focus:border-life-gold/50"
                        >
                            <option value="">None</option>
                            {skillState.skills.map(skill => (
                                <option key={skill.id} value={skill.id}>{skill.title}</option>
                            ))}
                        </select>
                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-life-muted rotate-90" size={14} />
                    </div>
                </div>
            </div>

            {/* Stat (Moved to Bottom) */}
            <div>
                 <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">
                    Attribute
                </label>
                {/* 🟢 Updated grid cols to 7 */}
                <div className="grid grid-cols-7 gap-2">
                    {Object.values(Stat).map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setStat(s)}
                            className={`
                                flex flex-col items-center justify-center p-2 rounded border transition-all aspect-square
                                ${stat === s 
                                    ? 'bg-life-muted/10 border-current shadow-sm scale-105' 
                                    : 'border-life-muted/20 text-life-muted opacity-50 hover:opacity-100'}
                            `}
                            style={{ color: stat === s ? STAT_COLORS[s] : undefined }}
                        >
                            <StatIcon type={s} />
                            <span className="text-[8px] font-bold mt-1">{s}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Submit */}
            <button
                type="submit"
                className={`
                    w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all mt-4
                    ${title ? 'bg-life-gold text-life-black hover:bg-yellow-400 shadow-[0_0_20px_rgba(251,191,36,0.3)]' : 'bg-life-muted/20 text-life-muted cursor-not-allowed'}
                `}
                disabled={!title}
            >
                Confirm Mission <ChevronRight size={16} />
            </button>
        </form>
    );
};

export default TaskForm;
