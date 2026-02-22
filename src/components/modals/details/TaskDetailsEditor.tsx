
import React from 'react';
import { Clock, Bell, X, Check, Trash2, Plus } from 'lucide-react';
import { Reminder } from '../../../types/types';
import { Subtask } from '../../../types/taskTypes';

interface TaskDetailsEditorProps {
    editTime: string;
    setEditTime: (val: string) => void;
    editReminders: Reminder[];
    setEditReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
    editSubtasks: Subtask[];
    setEditSubtasks: React.Dispatch<React.SetStateAction<Subtask[]>>;
    newSubtaskTitle: string;
    setNewSubtaskTitle: (val: string) => void;
    hideSubtasks?: boolean; // 👈 NEW PROP
}

export const TaskDetailsEditor: React.FC<TaskDetailsEditorProps> = ({
    editTime, setEditTime, editReminders, setEditReminders,
    editSubtasks, setEditSubtasks, newSubtaskTitle, setNewSubtaskTitle,
    hideSubtasks = false // Default to false
}) => {

    const handleAddReminder = (minutes: number) => {
        if (minutes === -1) return;
        const exists = editReminders.some(r => r.minutesBefore === minutes);
        if (!exists) {
            setEditReminders([...editReminders, { id: `rem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, minutesBefore: minutes, isSent: false }].sort((a,b) => a.minutesBefore - b.minutesBefore));
        }
    };

    const handleRemoveReminder = (id: string) => {
        setEditReminders(editReminders.filter(r => r.id !== id));
    };

    const handleAddSubtask = () => {
        if (!newSubtaskTitle.trim()) return;
        const newSubtask: Subtask = {
            id: `st_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,
            title: newSubtaskTitle.trim(),
            isCompleted: false
        };
        setEditSubtasks([...editSubtasks, newSubtask]);
        setNewSubtaskTitle('');
    };

    const handleRemoveSubtask = (subId: string) => {
        setEditSubtasks(editSubtasks.filter(st => st.id !== subId));
    };

    const getReminderLabel = (minutes: number) => {
        if (minutes === 0) return 'At time';
        if (minutes === 60) return '1h before';
        if (minutes === 1440) return '1d before';
        return `${minutes}m before`;
    };

    return (
        <>
            <div className="mb-4 space-y-3 bg-life-black/30 p-3 rounded-lg border border-life-muted/10">
                <div>
                    <label className="block text-[9px] text-life-muted uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                        <Clock size={10} /> Scheduled Time
                    </label>
                    <input 
                        type="datetime-local"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        className="w-full bg-life-black border border-life-muted/30 rounded p-2 text-xs text-life-text focus:outline-none focus:border-life-gold/50"
                    />
                </div>

                <div>
                    <label className="block text-[9px] text-life-muted uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                        <Bell size={10} /> Reminders
                    </label>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                        {editReminders.map(rem => (
                            <div key={rem.id} className="flex items-center gap-1 px-2 py-1 bg-life-gold/10 border border-life-gold/30 rounded text-[9px] text-life-gold">
                                <span>{getReminderLabel(rem.minutesBefore)}</span>
                                <button type="button" onClick={() => handleRemoveReminder(rem.id)} className="hover:text-white">
                                    <X size={10} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <select 
                        value={-1}
                        onChange={(e) => handleAddReminder(Number(e.target.value))}
                        className="w-full bg-life-black border border-life-muted/30 rounded p-1.5 text-xs text-life-muted focus:outline-none focus:border-life-gold/50"
                    >
                        <option value={-1}>+ Add Alert</option>
                        <option value={0}>At scheduled time</option>
                        <option value={15}>15 mins before</option>
                        <option value={60}>1 hour before</option>
                    </select>
                </div>
            </div>

            {!hideSubtasks && (
                <div className="border-t border-life-muted/10 pt-4 mt-2">
                    <label className="block text-[9px] text-life-muted uppercase font-bold tracking-widest mb-2 flex items-center gap-1">
                        <Check size={10} /> Subtasks
                    </label>
                    
                    <div className="space-y-2 mb-2">
                        {editSubtasks.map(st => (
                            <div key={st.id} className="flex items-center justify-between bg-life-black px-2 py-1.5 rounded border border-life-muted/20">
                                <span className="text-xs text-life-text truncate">{st.title}</span>
                                <button onClick={() => handleRemoveSubtask(st.id)} className="text-life-muted hover:text-life-hard p-1">
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <input 
                            type="text"
                            value={newSubtaskTitle}
                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                            placeholder="Add subtask..."
                            className="flex-1 bg-life-black border border-life-muted/30 rounded px-2 py-1.5 text-xs text-life-text focus:border-life-gold outline-none"
                        />
                        <button onClick={handleAddSubtask} className="bg-life-gold/10 hover:bg-life-gold/20 text-life-gold border border-life-gold/30 rounded px-2">
                            <Plus size={14} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
