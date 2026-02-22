
import { DailyMode } from '../types/types';
import { DAILY_TARGETS } from '../types/constants'; 

// 🪓 THE GUILLOTINE LOGIC
// Decides the fate of the user at midnight.

export type GuillotineResult = 
    | { outcome: 'success'; newStreak: number; message: string; bonusType?: 'milestone' }
    | { outcome: 'frozen'; newShields: number; newConsecutiveShields: number; message: string }
    | { outcome: 'reset'; message: string };

export const checkMidnight = (lastProcessedIso: string): boolean => {
    const now = new Date();
    const last = new Date(lastProcessedIso);
    return now.getDate() !== last.getDate() || 
           now.getMonth() !== last.getMonth() || 
           now.getFullYear() !== last.getFullYear();
};

export const calculateGuillotine = (
    currentXP: number,
    targetXP: number,
    currentStreak: number,
    shields: number,
    consecutiveShields: number
): GuillotineResult => {
    
    // 1. SUCCESS: Target Met
    if (currentXP >= targetXP) {
        return {
            outcome: 'success',
            newStreak: currentStreak + 1,
            message: `🌅 New Cycle: Target Met! Streak: ${currentStreak + 1}`
        };
    }

    // 2. FAILURE LOGIC
    const hasShield = shields > 0;
    const canUseShield = consecutiveShields < 3; // Rule: Max 3 days passive shield

    if (hasShield && canUseShield) {
        return {
            outcome: 'frozen',
            newShields: shields - 1,
            newConsecutiveShields: consecutiveShields + 1,
            message: `🛡️ Shield Shattered. Streak Frozen (${shields - 1} left).`
        };
    }

    // 3. RESET
    let failMsg = `☠️ Target Missed. Streak Lost.`;
    if (hasShield && !canUseShield) {
        failMsg = `☠️ Shield Limit Exceeded (3 Days). Streak Reset.`;
    }

    return {
        outcome: 'reset',
        message: failMsg
    };
};

export const getNextTarget = (nextMode: DailyMode): number => {
    return DAILY_TARGETS[nextMode];
};
