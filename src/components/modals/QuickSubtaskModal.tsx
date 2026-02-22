
import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { useLifeOS } from '../../contexts/LifeOSContext';
import { useTasks } from '../../contexts/TaskContext';
import { useHabits } from '../../contexts/HabitContext';

const QuickSubtaskModal: React.FC = () => {
    const { state, dispatch } = useLifeOS();
    const { taskState, taskDispatch } = useTasks();
    const { habitState, habitDispatch } = useHabits();
    const { modalData } = state.ui;

    const [inputText, setInputText] = useState('');

    if (!modalData || !modalData.itemId) return null;

    const { itemId, type } = modalData;
    
    // Find Title for display
    let title = "Item";
    if (type === 'task') {
        const item = taskState.tasks.find(t => t.id === itemId);
        if (item) title = item.title;
    } else if (type === 'habit') {
        const item = habitState.habits.find(h => h.id === itemId);
        if (item) title = item.title;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const newSubtask = {
            id: `st_quick_${Date.now()}`,
            title: inputText.trim(),
            isCompleted: false
        };

        if (type === 'task') {
            const existing = taskState.tasks.find(t => t.id === itemId);
            if (existing) {
                taskDispatch.updateTask(itemId, { subtasks: [...existing.subtasks, newSubtask] });
            }
        } else if (type === 'habit') {
            const existing = habitState.habits.find(h => h.id === itemId);
            if (existing) {
                habitDispatch.updateHabit(itemId, { subtasks: [...existing.subtasks, newSubtask] });
            }
        }

        dispatch.addToast('Side Mission Added', 'success');
        dispatch.setModal('none');
    };

    return (
        <div 
            onClick={() => dispatch.setModal('none')}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                className="bg-life-paper border border-life-gold/30 w-full max-w-sm rounded-xl shadow-2xl p-6 relative"
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xs font-black text-life-gold uppercase tracking-widest mb-1">
                            Add Side Mission
                        </h3>
                        <p className="text-sm font-bold text-white truncate max-w-[200px]">
                            {title}
                        </p>
                    </div>
                    <button onClick={() => dispatch.setModal('none')} className="text-life-muted hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type additional requirement..."
                        autoFocus
                        className="w-full bg-life-black border border-life-muted/30 rounded-lg p-3 text-life-text focus:border-life-gold outline-none mb-4"
                    />
                    <button 
                        type="submit"
                        className="w-full py-3 bg-life-gold text-life-black font-black uppercase tracking-widest rounded-lg hover:bg-yellow-400 flex items-center justify-center gap-2"
                    >
                        <Check size={16} /> Confirm
                    </button>
                </form>
            </div>
        </div>
    );
};

export default QuickSubtaskModal;
