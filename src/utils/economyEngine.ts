
// --- تصحيح المسارات (الدخول لمجلد types) ---
import { Difficulty, DailyMode, UserProfile, Stat } from '../types/types';
import { StoreItem } from '../types/shopTypes';
import { REWARDS, MILESTONE_REWARDS } from '../types/constants';

// 💰 THE ECONOMY ENGINE
// Centralizes all math regarding XP and Gold gain.

interface RewardOutput {
    xp: number;
    gold: number;
}

// 1. Calculate Daily Salary (Midnight Paycheck)
export const calculateDailySalary = (streak: number, mode: DailyMode): number => {
    let baseSalary = 50; // Easy
    if (mode === DailyMode.NORMAL) baseSalary = 100;
    if (mode === DailyMode.HARD) baseSalary = 200;

    // Streak Multiplier: +10% every 7 days (Max 2x)
    const multiplier = Math.min(2, 1 + Math.floor(streak / 7) * 0.1);
    
    return Math.floor(baseSalary * multiplier);
};

// 2. Calculate Milestone Bonus
export const getMilestoneBonus = (streak: number): number => {
    return MILESTONE_REWARDS[streak] || 0;
};

// 3. Calculate Mission/Habit Reward
// Now supports ARTIFACT BUFFS from UserProfile
export const calculateTaskReward = (
    difficulty: Difficulty, 
    currentMode: DailyMode,
    user?: UserProfile, // 👈 Optional for backward compatibility, but recommended
    storeItems?: StoreItem[], // 👈 Needed to lookup item effects
    taskStat?: Stat // 👈 Needed for specific stat boosts
): RewardOutput => {
    const base = REWARDS[difficulty];
    
    let xpMultiplier = 1;
    let goldMultiplier = 1;

    // A. Mode Modifiers
    if (currentMode === DailyMode.HARD) {
        xpMultiplier += 0.2; // +20%
        goldMultiplier += 0.5; // +50%
    } else if (currentMode === DailyMode.EASY) {
        xpMultiplier -= 0.2; // -20%
    }

    // B. Artifact Modifiers (The Loadout)
    if (user && storeItems && user.equippedItems) {
        user.equippedItems.forEach(itemId => {
            const item = storeItems.find(i => i.id === itemId);
            if (item && item.effect) {
                if (item.effect.type === 'xp_boost') {
                    // Global XP Boost OR Specific Stat Boost
                    if (!item.effect.stat || item.effect.stat === taskStat) {
                        xpMultiplier += item.effect.value;
                    }
                }
                if (item.effect.type === 'gold_boost') {
                    goldMultiplier += item.effect.value;
                }
            }
        });
    }

    return {
        xp: Math.floor(base.xp * xpMultiplier),
        gold: Math.floor(base.gold * goldMultiplier)
    };
};
