
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
// --- تصحيح المسارات (الرجوع خطوة واحدة ../ للوصول للمجلدات المجاورة) ---
import { Habit, DailyStatus, HabitCategory } from '../types/habitTypes';
import { Difficulty, Stat, Toast, Reminder } from '../types/types';
import { useLifeOS } from './LifeOSContext'; // ملف مجاور (نفس المجلد)
import { useSkills } from './SkillContext';   // ملف مجاور (نفس المجلد)
import { checkHabitActive, calculateFall } from '../utils/habitEngine'; // في مجلد utils
import { playSound } from '../utils/audio';
import { calculateTaskReward } from '../utils/economyEngine';
// 🟢 Updated Import
import { calculateMonthlyAverage, calculateDailyHonorPenalty } from '../utils/honorSystem'; 
import { usePersistence } from '../hooks/usePersistence';

// 🏗️ Define Shape of Habit Store
interface HabitState {
    habits: Habit[];
    categories: HabitCategory[];
    activeHabitId: string | null;
}

interface HabitContextType {
    habitState: HabitState;
    habitDispatch: {
        addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'status' | 'history' | 'checkpoint' | 'bestStreak' | 'createdAt'>) => void;
        // 🟢 UPDATED: Relaxed type constraint to allow history/streak injection via AI
        updateHabit: (habitId: string, updates: Partial<Habit>) => void; 
        processHabit: (habitId: string, status: DailyStatus) => void;
        deleteHabit: (habitId: string) => void;
        setActiveHabit: (id: string | null) => void;
        addCategory: (title: string) => void;
        deleteCategory: (id: string) => void;
        renameCategory: (id: string, newTitle: string) => void;
        toggleCategory: (id: string) => void;
        moveHabit: (habitId: string, categoryId: string | undefined) => void;
        toggleSubtask: (habitId: string, subtaskId: string) => void; 
        restoreData: (habits: Habit[], categories: HabitCategory[]) => void;
    };
}

const STORAGE_KEY_HABITS = 'LIFE_OS_HABITS_DATA';
const STORAGE_KEY_CATEGORIES = 'LIFE_OS_HABIT_CATEGORIES';

// 🧹 CLEARED MOCK DATA (Empty Array for Clean Slate)
const INITIAL_HABITS: Habit[] = [
    {
      "id": "h_1771593541489_o581bvlg5",
      "title": "Clean room ",
      "description": "",
      "difficulty": Difficulty.NORMAL,
      "stat": Stat.DIS,
      "type": "specific_days",
      "specificDays": [
        1,
        4,
        5,
        6
      ],
      "isTimed": false,
      "reminders": [],
      "subtasks": [],
      "dailyTarget": 1,
      "streak": 0,
      "status": "pending",
      "history": [],
      "checkpoint": 0,
      "bestStreak": 0,
      "createdAt": "2026-02-20T13:19:01.489Z",
      "dailyProgress": 0
    }
];

const INITIAL_CATEGORIES: HabitCategory[] = [
    { id: 'cat_morning', title: '☀️ Morning Protocol', isCollapsed: false },
    { id: 'cat_health', title: '💪 Health & Body', isCollapsed: false },
    { id: 'cat_night', title: '🌙 Night Routine', isCollapsed: false },
];

const HabitContext = createContext<HabitContextType | undefined>(undefined);

// Migration Logic
const migrateHabit = (h: any): Habit => {
    let reminders: Reminder[] = h.reminders || [];
    if (!h.reminders && h.reminderMinutes && h.reminderMinutes > 0) {
        reminders = [{ id: `mig_${Date.now()}_${Math.random()}`, minutesBefore: h.reminderMinutes, isSent: !!h.isReminderSent }];
    }

    return {
        difficulty: Difficulty.NORMAL,
        stat: Stat.DIS,
        type: 'daily',
        history: [],
        streak: 0,
        checkpoint: 0,
        bestStreak: 0,
        status: 'pending',
        isTimed: false, 
        durationMinutes: 0,
        reminders: reminders,
        subtasks: [], 
        dailyTarget: h.dailyTarget || 1, 
        dailyProgress: h.dailyProgress || 0, 
        ...h
    }
};

const migrateHabitState = (data: any): { habits: Habit[], categories: HabitCategory[] } => {
    return {
        habits: (data.habits || []).map(migrateHabit),
        categories: data.categories || INITIAL_CATEGORIES
    };
};

export const HabitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { state: lifeState, dispatch: lifeDispatch } = useLifeOS();
    const { skillDispatch, skillState } = useSkills(); 
    const soundEnabled = lifeState.user.preferences.soundEnabled;

    // 🟢 USE PERSISTENCE HOOK
    const [state, setState] = usePersistence<{ habits: Habit[], categories: HabitCategory[] }>(
        'LIFE_OS_HABITS_COMBINED',
        { habits: INITIAL_HABITS, categories: INITIAL_CATEGORIES },
        'habits_data',
        migrateHabitState
    );
    const { habits, categories } = state;
    const [activeHabitId, setActiveHabitId] = useState<string | null>(null); 

    // 🟢 CHECK DAILY RESET (REFACTORED TO AVOID SIDE EFFECTS IN SETTER)
    useEffect(() => {
        const checkDailyReset = () => {
            const now = new Date();
            const lastOnline = new Date(lifeState.user.lastOnline);
            
            // 🕰️ VIRTUAL TIME MACHINE
            const startHour = lifeState.user.preferences.dayStartHour ?? 4;
            const getVirtualDate = (d: Date) => {
                const shifted = new Date(d);
                shifted.setHours(d.getHours() - startHour);
                return shifted;
            };

            const vNow = getVirtualDate(now);
            const vLast = getVirtualDate(lastOnline);
            const isNewDay = vNow.getDate() !== vLast.getDate() || vNow.getMonth() !== vLast.getMonth();

            if (isNewDay) {
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayIso = yesterday.toISOString();
                
                let remainingShields = lifeState.user.shields; 
                let shieldsConsumed = 0;
                let statPenalties: Partial<Record<Stat, number>> = {};
                let disPenaltyTotal = 0;
                let partialRestCount = 0;

                const updatedHabits = habits.map(habit => {
                        // 🔔 RESET REMINDERS FOR NEW DAY
                        const reminders = habit.reminders ? habit.reminders.map(r => ({ ...r, isSent: false })) : [];
                        
                        // 🔄 RESET SUBTASKS & PROGRESS FOR NEW DAY
                        const subtasks = habit.subtasks ? habit.subtasks.map(s => ({ ...s, isCompleted: false })) : [];
                        
                        // Base reset object
                        const baseReset = { reminders, subtasks, dailyProgress: 0 }; // 👈 Reset Progress

                        if (habit.status === 'completed') {
                        return { ...habit, ...baseReset, status: 'pending' as DailyStatus, shieldUsed: false, history: [...habit.history, yesterdayIso] };
                    }
                    if (habit.status === 'failed') {
                        return { ...habit, ...baseReset, status: 'pending' as DailyStatus, shieldUsed: false };
                    }

                    const wasActiveYesterday = checkHabitActive(habit, yesterdayIso);
                    
                    if (wasActiveYesterday && habit.status === 'pending') {
                        // 🟢 PARTIAL PROGRESS CHECK
                        if ((habit.dailyProgress || 0) > 0) {
                            partialRestCount++;
                            return { ...habit, ...baseReset, status: 'pending' as DailyStatus, shieldUsed: false };
                        }

                        if (remainingShields > 0) {
                            remainingShields--;
                            shieldsConsumed++;
                            lifeDispatch.addToast(`🛡️ Shield protected: ${habit.title}`, 'info');
                            return { ...habit, ...baseReset, status: 'pending' as DailyStatus, shieldUsed: true };
                        }

                        const safeFallStreak = calculateFall(habit.streak);
                        statPenalties[habit.stat] = (statPenalties[habit.stat] || 0) + 1;
                        disPenaltyTotal += 1;
                        
                        lifeDispatch.addToast(`⚠️ Missed ${habit.title}: -1 ${habit.stat} & -1 DIS`, 'error');

                        return { ...habit, ...baseReset, streak: safeFallStreak, status: 'pending' as DailyStatus, shieldUsed: false };
                    }
                    return { ...habit, ...baseReset, status: 'pending' as DailyStatus, shieldUsed: false };
                });

                // Apply Updates & Side Effects
                setState(prev => ({ ...prev, habits: updatedHabits }));

                if (shieldsConsumed > 0) {
                    lifeDispatch.updateUser({ shields: remainingShields });
                    playSound('success', soundEnabled);
                } 
                if (partialRestCount > 0) {
                    lifeDispatch.addToast(`${partialRestCount} habits partially completed (Rest Day recorded)`, 'info');
                }
                if (disPenaltyTotal > 0) {
                    playSound('error', soundEnabled);
                    const currentStats = { ...lifeState.user.stats };
                    Object.entries(statPenalties).forEach(([statKey, count]) => {
                        const key = statKey as Stat;
                        currentStats[key] = Math.max(0, currentStats[key] - (count as number));
                    });
                    currentStats[Stat.DIS] = Math.max(0, currentStats[Stat.DIS] - disPenaltyTotal);
                    
                    lifeDispatch.updateUser({ stats: currentStats });
                }
            }
        };

        checkDailyReset();
        const interval = setInterval(checkDailyReset, 60000);
        return () => clearInterval(interval);
    }, [lifeState.user.lastOnline, habits, lifeState.user.preferences.dayStartHour]); 

    
    const setActiveHabit = (id: string | null) => {
        if(id) playSound('click', soundEnabled);
        setActiveHabitId(id);
    };

    const addHabit = (habitData: Omit<Habit, 'id' | 'streak' | 'status' | 'history' | 'checkpoint' | 'bestStreak' | 'createdAt'>) => {
        const newHabit: Habit = {
            // 🔒 FIX: ID Collision Prevention
            id: `h_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...habitData,
            streak: 0,
            status: 'pending',
            history: [],
            checkpoint: 0,
            bestStreak: 0,
            createdAt: new Date().toISOString(),
            dailyProgress: 0
        };
        playSound('click', soundEnabled);
        setState(prev => ({ ...prev, habits: [...prev.habits, newHabit] }));
        lifeDispatch.setModal('none');
    };

    // 🟢 ALLOW FULL PARTIALS
    const updateHabit = (habitId: string, updates: Partial<Habit>) => {
        setState(prev => ({ ...prev, habits: prev.habits.map(h => h.id === habitId ? { ...h, ...updates } : h) }));
        playSound('click', soundEnabled);
    };

    // 🆕 SUBTASK TOGGLE (With Partial Progress Logic)
    const toggleSubtask = (habitId: string, subtaskId: string) => {
        setState(prev => ({ ...prev, habits: prev.habits.map(h => {
            if (h.id !== habitId) return h;
            
            const updatedSubtasks = h.subtasks.map(st => 
                st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
            );
            
            return { ...h, subtasks: updatedSubtasks };
        })}));
        playSound('click', soundEnabled);
    };

    const processHabit = (habitId: string, status: DailyStatus) => {
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return;

        // 🟢 ITERATION LOGIC (Reps)
        if (status === 'completed' && habit.dailyTarget && habit.dailyTarget > 1) {
            const currentReps = habit.dailyProgress || 0;
            const newReps = currentReps + 1;
            
            if (newReps < habit.dailyTarget) {
                // Just increment reps
                setState(prev => ({ ...prev, habits: prev.habits.map(h => h.id === habitId ? { ...h, dailyProgress: newReps } : h) }));
                playSound('click', soundEnabled);
                lifeDispatch.addToast(`${habit.title}: Rep ${newReps}/${habit.dailyTarget}`, 'info');
                return; // Stop here, don't complete yet
            }
            // Else, hit target -> Complete fully below
        }

        let newStreak = habit.streak;
        let newHistory = habit.history;
        let soundToPlay: 'success' | 'level-up' | 'crit' | 'error' = 'success';
        
        if (status === 'completed') {
            newStreak += 1;
            const todayIso = new Date().toISOString().split('T')[0];
            // Prevent double logging same day (though UI prevents this usually)
            if (!newHistory.some(d => d.startsWith(todayIso))) {
                newHistory = [...newHistory, new Date().toISOString()];
            }

            // Reward Calculation
            let rewards = calculateTaskReward(habit.difficulty, lifeState.user.currentMode);
            const roll = Math.random();
            if (roll > 0.95) {
                rewards.xp *= 2;
                rewards.gold *= 2;
                soundToPlay = 'crit';
                lifeDispatch.setModal('loot', {
                    title: habit.title,
                    xp: rewards.xp,
                    gold: rewards.gold,
                    multiplier: 2,
                    message: "Consistency is Power."
                });
            } else {
                lifeDispatch.addToast(`${habit.title} Complete | +${rewards.xp} XP`, 'success');
            }

            const statReward = habit.difficulty === Difficulty.HARD ? 2 : habit.difficulty === Difficulty.NORMAL ? 1 : 0.5;

            lifeDispatch.updateUser({
                currentXP: lifeState.user.currentXP + rewards.xp,
                dailyXP: lifeState.user.dailyXP + rewards.xp,
                gold: lifeState.user.gold + rewards.gold,
                stats: {
                    ...lifeState.user.stats,
                    [habit.stat]: lifeState.user.stats[habit.stat] + statReward
                },
                metrics: {
                    ...lifeState.user.metrics,
                    habitsFixed: lifeState.user.metrics.habitsFixed + 1
                }
            });

            if (habit.skillId) {
                const skillXP = Math.ceil(rewards.xp * 0.5);
                skillDispatch.addSkillXP(habit.skillId, skillXP);
            }

        } else if (status === 'failed') {
            newStreak = calculateFall(habit.streak);
            soundToPlay = 'error';
            
            // 🛡️ DYNAMIC HONOR PENALTY LOGIC
            const penaltyPercent = calculateDailyHonorPenalty(habit.difficulty);
            
            const todayIso = lifeState.ui.debugDate ? new Date(lifeState.ui.debugDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            const currentDailyHonor = lifeState.user.honorDailyLog[todayIso] !== undefined ? lifeState.user.honorDailyLog[todayIso] : 100;
            const newDailyHonor = Math.max(0, currentDailyHonor - penaltyPercent); 
            
            const updatedLog = { ...lifeState.user.honorDailyLog, [todayIso]: newDailyHonor };
            const newAverage = calculateMonthlyAverage(updatedLog, lifeState.ui.debugDate);

            lifeDispatch.updateUser({ 
                honorDailyLog: updatedLog,
                honor: newAverage
            });

            lifeDispatch.addToast(`${habit.title} Failed | Streak Reset & -${penaltyPercent}% Honor`, 'error');
        }

        // Apply
        setState(prev => ({ ...prev, habits: prev.habits.map(h => h.id === habitId ? { 
            ...h, 
            status, 
            streak: newStreak, 
            history: newHistory,
            bestStreak: Math.max(h.bestStreak, newStreak),
            dailyProgress: status === 'completed' ? h.dailyTarget : h.dailyProgress // Max out reps
        } : h) }));

        playSound(soundToPlay, soundEnabled);
    };

    const deleteHabit = (habitId: string) => {
        setState(prev => ({ ...prev, habits: prev.habits.filter(h => h.id !== habitId) }));
        playSound('delete', soundEnabled);
        lifeDispatch.addToast('Protocol Deleted', 'info');
        if (activeHabitId === habitId) setActiveHabitId(null);
    };

    const addCategory = (title: string) => {
        const newCat: HabitCategory = { 
            id: `cat_h_${Date.now()}`, 
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
            habits: prev.habits.map(h => h.categoryId === id ? { ...h, categoryId: undefined } : h)
        }));
        playSound('delete', soundEnabled);
    };

    const renameCategory = (id: string, newTitle: string) => {
        setState(prev => ({ ...prev, categories: prev.categories.map(c => c.id === id ? { ...c, title: newTitle } : c) }));
    };

    const toggleCategory = (id: string) => {
        setState(prev => ({ ...prev, categories: prev.categories.map(c => c.id === id ? { ...c, isCollapsed: !c.isCollapsed } : c) }));
    };

    const moveHabit = (habitId: string, categoryId: string | undefined) => {
        setState(prev => ({ ...prev, habits: prev.habits.map(h => h.id === habitId ? { ...h, categoryId } : h) }));
        playSound('click', soundEnabled);
    };

    const restoreData = (newHabits: Habit[], newCategories: HabitCategory[]) => {
        setState({ habits: newHabits, categories: newCategories });
        lifeDispatch.addToast('Habits Restored', 'success');
    };

    return (
        <HabitContext.Provider value={{ 
            habitState: { habits, categories, activeHabitId }, 
            habitDispatch: { 
                addHabit, updateHabit, processHabit, deleteHabit, setActiveHabit, 
                addCategory, deleteCategory, renameCategory, toggleCategory, moveHabit,
                toggleSubtask, restoreData
            } 
        }}>
            {children}
        </HabitContext.Provider>
    );
};

export const useHabits = () => {
    const context = useContext(HabitContext);
    if (context === undefined) {
        throw new Error('useHabits must be used within a HabitProvider');
    }
    return context;
};
