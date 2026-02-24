
import React, { useState, useEffect } from 'react';
import { Dumbbell, Brain, Zap, Shield, Heart, Activity, ChevronRight, BookOpen, Clock, Calendar, AlignLeft, Folder, Plus, Trash2, Target, Bell, X, Palette, CalendarPlus, Flame, Users, Coins } from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';
import { useSkills } from '../../contexts/SkillContext';
import { useLifeOS } from '../../contexts/LifeOSContext';
import { Task, Subtask } from '../../types/taskTypes';
import { Difficulty, Stat } from '../../types/types';
import { DIFFICULTY_COLORS, DIFFICULTY_BG, STAT_COLORS } from '../../types/constants';
import { openInGoogleCalendar } from '../../utils/googleCalendar';

interface TaskFormProps {
    onClose: () => void;
    initialData?: Task | null;
}

const TaskForm: React.FC<TaskFormProps> = ({ onClose, initialData }) => {
    const { taskDispatch } = useTasks();
    const { skillState } = useSkills();
    const { state } = useLifeOS();
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
    const [stat, setStat] = useState<Stat>(Stat.DIS);
    const [skillId, setSkillId] = useState<string>('');
    const [dueDate, setDueDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [isTimed, setIsTimed] = useState(false);
    const [durationMinutes, setDurationMinutes] = useState(0);
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [newSubtask, setNewSubtask] = useState('');
    const [reminderTime, setReminderTime] = useState('');
    const [isGoogleCalSync, setIsGoogleCalSync] = useState(false);

    // Initialize Data (Edit Mode)
    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description || '');
            setDifficulty(initialData.difficulty);
            setStat(initialData.stat);
            setSkillId(initialData.skillId || '');
            setDueDate(initialData.deadline ? new Date(initialData.deadline).toISOString().slice(0, 16) : '');
            setScheduledTime(initialData.scheduledTime ? new Date(initialData.scheduledTime).toISOString().slice(0, 16) : '');
            setIsTimed(initialData.isTimed || false);
            setDurationMinutes(initialData.durationMinutes || 0);
            setSubtasks(initialData.subtasks || []);
            
            if (initialData.skillId) {
                setRewardType('skill');
            }
        }
    }, [initialData]);

    // 🟢 REWARD TYPE TOGGLE
    const [rewardType, setRewardType] = useState<'stat' | 'skill'>('stat');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        const taskData: any = {
            title,
            description,
            difficulty,
            stat,
            skillId: rewardType === 'skill' ? (skillId || undefined) : undefined,
            deadline: dueDate || undefined,
            scheduledTime: scheduledTime || undefined,
            isTimed,
            durationMinutes: isTimed ? durationMinutes : 0,
            subtasks
        };

        if (initialData) {
            taskDispatch.updateTask(initialData.id, taskData);
        } else {
            taskDispatch.addTask(taskData);
            
            // 📅 Google Calendar Sync
            if (isGoogleCalSync && scheduledTime) {
                openInGoogleCalendar(
                    title,
                    description,
                    scheduledTime,
                    isTimed ? durationMinutes : 60
                );
            }
        }
        onClose();
    };

    const addSubtask = () => {
        if (!newSubtask.trim()) return;
        const newSt: Subtask = {
            id: `st_${Date.now()}`,
            title: newSubtask,
            isCompleted: false
        };
        setSubtasks([...subtasks, newSt]);
        setNewSubtask('');
    };

    const removeSubtask = (id: string) => {
        setSubtasks(subtasks.filter(st => st.id !== id));
    };

    const StatIcon = ({ type }: { type: Stat }) => {
        switch (type) {
          case Stat.STR: return <Dumbbell size={18} />;
          case Stat.INT: return <Brain size={18} />;
          case Stat.DIS: return <Zap size={18} />;
          case Stat.HEA: return <Heart size={18} />;
          case Stat.CRT: return <Palette size={18} />;
          case Stat.SPR: return <Flame size={18} />;
          case Stat.REL: return <Users size={18} />;
          case Stat.FIN: return <Coins size={18} />;
          default: return <Activity size={18} />;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
            
            {/* 1. IDENTITY SECTION */}
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">Mission Objective</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            placeholder="e.g. Complete Project Alpha" 
                            autoFocus
                            className="w-full bg-life-black border border-life-muted/30 rounded-lg p-3 pr-12 text-life-text placeholder:text-life-muted/50 focus:outline-none focus:border-life-gold/50 transition-all font-medium"
                        />
                        <button 
                            type="button"
                            onClick={() => setIsTimed(!isTimed)}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors ${isTimed ? 'bg-life-gold text-life-black' : 'text-life-muted hover:bg-life-muted/10'}`}
                            title="Toggle Timer"
                        >
                            <Clock size={16} />
                        </button>
                    </div>
                    {isTimed && (
                        <div className="mt-2 animate-in slide-in-from-top-2 fade-in">
                            <div className="flex items-center gap-2 bg-life-black border border-life-muted/20 rounded-lg p-2 w-fit">
                                <Clock size={14} className="text-life-gold" />
                                <input 
                                    type="number" 
                                    min="1"
                                    value={durationMinutes || ''} 
                                    onChange={e => setDurationMinutes(parseInt(e.target.value) || 0)} 
                                    placeholder="Min" 
                                    className="w-12 bg-transparent text-sm text-life-text focus:outline-none text-center font-mono"
                                />
                                <span className="text-[10px] text-life-muted uppercase">Mins</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* DIFFICULTY */}
                <div>
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">Threat Level</label>
                    <div className="grid grid-cols-3 gap-2">
                        {Object.values(Difficulty).map((d) => (
                            <button
                                key={d}
                                type="button"
                                onClick={() => setDifficulty(d)}
                                className={`py-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${difficulty === d ? `${DIFFICULTY_COLORS[d]} ${DIFFICULTY_BG[d]} shadow-lg scale-[1.02] border-transparent` : 'bg-life-black border-life-muted/20 text-life-muted hover:bg-life-muted/5'}`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>


            </div>

            {/* 2. CONTEXT & LINKAGE */}
            <div className="space-y-4">
                {/* Intel / Description */}
                <div>
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2 flex items-center gap-1">
                        <AlignLeft size={12} /> Intel / Notes
                    </label>
                    <textarea 
                        rows={3}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Add details, links, or sub-objectives..."
                        className="w-full bg-life-black border border-life-muted/30 rounded-lg p-3 text-xs text-life-text placeholder:text-life-muted/50 focus:outline-none focus:border-life-gold/50 transition-all resize-none"
                    />
                </div>

                {/* Subtasks */}
                <div>
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2 flex items-center gap-1">
                        <Target size={12} /> Tactical Steps
                    </label>
                    <div className="space-y-2">
                        {subtasks.map(st => (
                            <div key={st.id} className="flex items-center gap-2 bg-life-black p-2 rounded border border-life-muted/20">
                                <span className="text-xs text-life-text flex-1">{st.title}</span>
                                <button type="button" onClick={() => removeSubtask(st.id)} className="text-life-muted hover:text-life-hard"><Trash2 size={12} /></button>
                            </div>
                        ))}
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={newSubtask}
                                onChange={e => setNewSubtask(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                                placeholder="Add step..."
                                className="flex-1 bg-life-black border border-life-muted/30 rounded p-2 text-xs focus:outline-none focus:border-life-gold/50"
                            />
                            <button type="button" onClick={addSubtask} className="p-2 bg-life-muted/10 rounded border border-life-muted/20 hover:bg-life-muted/20 text-life-muted hover:text-white"><Plus size={14} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. TIMING & ALERTS */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2 flex items-center gap-1">
                        <Clock size={12} /> Scheduled Start
                    </label>
                    <input 
                        type="datetime-local" 
                        value={scheduledTime}
                        onChange={e => setScheduledTime(e.target.value)}
                        className="w-full bg-life-black border border-life-muted/30 rounded-lg p-2.5 text-xs text-life-text focus:outline-none focus:border-life-gold/50"
                    />
                </div>
                <div>
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2 flex items-center gap-1">
                        <Calendar size={12} /> Deadline
                    </label>
                    <input 
                        type="datetime-local" 
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                        className="w-full bg-life-black border border-life-muted/30 rounded-lg p-2.5 text-xs text-life-text focus:outline-none focus:border-life-gold/50"
                    />
                </div>
            </div>

            {/* Google Calendar Sync Toggle */}
            {!initialData && scheduledTime && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-life-black border border-life-muted/20">
                    <CalendarPlus size={16} className={isGoogleCalSync ? "text-life-gold" : "text-life-muted"} />
                    <span className="text-xs text-life-text flex-1">Sync to Google Calendar</span>
                    <button 
                        type="button"
                        onClick={() => setIsGoogleCalSync(!isGoogleCalSync)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${isGoogleCalSync ? 'bg-life-gold' : 'bg-life-muted/30'}`}
                    >
                        <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${isGoogleCalSync ? 'translate-x-5' : ''}`} />
                    </button>
                </div>
            )}

                {/* REWARD SOURCE (STAT OR SKILL) */}
                <div>
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">
                        Reward Source
                    </label>
                    
                    {/* Toggle Switch */}
                    <div className="flex bg-life-black rounded-lg border border-life-muted/20 p-1 mb-4">
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
                            <div className="grid grid-cols-4 gap-2">
                                {Object.values(Stat).map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setStat(s)}
                                        className={`
                                            flex flex-col items-center justify-center p-3 rounded-lg border transition-all aspect-square
                                            ${stat === s 
                                                ? 'bg-life-muted/10 border-current shadow-lg scale-105' 
                                                : 'bg-life-black border-life-muted/20 text-life-muted opacity-70 hover:opacity-100 hover:bg-life-muted/5'}
                                        `}
                                        style={{ color: stat === s ? STAT_COLORS[s] : undefined }}
                                    >
                                        <StatIcon type={s} />
                                        <span className="text-[9px] font-bold mt-1.5">{s}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-2">
                            <div className="relative">
                                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-life-muted" size={16} />
                                <select 
                                    value={skillId}
                                    onChange={(e) => {
                                        const newSkillId = e.target.value;
                                        setSkillId(newSkillId);
                                        // Auto-update stat based on skill
                                        const skill = skillState.skills.find(s => s.id === newSkillId);
                                        if (skill && skill.relatedStats.length > 0) {
                                            setStat(skill.relatedStats[0]);
                                        }
                                    }}
                                    className="w-full bg-life-black border border-life-muted/30 rounded-lg p-3 pl-10 text-xs text-life-text appearance-none focus:outline-none focus:border-life-gold/50"
                                >
                                    <option value="">Select a Skill...</option>
                                    {skillState.skills.map(skill => (
                                        <option key={skill.id} value={skill.id}>{skill.title} (Lvl {skill.level})</option>
                                    ))}
                                </select>
                                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-life-muted rotate-90 pointer-events-none" size={14} />
                            </div>
                            
                            {skillId && (
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

            {/* ACTION BUTTON */}
            <button 
                type="submit" 
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg ${title ? 'bg-life-gold text-life-black hover:bg-yellow-400 shadow-life-gold/20' : 'bg-life-muted/10 text-life-muted cursor-not-allowed'}`}
                disabled={!title}
            >
                {initialData ? 'Update Mission' : 'Initiate Mission'}
            </button>

        </form>
    );
};

export default TaskForm;
