

import { Habit } from '../types/habitTypes'; // 👈 Updated Import

// 🧬 THE HABIT ENGINE: GOLDEN RATIO LOGIC

export interface LevelData {
    level: number;
    phase: string;
    phaseColor: string;
    nextCheckpoint: number;
    prevCheckpoint: number;
    progress: number; // 0 to 100
    isMaxLevel: boolean;
}

// The Fibonacci Checkpoints
export const LEVELS = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610];

export const getHabitLevel = (streak: number): LevelData => {
    // 1. Find Current Level Index
    let levelIndex = LEVELS.findIndex(l => l > streak) - 1;
    
    // Handle cases beyond the chart or at 0
    if (streak === 0) levelIndex = -1;
    if (streak >= 610) levelIndex = LEVELS.length - 1;
    
    // Safety fallback
    if (levelIndex < -1) levelIndex = LEVELS.length - 1; 

    const currentLevel = levelIndex + 1; // 1-based level
    
    // 2. Determine Phase
    let phase = "Initiate";
    let phaseColor = "text-gray-500 border-gray-500/20"; // Default Foundation
    
    if (currentLevel <= 7) {
        phase = "Foundation";
        phaseColor = "text-gray-400 border-gray-500/30";
    } else if (currentLevel <= 10) {
        phase = "Solid State";
        phaseColor = "text-life-silver border-life-silver/50";
    } else if (currentLevel <= 12) {
        phase = "Mastery";
        phaseColor = "text-life-gold border-life-gold";
    } else if (currentLevel === 13) {
        phase = "Legendary";
        phaseColor = "text-life-diamond border-life-diamond shadow-[0_0_10px_rgba(96,165,250,0.5)]";
    } else {
        phase = "The Godfather";
        phaseColor = "text-life-crimson border-life-crimson shadow-[0_0_15px_rgba(220,38,38,0.6)]";
    }

    // 3. Calculate Progress to Next Checkpoint
    const prevCheckpoint = levelIndex >= 0 ? LEVELS[levelIndex] : 0;
    const nextCheckpoint = levelIndex + 1 < LEVELS.length ? LEVELS[levelIndex + 1] : 610;
    const isMaxLevel = streak >= 610;

    let progress = 0;
    if (isMaxLevel) {
        progress = 100;
    } else {
        const totalGap = nextCheckpoint - prevCheckpoint;
        const currentProgress = streak - prevCheckpoint;
        progress = Math.min(100, Math.max(0, (currentProgress / totalGap) * 100));
    }

    return {
        level: currentLevel,
        phase,
        phaseColor,
        nextCheckpoint,
        prevCheckpoint,
        progress,
        isMaxLevel
    };
};

// 📉 THE FALL ALGORITHM
// Calculates where the streak should land if broken.
export const calculateFall = (currentStreak: number): number => {
    if (currentStreak <= 1) return 0;

    // Find the current checkpoint bucket
    // e.g. streak 12. LEVELS.findIndex(>12) is index 5 (13). index-1 = 4 (value 8).
    let nextIndex = LEVELS.findIndex(l => l > currentStreak);
    if (nextIndex === -1) nextIndex = LEVELS.length; 
    
    const checkpointIndex = nextIndex - 1;
    const currentCheckpoint = LEVELS[checkpointIndex] || 0;

    // Rule 1: Safe Fall
    // If you are climbing between checkpoints (e.g. 12, checkpoint is 8), you fall to the checkpoint (8).
    if (currentStreak > currentCheckpoint) {
        return currentCheckpoint;
    }

    // Rule 2: Hard Fall
    // If you are AT the checkpoint (e.g. 8), you slip to the previous checkpoint (5).
    return LEVELS[checkpointIndex - 1] || 0;
};

// 🗓️ HABIT ACTIVATION LOGIC
export const checkHabitActive = (habit: Habit, dateStr?: string): boolean => {
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    const createdAt = new Date(habit.createdAt || new Date().toISOString());
    
    targetDate.setHours(0, 0, 0, 0);
    createdAt.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - createdAt.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return true; 

    switch (habit.type) {
        case 'daily':
            return true;
        case 'specific_days':
            if (!habit.specificDays || habit.specificDays.length === 0) return true;
            return habit.specificDays.includes(targetDate.getDay());
        case 'interval':
            const interval = habit.intervalValue || 1;
            return diffDays % interval === 0;
        case 'custom':
            if (!habit.pattern || habit.pattern.length === 0) return true;
            const index = diffDays % habit.pattern.length;
            return habit.pattern[index] === '1';
        default:
            return true;
    }
};
