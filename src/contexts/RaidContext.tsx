
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Raid, RaidStep } from '../types/raidTypes';
import { Difficulty, Stat, LootPayload } from '../types/types';
import { useLifeOS } from './LifeOSContext';
import { useSkills } from './SkillContext';
import { playSound } from '../utils/audio';
import { REWARDS } from '../types/constants';
import { calculateTaskReward } from '../utils/economyEngine';

interface RaidState {
    raids: Raid[];
}

interface RaidContextType {
    raidState: RaidState;
    raidDispatch: {
        addRaid: (raid: Omit<Raid, 'id' | 'status' | 'progress'>) => void;
        updateRaid: (raidId: string, updates: Partial<Raid>) => void; 
        deleteRaid: (raidId: string) => void;
        toggleRaidStep: (raidId: string, stepId: string) => void;
        updateRaidStep: (raidId: string, stepId: string, updates: Partial<RaidStep>) => void;
        mergeRaidSteps: (raidId: string, newSteps: Partial<RaidStep>[]) => void;
        toggleRaidStepSubtask: (raidId: string, stepId: string, subtaskId: string) => void;
        archiveRaid: (raidId: string) => void;
        archiveRaidStep: (raidId: string, stepId: string) => void;
        deleteRaidStep: (raidId: string, stepId: string) => void;
        restoreRaid: (raidId: string) => void;
        restoreData: (raids: Raid[]) => void;
    };
}

const STORAGE_KEY_RAIDS = 'LIFE_OS_RAIDS_DATA';

const RaidContext = createContext<RaidContextType | undefined>(undefined);

export const RaidProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { state: lifeState, dispatch: lifeDispatch } = useLifeOS();
    const { skillDispatch } = useSkills();
    const soundEnabled = lifeState.user.preferences.soundEnabled;

    // 🛡️ Safe Loader
    const safeLoad = (): Raid[] => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_RAIDS);
            if (saved) return JSON.parse(saved);
        } catch (e) { console.warn("Failed to load raids:", e); }
        return [];
    };

    const [raids, setRaids] = useState<Raid[]>(safeLoad);

    useEffect(() => {
        const saveTimeout = setTimeout(() => {
            if (raids.length > 0 || localStorage.getItem(STORAGE_KEY_RAIDS)) {
                localStorage.setItem(STORAGE_KEY_RAIDS, JSON.stringify(raids));
            }
        }, 500);
        return () => clearTimeout(saveTimeout);
    }, [raids]);

    // Actions
    const addRaid = (raidData: Omit<Raid, 'id' | 'status' | 'progress'>) => {
        const newRaid: Raid = {
            id: `rd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...raidData,
            status: 'active',
            progress: 0,
            isCampaign: raidData.isCampaign || false
        };
        setRaids(prev => [newRaid, ...prev]);
        playSound('click', soundEnabled);
        lifeDispatch.addToast('Operation Initialized', 'success');
    };

    const updateRaid = (raidId: string, updates: Partial<Raid>) => {
        setRaids(prev => prev.map(r => r.id === raidId ? { ...r, ...updates } : r));
        playSound('click', soundEnabled);
    };

    const deleteRaid = (raidId: string) => {
        setRaids(prev => prev.filter(r => r.id !== raidId));
        playSound('delete', soundEnabled);
        lifeDispatch.addToast('Operation Deleted', 'info');
    };

    const archiveRaid = (raidId: string) => {
        setRaids(prev => prev.map(r => r.id === raidId ? { ...r, status: 'archived' } : r));
        lifeDispatch.addToast('Operation Archived', 'info');
    };

    const restoreRaid = (raidId: string) => {
        setRaids(prev => prev.map(r => r.id === raidId ? { ...r, status: 'active' } : r));
        lifeDispatch.addToast('Operation Restored', 'success');
    };

    const archiveRaidStep = (raidId: string, stepId: string) => {
        setRaids(prev => prev.map(r => {
            if (r.id !== raidId) return r;
            const updatedSteps = r.steps.map(s => s.id === stepId ? { ...s, isArchived: true } : s);
            return { ...r, steps: updatedSteps };
        }));
    };

    const deleteRaidStep = (raidId: string, stepId: string) => {
        setRaids(prev => prev.map(r => {
            if (r.id !== raidId) return r;
            const updatedSteps = r.steps.filter(s => s.id !== stepId);
            return { ...r, steps: updatedSteps };
        }));
        lifeDispatch.setModal('none');
    };

    const updateRaidStep = (raidId: string, stepId: string, updates: Partial<RaidStep>) => {
        setRaids(prev => prev.map(r => {
            if (r.id !== raidId) return r;
            const updatedSteps = r.steps.map(s => s.id === stepId ? { ...s, ...updates } : s);
            return { ...r, steps: updatedSteps };
        }));
    };

    const mergeRaidSteps = (raidId: string, newSteps: Partial<RaidStep>[]) => {
        setRaids(prev => prev.map(r => {
            if (r.id !== raidId) return r;
            
            // Create a map of updates for faster lookup
            const updatesMap = new Map(newSteps.map(s => [s.id, s]));
            
            const updatedSteps = r.steps.map(s => {
                if (updatesMap.has(s.id)) {
                    const updates = updatesMap.get(s.id)!;
                    // Merge updates, but preserve critical state if not explicitly overwritten
                    return { 
                        ...s, 
                        ...updates,
                        // Ensure we don't accidentally reset completion unless intended (though updates usually won't have isCompleted if just text)
                        isCompleted: updates.isCompleted !== undefined ? updates.isCompleted : s.isCompleted
                    };
                }
                return s;
            });

            return { ...r, steps: updatedSteps };
        }));
        lifeDispatch.addToast('Raid Steps Updated', 'success');
    };

    const toggleRaidStepSubtask = (raidId: string, stepId: string, subtaskId: string) => {
        setRaids(prev => prev.map(r => {
            if (r.id !== raidId) return r;
            const updatedSteps = r.steps.map(s => {
                if (s.id !== stepId) return s;
                const newSubtasks = s.subtasks?.map(sub => 
                    sub.id === subtaskId ? { ...sub, isCompleted: !sub.isCompleted } : sub
                ) || [];
                return { ...s, subtasks: newSubtasks };
            });
            return { ...r, steps: updatedSteps };
        }));
        playSound('click', soundEnabled);
    };

    const toggleRaidStep = (raidId: string, stepId: string) => {
        const raid = raids.find(r => r.id === raidId);
        if (!raid) return;

        const stepIndex = raid.steps.findIndex(s => s.id === stepId);
        if (stepIndex === -1) return;

        const step = raid.steps[stepIndex];
        const isCompleting = !step.isCompleted;

        // 🟢 REWARD CALCULATION
        const stepDifficulty = step.difficulty || raid.difficulty;
        const stepStat = step.stat || (raid.stats && raid.stats.length > 0 ? raid.stats[0] : Stat.STR);
        const stepSkillId = step.skillId || raid.skillId;
        const rewards = calculateTaskReward(stepDifficulty, lifeState.user.currentMode);
        const xp = rewards.xp;
        const gold = rewards.gold;
        const statReward = stepDifficulty === Difficulty.HARD ? 2 : stepDifficulty === Difficulty.NORMAL ? 1 : 0.5;

        // Calculate what the new progress will be
        const tempSteps = [...raid.steps];
        tempSteps[stepIndex] = { ...step, isCompleted: isCompleting };
        const completedCount = tempSteps.filter(s => s.isCompleted).length;
        const newProgress = Math.round((completedCount / tempSteps.length) * 100);
        const isRaidComplete = newProgress === 100;

        let lootPayload: LootPayload | null = null;

        // ⚡ SIDE EFFECTS & USER UPDATES (OUTSIDE setRaids)
        if (isCompleting) {
            lifeDispatch.updateUser({
                currentXP: lifeState.user.currentXP + xp,
                dailyXP: lifeState.user.dailyXP + xp,
                gold: lifeState.user.gold + gold,
                stats: {
                    ...lifeState.user.stats,
                    [stepStat]: lifeState.user.stats[stepStat] + statReward
                }
            });

            if (stepSkillId) skillDispatch.addSkillXP(stepSkillId, Math.ceil(xp * 0.5));

            if (isRaidComplete) {
                playSound('crit', soundEnabled);
                lootPayload = {
                    title: `Operation Conquered: ${raid.title}`,
                    xp: xp * 5,
                    gold: gold * 5,
                    multiplier: 5,
                    message: "Sector Secured. Tactical Superiority Achieved."
                };
                lifeDispatch.updateUser({
                    currentXP: lifeState.user.currentXP + (xp * 5),
                    gold: lifeState.user.gold + (gold * 5),
                    metrics: {
                        ...lifeState.user.metrics,
                        totalRaidsWon: lifeState.user.metrics.totalRaidsWon + 1
                    }
                });
            } else {
                playSound('success', soundEnabled);
                lifeDispatch.addToast(`Step Secured | +${xp} XP`, 'success');
            }
        } else {
            // 🔴 UNDO LOGIC
            lifeDispatch.updateUser({
                currentXP: Math.max(0, lifeState.user.currentXP - xp),
                dailyXP: Math.max(0, lifeState.user.dailyXP - xp),
                gold: Math.max(0, lifeState.user.gold - gold),
                stats: {
                    ...lifeState.user.stats,
                    [stepStat]: Math.max(0, lifeState.user.stats[stepStat] - statReward)
                }
            });

            if (raid.status === 'completed') {
                lifeDispatch.updateUser({
                    currentXP: Math.max(0, lifeState.user.currentXP - (xp * 5)),
                    gold: Math.max(0, lifeState.user.gold - (gold * 5)),
                    metrics: {
                        ...lifeState.user.metrics,
                        totalRaidsWon: Math.max(0, lifeState.user.metrics.totalRaidsWon - 1)
                    }
                });
                lifeDispatch.addToast(`Step Revoked | Completion Bonus Removed`, 'info');
            } else {
                lifeDispatch.addToast(`Step Revoked`, 'info');
            }
            playSound('delete', soundEnabled);
        }

        // 🔄 UPDATE RAIDS STATE
        setRaids(prev => prev.map(r => {
            if (r.id !== raidId) return r;

            const newSteps = [...r.steps];
            newSteps[stepIndex] = { ...step, isCompleted: isCompleting };

            if (isCompleting && stepIndex + 1 < newSteps.length) {
                newSteps[stepIndex + 1] = { ...newSteps[stepIndex + 1], isLocked: false };
            }

            return { 
                ...r, 
                steps: newSteps, 
                progress: newProgress,
                status: isRaidComplete ? 'completed' : (r.status === 'completed' ? 'active' : r.status)
            };
        }));

        if (lootPayload) {
            setTimeout(() => lifeDispatch.setModal('loot', lootPayload), 300);
        }
    };

    const restoreData = (newRaids: Raid[]) => {
        setRaids(newRaids);
        lifeDispatch.addToast('Raids Restored', 'success');
    };

    return (
        <RaidContext.Provider value={{ 
            raidState: { raids }, 
            raidDispatch: { 
                addRaid, updateRaid, deleteRaid, archiveRaid, restoreRaid, 
                toggleRaidStep, updateRaidStep, mergeRaidSteps, toggleRaidStepSubtask, 
                archiveRaidStep, deleteRaidStep, restoreData 
            } 
        }}>
            {children}
        </RaidContext.Provider>
    );
};

export const useRaids = () => {
    const context = useContext(RaidContext);
    if (context === undefined) {
        throw new Error('useRaids must be used within a RaidProvider');
    }
    return context;
};
