
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle, Circle, Plus, Crosshair, Target } from 'lucide-react';
import { useHabits } from '../../contexts/HabitContext';
import { useTasks } from '../../contexts/TaskContext';
import { useLifeOS } from '../../contexts/LifeOSContext';
import { checkHabitActive } from '../../utils/habitEngine';
import { playSound } from '../../utils/audio';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const CalendarView: React.FC = () => {
    const { habitState } = useHabits();
    const { taskState, taskDispatch } = useTasks();
    const { dispatch } = useLifeOS();

    // 📅 STATE
    const [currentDate, setCurrentDate] = useState(new Date()); // For Month Navigation
    const [selectedDate, setSelectedDate] = useState(new Date()); // For Day Selection

    // 🧮 CALENDAR MATH
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
        playSound('click', true);
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
        playSound('click', true);
    };

    const handleSelectDay = (day: number) => {
        const newDate = new Date(year, month, day);
        setSelectedDate(newDate);
        playSound('click', true);
    };

    // 🕵️‍♀️ DATA PROJECTION ENGINE
    // Determine active items for a specific date
    const getItemsForDate = (date: Date) => {
        const isoDate = date.toISOString();
        const dateStr = isoDate.split('T')[0]; // YYYY-MM-DD for comparison

        // 1. Habits (Projected)
        const activeHabits = habitState.habits.filter(h => {
            // Check if habit was created before or on this date
            const created = new Date(h.createdAt);
            if (date < created && date.getDate() !== created.getDate()) return false;
            
            // Use the engine to check recurrence
            return checkHabitActive(h, isoDate);
        }).map(h => ({
            id: h.id,
            title: h.title,
            type: 'habit',
            isCompleted: h.history.some(d => d.startsWith(dateStr)), // Simple check for past completion
            stat: h.stat
        }));

        // 2. Tasks (Scheduled)
        const scheduledTasks = taskState.tasks.filter(t => {
            if (!t.deadline && !t.scheduledTime) return false;
            const tDate = t.scheduledTime ? new Date(t.scheduledTime) : new Date(t.deadline!);
            return tDate.getDate() === date.getDate() && 
                   tDate.getMonth() === date.getMonth() && 
                   tDate.getFullYear() === date.getFullYear();
        }).map(t => ({
            id: t.id,
            title: t.title,
            type: 'task',
            isCompleted: t.isCompleted,
            stat: t.stat
        }));

        return [...activeHabits, ...scheduledTasks];
    };

    // Memoize the selected day's items
    const selectedDayItems = useMemo(() => getItemsForDate(selectedDate), [selectedDate, habitState.habits, taskState.tasks]);

    // Function to check density for dots in calendar grid
    const getDayDensity = (day: number) => {
        const date = new Date(year, month, day);
        const count = getItemsForDate(date).length;
        return count > 0;
    };

    // 🟢 ADD TASK TO SELECTED DAY
    const handleAddTask = () => {
        // Correctly format date as YYYY-MM-DD for the input type="date"
        const offsetDate = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000));
        const isoDate = offsetDate.toISOString().split('T')[0];
        
        dispatch.setModal('addTask', { 
            defaultType: 'mission',
            date: isoDate,
            origin: 'calendar' // 👈 Explicitly set origin to Calendar
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
            
            {/* 🟦 SQUARE 1: MONTHLY CALENDAR */}
            <div className="bg-life-paper border border-life-muted/20 rounded-2xl p-4 shadow-lg">
                
                {/* Month Header */}
                <div className="flex items-center justify-between mb-4">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-life-muted/10 rounded-full text-life-muted hover:text-white transition-colors">
                        <ChevronLeft size={18} />
                    </button>
                    <h3 className="text-sm font-black text-life-text uppercase tracking-widest">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-life-muted/10 rounded-full text-life-muted hover:text-white transition-colors">
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {WEEKDAYS.map((d, i) => (
                        <div key={i} className="text-center text-[9px] font-bold text-life-muted/50 py-1">
                            {d}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {/* Empty Slots */}
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {/* Days */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const date = new Date(year, month, day);
                        const isSelected = date.toDateString() === selectedDate.toDateString();
                        const isToday = date.toDateString() === new Date().toDateString();
                        const hasItems = getDayDensity(day);

                        return (
                            <button
                                key={day}
                                onClick={() => handleSelectDay(day)}
                                className={`
                                    aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all duration-200
                                    ${isSelected 
                                        ? 'bg-life-gold text-life-black font-black shadow-[0_0_15px_rgba(251,191,36,0.4)] scale-110 z-10' 
                                        : 'hover:bg-life-muted/10 text-life-text'}
                                    ${isToday && !isSelected ? 'border border-life-gold/50 text-life-gold' : ''}
                                `}
                            >
                                <span className="text-xs">{day}</span>
                                {hasItems && (
                                    <div className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-black' : 'bg-life-muted'}`} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 🟦 SQUARE 2: DAILY AGENDA */}
            <div className="bg-life-black border border-life-muted/20 rounded-2xl p-0 overflow-hidden shadow-lg min-h-[200px] flex flex-col">
                
                {/* Header */}
                <div className="p-4 border-b border-life-muted/10 flex justify-between items-center bg-life-paper/50">
                    <div>
                        <h4 className="text-xs font-black uppercase text-life-muted tracking-widest">
                            Tactical Log
                        </h4>
                        <p className="text-sm font-bold text-life-text mt-0.5">
                            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </p>
                    </div>
                    <button 
                        onClick={handleAddTask}
                        className="bg-life-gold/10 hover:bg-life-gold/20 text-life-gold border border-life-gold/30 p-2 rounded-lg transition-all"
                        title="Add Mission for this Day"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                {/* List */}
                <div className="p-2 flex-1 overflow-y-auto max-h-[300px]">
                    {selectedDayItems.length > 0 ? (
                        <div className="space-y-1">
                            {selectedDayItems.map((item, idx) => (
                                <div 
                                    key={`${item.type}-${item.id}-${idx}`}
                                    className={`
                                        flex items-center gap-3 p-3 rounded-xl border transition-all
                                        ${item.isCompleted 
                                            ? 'bg-life-black border-life-muted/10 opacity-50' 
                                            : 'bg-life-paper border-life-muted/10 hover:border-life-gold/30'}
                                    `}
                                >
                                    <div className={`
                                        w-8 h-8 rounded-full flex items-center justify-center border-2
                                        ${item.isCompleted 
                                            ? 'bg-life-muted border-life-muted text-life-black' 
                                            : item.type === 'habit' ? 'border-life-gold/30 text-life-gold bg-life-gold/5' : 'border-life-muted/30 text-life-muted'}
                                    `}>
                                        {item.type === 'habit' ? <Target size={14} /> : <Crosshair size={14} />}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className={`text-xs font-bold ${item.isCompleted ? 'line-through text-life-muted' : 'text-life-text'}`}>
                                            {item.title}
                                        </div>
                                        <div className="text-[9px] text-life-muted uppercase tracking-wider flex items-center gap-1">
                                            {item.type === 'habit' ? 'Protocol' : 'Mission'} • {item.stat}
                                        </div>
                                    </div>

                                    {item.type === 'task' && !item.isCompleted && (
                                        <button 
                                            onClick={() => taskDispatch.toggleTask(item.id)}
                                            className="w-6 h-6 rounded border border-life-muted/30 hover:border-life-gold hover:text-life-gold flex items-center justify-center transition-colors"
                                        >
                                            <Circle size={14} />
                                        </button>
                                    )}
                                    {item.isCompleted && <CheckCircle size={14} className="text-life-muted" />}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-32 text-life-muted/40">
                            <CalendarIcon size={32} className="mb-2 opacity-50" />
                            <p className="text-[10px] uppercase font-bold tracking-widest">No orders for this sector</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default CalendarView;
