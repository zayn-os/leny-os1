
import React, { useRef, useEffect } from 'react';
import { FileText, CheckSquare, Plus, Bell, X, Trash2, Clock, Zap, Dumbbell, Brain, Shield, Heart, Activity, Palette, Lock, BookOpen, ChevronRight } from 'lucide-react';
import { Subtask } from '../../../types/taskTypes';
import { Reminder, Difficulty, Stat } from '../../../types/types';
import { DIFFICULTY_COLORS, DIFFICULTY_BG, STAT_COLORS } from '../../../types/constants';
import { useSkills } from '../../../contexts/SkillContext';

interface RaidStepEditorProps {
    stepIndex: number;
    step: {
        title: string;
        notes: string;
        subtasks: Subtask[];
        reminders: Reminder[];
        difficulty?: Difficulty;
        stat?: Stat;
        scheduledTime?: string;
        isTimed?: boolean;
        durationMinutes?: number;
    };
    parentDifficulty: Difficulty;
    parentStat: Stat;
    parentSkillId?: string;
    onUpdate: (index: number, field: string, value: any) => void;
    onClose: () => void;
    
    // Subtask Handlers
    onAddSubtask: (index: number) => void;
    onRemoveSubtask: (stepIndex: number, subtaskId: string) => void;
    onChangeSubtask: (stepIndex: number, subtaskIndex: number, val: string) => void;
    
    // Reminder Handlers
    onAddReminder: (index: number, minutes: number) => void;
    onRemoveReminder: (stepIndex: number, reminderId: string) => void;
}

export const RaidStepEditor: React.FC<RaidStepEditorProps> = ({
    stepIndex, step, parentDifficulty, parentStat, parentSkillId, onUpdate, onClose,
    onAddSubtask, onRemoveSubtask, onChangeSubtask,
    onAddReminder, onRemoveReminder
}) => {
    const { skillState } = useSkills();
    const subtaskInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // 🟢 FOCUS NEW SUBTASK
    useEffect(() => {
        if (step.subtasks.length > 0) {
            const lastIdx = step.subtasks.length - 1;
            if (step.subtasks[lastIdx].title === '') {
                subtaskInputRefs.current[lastIdx]?.focus();
            }
        }
    }, [step.subtasks.length]);

    const activeDifficulty = step.difficulty || parentDifficulty;
    const activeStat = step.stat || parentStat;
    const parentSkill = skillState.skills.find(s => s.id === parentSkillId);

    const getReminderLabel = (minutes: number) => {
        if (minutes === 0) return 'At time';
        if (minutes === 60) return '1h before';
        if (minutes === 1440) return '1d before';
        return `${minutes}m before`;
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-life-paper w-full max-w-md rounded-2xl border border-life-muted/20 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* HEADER */}
                <div className="flex items-center justify-between p-4 border-b border-life-muted/20 bg-life-black/50 shrink-0">
                    <h3 className="text-sm font-black tracking-tight text-life-text flex items-center gap-2 uppercase">
                        <span className="text-life-gold">///</span> Edit Step {stepIndex + 1}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="text-life-muted hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-4 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
                
                {/* 1. OBJECTIVE (TITLE) */}
                <div>
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">Tactical Objective</label>
                    <input
                        type="text"
                        value={step.title}
                        onChange={(e) => onUpdate(stepIndex, 'title', e.target.value)}
                        placeholder="e.g. Secure the perimeter..."
                        autoFocus
                        className="w-full bg-life-black border border-life-muted/30 rounded-lg p-3 text-sm text-life-text font-medium placeholder:text-life-muted/50 focus:outline-none focus:border-life-gold/50 transition-all"
                    />
                </div>

                {/* 2. LOCKED SKILL (INHERITED) */}
                <div>
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2 flex items-center gap-1">
                        <Lock size={10} /> Inherited Skill
                    </label>
                    <div className="flex items-center gap-3 bg-life-black/30 p-3 rounded-lg border border-life-muted/20 opacity-70">
                        <BookOpen size={16} className="text-life-gold" />
                        <span className="text-xs font-bold text-life-text">
                            {parentSkill ? `${parentSkill.title} (Lvl ${parentSkill.level})` : 'No Skill Linked'}
                        </span>
                        <span className="ml-auto text-[8px] uppercase font-black text-life-muted tracking-widest">Locked</span>
                    </div>
                </div>

                {/* 3. DIFFICULTY (BIG BUTTONS) */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest">Threat Level</label>
                        {!step.difficulty && <span className="text-[8px] uppercase font-black text-life-gold/50 tracking-widest">Inherited</span>}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {Object.values(Difficulty).map((diff) => (
                            <button 
                                key={diff} 
                                type="button" 
                                onClick={() => {
                                    // If clicking the already set override, reset to inherited
                                    if (step.difficulty === diff) {
                                        onUpdate(stepIndex, 'difficulty', undefined);
                                    } else {
                                        onUpdate(stepIndex, 'difficulty', diff);
                                    }
                                }} 
                                className={`py-3 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${activeDifficulty === diff ? `${DIFFICULTY_COLORS[diff]} ${DIFFICULTY_BG[diff]} shadow-lg scale-[1.02]` : 'border-life-muted/20 text-life-muted hover:bg-life-muted/5'}`}
                            >
                                {diff}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. ATTRIBUTE (BIG SQUARES) */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest">Attribute Focus</label>
                        {!step.stat && <span className="text-[8px] uppercase font-black text-life-gold/50 tracking-widest">Inherited</span>}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {Object.values(Stat).map((s) => {
                            const isSelected = activeStat === s;
                            return (
                                <button 
                                    key={s} 
                                    type="button" 
                                    onClick={() => {
                                        // If clicking the already set override, reset to inherited
                                        if (step.stat === s) {
                                            onUpdate(stepIndex, 'stat', undefined);
                                        } else {
                                            onUpdate(stepIndex, 'stat', s);
                                        }
                                    }} 
                                    className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all aspect-square relative ${isSelected ? 'bg-life-muted/10 border-current shadow-lg scale-110' : 'border-life-muted/20 text-life-muted hover:bg-life-muted/5 opacity-70 hover:opacity-100'}`} 
                                    style={{ color: isSelected ? STAT_COLORS[s] : undefined }}
                                >
                                    <StatIcon type={s} />
                                    <span className="text-[8px] font-bold mt-1">{s}</span>
                                    {isSelected && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_5px_currentColor]" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 5. FOCUS TIMER (TOGGLE) */}
                <div>
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">Focus Timer</label>
                    <div className="flex bg-life-black border border-life-muted/20 rounded-lg p-1">
                        <button
                            type="button"
                            onClick={() => onUpdate(stepIndex, 'isTimed', false)}
                            className={`flex-1 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${!step.isTimed ? 'bg-life-muted/20 text-white shadow-sm' : 'text-life-muted hover:text-life-silver'}`}
                        >
                            No Timer
                        </button>
                        <button
                            type="button"
                            onClick={() => onUpdate(stepIndex, 'isTimed', true)}
                            className={`flex-1 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${step.isTimed ? 'bg-life-gold/20 text-life-gold shadow-sm' : 'text-life-muted hover:text-life-silver'}`}
                        >
                            With Timer
                        </button>
                    </div>
                    
                    {step.isTimed && (
                        <div className="mt-3 animate-in slide-in-from-top-2 fade-in">
                            <div className="flex items-center gap-3 bg-life-black/50 p-3 rounded-lg border border-life-gold/20">
                                <Clock className="text-life-gold" size={18} />
                                <input 
                                    type="number" 
                                    value={step.durationMinutes || 0}
                                    onChange={(e) => onUpdate(stepIndex, 'durationMinutes', Number(e.target.value))}
                                    className="flex-1 bg-transparent text-lg font-mono text-white focus:outline-none"
                                    placeholder="0"
                                />
                                <span className="text-xs font-bold text-life-muted uppercase">Minutes</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* 6. SCHEDULED TIME */}
                <div>
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2 flex items-center gap-1">
                        <Clock size={12} /> Scheduled Start (Optional)
                    </label>
                    <input 
                        type="datetime-local"
                        value={step.scheduledTime || ''}
                        onChange={(e) => onUpdate(stepIndex, 'scheduledTime', e.target.value)}
                        className="w-full bg-life-black border border-life-muted/30 rounded-lg p-3 text-xs text-life-text focus:outline-none focus:border-life-gold/50 transition-all"
                    />
                </div>

                {/* 7. SUBTASKS */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest">Tactical Steps (Sub-objectives)</label>
                        <button type="button" onClick={() => onAddSubtask(stepIndex)} className="text-[10px] flex items-center gap-1 text-life-gold hover:text-white transition-colors uppercase font-bold">
                            <Plus size={12} /> Add Step
                        </button>
                    </div>
                    
                    {step.subtasks.length === 0 ? (
                        <div onClick={() => onAddSubtask(stepIndex)} className="border border-dashed border-life-muted/20 rounded-lg p-4 text-center cursor-pointer hover:bg-life-muted/5 transition-colors group">
                            <p className="text-[10px] text-life-muted group-hover:text-life-silver">No sub-objectives. Tap 'Add Step' to start planning.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {step.subtasks.map((st, sIdx) => (
                                <div key={st.id} className="flex items-center gap-2 bg-life-black p-2 rounded-lg border border-life-muted/20 focus-within:border-life-gold/50 transition-all">
                                    <div className="w-4 h-4 rounded border border-life-muted/30 flex items-center justify-center shrink-0">
                                        <div className="w-2 h-2 rounded-sm bg-life-muted/20" />
                                    </div>
                                    <input
                                        ref={(el) => { subtaskInputRefs.current[sIdx] = el; }}
                                        type="text"
                                        value={st.title}
                                        onChange={(e) => onChangeSubtask(stepIndex, sIdx, e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (sIdx < step.subtasks.length - 1) {
                                                    subtaskInputRefs.current[sIdx + 1]?.focus();
                                                } else {
                                                    onAddSubtask(stepIndex);
                                                    // Focus will happen in useEffect or next render if we had a way to track new subtask
                                                    // For now, simple focus next is better.
                                                }
                                            }
                                        }}
                                        placeholder="Sub-objective..."
                                        className="flex-1 bg-transparent text-xs text-life-text focus:outline-none"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => onRemoveSubtask(stepIndex, st.id)}
                                        className="text-life-muted hover:text-life-hard p-1 opacity-50 hover:opacity-100"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 8. INTEL / NOTES */}
                <div>
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2 flex items-center gap-1">
                        <FileText size={12} /> Intel / Notes
                    </label>
                    <textarea
                        value={step.notes}
                        onChange={(e) => onUpdate(stepIndex, 'notes', e.target.value)}
                        placeholder="Add detailed instructions, links, or coordinates..."
                        className="w-full h-24 bg-life-black border border-life-muted/30 rounded-lg p-3 text-xs text-life-text focus:border-life-gold outline-none resize-none font-mono leading-relaxed"
                    />
                </div>

                {/* 9. ALERTS */}
                <div>
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2 flex items-center gap-1">
                        <Bell size={12} /> Alerts
                    </label>
                    <div className="bg-life-black border border-life-muted/20 rounded-lg p-2">
                        <div className="flex flex-wrap gap-2 mb-3">
                            {step.reminders.map(rem => (
                                <div key={rem.id} className="flex items-center gap-1 px-2 py-1 bg-life-gold/10 border border-life-gold/30 rounded text-[9px] text-life-gold font-bold">
                                    <span>{getReminderLabel(rem.minutesBefore)}</span>
                                    <button type="button" onClick={() => onRemoveReminder(stepIndex, rem.id)} className="hover:text-white">
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                            {step.reminders.length === 0 && <span className="text-[10px] text-life-muted italic p-1">No active alerts</span>}
                        </div>
                        
                        <div className="relative">
                            <select 
                                value={-1}
                                onChange={(e) => onAddReminder(stepIndex, Number(e.target.value))}
                                className="w-full bg-life-black/50 border border-life-muted/30 rounded p-2 text-xs text-life-muted focus:outline-none focus:border-life-gold/50 appearance-none"
                            >
                                <option value={-1}>+ Add Reminder</option>
                                <option value={0}>At scheduled time</option>
                                <option value={5}>5 mins before</option>
                                <option value={15}>15 mins before</option>
                                <option value={30}>30 mins before</option>
                                <option value={60}>1 hour before</option>
                            </select>
                            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-life-muted rotate-90 pointer-events-none" size={14} />
                        </div>
                    </div>
                </div>

                {/* Bottom Spacer */}
                <div className="h-4" />
            </div>

            {/* FOOTER */}
            <div className="p-4 bg-life-black/80 border-t border-life-muted/20 shrink-0">
                <button 
                    onClick={onClose}
                    className="w-full py-3 rounded-xl bg-life-gold text-life-black font-black uppercase tracking-widest text-xs hover:bg-yellow-400 transition-all shadow-lg shadow-life-gold/10"
                >
                    Apply Tactical Intel
                </button>
            </div>
        </div>
    </div>
);
};
