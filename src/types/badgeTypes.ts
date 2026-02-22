
// 🏆 MODULE 08: THE HALL OF GLORY TYPES

export type BadgeTier = 'silver' | 'gold' | 'diamond' | 'crimson';

export type BadgeCategory = 
    | 'progression' // Levels, XP
    | 'combat'      // Tasks
    | 'warfare'     // Raids
    | 'consistency' // Streaks
    | 'resilience'  // Shields, Resets
    | 'economy'     // Gold
    | 'mastery'     // Stats
    | 'skill'       // Specific Skills
    | 'special';    // 👈 NEW: Habit/Raid Specifics

export interface BadgeLevelDefinition {
    tier: BadgeTier;
    target: number; // The threshold value
    quote: string; // The Godfather's Quote
    rewards: {
        xp: number;
        gold: number;
    };
}

export interface BadgeDefinition {
    id: string;
    name: string;
    icon: string; // Emoji or Lucide icon name
    description: string;
    category: BadgeCategory;
    
    // Logic Mapping
    // 🟢 Added 'raid' to trigger specific raid checks
    triggerType: 'stat' | 'metric' | 'manual' | 'skill' | 'habit' | 'raid'; 
    metricKey?: string; // e.g., 'totalTasksCompleted' or 'stats.STR' or 'Habit Title'
    
    levels: BadgeLevelDefinition[];
}

// User Progress Data (Derived)
export interface BadgeProgress {
    badge: BadgeDefinition;
    currentValue: number;
    isUnlocked: boolean;
    currentTier: BadgeTier | null;
    nextTier: BadgeLevelDefinition | null;
    history: Record<BadgeTier, string | null>; // Timestamps
}
