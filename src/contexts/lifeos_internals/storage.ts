
import { LifeOSState, UserProfile, Theme } from '../../types/types';
import { INITIAL_STATE } from './initialState';
import { DEFAULT_THEMES } from '../../data/themeData';

export const STORAGE_KEY = 'LIFE_OS_V1_DATA';
export const BACKUP_KEY = 'LIFE_OS_V1_DATA_AUTO_BACKUP';

export const loadState = (): LifeOSState => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      
      if (saved) {
        // 🛡️ SAFETY 1: Create an in-memory backup of raw string before parsing attempts
        // This ensures if logic below fails, we don't lose the raw string on next save
        localStorage.setItem(BACKUP_KEY, saved);

        const parsed = JSON.parse(saved); 
        
        // 🛡️ DEEP MERGE STRATEGY
        // This ensures new fields added in updates are merged with old data
        const migratedUser: UserProfile = {
            ...INITIAL_STATE.user, 
            ...parsed.user,        
            
            metrics: { ...INITIAL_STATE.user.metrics, ...(parsed.user?.metrics || {}) },
            preferences: { ...INITIAL_STATE.user.preferences, ...(parsed.user?.preferences || {}) },
            stats: { ...INITIAL_STATE.user.stats, ...(parsed.user?.stats || {}) },
            
            inventory: parsed.user?.inventory || [],
            equippedItems: parsed.user?.equippedItems || [],
            badges: parsed.user?.badges || [],
            featuredBadges: parsed.user?.featuredBadges || [],
            
            // Ensure themes are merged correctly
            unlockedThemes: parsed.user?.unlockedThemes 
                ? [
                    ...parsed.user.unlockedThemes, 
                    ...DEFAULT_THEMES.filter(t => !parsed.user.unlockedThemes.some((pt: Theme) => pt.id === t.id))
                  ]
                : DEFAULT_THEMES,

            lastOnline: parsed.user?.lastOnline || new Date().toISOString(),
            hasOnboarded: parsed.user?.hasOnboarded ?? (parsed.user?.name !== "Shadow Walker")
        };

        return { 
            user: migratedUser,
            badgesRegistry: parsed.badgesRegistry || [],
            ui: { 
                ...INITIAL_STATE.ui, 
                ...parsed.ui, 
                currentView: parsed.ui?.currentView || 'tasks',
                debugDate: parsed.ui?.debugDate || null,
                habitsViewMode: parsed.ui?.habitsViewMode || 'list',
                modalQueue: [] 
            } 
        };
      }
    } catch (e) {
      console.error("CRITICAL: Failed to load persistence. Recovering...", e);
      // 🛡️ SAFETY 2: Attempt to recover from Backup if Main failed
      try {
          const backup = localStorage.getItem(BACKUP_KEY);
          if (backup) {
              console.warn("Restoring from Auto-Backup...");
              const parsedBackup = JSON.parse(backup);
              // Return merged backup
              return { ...INITIAL_STATE, ...parsedBackup, user: { ...INITIAL_STATE.user, ...parsedBackup.user } };
          }
      } catch (backupError) {
          console.error("Backup also corrupted.", backupError);
      }
    }
    return INITIAL_STATE;
};

export const saveState = (state: LifeOSState) => {
    try {
        // Prevent saving if state looks like a default reset (unless it's a fresh user)
        // This prevents overwriting data if loadState failed silently
        if (state.user.hasOnboarded === false && localStorage.getItem(STORAGE_KEY)) {
             const existing = localStorage.getItem(STORAGE_KEY);
             if (existing && existing.includes('"hasOnboarded":true')) {
                 console.warn("⚠️ Prevented overwriting initialized data with empty state.");
                 return;
             }
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { console.error("Save failed:", e); }
};
