import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Dumbbell, Brain, Zap, Heart, Activity, ChevronRight, BookOpen, Calendar, FileText, CheckSquare, Bell, Palette, Flame, Users, Coins, Clock, ChevronDown, ChevronUp, AlignLeft } from 'lucide-react';
import { useRaids } from '../../contexts/RaidContext';
import { useSkills } from '../../contexts/SkillContext';
import { useLifeOS } from '../../contexts/LifeOSContext';
import { Raid, RaidStep } from '../../types/raidTypes';
import { Difficulty, Stat } from '../../types/types';
import { DIFFICULTY_COLORS, DIFFICULTY_BG, STAT_COLORS } from '../../types/constants';

import { RaidStepEditor } from './parts/RaidStepEditor';

interface RaidFormProps {
    onClose: () => void;
    initialData?: Raid | null;
}

// Helper to generate IDs
const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Extended Step Interface for Form State
export interface PendingRaidStep extends Omit<RaidStep, 'id' | 'isCompleted'> {
    id: string; // We need ID for list management
    isLocked: boolean;
    difficulty?: Difficulty;
    stat?: Stat;
    scheduledTime?: string;
    deadline?: string;
    isTimed?: boolean;
    durationMinutes?: number;
}

const RaidForm: React.FC<RaidFormProps> = ({ onClose, initialData }) => {
    const { raidDispatch } = useRaids();
    const { skillState } = useSkills();
    const { state } = useLifeOS();
    
    // Basic Info
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY); 
    const [stat, setStat] = useState<Stat>(Stat.DIS);
    const [skillId, setSkillId] = useState<string>('');
    
    // Steps
    const [steps, setSteps] = useState<PendingRaidStep[]>([]);
    const [editingStepId, setEditingStepId] = useState<string | null>(null);

    // Initialize Data (Edit Mode)
    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description || '');
            setDifficulty(initialData.difficulty);
            setStat(initialData.stats[0] || Stat.DIS);
            setSkillId(initialData.skillId || '');
            
            // Map existing steps to pending steps
            setSteps(initialData.steps.map(s => ({
                id: s.id,
                title: s.title,
                isLocked: s.isLocked || false,
                notes: s.notes || '',
                subtasks: s.subtasks || [],
                reminders: s.reminders || [],
                difficulty: s.difficulty,
                stat: s.stat,
                scheduledTime: s.scheduledTime,
                deadline: s.deadline,
                isTimed: s.isTimed,
                durationMinutes: s.durationMinutes
            })));

            if (initialData.skillId) {
                setRewardType('skill');
            }
        } else {
            // Default 1 empty step for new Raid
            setSteps([
                { id: generateId('rs'), title: '', isLocked: false, notes: '', subtasks: [], reminders: [] },
            ]);
        }
    }, [initialData]);

    // 🟢 REWARD TYPE TOGGLE
    const [rewardType, setRewardType] = useState<'stat' | 'skill'>('stat');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        // Convert PendingSteps back to RaidSteps (clean up ID if needed, but we keep it)
        const finalSteps: RaidStep[] = steps.map(s => ({
            id: s.id,
            title: s.title,
            isCompleted: false, 
            isLocked: s.isLocked || false,
            notes: s.notes,
            subtasks: s.subtasks,
            reminders: s.reminders,
            difficulty: s.difficulty || difficulty, // Inherit from Raid if not set
            stat: stat, // Inherit from Raid
            scheduledTime: s.scheduledTime,
            deadline: s.deadline,
            isTimed: s.isTimed,
            durationMinutes: s.durationMinutes
        }));

        // If editing, we need to preserve `isCompleted` from original data if step ID matches
        if (initialData) {
            const mergedSteps = finalSteps.map(fs => {
                const original = initialData.steps.find(os => os.id === fs.id);
                return original ? { ...fs, isCompleted: original.isCompleted } : fs;
            });

            raidDispatch.updateRaid(initialData.id, {
                title,
                description,
                difficulty,
                stats: [stat],
                skillId: rewardType === 'skill' ? (skillId || undefined) : undefined,
                steps: mergedSteps
            });
        } else {
            raidDispatch.addRaid({
                title,
                description,
                difficulty,
                stats: [stat],
                skillId: rewardType === 'skill' ? (skillId || undefined) : undefined,
                steps: finalSteps
            });
        }
        onClose();
    };

    // Step Management
    const addStep = () => {
        const newId = generateId('rs');
        setSteps([...steps, { id: newId, title: '', isLocked: false, notes: '', subtasks: [], reminders: [] }]);
    };

    const removeStep = (index: number) => {
        const newSteps = [...steps];
        newSteps.splice(index, 1);
        setSteps(newSteps);
    };

    const updateStep = (index: number, field: string, value: any) => {
        const newSteps = [...steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setSteps(newSteps);
    };

    const toggleDetails = (id: string) => {
        setEditingStepId(id);
    };

    const handleSaveStep = (updatedStep: PendingRaidStep) => {
        setSteps(steps.map(s => s.id === updatedStep.id ? updatedStep : s));
        setEditingStepId(null);
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

    if (editingStepId) {
        const stepToEdit = steps.find(s => s.id === editingStepId);
        if (stepToEdit) {
            return (
                <RaidStepEditor 
                    step={stepToEdit} 
                    onSave={handleSaveStep} 
                    onClose={() => setEditingStepId(null)} 
                />
            );
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
            
            {/* 1. IDENTITY SECTION */}
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">Operation Name</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        placeholder="e.g. Project Spartan" 
                        autoFocus
                        className="w-full bg-life-black border border-life-muted/30 rounded-lg p-3 text-life-text placeholder:text-life-muted/50 focus:outline-none focus:border-life-gold/50 transition-all font-medium"
                    />
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
                        <FileText size={12} /> Briefing / Intel
                    </label>
                    <textarea 
                        rows={3}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Add mission briefing..."
                        className="w-full bg-life-black border border-life-muted/30 rounded-lg p-3 text-xs text-life-text placeholder:text-life-muted/50 focus:outline-none focus:border-life-gold/50 transition-all resize-none"
                    />
                </div>
            </div>

            {/* 3. STEPS */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest flex items-center gap-1">
                        <CheckSquare size={12} /> Operational Steps
                    </label>
                    <button type="button" onClick={addStep} className="text-[10px] flex items-center gap-1 text-life-gold hover:text-white transition-colors uppercase font-bold">
                        <Plus size={12} /> Add Step
                    </button>
                </div>
                
                <div className="space-y-2">
                    {steps.map((step, idx) => (
                        <div key={step.id} className="bg-life-black border border-life-muted/20 rounded-lg p-2 transition-all hover:border-life-muted/40">
                            {/* Header Row */}
                            <div className="flex items-center gap-2">
                                <div className="flex flex-col items-center justify-center w-5 h-5 rounded bg-life-muted/10 text-life-muted font-black text-[9px]">
                                    {idx + 1}
                                </div>
                                
                                <div className="flex-1 relative">
                                    <input 
                                        type="text" 
                                        value={step.title}
                                        onChange={(e) => updateStep(idx, 'title', e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addStep();
                                            }
                                        }}
                                        placeholder="Step Title..."
                                        className="w-full bg-transparent border-none text-xs font-bold text-life-text focus:outline-none placeholder:text-life-muted/30"
                                        autoFocus={idx === steps.length - 1 && steps.length > 1}
                                    />
                                </div>

                                {/* Timer Toggle */}
                                <button
                                    type="button"
                                    onClick={() => updateStep(idx, 'isTimed', !step.isTimed)}
                                    className={`p-1.5 rounded-md transition-colors ${step.isTimed ? 'text-life-gold' : 'text-life-muted hover:text-white'}`}
                                    title="Toggle Timer"
                                >
                                    <Clock size={14} />
                                </button>

                                {/* Details Toggle */}
                                <button 
                                    type="button" 
                                    onClick={() => toggleDetails(step.id)}
                                    className="p-1.5 rounded-md transition-colors text-life-muted hover:text-life-gold hover:bg-life-gold/10"
                                    title="Step Details"
                                >
                                    <AlignLeft size={14} />
                                </button>

                                <button type="button" onClick={() => removeStep(idx)} className="text-life-muted hover:text-life-hard p-1.5">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

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
                {initialData ? 'Update Operation' : 'Launch Operation'}
            </button>

        </form>
    );
};

export default RaidForm;
