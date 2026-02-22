
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { BadgeDefinition, BadgeTier, BadgeProgress } from '../types/badgeTypes';
import { BADGE_DATABASE } from '../data/badgeData'; // قاعدة البيانات في مجلد data
import { useLifeOS } from './LifeOSContext'; // ملف مجاور (نفس المجلد)
import { useSkills } from './SkillContext';   // ملف مجاور (نفس المجلد)
import { useHabits } from './HabitContext';   // 👈 Import Habits
import { useRaids } from './RaidContext';     // 👈 NEW: Import Raids
import { playSound } from '../utils/audio';   // الصوتيات في مجلد utils
import { UserProfile, UserMetrics } from '../types/types'; // الأنواع العامة

interface BadgeContextType {
    getAllBadges: () => BadgeProgress[];
    checkBadges: () => void;
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

// Helper to format date as YYMMDDHHmm
const generateTimeCode = (): string => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${now.getFullYear().toString().slice(-2)}${pad(now.getMonth()+1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
};

export const BadgeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { state, dispatch } = useLifeOS();
    const { skillState } = useSkills(); 
    const { habitState } = useHabits();
    const { raidState } = useRaids(); // 👈 Access Raids
    const { user } = state;

    // 🔗 COMBINE NATIVE + INJECTED BADGES
    const getAllBadgeDefinitions = () => {
        return [...BADGE_DATABASE, ...state.badgesRegistry];
    };

    // 🕵️‍♀️ THE CHECKER ENGINE
    const checkBadges = () => {
        let updatesOccurred = false;
        let newUser = { ...user };
        
        // Ensure data structures exist
        if (!newUser.badgeTiers) newUser.badgeTiers = {};
        if (!newUser.badgeHistory) newUser.badgeHistory = {};

        const allBadges = getAllBadgeDefinitions();

        allBadges.forEach(badge => {
            let currentValue = 0;

            // 1. Determine Current Value based on Trigger
            if (badge.triggerType === 'metric' && badge.metricKey) {
                // Handle nested keys like "tasksByDifficulty.hard"
                const keys = badge.metricKey.split('.');
                if (keys.length === 1) {
                    currentValue = (user.metrics as any)[keys[0]] || 0;
                } else if (keys.length === 2) {
                     currentValue = (user.metrics as any)[keys[0]]?.[keys[1]] || 0;
                }
                
                // Special Case: Level is directly on user, not metrics
                if (badge.metricKey === 'level') currentValue = user.level;
                // Special Case: Streak is directly on user
                if (badge.metricKey === 'highestStreak') currentValue = Math.max(user.streak, user.metrics.highestStreak);

            } else if (badge.triggerType === 'stat' && badge.metricKey) {
                currentValue = user.stats[badge.metricKey as any] || 0;
            } 
            // 🧠 SKILL LOGIC
            else if (badge.triggerType === 'skill' && badge.metricKey) {
                const targetSkill = skillState.skills.find(s => s.id === badge.metricKey);
                if (targetSkill) {
                    currentValue = targetSkill.level;
                }
            }
            // 🗓️ HABIT SPECIFIC LOGIC
            else if (badge.triggerType === 'habit' && badge.metricKey) {
                const targetHabit = habitState.habits.find(h => 
                    h.title.toLowerCase().includes(badge.metricKey!.toLowerCase())
                );
                if (targetHabit) {
                    currentValue = targetHabit.streak;
                }
            }
            // ⚔️ RAID SPECIFIC LOGIC (NEW)
            else if (badge.triggerType === 'raid' && badge.metricKey) {
                // Search for a Raid title containing the key
                const targetRaid = raidState.raids.find(r => 
                    r.title.toLowerCase().includes(badge.metricKey!.toLowerCase())
                );
                if (targetRaid) {
                    // Use progress % as metric (0-100)
                    currentValue = targetRaid.progress;
                }
            }

            // 2. Check Levels
            badge.levels.forEach(level => {
                const tierKey = level.tier;
                // If not already unlocked at this tier
                const currentTier = newUser.badgeTiers[badge.id];
                const isAlreadyUnlocked = newUser.badgeHistory[badge.id]?.[tierKey];
                
                // Logic: Unlock if target met AND not already unlocked
                if (currentValue >= level.target && !isAlreadyUnlocked) {
                    updatesOccurred = true;
                    
                    // Update User Badge Data
                    newUser.badgeTiers[badge.id] = tierKey; // Set current highest tier
                    if (!newUser.badges.includes(badge.id)) newUser.badges.push(badge.id);
                    
                    if (!newUser.badgeHistory[badge.id]) newUser.badgeHistory[badge.id] = {};
                    newUser.badgeHistory[badge.id][tierKey] = generateTimeCode();

                    // Give Rewards
                    newUser.currentXP += level.rewards.xp;
                    newUser.gold += level.rewards.gold;

                    // 🏆 TRIGGER CELEBRATION MODAL
                    setTimeout(() => {
                        dispatch.setModal('badgeUnlock', { 
                            badge, 
                            tier: tierKey,
                            rewards: level.rewards
                        });
                        playSound('level-up', true);
                    }, 500);
                }
            });
        });

        if (updatesOccurred) {
            dispatch.updateUser(newUser);
        }
    };

    // 🗓️ AUTO-CHECKER: Run whenever metrics OR HABITS/RAIDS change
    useEffect(() => {
        const timeout = setTimeout(() => {
            checkBadges();
        }, 1000);
        return () => clearTimeout(timeout);
    }, [
        user.level, 
        user.streak, 
        user.metrics?.totalTasksCompleted, 
        user.metrics?.totalGoldEarned, 
        user.metrics?.totalRaidsWon,
        JSON.stringify(user.stats), 
        JSON.stringify(skillState.skills.map(s => s.level)),
        // 🟢 Watch Habits & Raids
        JSON.stringify(habitState.habits.map(h => h.streak)),
        JSON.stringify(raidState.raids.map(r => r.progress))
    ]);

    // 📤 DATA PREPARATION FOR UI
    const getAllBadges = (): BadgeProgress[] => {
        const allBadges = getAllBadgeDefinitions();

        return allBadges.map(badge => {
            let currentValue = 0;
            if (badge.triggerType === 'metric' && badge.metricKey) {
                const keys = badge.metricKey.split('.');
                if (keys.length === 1) currentValue = (user.metrics as any)[keys[0]] || 0;
                else currentValue = (user.metrics as any)[keys[0]]?.[keys[1]] || 0;
                if (badge.metricKey === 'level') currentValue = user.level;
                if (badge.metricKey === 'highestStreak') currentValue = Math.max(user.streak, user.metrics?.highestStreak || 0);
            } else if (badge.triggerType === 'stat' && badge.metricKey) {
                currentValue = user.stats[badge.metricKey as any] || 0;
            } else if (badge.triggerType === 'skill' && badge.metricKey) {
                const targetSkill = skillState.skills.find(s => s.id === badge.metricKey);
                if (targetSkill) currentValue = targetSkill.level;
            } else if (badge.triggerType === 'habit' && badge.metricKey) {
                const targetHabit = habitState.habits.find(h => 
                    h.title.toLowerCase().includes(badge.metricKey!.toLowerCase())
                );
                if (targetHabit) currentValue = targetHabit.streak;
            } else if (badge.triggerType === 'raid' && badge.metricKey) {
                const targetRaid = raidState.raids.find(r => 
                    r.title.toLowerCase().includes(badge.metricKey!.toLowerCase())
                );
                if (targetRaid) currentValue = targetRaid.progress;
            }

            const currentTier = user.badgeTiers?.[badge.id] || null;
            
            let nextTier = badge.levels[0];
            if (currentTier === 'silver') nextTier = badge.levels[1];
            if (currentTier === 'gold') nextTier = badge.levels[2];
            if (currentTier === 'diamond') nextTier = badge.levels[3];
            if (currentTier === 'crimson') nextTier = null as any; 

            return {
                badge,
                currentValue,
                isUnlocked: !!currentTier,
                currentTier,
                nextTier,
                history: user.badgeHistory?.[badge.id] || {} as any
            };
        });
    };

    return (
        <BadgeContext.Provider value={{ getAllBadges, checkBadges }}>
            {children}
        </BadgeContext.Provider>
    );
};

export const useBadges = () => {
    const context = useContext(BadgeContext);
    if (!context) throw new Error("useBadges must be used within BadgeProvider");
    return context;
};
