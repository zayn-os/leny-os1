
import React, { useState, useEffect, useMemo } from 'react';
import { useLifeOS } from '../../contexts/LifeOSContext';
import { useTasks } from '../../contexts/TaskContext';
import { useHabits } from '../../contexts/HabitContext';
import { playSound } from '../../utils/audio';
import { Difficulty, Stat } from '../../types/types';
import { useFocusTimer } from './hooks/useFocusTimer';
import { useFocusAudio, NoiseType } from './hooks/useFocusAudio';
import { FocusHeader } from './components/FocusHeader';
import { FocusTimer } from './components/FocusTimer';
import { FocusControls } from './components/FocusControls';
import { NotesPanel } from './components/NotesPanel';
import { SubtasksPanel } from './components/SubtasksPanel';

const FocusMode: React.FC = () => {
    const { state, dispatch } = useLifeOS();
    const { taskState, taskDispatch } = useTasks();
    const { habitState, habitDispatch } = useHabits();
    const { focusSession } = state.ui;

    const [activePanel, setActivePanel] = useState<'none' | 'notes' | 'subtasks'>('none');
    const [notes, setNotes] = useState('');
    const [noiseType, setNoiseType] = useState<NoiseType>('none');

    const { timeLeft, isPaused, setIsPaused, setTimeLeft } = useFocusTimer(!!focusSession, focusSession?.durationMinutes || 0);
    const { stopAudio } = useFocusAudio(noiseType, !!focusSession);

    const activeItem = useMemo(() => {
        if (!focusSession) return null;
        const isHabit = focusSession.itemType === 'habit';
        return isHabit
            ? habitState.habits.find(h => h.id === focusSession.itemId)
            : taskState.tasks.find(t => t.id === focusSession.itemId);
    }, [focusSession, habitState.habits, taskState.tasks]);

    useEffect(() => {
        if (focusSession && !activeItem) {
            stopAudio();
            dispatch.endFocusSession();
        }
    }, [focusSession, activeItem, dispatch]);

    if (!focusSession || !activeItem) return null;

    const isHabit = focusSession.itemType === 'habit';
    const hasSubtasks = activeItem.subtasks && activeItem.subtasks.length > 0;
    const completedSubtasksCount = activeItem.subtasks?.filter(s => s.isCompleted).length || 0;
    const totalSubtasksCount = activeItem.subtasks?.length || 0;

    const handleExit = (shouldCompleteItem: boolean = false) => {
        stopAudio();
        const totalDurationSeconds = focusSession.durationMinutes * 60;
        const elapsedSeconds = totalDurationSeconds - timeLeft;
        const minutesFocused = Math.floor(elapsedSeconds / 60);

        if (minutesFocused >= 1) {
            const xpEarned = Math.floor(minutesFocused * 2);
            dispatch.updateUser({
                currentXP: state.user.currentXP + xpEarned,
                dailyXP: state.user.dailyXP + xpEarned
            });
            dispatch.addToast(`Focused for ${minutesFocused}m (+${xpEarned} XP)`, 'success');
        }

        if (notes.trim()) {
            const lines = notes.split('\n').filter(line => line.trim().length > 0);
            lines.forEach(line => {
                taskDispatch.addTask({
                    title: line.trim(),
                    difficulty: Difficulty.EASY,
                    stat: Stat.INT,
                    isTimed: false,
                    subtasks: [],
                    categoryId: undefined
                });
            });
            dispatch.addToast(`${lines.length} Missions added from notes`, 'info');
        }

        if (shouldCompleteItem) {
            if (isHabit) habitDispatch.processHabit(activeItem.id, 'completed');
            else taskDispatch.toggleTask(activeItem.id);
        }

        dispatch.endFocusSession();
    };

    const handleToggleSubtask = (subId: string) => {
        playSound('click', true);
        if (isHabit) habitDispatch.toggleSubtask(activeItem.id, subId);
        else taskDispatch.toggleSubtask(activeItem.id, subId);
    };



    return (
        <div className="fixed inset-0 z-[200] bg-black text-white flex flex-col animate-in fade-in duration-500">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] pointer-events-none" />
            <div className={`absolute inset-0 bg-life-gold/5 blur-[100px] rounded-full transition-opacity duration-[3000ms] ${isPaused ? 'opacity-10' : 'opacity-40 animate-pulse-slow'}`} />

            <FocusHeader onExit={() => handleExit(false)} />

            <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-6 text-center">
                <div className="mb-4 text-[9px] font-black uppercase tracking-[0.2em] bg-white/5 px-3 py-1 rounded-full border border-zinc-800 text-life-gold">
                    {isHabit ? 'PROTOCOL' : 'MISSION'} TARGET
                </div>
                <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-8 max-w-2xl leading-tight">
                    {activeItem.title}
                </h2>

                <FocusTimer 
                    timeLeft={timeLeft}
                    isPaused={isPaused}
                    onTogglePause={() => setIsPaused(!isPaused)}
                    durationMinutes={focusSession.durationMinutes}
                />

                <FocusControls
                    noiseType={noiseType}
                    setNoiseType={setNoiseType}
                    activePanel={activePanel}
                    setActivePanel={setActivePanel}
                    hasSubtasks={hasSubtasks}
                    completedSubtasksCount={completedSubtasksCount}
                    totalSubtasksCount={totalSubtasksCount}
                    onComplete={() => handleExit(true)}
                />

                <NotesPanel 
                    notes={notes}
                    setNotes={setNotes}
                    isOpen={activePanel === 'notes'}
                    onClose={() => setActivePanel('none')}
                />

                <SubtasksPanel 
                    subtasks={activeItem.subtasks || []}
                    onToggleSubtask={handleToggleSubtask}
                    isOpen={activePanel === 'subtasks'}
                    onClose={() => setActivePanel('none')}
                />
            </div>
        </div>
    );
};

export default FocusMode;
