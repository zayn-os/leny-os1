
import { Stat } from './types';

// 🏛️ MODULE 07: SKILL ENTITIES

export type SkillRank = 'Novice' | 'Adept' | 'Expert' | 'Master' | 'Grandmaster';

export interface Skill {
  id: string;
  title: string;
  description?: string;
  relatedStats: Stat[]; // 👈 Updated to Array for Hybrid Skills (e.g. Boxing = STR + DIS)
  icon?: string; 
  
  // Progress Data
  level: number;
  currentXP: number;
  targetXP: number;
  rank: SkillRank;
  
  // The Rust Mechanic 🍂
  lastPracticed: string; // ISO Date
  isRusty: boolean;

  // Meta
  createdAt: string;
}
