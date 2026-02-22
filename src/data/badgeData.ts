
import { BadgeDefinition } from '../types/badgeTypes';
import { Difficulty, Stat } from '../types/types';

// 🩸 THE CRIMSON LEGACY DATABASE
// // The Constitution of Glory

export const BADGE_DATABASE: BadgeDefinition[] = [
    // 1. PROGRESSION ------------------------------------------------
    {
        id: 'bdg_ascendant',
        name: 'The Ascendant',
        icon: '👑',
        description: 'Rise through the ranks of existence.',
        category: 'progression',
        triggerType: 'metric',
        metricKey: 'level', // Reads UserProfile.level
        levels: [
            { tier: 'silver', target: 5, quote: "You have awakened.", rewards: { xp: 100, gold: 50 } },
            { tier: 'gold', target: 10, quote: "Power is not given, it is taken.", rewards: { xp: 500, gold: 200 } },
            { tier: 'diamond', target: 25, quote: "You are no longer a spectator.", rewards: { xp: 2000, gold: 1000 } },
            { tier: 'crimson', target: 50, quote: "Godhood is a lonely path.", rewards: { xp: 10000, gold: 5000 } },
        ]
    },

    // 2. COMBAT (TASKS) ---------------------------------------------
    {
        id: 'bdg_grunt',
        name: 'The Grunt',
        icon: '🪖',
        description: 'Complete missions of Easy difficulty.',
        category: 'combat',
        triggerType: 'metric',
        metricKey: `tasksByDifficulty.${Difficulty.EASY}`,
        levels: [
            { tier: 'silver', target: 10, quote: "Do the work. Don't complain.", rewards: { xp: 50, gold: 20 } },
            { tier: 'gold', target: 50, quote: "Discipline is the bridge between goals and accomplishment.", rewards: { xp: 200, gold: 100 } },
            { tier: 'diamond', target: 200, quote: "Routine is the weapon of the disciplined.", rewards: { xp: 1000, gold: 500 } },
            { tier: 'crimson', target: 500, quote: "The mundane has become your masterpiece.", rewards: { xp: 5000, gold: 2000 } },
        ]
    },
    {
        id: 'bdg_warlord',
        name: 'The Warlord',
        icon: '⚔️',
        description: 'Complete missions of Hard difficulty.',
        category: 'combat',
        triggerType: 'metric',
        metricKey: `tasksByDifficulty.${Difficulty.HARD}`,
        levels: [
            { tier: 'silver', target: 5, quote: "Pain is weakness leaving the body.", rewards: { xp: 200, gold: 100 } },
            { tier: 'gold', target: 25, quote: "Hardship is the forge of character.", rewards: { xp: 1000, gold: 500 } },
            { tier: 'diamond', target: 100, quote: "You do not survive the storm. You are the storm.", rewards: { xp: 5000, gold: 2000 } },
            { tier: 'crimson', target: 250, quote: "Impossible is just an opinion.", rewards: { xp: 20000, gold: 10000 } },
        ]
    },

    // 3. WARFARE (RAIDS) --------------------------------------------
    {
        id: 'bdg_conqueror',
        name: 'The Conqueror',
        icon: '🏴‍☠️',
        description: 'Total Operations (Raids) Conquered.',
        category: 'warfare',
        triggerType: 'metric',
        metricKey: 'totalRaidsWon',
        levels: [
            { tier: 'silver', target: 1, quote: "First blood.", rewards: { xp: 150, gold: 100 } },
            { tier: 'gold', target: 5, quote: "Strategy requires sacrifice.", rewards: { xp: 750, gold: 500 } },
            { tier: 'diamond', target: 20, quote: "Kings play chess on a map of the world.", rewards: { xp: 3000, gold: 2000 } },
            { tier: 'crimson', target: 50, quote: "History is written by the victors.", rewards: { xp: 15000, gold: 10000 } },
        ]
    },

    // 4. CONSISTENCY ------------------------------------------------
    {
        id: 'bdg_immortal',
        name: 'The Immortal',
        icon: '🔥',
        description: 'Maintain a daily login streak.',
        category: 'consistency',
        triggerType: 'metric',
        metricKey: 'highestStreak', // Reads user.streak or metric.highestStreak
        levels: [
            { tier: 'silver', target: 7, quote: "Momentum is building.", rewards: { xp: 100, gold: 50 } },
            { tier: 'gold', target: 30, quote: "Consistency is the only currency that matters.", rewards: { xp: 500, gold: 250 } },
            { tier: 'diamond', target: 90, quote: "You have transcended motivation.", rewards: { xp: 2000, gold: 1000 } },
            { tier: 'crimson', target: 365, quote: "Time bows to your will.", rewards: { xp: 10000, gold: 5000 } },
        ]
    },
    {
        id: 'bdg_phoenix',
        name: 'The Phoenix',
        icon: '🦅',
        description: 'Reset the system and start over.',
        category: 'consistency',
        triggerType: 'metric',
        metricKey: 'resetsCount',
        levels: [
            { tier: 'silver', target: 1, quote: "From the ashes, we rise.", rewards: { xp: 0, gold: 500 } }, // Compensation
            { tier: 'gold', target: 3, quote: "Failure is not the end.", rewards: { xp: 0, gold: 1000 } },
            { tier: 'diamond', target: 5, quote: "Destruction is a form of creation.", rewards: { xp: 0, gold: 3000 } },
            { tier: 'crimson', target: 10, quote: "You are eternal.", rewards: { xp: 0, gold: 10000 } },
        ]
    },

    // 5. HABIT SPECIFIC (SPECIAL) -----------------------------------
    {
        id: 'bdg_deep_focus',
        name: 'Deep Worker',
        icon: '🧠',
        description: 'Maintain a streak on any "Deep Work" habit.',
        category: 'special',
        triggerType: 'habit',
        metricKey: 'Deep Work', // Searches for habit with "Deep Work" in title
        levels: [
            { tier: 'silver', target: 7, quote: "Focus is the new oil.", rewards: { xp: 300, gold: 150 } },
            { tier: 'gold', target: 21, quote: "Distraction is the enemy of greatness.", rewards: { xp: 1000, gold: 500 } },
            { tier: 'diamond', target: 66, quote: "The mind is a laser.", rewards: { xp: 5000, gold: 2500 } },
            { tier: 'crimson', target: 100, quote: "Flow state is your home.", rewards: { xp: 20000, gold: 10000 } },
        ]
    },

    // 6. ECONOMY ----------------------------------------------------
    {
        id: 'bdg_gold_hoarder',
        name: 'Gold Hoarder',
        icon: '💰',
        description: 'Total lifetime gold earned.',
        category: 'economy',
        triggerType: 'metric',
        metricKey: 'totalGoldEarned',
        levels: [
            { tier: 'silver', target: 1000, quote: "The first coin is the heaviest.", rewards: { xp: 100, gold: 100 } },
            { tier: 'gold', target: 10000, quote: "Wealth is a tool, not a master.", rewards: { xp: 500, gold: 500 } },
            { tier: 'diamond', target: 100000, quote: "You can buy armies.", rewards: { xp: 2000, gold: 2000 } },
            { tier: 'crimson', target: 1000000, quote: "Midas touches you.", rewards: { xp: 10000, gold: 10000 } },
        ]
    },

    // 7. STATS MASTERY ----------------------------------------------
    {
        id: 'bdg_stoic',
        name: 'The Stoic',
        icon: '⚡',
        description: 'Reach high Discipline (DIS).',
        category: 'mastery',
        triggerType: 'stat',
        metricKey: Stat.DIS,
        levels: [
            { tier: 'silver', target: 10, quote: "Control your mind.", rewards: { xp: 200, gold: 100 } },
            { tier: 'gold', target: 25, quote: "Emotion is a choice.", rewards: { xp: 1000, gold: 500 } },
            { tier: 'diamond', target: 50, quote: "Stone does not bleed.", rewards: { xp: 5000, gold: 2000 } },
            { tier: 'crimson', target: 100, quote: "You are the mountain.", rewards: { xp: 20000, gold: 10000 } },
        ]
    },
    {
        id: 'bdg_titan',
        name: 'The Titan',
        icon: '💪',
        description: 'Reach high Strength (STR).',
        category: 'mastery',
        triggerType: 'stat',
        metricKey: Stat.STR,
        levels: [
            { tier: 'silver', target: 10, quote: "Lift the weight.", rewards: { xp: 200, gold: 100 } },
            { tier: 'gold', target: 25, quote: "The body obeys the will.", rewards: { xp: 1000, gold: 500 } },
            { tier: 'diamond', target: 50, quote: "Force of nature.", rewards: { xp: 5000, gold: 2000 } },
            { tier: 'crimson', target: 100, quote: "Atlas shrugs.", rewards: { xp: 20000, gold: 10000 } },
        ]
    }
];
