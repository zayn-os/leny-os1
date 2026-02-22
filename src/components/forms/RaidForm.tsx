
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Dumbbell, Brain, Zap, Shield, Heart, Activity, ChevronRight, BookOpen, Calendar, FileText, CheckSquare, Bell, Palette } from 'lucide-react';
import { useRaids } from '../../contexts/RaidContext';
import { useSkills } from '../../contexts/SkillContext';
import { useLifeOS } from '../../contexts/LifeOSContext';
import { Difficulty, Stat, Reminder } from '../../types/types';
import { Subtask } from '../../types/taskTypes';
import { STAT_COLORS, DIFFICULTY_COLORS, DIFFICULTY_BG } from '../../types/constants';
import { RaidStepEditor } from './parts/RaidStepEditor'; // 👈 IMPORT NEW COMPONENT

interface RaidFormProps {
    onClose: () => void;
}

interface PendingRaidStep {
    id: string;
    title: string;
    notes: string;
    subtasks: Subtask[];
    reminders: Reminder[];
    // 🟢 NEW FIELDS
    difficulty?: Difficulty;
    stat?: Stat;
    scheduledTime?: string;
    deadline?: string;
    isTimed?: boolean;
    durationMinutes?: number;
}

const RaidForm: React.FC<RaidFormProps> = ({ onClose }) => {
    const { state } = useLifeOS(); 
    const { raidDispatch } = useRaids();
    const { skillState } = useSkills();
    
    const [title, setTitle] = useState('');
    const initialDate = state.ui.modalData?.date ? state.ui.modalData.date.split('T')[0] : '';
    const [deadline, setDeadline] = useState(initialDate);
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
    const [selectedStats, setSelectedStats] = useState<Stat[]>([Stat.DIS]);
    const [selectedSkillId, setSelectedSkillId] = useState<string>('');
    
    const [raidSteps, setRaidSteps] = useState<PendingRaidStep[]>([
        { id: `temp_${Date.now()}_1`, title: '', notes: '', subtasks: [], reminders: [] },
        { id: `temp_${Date.now()}_2`, title: '', notes: '', subtasks: [], reminders: [] }
    ]);

    const stepInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);

    // 🟢 FOCUS NEW STEP
    useEffect(() => {
        if (raidSteps.length > 0) {
            const lastIdx = raidSteps.length - 1;
            if (raidSteps[lastIdx].title === '') {
                stepInputRefs.current[lastIdx]?.focus();
            }
        }
    }, [raidSteps.length]);

    const handleAddStep = () => {
        setRaidSteps([...raidSteps, { 
            id: `temp_${Date.now()}_${raidSteps.length + 1}`, 
            title: '', 
            notes: '', 
            subtasks: [], 
            reminders: [],
            // 🟢 INIT NEW FIELDS as undefined to inherit from Parent
            difficulty: undefined, 
            stat: undefined,
        }]);
    };

    const handleRemoveStep = (index: number) => {
        setRaidSteps(raidSteps.filter((_, i) => i !== index));
    };

    const handleStepChange = (index: number, field: keyof PendingRaidStep, value: any) => {
        const newSteps = [...raidSteps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setRaidSteps(newSteps);
    };

    // Subtask Handlers
    const handleAddSubtask = (index: number) => {
        const newSub: Subtask = { id: `st_new_${Date.now()}`, title: '', isCompleted: false };
        const newSteps = [...raidSteps];
        newSteps[index].subtasks.push(newSub);
        setRaidSteps(newSteps);
    };

    const handleSubtaskChange = (stepIndex: number, subtaskIndex: number, val: string) => {
        const newSteps = [...raidSteps];
        newSteps[stepIndex].subtasks[subtaskIndex].title = val;
        setRaidSteps(newSteps);
    };

    const handleRemoveSubtask = (stepIndex: number, subtaskId: string) => {
        const newSteps = [...raidSteps];
        newSteps[stepIndex].subtasks = newSteps[stepIndex].subtasks.filter(st => st.id !== subtaskId);
        setRaidSteps(newSteps);
    };

    // Reminder Handlers
    const handleAddReminder = (index: number, minutes: number) => {
        if (minutes === -1) return;
        const exists = raidSteps[index].reminders.some(r => r.minutesBefore === minutes);
        if (exists) return;
        const newReminder: Reminder = { id: `rem_new_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, minutesBefore: minutes, isSent: false };
        const newSteps = [...raidSteps];
        newSteps[index].reminders.push(newReminder);
        newSteps[index].reminders.sort((a,b) => a.minutesBefore - b.minutesBefore);
        setRaidSteps(newSteps);
    };

    const handleRemoveReminder = (stepIndex: number, reminderId: string) => {
        const newSteps = [...raidSteps];
        newSteps[stepIndex].reminders = newSteps[stepIndex].reminders.filter(r => r.id !== reminderId);
        setRaidSteps(newSteps);
    };

    const toggleStat = (stat: Stat) => {
        if (selectedStats.includes(stat)) {
            setSelectedStats(selectedStats.filter(s => s !== stat));
        } else {
            if (selectedStats.length < 3) setSelectedStats([...selectedStats, stat]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || selectedStats.length === 0) return;

        const validSteps = raidSteps
            .filter(s => s.title.trim() !== '')
            .map((step, idx) => ({
                id: `rs_${Date.now()}_${idx}`,
                title: step.title,
                notes: step.notes, 
                subtasks: step.subtasks.filter(st => st.title.trim() !== ''),
                reminders: step.reminders,
                isCompleted: false,
                isLocked: idx > 0,
                // 🟢 NEW FIELDS PAYLOAD
                difficulty: step.difficulty,
                stat: step.stat,
                scheduledTime: step.scheduledTime,
                deadline: step.deadline,
                isTimed: step.isTimed,
                durationMinutes: step.durationMinutes
            }));

        if (validSteps.length === 0) { alert("Operation must have at least one step."); return; }

        raidDispatch.addRaid({
            title,
            deadline: deadline || undefined,
            difficulty,
            stats: selectedStats,
            skillId: selectedSkillId || undefined,
            steps: validSteps
        });
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
        <>
            <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">Operation Title</label>
                        <input 
                            type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Master React Native..." autoFocus
                            className="w-full bg-life-black border border-life-muted/30 rounded-lg p-3 text-life-text placeholder:text-life-muted/50 focus:outline-none focus:border-life-gold/50 transition-all font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">Deadline (Target Date)</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-life-muted" size={16} />
                            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full bg-life-black border border-life-muted/30 rounded-lg p-3 pl-10 text-life-text focus:outline-none focus:border-life-gold/50 text-sm" />
                        </div>
                    </div>
                </div>

                {skillState.skills.length > 0 && (
                    <div>
                        <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">Linked Skill</label>
                        <div className="relative">
                            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-life-muted" size={16} />
                            <select value={selectedSkillId} onChange={(e) => setSelectedSkillId(e.target.value)} className="w-full bg-life-black border border-life-muted/30 rounded-lg p-3 pl-10 text-sm text-life-text appearance-none focus:outline-none focus:border-life-gold/50">
                                <option value="">No specific skill...</option>
                                {skillState.skills.map(skill => (<option key={skill.id} value={skill.id}>{skill.title} (Lvl {skill.level})</option>))}
                            </select>
                            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-life-muted rotate-90" size={16} />
                        </div>
                    </div>
                )}

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest">Tactical Steps & Intel</label>
                        <button type="button" onClick={handleAddStep} className="text-[10px] flex items-center gap-1 text-life-gold hover:text-white transition-colors uppercase font-bold">
                            <Plus size={12} /> Add Step
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                        {raidSteps.map((step, idx) => (
                            <div key={step.id} className="bg-life-black/40 p-3 rounded-lg border border-life-muted/20">
                                <div className="flex gap-2 items-center mb-2">
                                    <span className="text-[10px] font-mono text-life-muted w-4">{idx + 1}.</span>
                                    <input 
                                        ref={(el) => { stepInputRefs.current[idx] = el; }}
                                        type="text" value={step.title}
                                        onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (idx < raidSteps.length - 1) {
                                                    stepInputRefs.current[idx + 1]?.focus();
                                                } else {
                                                    handleAddStep();
                                                    // Note: Focus on newly added step will require a useEffect or similar
                                                    // For now, focusing the next existing one is handled.
                                                }
                                            }
                                        }}
                                        placeholder={`Step ${idx + 1} objective...`}
                                        className="flex-1 bg-transparent border-b border-life-muted/30 px-2 py-1 text-sm text-life-text focus:outline-none focus:border-life-gold/50"
                                    />
                                    {raidSteps.length > 1 && <button type="button" onClick={() => handleRemoveStep(idx)} className="text-life-muted hover:text-life-hard p-1"><Trash2 size={14} /></button>}
                                </div>
                                <div className="pl-6">
                                    <button type="button" onClick={() => setEditingStepIndex(idx)} className={`w-full flex items-center gap-3 p-2 rounded-md border text-xs text-left transition-all ${(step.notes || step.subtasks.length > 0 || step.reminders.length > 0) ? 'bg-life-gold/5 border-life-gold/30 text-life-text' : 'bg-transparent border-dashed border-life-muted/30 text-life-muted hover:text-life-gold hover:border-life-gold/50'}`}>
                                        <FileText size={14} className={step.notes ? 'text-life-gold' : 'opacity-50'} />
                                        <div className="flex-1 truncate">{step.notes ? step.notes : <span className="opacity-50">+ Add Intel, Subtasks, Alerts</span>}</div>
                                        {(step.subtasks.length > 0 || step.reminders.length > 0) && (
                                            <div className="flex gap-2 text-[9px] font-mono font-bold">
                                                {step.subtasks.length > 0 && <span className="flex items-center gap-1 text-life-gold"><CheckSquare size={10} /> {step.subtasks.length}</span>}
                                                {step.reminders.length > 0 && <span className="flex items-center gap-1 text-life-gold"><Bell size={10} /> {step.reminders.length}</span>}
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">Threat Level</label>
                    <div className="grid grid-cols-3 gap-2">
                        {Object.values(Difficulty).map((diff) => (
                            <button key={diff} type="button" onClick={() => setDifficulty(diff)} className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${difficulty === diff ? `${DIFFICULTY_COLORS[diff]} ${DIFFICULTY_BG[diff]} shadow-[0_0_10px_rgba(0,0,0,0.5)] scale-105` : 'border-life-muted/20 text-life-muted hover:bg-life-muted/5'}`}>{diff}</button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">Attribute Focus (Select 1-3)</label>
                    <div className="grid grid-cols-7 gap-2">
                        {Object.values(Stat).map((s) => {
                            const isSelected = selectedStats.includes(s);
                            return (
                                <button key={s} type="button" onClick={() => toggleStat(s)} className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all aspect-square relative ${isSelected ? 'bg-life-muted/10 border-current shadow-lg scale-110' : 'border-life-muted/20 text-life-muted hover:bg-life-muted/5 opacity-70 hover:opacity-100'}`} style={{ color: isSelected ? STAT_COLORS[s] : undefined }}>
                                    <StatIcon type={s} /><span className="text-[9px] font-bold mt-1">{s}</span>{isSelected && <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-current shadow-[0_0_5px_currentColor]" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <button type="submit" className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all mt-4 ${title && selectedStats.length > 0 ? 'bg-life-gold text-life-black hover:bg-yellow-400 shadow-[0_0_20px_rgba(251,191,36,0.3)]' : 'bg-life-muted/20 text-life-muted cursor-not-allowed'}`} disabled={!title || selectedStats.length === 0}>
                    Launch Operation <ChevronRight size={16} />
                </button>
            </form>

            {editingStepIndex !== null && (
                <RaidStepEditor 
                    stepIndex={editingStepIndex}
                    step={raidSteps[editingStepIndex]}
                    parentDifficulty={difficulty}
                    parentStat={selectedStats[0] || Stat.DIS}
                    parentSkillId={selectedSkillId}
                    onUpdate={handleStepChange}
                    onClose={() => setEditingStepIndex(null)}
                    onAddSubtask={handleAddSubtask}
                    onRemoveSubtask={handleRemoveSubtask}
                    onChangeSubtask={handleSubtaskChange}
                    onAddReminder={handleAddReminder}
                    onRemoveReminder={handleRemoveReminder}
                />
            )}
        </>
    );
};

export default RaidForm;
