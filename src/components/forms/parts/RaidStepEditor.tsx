import React, { useState } from 'react';
import { Clock, Calendar, AlignLeft, Target, Plus, Trash2, ChevronLeft } from 'lucide-react';
import { Difficulty } from '../../../types/types';
import { DIFFICULTY_COLORS, DIFFICULTY_BG } from '../../../types/constants';
import { Subtask } from '../../../types/taskTypes';
import { PendingRaidStep } from '../RaidForm';

interface RaidStepEditorProps {
    step: PendingRaidStep;
    onSave: (step: PendingRaidStep) => void;
    onClose: () => void;
}

export const RaidStepEditor: React.FC<RaidStepEditorProps> = ({ step, onSave, onClose }) => {
    const [title, setTitle] = useState(step.title);
    const [isTimed, setIsTimed] = useState(step.isTimed || false);
    const [durationMinutes, setDurationMinutes] = useState(step.durationMinutes || 0);
    const [difficulty, setDifficulty] = useState<Difficulty | undefined>(step.difficulty);
    const [notes, setNotes] = useState(step.notes || '');
    const [subtasks, setSubtasks] = useState<Subtask[]>(step.subtasks || []);
    const [newSubtask, setNewSubtask] = useState('');
    const [scheduledTime, setScheduledTime] = useState(step.scheduledTime || '');
    const [deadline, setDeadline] = useState(step.deadline || '');

    const handleSave = () => {
        onSave({
            ...step,
            title,
            isTimed,
            durationMinutes: isTimed ? durationMinutes : 0,
            difficulty,
            notes,
            subtasks,
            scheduledTime,
            deadline
        });
    };

    const addSubtask = () => {
        if (!newSubtask.trim()) return;
        setSubtasks([...subtasks, { id: `st_${Date.now()}`, title: newSubtask, isCompleted: false }]);
        setNewSubtask('');
    };

    const removeSubtask = (id: string) => {
        setSubtasks(subtasks.filter(st => st.id !== id));
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
            {/* Header / Back */}
            <div className="flex items-center gap-3 mb-4">
                <button type="button" onClick={onClose} className="p-2 bg-life-black border border-life-muted/20 rounded-lg text-life-muted hover:text-white transition-colors">
                    <ChevronLeft size={16} />
                </button>
                <h3 className="text-sm font-bold text-life-text uppercase tracking-widest">Step Details</h3>
            </div>

            {/* 1. IDENTITY SECTION */}
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">Step Objective</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            placeholder="e.g. Hack the mainframe" 
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
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">Threat Level (Overrides Raid)</label>
                    <div className="grid grid-cols-3 gap-2">
                        {Object.values(Difficulty).map((d) => (
                            <button
                                key={d}
                                type="button"
                                onClick={() => setDifficulty(difficulty === d ? undefined : d)}
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
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
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
                        value={deadline}
                        onChange={e => setDeadline(e.target.value)}
                        className="w-full bg-life-black border border-life-muted/30 rounded-lg p-2.5 text-xs text-life-text focus:outline-none focus:border-life-gold/50"
                    />
                </div>
            </div>

            <button 
                type="button" 
                onClick={handleSave}
                className="w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg bg-life-gold text-life-black hover:bg-yellow-400 shadow-life-gold/20"
            >
                Save Step Details
            </button>
        </div>
    );
};
