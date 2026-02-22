
import { BadgeDefinition, BadgeTier } from '../types/badgeTypes';
import { Difficulty, Stat } from '../types/types';
import { checkHabitActive } from './habitEngine';

// ⚖️ THE JUDGEMENT ALGORITHM V2
// Calculates monthly performance and generates material-based badges.

type HonorMaterial = 'Wood' | 'Copper' | 'Iron' | 'Silver' | 'Gold' | 'Diamond' | 'Crimson';

export const HONOR_QUOTES: Record<HonorMaterial, string> = {
    "Wood": "هش وسريع الكسر. تحتاج إلى تقوية جذورك.", // 0-39%
    "Copper": "بداية التوصيل، لكن المعدن رخيص.", // 40-59%
    "Iron": "صلب، يتحمل الصدمات، لكنه يصدأ بلا عناية.", // 60-69%
    "Silver": "نقي ولامع. بدأت ترتقي عن المعادن الدنيئة.", // 70-79%
    "Gold": "المعيار الذي يُقاس به الآخرون. قيمة ثابتة.", // 80-89%
    "Diamond": "غير قابل للخدش. ضغط هائل صنع جوهرة.", // 90-98%
    "Crimson": "أسطورة حية. الشرف يجري في عروقك كالدم.", // 99-100%
};

// ⚖️ DIFFICULTY WEIGHTS
// Hard = 3x Normal = 9x Easy
const WEIGHTS = {
    [Difficulty.EASY]: 1,
    [Difficulty.NORMAL]: 3,
    [Difficulty.HARD]: 9
};

// 🏗️ DATA TYPES FOR BREAKDOWN
export interface HonorItem {
    id: string;
    title: string;
    type: 'task' | 'habit' | 'raid';
    difficulty: Difficulty;
    weight: number;
    percentage: number;
    isCompleted: boolean;
}

/**
 * 🧮 CALCULATE HONOR BREAKDOWN (Pure Function)
 * Returns a detailed list of all items contributing to today's Honor score.
 * Used by the HonorBreakdownModal.
 */
export const getDailyHonorBreakdown = (
    tasks: any[], 
    habits: any[], 
    raids: any[], 
    debugDate: string | null = null
): { items: HonorItem[], totalWeight: number } => {
    const today = debugDate ? new Date(debugDate) : new Date();
    const todayStr = today.toISOString().split('T')[0];
    const items: HonorItem[] = [];
    let totalWeight = 0;

    // 1. Process Tasks
    tasks.forEach((t: any) => {
        if (!t.isArchived) {
            const d = t.deadline || t.scheduledTime;
            // Matches today
            if (d && d.startsWith(todayStr)) {
                const weight = WEIGHTS[t.difficulty as Difficulty] || 1;
                items.push({
                    id: t.id,
                    title: t.title,
                    type: 'task',
                    difficulty: t.difficulty,
                    weight,
                    percentage: 0, // Will calc later
                    isCompleted: t.isCompleted
                });
                totalWeight += weight;
            }
        }
    });

    // 2. Process Habits
    habits.forEach((h: any) => {
        // Use engine to check if active today (ignore already completed ones for calc? No, completed ones still carried weight)
        if (checkHabitActive(h, today.toISOString())) {
             const weight = WEIGHTS[h.difficulty as Difficulty] || 1;
             items.push({
                id: h.id,
                title: h.title,
                type: 'habit',
                difficulty: h.difficulty,
                weight,
                percentage: 0,
                isCompleted: h.status === 'completed'
            });
            totalWeight += weight;
        }
    });

    // 3. Process Raids
    raids.forEach((r: any) => {
        if (r.status === 'active') {
            r.steps.forEach((s: any) => {
                const d = s.scheduledTime || s.scheduledDate;
                if (d && d.startsWith(todayStr)) {
                     const weight = WEIGHTS[r.difficulty as Difficulty] || 3;
                     items.push({
                        id: s.id,
                        title: `${r.title}: ${s.title}`,
                        type: 'raid',
                        difficulty: r.difficulty,
                        weight,
                        percentage: 0,
                        isCompleted: s.isCompleted
                    });
                    totalWeight += weight;
                }
            });
        }
    });

    // 4. Calculate Percentages
    const finalItems = items.map(item => ({
        ...item,
        percentage: totalWeight > 0 ? Math.round((item.weight / totalWeight) * 100) : 0
    }));

    // Sort by Weight Descending (Heaviest first)
    finalItems.sort((a, b) => b.weight - a.weight);

    return { items: finalItems, totalWeight };
};

/**
 * 🧮 CALCULATE TOTAL DAILY LOAD (Legacy Wrapper)
 * Retained for backward compatibility with existing calls.
 */
export const calculateDailyHonorPenalty = (itemDifficulty: Difficulty): number => {
    try {
        const tasks = JSON.parse(localStorage.getItem('LIFE_OS_TASKS_DATA') || '[]');
        const habits = JSON.parse(localStorage.getItem('LIFE_OS_HABITS_DATA') || '[]');
        const raids = JSON.parse(localStorage.getItem('LIFE_OS_RAIDS_DATA') || '[]');

        const { totalWeight } = getDailyHonorBreakdown(tasks, habits, raids);
        
        const itemWeight = WEIGHTS[itemDifficulty] || 1;
        const totalLoad = Math.max(itemWeight, totalWeight); 
        
        return Math.round((itemWeight / totalLoad) * 100);

    } catch (e) {
        console.error("Honor Calc Failed:", e);
        return 5; 
    }
};

const getMaterialData = (percentage: number): { material: HonorMaterial, icon: string, tier: BadgeTier } => {
    if (percentage >= 99) return { material: 'Crimson', icon: '👹', tier: 'crimson' };
    if (percentage >= 90) return { material: 'Diamond', icon: '💠', tier: 'diamond' };
    if (percentage >= 80) return { material: 'Gold', icon: '👑', tier: 'gold' };
    if (percentage >= 70) return { material: 'Silver', icon: '🥈', tier: 'silver' };
    if (percentage >= 60) return { material: 'Iron', icon: '🛡️', tier: 'silver' }; // Iron uses Silver styling
    if (percentage >= 40) return { material: 'Copper', icon: '🥉', tier: 'silver' }; // Copper uses Silver styling
    return { material: 'Wood', icon: '🪵', tier: 'silver' }; // Wood uses Silver styling
};

/**
 * Calculates the Rolling Monthly Average.
 * Formula: Sum(Daily Scores) / Days Passed in Month
 */
export const calculateMonthlyAverage = (dailyLog: Record<string, number>, debugDate: string | null = null): number => {
    const now = debugDate ? new Date(debugDate) : new Date();
    const currentMonthPrefix = now.toISOString().slice(0, 7); // "YYYY-MM"
    
    // Filter entries for current month
    const scores = Object.entries(dailyLog)
        .filter(([date]) => date.startsWith(currentMonthPrefix))
        .map(([, score]) => score);

    // If today is day 1 and no logs yet, return 100
    if (scores.length === 0) return 100;

    const sum = scores.reduce((a, b) => a + b, 0);
    return Math.round(sum / scores.length);
};

/**
 * 🛡️ REDEMPTION MECHANIC
 * Finds the lowest score in the current month and resets it to 100.
 * Returns the updated dailyLog and the new average.
 */
export const redeemLowestScore = (dailyLog: Record<string, number>, debugDate: string | null = null): { updatedLog: Record<string, number>, newAverage: number, redeemedDate: string | null } => {
    const now = debugDate ? new Date(debugDate) : new Date();
    const currentMonthPrefix = now.toISOString().slice(0, 7); // "YYYY-MM"

    // Find entries for current month
    const monthEntries = Object.entries(dailyLog)
        .filter(([date]) => date.startsWith(currentMonthPrefix));

    if (monthEntries.length === 0) return { updatedLog: dailyLog, newAverage: 100, redeemedDate: null };

    // Find the worst day
    // Sort by score ascending
    monthEntries.sort((a, b) => a[1] - b[1]);
    
    const worstDay = monthEntries[0];
    
    // If worst day is already 100, nothing to redeem
    if (worstDay[1] >= 100) return { updatedLog: dailyLog, newAverage: 100, redeemedDate: null };

    // Update log
    const updatedLog = { ...dailyLog };
    updatedLog[worstDay[0]] = 100; // Reset to perfect score

    // Recalculate Average
    const newAverage = calculateMonthlyAverage(updatedLog, debugDate);

    return { updatedLog, newAverage, redeemedDate: worstDay[0] };
};

/**
 * Generates a Unique Badge based on Month Performance with Material Grading
 */
export const generateMonthBadge = (percentage: number, monthName: string, year: number): BadgeDefinition => {
    const { material, icon, tier } = getMaterialData(percentage);
    const quote = HONOR_QUOTES[material];
    
    // Dynamic XP Reward based on percentage
    const xpReward = Math.floor(percentage * 15); // e.g. 100% = 1500 XP
    const goldReward = Math.floor(percentage * 10); // e.g. 100% = 1000 G

    return {
        id: `bdg_honor_${monthName.toLowerCase()}_${year}`,
        name: `${material} Honor: ${monthName} ${year}`,
        icon: icon,
        description: `Achieved ${percentage}% Integrity Score in ${monthName} ${year}. Rank: ${material}.`,
        category: 'consistency',
        triggerType: 'manual', // Manually awarded by midnight system
        levels: [
            { 
                tier: tier, 
                target: 1, 
                quote: quote, 
                rewards: { xp: xpReward, gold: goldReward } 
            }
        ]
    };
};
