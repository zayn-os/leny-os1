
import { Difficulty, Stat, DailyMode, Theme, UserMetrics } from '../../types/types';

export interface OracleMeta {
    type: "ORACLE_CONTEXT_V2_FULL"; // Version bump
    generatedAt: string;
    instructions: string;
}

export interface OracleUserProfile {
    name: string;
    level: number;
    title: string;
    stats: Record<Stat, number>;
    gold: number;
    currentMode: DailyMode;
    // 🟢 NEW: Deep Metrics
    metrics: UserMetrics;
    activeBuffs: string[]; // Equipped artifacts
}

export interface OracleSkill {
    id: string;
    title: string;
    level: number;
    rank: string;
    relatedStats: Stat[];
    description?: string;
}

export interface OracleHabit {
    id: string;
    title: string;
    stat: Stat;
    difficulty: Difficulty;
    streak: number;
    
    // 🟢 NEW: Daily Repetitions support
    dailyTarget?: number;

    frequency: {
        type: string;
        specificDays?: number[];
        intervalValue?: number;
        matrixPattern?: string; 
    };

    subtasks?: string[];
    timing?: {
        isTimed: boolean;
        duration?: number;
        scheduledTime?: string;
    };

    skillName?: string;
    
    // 🟢 NEW: Historical Data (Last 30 entries) to detect failure patterns
    recentHistory: string[]; 
}

export interface OracleTask {
    title: string;
    difficulty: Difficulty;
    stat: Stat;
    skillName?: string;
    isCampaign: boolean;
    deadline?: string;
    scheduledTime?: string;
    subtasks?: string[];
}

// 🟢 Detailed Step for AI Context
export interface OracleRaidStep {
    title: string;
    notes?: string;
    subtasks?: string[]; // The AI needs to see this to learn it
}

export interface OracleRaid {
    title: string;
    difficulty: Difficulty;
    progress: number;
    status: string;
    stepsRemaining: number;
    steps: OracleRaidStep[]; // Changed from stepsOverview (string[])
}

export interface OracleCampaign {
    active: boolean;
    title: string;
    currentWeek: number;
    isFrozen: boolean;
}

// 🟢 NEW: Shop Item Structure for AI Advice
export interface OracleShopItem {
    title: string;
    cost: number;
    description: string;
    canAfford: boolean;
}

export interface OracleLaw {
    title: string;
    penaltyType: 'gold' | 'xp' | 'stat' | 'honor';
    penaltyValue: number;
    timesBroken: number;
}

export interface OracleBlueprint {
    meta: OracleMeta;
    user: OracleUserProfile;
    campaign: OracleCampaign;
    skills: OracleSkill[];
    habits: OracleHabit[];
    activeRaids: OracleRaid[];
    pendingMissions: OracleTask[];
    // 🟢 NEW: Shop Context
    shopCatalog: OracleShopItem[];
    inventory: string[];
    badges: string[];
    themes: Theme[]; 
    laws: OracleLaw[]; // 👈 NEW: Law Context
}
