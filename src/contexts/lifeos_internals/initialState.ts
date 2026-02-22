
import { LifeOSState, Difficulty, Stat, DailyMode } from '../../types/types';
import { DAILY_TARGETS } from '../../types/constants';
import { DEFAULT_THEMES } from '../../data/themeData';

export const INITIAL_STATE: LifeOSState = {
  user: {
    name: "Shadow Walker",
    title: "Initiate",
    level: 1,
    currentXP: 0, 
    targetXP: 1000,
    gold: 450,
    honor: 100, // 👈 Starts at 100%
    honorDailyLog: {}, // 👈 Empty log
    streak: 0, 
    shields: 1,
    inventory: [],
    equippedItems: [], 
    
    hasOnboarded: false, 

    purchaseHistory: [], 
    badges: [], 
    badgeTiers: {}, 
    badgeHistory: {}, 
    featuredBadges: [],
    
    // 🆕 HEARTBEAT INIT
    dailyXP: 0,
    dailyTarget: DAILY_TARGETS[DailyMode.NORMAL], 
    currentMode: DailyMode.NORMAL,
    pendingMode: DailyMode.NORMAL, 
    lastProcessedDate: new Date().toISOString(), 
    consecutiveShields: 0,
    streakHistory: {}, 

    metrics: { 
        totalTasksCompleted: 0,
        tasksByDifficulty: { [Difficulty.EASY]: 0, [Difficulty.NORMAL]: 0, [Difficulty.HARD]: 0 },
        totalRaidsWon: 0,
        raidsByDifficulty: { [Difficulty.EASY]: 0, [Difficulty.NORMAL]: 0, [Difficulty.HARD]: 0 },
        totalGoldEarned: 450, 
        totalXPEarned: 0, 
        highestStreak: 0,
        habitsFixed: 0,
        shieldsUsed: 0,
        resetsCount: 0
    },
    // 🎨 Use Imported Themes
    unlockedThemes: DEFAULT_THEMES,
    stats: {
      [Stat.DIS]: 1,
      [Stat.STR]: 1,
      [Stat.INT]: 1,
      [Stat.PCE]: 1,
      [Stat.EMT]: 1,
      [Stat.CAM]: 1,
      [Stat.CRT]: 1, // Creativity Added
    },
    lastOnline: new Date().toISOString(), 
    preferences: {
        soundEnabled: true,
        deviceNotificationsEnabled: false, 
        theme: 'standard',
        showHighlights: true, 
        showCampaignUI: true,
        unlockAllWeeks: false,
        showCalendarSync: true, 
        statsViewMode: 'radar',
        enableRefiner: true, 
        copyIncludesHistory: true, // 👈 NEW: Default Copy Everything
        dayStartHour: 4, // 👈 NEW: Default Day Starts at 04:00 AM
        // 🔑 API KEY INIT (The Neural Cortex)
        apiKeys: {
            discussion: '',
            tasks: '',
            habits: '',
            raids: '',
            themes: '',
            monitoring: '',
            refiner: '' 
        }
    }
  },
  badgesRegistry: [],
  ui: {
    currentView: 'tasks',
    activeModal: 'none',
    modalQueue: [], 
    toasts: [],
    systemLogs: [], 
    debugDate: null,
    focusSession: null,
    habitsViewMode: 'list',
    tasksViewMode: 'missions'
  }
};
