
import { Stat } from './types';

// 🛒 MODULE 12: THE BAZAAR TYPES

export interface ItemEffect {
    type: 'xp_boost' | 'gold_boost';
    value: number; // e.g. 0.1 for +10%
    stat?: Stat; // If null, applies to global XP. If set, applies to specific stat XP.
}

export interface StoreItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  icon: string; // Identifier for icon component
  type: 'system' | 'custom' | 'artifact' | 'redemption'; // 👈 NEW: Redemption Type
  isInfinite: boolean; // True = Always available, False = One-time buy (disappears)
  effect?: ItemEffect; // 👈 NEW: Passive Bonus
}

export interface PurchaseLog {
    id: string;
    itemId: string;
    title: string;
    cost: number;
    timestamp: string;
}
