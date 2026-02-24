
import React, { createContext, useContext, ReactNode } from 'react';
import { UserProfile, Stat, ViewState, Toast, ModalType, Theme, LifeOSState } from '../types/types';
import { StoreItem } from '../types/shopTypes';
import { BadgeDefinition } from '../types/badgeTypes';
import { INITIAL_STATE } from './lifeos_internals/initialState';
import { STORAGE_KEY } from './lifeos_internals/storage';
import { useNativeBack } from '../hooks/useNativeBack';
import { usePersistence } from '../hooks/usePersistence';
import { DEFAULT_THEMES } from '../data/themeData';
import { useThemeManager } from './hooks/useThemeManager';
import { useDailyReset } from './hooks/useDailyReset';
import { useLevelUp } from './hooks/useLevelUp';
import { useDispatch } from './hooks/useDispatch';

interface LifeOSContextType {
  state: LifeOSState;
  isDataLoaded: boolean;
  dispatch: {
    updateUser: (updates: Partial<UserProfile>) => void;
    setView: (view: ViewState) => void;
    setHabitsViewMode: (mode: 'list' | 'calendar') => void;
    setTasksViewMode: (mode: 'missions' | 'codex') => void;
    setModal: (modal: ModalType, data?: any) => void;
    useItem: (item: StoreItem) => void;
    addBadge: (badge: BadgeDefinition) => void;
    addTheme: (theme: Theme) => void;
    deleteTheme: (themeId: string) => void;
    awardBadge: (badgeId: string) => void;
    addToast: (message: string, type?: Toast['type']) => void;
    removeToast: (id: string) => void;
    resetSystem: () => void;
    toggleSound: () => void;
    togglePreference: (key: keyof UserProfile['preferences']) => void;
    setTheme: (themeId: string) => void;
    importData: (jsonData: string) => void;
    exportData: () => string;
    triggerDailyReset: () => void;
    setDebugDate: (date: string | null) => void;
    startFocusSession: (itemId: string, durationMinutes: number, type?: 'task' | 'habit') => void;
    endFocusSession: () => void;
    completeOnboarding: (name: string, title: string, focusStat: Stat) => void;
    toggleEquip: (itemId: string) => void;
    enableNotifications: () => Promise<boolean>;
    setCustomAudio: (file: File) => void;
    setDayStartHour: (hour: number) => void;
  };
}

const LifeOSContext = createContext<LifeOSContextType | undefined>(undefined);

const migrateLifeOSState = (parsed: any): LifeOSState => {
    const oldStats = parsed.user?.stats || {};
    const migratedStats = {
        [Stat.STR]: oldStats.STR || 1,
        [Stat.INT]: oldStats.INT || 1,
        [Stat.DIS]: oldStats.DIS || 1,
        [Stat.HEA]: oldStats.HEA || oldStats.EMT || 1,
        [Stat.CRT]: oldStats.CRT || 1,
        [Stat.SPR]: oldStats.SPR || oldStats.PCE || 1,
        [Stat.REL]: oldStats.REL || oldStats.CAM || 1,
        [Stat.FIN]: oldStats.FIN || 1,
    };

    const migratedUser: UserProfile = {
        ...INITIAL_STATE.user,
        ...parsed.user,
        metrics: { ...INITIAL_STATE.user.metrics, ...(parsed.user?.metrics || {}) },
        preferences: { ...INITIAL_STATE.user.preferences, ...(parsed.user?.preferences || {}) },
        stats: migratedStats,
        inventory: parsed.user?.inventory || [],
        equippedItems: parsed.user?.equippedItems || [],
        badges: parsed.user?.badges || [],
        featuredBadges: parsed.user?.featuredBadges || [],
        unlockedThemes: parsed.user?.unlockedThemes
            ? [
                ...parsed.user.unlockedThemes,
                ...DEFAULT_THEMES.filter((t: Theme) => !parsed.user.unlockedThemes.some((pt: Theme) => pt.id === t.id))
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
};

export const LifeOSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState, isLoading] = usePersistence<LifeOSState>(
      STORAGE_KEY, 
      INITIAL_STATE, 
      'lifeos_data', 
      migrateLifeOSState
  );

  useNativeBack(state, setState);
  useThemeManager(state);
  useDailyReset(state, setState);
  useLevelUp(state, setState);

  const dispatch = useDispatch(state, setState);

  return (
    <LifeOSContext.Provider value={{ state, isDataLoaded: !isLoading, dispatch }}>
      {children}
    </LifeOSContext.Provider>
  );
};

export const useLifeOS = () => { const context = useContext(LifeOSContext); if (!context) throw new Error('useLifeOS must be used within a LifeOSProvider'); return context; };
