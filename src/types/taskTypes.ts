
import { Difficulty, Stat, Reminder } from './types';

// 🏛️ MODULE 01: TASK ENTITIES

export type EnergyLevel = 'low' | 'medium' | 'high';

export interface Subtask {
    id: string;
    title: string;
    isCompleted: boolean;
}

export interface TaskCategory {
    id: string;
    title: string;
    isCollapsed: boolean;
}

// ⚖️ THE LAW ENTITY
export interface Law {
    id: string;
    title: string;
    penaltyType: 'gold' | 'xp' | 'stat' | 'honor'; // 👈 Added Honor
    penaltyValue: number;
    statTarget?: Stat; // Only used if penaltyType is 'stat'
    timesBroken: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  difficulty: Difficulty;
  stat: Stat;
  skillId?: string; 
  isCompleted: boolean;
  
  // 🆕 Step 2: Tactical Granularity
  subtasks: Subtask[]; 
  energyLevel: EnergyLevel;

  // Organization
  categoryId?: string; 
  isArchived?: boolean; 

  // Timer Logic
  isTimed: boolean;
  durationMinutes?: number;
  
  deadline?: string; // This acts as the visual deadline
  
  // ⏰ SCHEDULING & REMINDERS (Updated)
  scheduledTime?: string; // ISO Date Time
  reminders?: Reminder[]; // 👈 Multiple reminders support

  // 🆕 G12 MARKER
  isCampaign?: boolean; // True if part of 12 Week Year
  
  // 🗓️ CALENDAR C30 MARKER (New)
  isCalendarEvent?: boolean; // True if created via Calendar
}
