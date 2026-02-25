import React from 'react';
import { X, ListTodo, Check } from 'lucide-react';
import { Subtask } from '../../../types/taskTypes';

interface SubtasksPanelProps {
    subtasks: Subtask[];
    onToggleSubtask: (id: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

export const SubtasksPanel: React.FC<SubtasksPanelProps> = ({ subtasks, onToggleSubtask, isOpen, onClose }) => {
    return (
        <div className={`absolute bottom-0 left-0 right-0 bg-[#111] border-t border-zinc-800 p-6 rounded-t-3xl transition-transform duration-300 ease-out z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] h-[50vh] flex flex-col text-left ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="flex justify-between items-center mb-4 shrink-0">
                <h3 className="text-xs font-bold uppercase text-life-gold tracking-widest flex items-center gap-2"><ListTodo size={14} /> Tactical Objectives</h3>
                <button onClick={onClose} className="text-life-muted hover:text-white"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {subtasks.map(st => (
                    <div key={st.id} onClick={() => onToggleSubtask(st.id)} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${st.isCompleted ? 'bg-life-gold/10 border-life-gold/30 opacity-60' : 'bg-white/5 border-zinc-800 hover:bg-white/10'}`}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${st.isCompleted ? 'bg-life-gold border-life-gold text-black' : 'border-life-muted text-transparent'}`}><Check size={12} strokeWidth={4} /></div>
                        <span className={`text-sm ${st.isCompleted ? 'line-through text-life-gold' : 'text-life-text'}`}>{st.title}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};