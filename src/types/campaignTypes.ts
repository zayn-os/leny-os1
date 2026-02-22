
// 🏛️ MODULE 11: CAMPAIGN ENTITIES (12-WEEK YEAR)

export interface Campaign {
  id: string;
  title: string;
  description?: string;
  
  // ⚓ Zero Point Protocol
  startDate: string | null; // ISO Date String (If null, campaign hasn't started)
  isFrozen: boolean;
  
  // Structure
  currentWeek: number; // Calculated live
  currentDay: number;  // Calculated live
  totalWeeks: number;  // Fixed at 12 + 1 (Harvest)
  
  // Meta
  isActive: boolean;
}
