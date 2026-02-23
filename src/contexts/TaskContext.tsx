
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Task, TaskCategory, Law } from '../types/taskTypes';
import { Difficulty, Stat, LootPayload, Reminder } from '../types/types';
import { useLifeOS } from './LifeOSContext'; // نفس المجلد (صحيح)
import { useSkills } from './SkillContext';   // نفس المجلد (صحيح)
import { playSound } from '../utils/audio';   // مجلد خارجي
import { REWARDS, PENALTIES } from '../types/constants'; // مجلد خارجي
import { parseTimeCode, parseCalendarCode, calculateCampaignDate, getActiveCampaignData } from '../utils/campaignEngine';
import { calculateTaskReward } from '../utils/economyEngine';
// 🟢 Updated Import
import { calculateMonthlyAverage, calculateDailyHonorPenalty } from '../utils/honorSystem'; 
import { usePersistence } from '../hooks/usePersistence';

interface TaskState {
    tasks: Task[];
    categories: TaskCategory[];
    laws: Law[]; // 👈 NEW
}

interface TaskContextType {
    taskState: TaskState;
    taskDispatch: {
        addTask: (task: Omit<Task, 'id' | 'isCompleted'>) => void;
        updateTask: (taskId: string, updates: Partial<Omit<Task, 'id'>>) => void; 
        toggleTask: (taskId: string) => void;
        deleteTask: (taskId: string) => void;
        addCategory: (title: string) => void;
        deleteCategory: (id: string) => void;
        renameCategory: (id: string, newTitle: string) => void;
        toggleCategory: (id: string) => void;
        moveTask: (taskId: string, categoryId: string | undefined) => void;
        archiveTask: (taskId: string) => void;
        restoreTask: (taskId: string) => void;
        toggleSubtask: (taskId: string, subtaskId: string) => void;
        // ⚖️ LAW FUNCTIONS
        addLaw: (title: string, type: 'gold' | 'xp' | 'stat' | 'honor', value: number, stat?: Stat) => void;
        updateLaw: (id: string, updates: Partial<Omit<Law, 'id'>>) => void; 
        deleteLaw: (id: string) => void;
        enforceLaw: (id: string) => void;
        // 🔄 RESTORE
        restoreData: (tasks: Task[], categories: TaskCategory[], laws: Law[]) => void;
    };
}

const STORAGE_KEY_TASKS = 'LIFE_OS_TASKS_DATA';
const STORAGE_KEY_TASK_CATS = 'LIFE_OS_TASK_CATEGORIES';
const STORAGE_KEY_LAWS = 'LIFE_OS_LAWS_DATA'; 

const INITIAL_TASKS: Task[] = [
    {
      id: 't_01',
      title: 'Initialize LifeOS Protocol',
      description: 'System calibration complete.',
      difficulty: Difficulty.HARD,
      stat: Stat.INT,
      isCompleted: false,
      isTimed: false,
      deadline: '2024-12-31',
      subtasks: [
          { id: 'st_1', title: 'Check Audio Systems', isCompleted: true },
          { id: 'st_2', title: 'Verify Data Persistence', isCompleted: false }
      ],
      energyLevel: 'high'
    }
];

const INITIAL_CATS: TaskCategory[] = [
    { id: 'cat_work', title: '💼 Work Operations', isCollapsed: false },
    { id: 'cat_personal', title: '🏠 Personal Logs', isCollapsed: false }
];

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Migration Logic
const migrateTask = (t: any): Task => {
    let reminders: Reminder[] = t.reminders || [];
    if (!t.reminders && t.reminderMinutes && t.reminderMinutes > 0) {
        reminders = [{ id: `mig_${Date.now()}_${Math.random()}`, minutesBefore: t.reminderMinutes, isSent: !!t.isReminderSent }];
    }
    return {
        difficulty: Difficulty.NORMAL,
        stat: Stat.STR,
        subtasks: [],
        energyLevel: 'medium',
        isTimed: false,
        isArchived: false,
        isCompleted: false,
        isCampaign: false,
        reminders: reminders,
        ...t,
    };
};

const migrateTaskState = (data: any): TaskState => {
    return {
        tasks: (data.tasks || []).map(migrateTask),
        categories: data.categories || INITIAL_CATS,
        laws: data.laws || []
    };
};

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { state: lifeState, dispatch: lifeDispatch } = useLifeOS();
    const { skillDispatch, skillState } = useSkills();
    const soundEnabled = lifeState.user.preferences.soundEnabled;

    // 🟢 USE PERSISTENCE HOOK
    const [state, setState] = usePersistence<TaskState>(
        'LIFE_OS_TASKS_COMBINED',
        { tasks: INITIAL_TASKS, categories: INITIAL_CATS, laws: [] },
        'tasks_data',
        migrateTaskState
    );
    
    const { tasks, categories, laws } = state;

    // ⚡ ACTIONS

    const addTask = (taskData: Omit<Task, 'id' | 'isCompleted'>) => {
        // 1. Try G12 Logic [WxDy]
        let { cleanedTitle, timeCode } = parseTimeCode(taskData.title);
        
        // 2. Try Calendar Code Logic YYMMDDHHmm
        const calendarResult = parseCalendarCode(cleanedTitle);
        
        let finalDeadline = taskData.deadline;
        let scheduledTime = taskData.scheduledTime;
        let isCampaign = taskData.isCampaign || false;
        let isCalendarEvent = taskData.isCalendarEvent || false;

        // Apply G12 if found
        if (timeCode) {
            isCampaign = true; 
            const campaignData = getActiveCampaignData();
            if (campaignData) {
                finalDeadline = calculateCampaignDate(campaignData.startDate, timeCode.week, timeCode.day);
                lifeDispatch.addToast(`G12: Scheduled for W${timeCode.week} D${timeCode.day}`, 'info');
            } else {
                 lifeDispatch.addToast(`No active G12 campaign found for [W${timeCode.week}D${timeCode.day}]`, 'error');
            }
        } 
        
        // Apply Calendar Code if found (Overrides G12 title if both exist, but uses parsed date)
        if (calendarResult.dateIso) {
            cleanedTitle = calendarResult.cleanedTitle;
            scheduledTime = calendarResult.dateIso;
            finalDeadline = calendarResult.dateIso; // Tasks use deadline visually
            isCalendarEvent = true;
            lifeDispatch.addToast(`C30: Scheduled via Code`, 'info');
        }

        const newTask: Task = {
            ...taskData,
            title: cleanedTitle,
            deadline: finalDeadline,
            scheduledTime: scheduledTime,
            isCampaign: isCampaign, 
            isCalendarEvent: isCalendarEvent,
            id: `t_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            isCompleted: false,
            isArchived: false
        };
        playSound('click', soundEnabled);
        setState(prev => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
        lifeDispatch.setModal('none'); 
    };

    const updateTask = (taskId: string, updates: Partial<Omit<Task, 'id'>>) => {
        setState(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t) }));
        playSound('click', soundEnabled);
    };

    const toggleTask = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const isCompleting = !task.isCompleted;
        let soundToPlay: 'success' | 'level-up' | 'crit' | null = null;

        if (isCompleting) {
            let rewards = calculateTaskReward(task.difficulty, lifeState.user.currentMode);
            if (task.isCampaign) rewards.xp = Math.ceil(rewards.xp * 1.1);

            const roll = Math.random();
            const isCrit = (task.difficulty === Difficulty.HARD && roll > 0.85) || 
                           (task.difficulty === Difficulty.NORMAL && roll > 0.90);

            let lootPayload: LootPayload | null = null;

            if (isCrit) {
                rewards.xp *= 2;
                rewards.gold *= 2;
                soundToPlay = 'crit';
                lootPayload = {
                    title: task.title,
                    xp: rewards.xp,
                    gold: rewards.gold,
                    multiplier: 2,
                    message: "Luck favors the bold."
                };
            } else {
                soundToPlay = 'success';
            }

            const currentMetrics = lifeState.user.metrics;
            const newMetrics = {
                ...currentMetrics,
                totalTasksCompleted: currentMetrics.totalTasksCompleted + 1,
                tasksByDifficulty: {
                    ...currentMetrics.tasksByDifficulty,
                    [task.difficulty]: (currentMetrics.tasksByDifficulty[task.difficulty] || 0) + 1
                },
                totalGoldEarned: currentMetrics.totalGoldEarned + rewards.gold,
                totalXPEarned: currentMetrics.totalXPEarned + rewards.xp
            };

            const statReward = task.difficulty === Difficulty.HARD ? 2 : task.difficulty === Difficulty.NORMAL ? 1 : 0.5;

            lifeDispatch.updateUser({
                currentXP: lifeState.user.currentXP + rewards.xp,
                dailyXP: lifeState.user.dailyXP + rewards.xp,
                gold: lifeState.user.gold + rewards.gold,
                stats: {
                    ...lifeState.user.stats,
                    [task.stat]: lifeState.user.stats[task.stat] + statReward
                },
                metrics: newMetrics 
            });

            let toastRewards = `+${rewards.xp} XP • +${rewards.gold} G`;
            if (task.skillId) {
                const skillXp = Math.ceil(rewards.xp * 0.5); 
                skillDispatch.addSkillXP(task.skillId, skillXp);
                const linkedSkill = skillState.skills.find(s => s.id === task.skillId);
                if (linkedSkill) toastRewards += ` • +${skillXp} ${linkedSkill.title}`;
            }

            if (!lootPayload) {
                lifeDispatch.addToast(`Mission Complete: ${task.title} | ${toastRewards}`, 'success');
            } else {
                setTimeout(() => lifeDispatch.setModal('loot', lootPayload), 200); 
            }

        } else {
            const baseRewards = calculateTaskReward(task.difficulty, lifeState.user.currentMode);
            if (task.isCampaign) baseRewards.xp = Math.ceil(baseRewards.xp * 1.1);

            const currentMetrics = lifeState.user.metrics;
            const newMetrics = {
                ...currentMetrics,
                totalTasksCompleted: Math.max(0, currentMetrics.totalTasksCompleted - 1),
                tasksByDifficulty: {
                    ...currentMetrics.tasksByDifficulty,
                    [task.difficulty]: Math.max(0, (currentMetrics.tasksByDifficulty[task.difficulty] || 0) - 1)
                },
                totalGoldEarned: Math.max(0, currentMetrics.totalGoldEarned - baseRewards.gold),
                totalXPEarned: Math.max(0, currentMetrics.totalXPEarned - baseRewards.xp)
            };

            const statReward = task.difficulty === Difficulty.HARD ? 2 : task.difficulty === Difficulty.NORMAL ? 1 : 0.5;

             lifeDispatch.updateUser({
                currentXP: Math.max(0, lifeState.user.currentXP - baseRewards.xp),
                dailyXP: Math.max(0, lifeState.user.dailyXP - baseRewards.xp),
                gold: Math.max(0, lifeState.user.gold - baseRewards.gold),
                stats: {
                    ...lifeState.user.stats,
                    [task.stat]: Math.max(0, lifeState.user.stats[task.stat] - statReward)
                },
                metrics: newMetrics
            });
        }

        if (soundToPlay && soundEnabled) playSound(soundToPlay, soundEnabled);
        setState(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === taskId ? { ...t, isCompleted: isCompleting } : t) }));
    };

    const toggleSubtask = (taskId: string, subtaskId: string) => {
        setState(prev => ({ ...prev, tasks: prev.tasks.map(t => {
            if (t.id !== taskId) return t;
            const updatedSubtasks = t.subtasks.map(st => 
                st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
            );
            return { ...t, subtasks: updatedSubtasks };
        })}));
        playSound('click', soundEnabled);
    };

    const deleteTask = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if(!task) return;

        if (!task.isCompleted && !task.isArchived) {
             const penalty = PENALTIES[task.difficulty];
             
             // ⚖️ DYNAMIC HONOR PENALTY
             const penaltyPercent = calculateDailyHonorPenalty(task.difficulty);

             const todayIso = lifeState.ui.debugDate ? new Date(lifeState.ui.debugDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
             const currentDailyHonor = lifeState.user.honorDailyLog[todayIso] !== undefined ? lifeState.user.honorDailyLog[todayIso] : 100;
             const newDailyHonor = Math.max(0, currentDailyHonor - penaltyPercent); 
             
             const updatedLog = { ...lifeState.user.honorDailyLog, [todayIso]: newDailyHonor };
             const newAverage = calculateMonthlyAverage(updatedLog, lifeState.ui.debugDate);

             lifeDispatch.updateUser({
                currentXP: Math.max(0, lifeState.user.currentXP - penalty.xp),
                gold: Math.max(0, lifeState.user.gold - penalty.gold),
                stats: {
                    ...lifeState.user.stats,
                    [task.stat]: Math.max(0, lifeState.user.stats[task.stat] - penalty.stat)
                },
                honorDailyLog: updatedLog,
                honor: newAverage
            });
            lifeDispatch.addToast(`Mission Failed: -${penaltyPercent}% Honor | -${penalty.xp} XP`, 'error');
            playSound('error', soundEnabled);
        } else {
            playSound('delete', soundEnabled);
        }
        
        setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== taskId) }));
    };

    const addCategory = (title: string) => {
        const newCat: TaskCategory = { 
            id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, 
            title, 
            isCollapsed: false 
        };
        setState(prev => ({ ...prev, categories: [...prev.categories, newCat] }));
        playSound('click', soundEnabled);
    };

    const deleteCategory = (id: string) => {
        setState(prev => ({ 
            ...prev, 
            categories: prev.categories.filter(c => c.id !== id),
            tasks: prev.tasks.map(t => t.categoryId === id ? { ...t, categoryId: undefined } : t)
        }));
        playSound('delete', soundEnabled);
    };

    const renameCategory = (id: string, newTitle: string) => {
        setState(prev => ({ ...prev, categories: prev.categories.map(c => c.id === id ? { ...c, title: newTitle } : c) }));
    };

    const toggleCategory = (id: string) => {
        setState(prev => ({ ...prev, categories: prev.categories.map(c => c.id === id ? { ...c, isCollapsed: !c.isCollapsed } : c) }));
    };

    const moveTask = (taskId: string, categoryId: string | undefined) => {
        setState(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === taskId ? { ...t, categoryId } : t) }));
        playSound('click', soundEnabled);
    };

    const archiveTask = (taskId: string) => {
        setState(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === taskId ? { ...t, isArchived: true } : t) }));
        lifeDispatch.addToast('Mission moved to Backlog', 'info');
        playSound('click', soundEnabled);
    };

    const restoreTask = (taskId: string) => {
        setState(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === taskId ? { ...t, isArchived: false } : t) }));
        lifeDispatch.addToast('Mission Restored', 'success');
        playSound('click', soundEnabled);
    };

    // ⚖️ LAW IMPLEMENTATION
    const addLaw = (title: string, type: 'gold' | 'xp' | 'stat' | 'honor', value: number, stat?: Stat) => {
        const newLaw: Law = {
            id: `law_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            title,
            penaltyType: type,
            penaltyValue: value,
            statTarget: stat,
            timesBroken: 0
        };
        setState(prev => ({ ...prev, laws: [...prev.laws, newLaw] }));
        playSound('click', soundEnabled);
        lifeDispatch.addToast('New Law Enacted', 'info');
    };

    const updateLaw = (id: string, updates: Partial<Omit<Law, 'id'>>) => {
        setState(prev => ({ ...prev, laws: prev.laws.map(l => l.id === id ? { ...l, ...updates } : l) }));
        playSound('click', soundEnabled);
    };

    const deleteLaw = (id: string) => {
        setState(prev => ({ ...prev, laws: prev.laws.filter(l => l.id !== id) }));
        playSound('delete', soundEnabled);
    };

    const enforceLaw = (id: string) => {
        const law = laws.find(l => l.id === id);
        if (!law) return;

        // Apply Penalty (ALLOWING NEGATIVES)
        if (law.penaltyType === 'gold') {
            lifeDispatch.updateUser({ gold: lifeState.user.gold - law.penaltyValue });
            lifeDispatch.addToast(`Law Broken: ${law.title} | -${law.penaltyValue} Gold`, 'error');
        } else if (law.penaltyType === 'xp') {
            lifeDispatch.updateUser({ currentXP: lifeState.user.currentXP - law.penaltyValue });
            lifeDispatch.addToast(`Law Broken: ${law.title} | -${law.penaltyValue} XP`, 'error');
        } else if (law.penaltyType === 'stat' && law.statTarget) {
            lifeDispatch.updateUser({
                stats: {
                    ...lifeState.user.stats,
                    [law.statTarget]: lifeState.user.stats[law.statTarget] - law.penaltyValue
                }
            });
            lifeDispatch.addToast(`Law Broken: ${law.title} | -${law.penaltyValue} ${law.statTarget}`, 'error');
        } else if (law.penaltyType === 'honor') {
            // 🛡️ HONOR PENALTY V2: Apply to Daily Score
            const todayIso = lifeState.ui.debugDate ? new Date(lifeState.ui.debugDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            const currentDailyHonor = lifeState.user.honorDailyLog[todayIso] !== undefined ? lifeState.user.honorDailyLog[todayIso] : 100;
            const newDailyHonor = Math.max(0, currentDailyHonor - law.penaltyValue);
            
            // Recalculate Monthly Avg instantly
            const updatedLog = { ...lifeState.user.honorDailyLog, [todayIso]: newDailyHonor };
            const newAverage = calculateMonthlyAverage(updatedLog, lifeState.ui.debugDate);

            lifeDispatch.updateUser({ 
                honorDailyLog: updatedLog,
                honor: newAverage
            });
            
            lifeDispatch.addToast(`Law Broken: ${law.title} | -${law.penaltyValue} Honor`, 'error');
        }

        // Update Tracker
        setState(prev => ({ ...prev, laws: prev.laws.map(l => l.id === id ? { ...l, timesBroken: l.timesBroken + 1 } : l) }));
        playSound('error', soundEnabled);
    };

    const restoreData = (newTasks: Task[], newCategories: TaskCategory[], newLaws: Law[]) => {
        setState({ tasks: newTasks, categories: newCategories, laws: newLaws });
        lifeDispatch.addToast('Tasks & Laws Restored', 'success');
    };

    return (
        <TaskContext.Provider value={{ 
            taskState: state, 
            taskDispatch: { 
                addTask, updateTask, toggleTask, deleteTask, 
                addCategory, deleteCategory, renameCategory, toggleCategory, moveTask, archiveTask, restoreTask,
                toggleSubtask, addLaw, deleteLaw, enforceLaw, updateLaw, restoreData
            } 
        }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
};
