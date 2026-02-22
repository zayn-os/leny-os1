
import { BadgeDefinition } from './badgeTypes';
import { PurchaseLog } from './shopTypes'; 

export type { PurchaseLog };

// 🏛️ MODULE 01 & 16: CORE ENTITIES & ECONOMY

export interface Reminder {
    id: string;
    minutesBefore: number; // e.g. 15, 60, 1440
    isSent: boolean;
}

export enum Difficulty {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard',
}

// 🆕 MODULE 15: THE HEARTBEAT (New Modes)
export enum DailyMode {
    EASY = 'easy',     // Recovery (300 XP)
    NORMAL = 'normal', // Standard (400 XP)
    HARD = 'hard',     // War Mode (500 XP)
}

export enum Stat {
  DIS = 'DIS', // Discipline
  STR = 'STR', // Strength
  INT = 'INT', // Intelligence
  PCE = 'PCE', // Peace
  EMT = 'EMT', // Emotion
  CAM = 'CAM', // Charisma
  CRT = 'CRT', // Creativity (New)
}

// 🎨 MODULE 20: THEME ENGINE
export interface Theme {
    id: string;
    name: string;
    // 🟢 UPDATED: Allow any string key for full CSS Variable injection
    colors: Record<string, string>; 
    customCss?: string; 
}

// 📊 MODULE 08: USER METRICS
export interface UserMetrics {
    totalTasksCompleted: number;
    tasksByDifficulty: { [key in Difficulty]: number };
    totalRaidsWon: number;
    raidsByDifficulty: { [key in Difficulty]: number };
    totalGoldEarned: number; 
    totalXPEarned: number;
    highestStreak: number;
    habitsFixed: number; 
    shieldsUsed: number;
    resetsCount: number; 
}

// 🏛️ MODULE 05: USER PROFILE
export interface UserProfile {
  name: string;
  title: string; 
  level: number;
  currentXP: number;
  targetXP: number;
  gold: number;
  
  // ⚖️ HONOR SYSTEM V2 (Average Calculation)
  honor: number; // The Calculated Monthly Average (0-100%)
  honorDailyLog: Record<string, number>; // Key: YYYY-MM-DD, Value: Score (Starts at 100)

  streak: number;
  shields: number;
  inventory: string[]; 
  
  equippedItems: string[]; // 👈 NEW: IDs of equipped artifacts (Max 3)

  hasOnboarded: boolean; 

  purchaseHistory: PurchaseLog[]; 

  // 🆕 THE HEARTBEAT VARIABLES (Streak System)
  dailyXP: number;          // XP earned TODAY only
  dailyTarget: number;      // The target needed to save streak today
  currentMode: DailyMode;   // Today's difficulty
  pendingMode: DailyMode;   // Tomorrow's difficulty (Crystal Ball Logic)
  lastProcessedDate: string; // ISO Date of the last "Guillotine" check
  consecutiveShields: number; // 🆕 Track consecutive shield usage (Max 3)
  
  // 🗓️ STREAK HISTORY (New)
  // Key: YYYY-MM-DD, Value: 'success' | 'shield' | 'fail' | 'frozen'
  streakHistory: Record<string, 'success' | 'shield' | 'fail' | 'frozen'>;

  // 🏅 BADGE SYSTEM INTEGRATION
  badges: string[]; 
  badgeTiers: Record<string, 'silver' | 'gold' | 'diamond' | 'crimson'>;
  badgeHistory: Record<string, Record<string, string>>; 
  featuredBadges: string[]; 

  metrics: UserMetrics; 

  // 🎨 THEME ENGINE
  unlockedThemes: Theme[]; 

  stats: Record<Stat, number>;
  lastOnline: string; 
  preferences: { 
    soundEnabled: boolean;
    deviceNotificationsEnabled: boolean; 
    theme: string; 
    // 👁️ VISUAL CORTEX CONTROLS
    showHighlights: boolean; // Show/Hide Spear Tip (Raids at top of tasks)
    showCampaignUI: boolean; // Show/Hide Campaign & Raid Tabs
    unlockAllWeeks: boolean;
    showCalendarSync: boolean; // 👈 NEW: Toggle Google Calendar Button
    statsViewMode: 'radar' | 'list'; // 👈 NEW: Persist Stats View Preference
    useSkillAsTitle?: boolean; // 👈 NEW: Use linked skill as main title
    linkedSkillId?: string; // 👈 NEW: ID of the skill to link
    enableRefiner?: boolean; 
    copyIncludesHistory?: boolean; // 👈 NEW: Control copying logs
    // 🌅 DAY BOUNDARY CONTROL
    dayStartHour: number; // 👈 NEW: Hour (0-23) when the day technically starts. Default 4.
    apiKeys?: {
        discussion?: string;
        tasks?: string;
        habits?: string;
        raids?: string;
        themes?: string;
        monitoring?: string;
        refiner?: string;
    };
  };
}

// 🏛️ MODULE 19: NAVIGATION STATE
export type ViewState = 'profile' | 'shop' | 'tasks' | 'habits' | 'raids' | 'campaign' | 'skills' | 'hall_of_fame' | 'oracle';

// 🔔 UI NOTIFICATIONS
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'level-up' | 'error' | 'info' | 'crit';
  timestamp?: string; 
}

export type ModalType = 
    | 'none' 
    | 'addTask' 
    | 'levelUp' 
    | 'badgeUnlock' 
    | 'streak' 
    | 'devConsole' 
    | 'itemDetails' 
    | 'resetConfirm' 
    | 'confirmation' 
    | 'loot' 
    | 'quickSubtask' 
    | 'dataExchange'
    | 'honorBreakdown'
    | 'questForge'
    | 'habitProtocol'
    | 'economyProtocol'
    | 'raidProtocol'
    | 'skillProtocol'
    | 'codexArbiter'
    | 'badgeProtocol'; // 👈 NEW: Badge Protocol Modal

export interface LootPayload {
    title: string;
    xp: number;
    gold: number;
    multiplier: number;
    message: string;
}

export interface FocusSessionData {
    itemId: string;
    itemType: 'task' | 'habit';
    startTime: string;
    durationMinutes: number;
    isActive: boolean;
}

export interface SystemLog {
    id: string;
    message: string;
    type: string;
    timestamp: string;
}

export interface CustomAudio {
    name: string;
    url: string;
}

export interface UIState {
    currentView: ViewState;
    activeModal: ModalType;
    modalData?: any;
    modalQueue: any[];
    toasts: Toast[];
    systemLogs: SystemLog[];
    debugDate: string | null;
    focusSession: FocusSessionData | null;
    habitsViewMode: 'list' | 'calendar';
    tasksViewMode: 'missions' | 'codex'; // 👈 NEW: Toggle for Tasks View
    customAudio?: CustomAudio;
}

export interface LifeOSState {
    user: UserProfile;
    badgesRegistry: BadgeDefinition[];
    ui: UIState;
}

// 💉 INJECTION PAYLOAD (For AI)
export interface InjectionPayload {
    meta: {
        packName?: string;
        author?: string;
    };
    tasks?: any[];
    habits?: any[];
    raids?: any[];
    skills?: any[];
    storeItems?: any[];
    badges?: any[];
    themes?: any[];
    laws?: any[]; // 👈 NEW: Support for Laws Injection
}
