
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserProfile, Stat, ViewState, Toast, ModalType, Theme, LifeOSState } from '../types/types';
import { StoreItem } from '../types/shopTypes';
import { BadgeDefinition } from '../types/badgeTypes';
import { playSound } from '../utils/audio';
import { requestNotificationPermission } from '../utils/notifications'; 
import { INITIAL_STATE } from './lifeos_internals/initialState';
import { STORAGE_KEY } from './lifeos_internals/storage'; // Import STORAGE_KEY
import { calculateMidnightUpdates } from './lifeos_internals/midnightStrategy';
import { useNativeBack } from '../hooks/useNativeBack'; 
import { usePersistence } from '../hooks/usePersistence'; // Import Hook
import { DEFAULT_THEMES } from '../data/themeData'; // Import Themes

interface LifeOSContextType {
  state: LifeOSState;
  isDataLoaded: boolean; // 👈 NEW
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

// 🔄 MIGRATION LOGIC
const migrateLifeOSState = (parsed: any): LifeOSState => {
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
  // 🟢 USE PERSISTENCE HOOK
  const [state, setState, isLoading] = usePersistence<LifeOSState>(
      STORAGE_KEY, 
      INITIAL_STATE, 
      'lifeos_data', 
      migrateLifeOSState
  );

  // 🔌 USE NATIVE BACK LOGIC HOOK
  useNativeBack(state, setState);

  // 🌈 THEME ENGINE
  useEffect(() => {
      const currentThemeId = state.user.preferences.theme;
      const themeData = state.user.unlockedThemes.find(t => t.id === currentThemeId) || state.user.unlockedThemes[0];
      const root = document.documentElement;
      if (themeData) Object.entries(themeData.colors).forEach(([k, v]) => root.style.setProperty(k, v as string));
      document.body.setAttribute('data-theme', currentThemeId);
      
      const styleId = 'theme-custom-structural-css';
      let styleTag = document.getElementById(styleId);
      if (themeData?.customCss) {
          if (!styleTag) { styleTag = document.createElement('style'); styleTag.id = styleId; document.head.appendChild(styleTag); }
          styleTag.innerHTML = themeData.customCss;
      } else if (styleTag) styleTag.innerHTML = '';
  }, [state.user.preferences.theme, state.user.unlockedThemes]);

  // 🪓 MIDNIGHT PROTOCOL (With Virtual Day Offset)
  useEffect(() => {
      const checkDailyReset = () => {
          const now = state.ui.debugDate ? new Date(state.ui.debugDate) : new Date();
          const lastProcessed = new Date(state.user.lastProcessedDate);
          
          // 🕰️ VIRTUAL TIME MACHINE
          const startHour = state.user.preferences.dayStartHour ?? 4;
          
          const getVirtualDate = (d: Date) => {
              const shifted = new Date(d);
              shifted.setHours(d.getHours() - startHour);
              return shifted;
          };

          const vNow = getVirtualDate(now);
          const vLast = getVirtualDate(lastProcessed);

          if (vNow.getDate() !== vLast.getDate() || vNow.getMonth() !== vLast.getMonth()) {
              const logId = `day_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              const timestamp = new Date().toISOString();

              setState(prev => {
                  const { newUser, toastMessage, toastType, newBadge } = calculateMidnightUpdates(prev.user, prev.ui.debugDate);
                  const midLog = { id: logId, message: toastMessage, type: toastType, timestamp };
                  
                  // 💉 INJECT GENERATED BADGE
                  let updatedRegistry = prev.badgesRegistry;
                  if (newBadge) {
                      updatedRegistry = [...prev.badgesRegistry, newBadge];
                      if (!newUser.badges.includes(newBadge.id)) {
                          newUser.badges.push(newBadge.id);
                          newUser.badgeTiers[newBadge.id] = 'gold'; 
                          if (!newUser.badgeHistory[newBadge.id]) newUser.badgeHistory[newBadge.id] = {};
                          newUser.badgeHistory[newBadge.id]['gold'] = new Date().toISOString();
                      }
                  }

                  return { 
                      ...prev, 
                      user: newUser, 
                      badgesRegistry: updatedRegistry,
                      ui: { ...prev.ui, toasts: [...prev.ui.toasts, midLog], systemLogs: [midLog, ...(prev.ui.systemLogs || [])].slice(0, 100) } 
                  };
              });
          } else {
              setState(prev => ({ ...prev, user: { ...prev.user, lastOnline: now.toISOString() } }));
          }
      };
      checkDailyReset();
      const interval = setInterval(checkDailyReset, 5000); 
      return () => clearInterval(interval);
  }, [state.ui.debugDate, state.user.lastProcessedDate, state.user.preferences.dayStartHour]);

  // REMOVED: saveState useEffect (handled by usePersistence)

  // ✨ LEVEL UP PROTOCOL
  useEffect(() => {
    if (state.user.currentXP < state.user.targetXP) return;

    let userCopy = { ...state.user };
    let hasLeveledUp = false;
    const oldLevel = userCopy.level;

    // Use a while loop in case of multiple level-ups from a large XP gain
    while (userCopy.currentXP >= userCopy.targetXP) {
      hasLeveledUp = true;
      const remainingXP = userCopy.currentXP - userCopy.targetXP;
      const newLevel = userCopy.level + 1;
      
      // 📈 PROGRESSIVE SCALING: New Target XP = Previous Target * 1.15 (rounded)
      const newTargetXP = Math.round(userCopy.targetXP * 1.15);

      userCopy = {
        ...userCopy,
        level: newLevel,
        currentXP: remainingXP,
        targetXP: newTargetXP,
      };
    }

    if (hasLeveledUp) {
      const finalUser = userCopy;
      setState(prev => ({
        ...prev,
        user: finalUser,
        ui: {
          ...prev.ui,
          activeModal: 'levelUp',
          modalData: { newLevel: finalUser.level, oldLevel: oldLevel }
        }
      }));
      playSound('level-up', state.user.preferences.soundEnabled);
    }
  }, [state.user.currentXP, state.user.targetXP]);

  const soundEnabled = state.user.preferences.soundEnabled;
  const updateUser = (updates: Partial<UserProfile>) => setState(prev => ({ ...prev, user: { ...prev.user, ...updates } }));
  const setView = (view: ViewState) => { if (view !== state.ui.currentView) { playSound('click', soundEnabled); window.history.pushState({ view }, '', ''); setState(prev => ({ ...prev, ui: { ...prev.ui, currentView: view } })); }};
  const setHabitsViewMode = (mode: 'list' | 'calendar') => { playSound('click', soundEnabled); setState(prev => ({ ...prev, ui: { ...prev.ui, habitsViewMode: mode } })); };
  const setTasksViewMode = (mode: 'missions' | 'codex') => { playSound('click', soundEnabled); setState(prev => ({ ...prev, ui: { ...prev.ui, tasksViewMode: mode } })); };
  const setModal = (modal: ModalType, data?: any) => { if (modal !== 'none') playSound('click', soundEnabled); setState(prev => ({ ...prev, ui: { ...prev.ui, activeModal: modal, modalData: data ?? null } })); };
  const addToast = (message: string, type: Toast['type'] = 'info') => { 
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; 
    setState(prev => ({ 
      ...prev, 
      ui: { 
        ...prev.ui, 
        toasts: [...prev.ui.toasts, { id, message, type, timestamp: new Date().toISOString() }], 
        systemLogs: [{ id, message, type: type as string, timestamp: new Date().toISOString() }, ...(prev.ui.systemLogs || [])].slice(0, 100) 
      } 
    })); 
    setTimeout(() => removeToast(id), 3000); 
  };
  const removeToast = (id: string) => setState(prev => ({ ...prev, ui: { ...prev.ui, toasts: prev.ui.toasts.filter(t => t.id !== id) } }));
  const startFocusSession = (itemId: string, durationMinutes: number, type: 'task' | 'habit' = 'task') => { playSound('click', soundEnabled); setState(prev => ({ ...prev, ui: { ...prev.ui, focusSession: { itemId, startTime: new Date().toISOString(), durationMinutes, isActive: true, itemType: type } } })); };
  const endFocusSession = () => setState(prev => ({ ...prev, ui: { ...prev.ui, focusSession: null } }));
  const toggleSound = () => updateUser({ preferences: { ...state.user.preferences, soundEnabled: !state.user.preferences.soundEnabled } });
  
  const togglePreference = (key: keyof UserProfile['preferences']) => {
      if (key === 'deviceNotificationsEnabled' && !state.user.preferences.deviceNotificationsEnabled) { enableNotifications(); return; }
      updateUser({ preferences: { ...state.user.preferences, [key]: !state.user.preferences[key] } });
      playSound('click', soundEnabled);
  };

  const setDayStartHour = (hour: number) => {
      updateUser({ preferences: { ...state.user.preferences, dayStartHour: hour } });
      addToast(`Day Start set to ${hour}:00`, 'info');
  };

  const enableNotifications = async (): Promise<boolean> => {
      const granted = await requestNotificationPermission();
      updateUser({ preferences: { ...state.user.preferences, deviceNotificationsEnabled: granted } });
      addToast(granted ? 'Notifications Enabled' : 'Permission Denied', granted ? 'success' : 'error');
      return granted;
  };

  const resetSystem = () => { localStorage.clear(); playSound('delete', soundEnabled); window.location.reload(); };
  const completeOnboarding = (name: string, title: string, focusStat: Stat) => updateUser({ name, title, hasOnboarded: true, stats: { ...state.user.stats, [focusStat]: state.user.stats[focusStat] + 2 } });
  
  const useItem = (item: StoreItem) => {
      let newInventory = [...state.user.inventory];
      
      // 🟢 LOGIC UPDATE: Always consume 'custom' and 'redemption' items
      const shouldConsume = item.type === 'custom' || item.type === 'redemption' || !item.isInfinite;

      if (shouldConsume) {
          const index = newInventory.indexOf(item.id);
          if (index > -1) newInventory.splice(index, 1);
      }

      if (item.id === 'item_potion_xp') { updateUser({ currentXP: state.user.currentXP + 500, inventory: newInventory }); playSound('level-up', soundEnabled); addToast('Potion Consumed: +500 XP', 'success'); }
      else { updateUser({ inventory: newInventory }); addToast(`${item.title} Used`, 'info'); }
  };

  const toggleEquip = (itemId: string) => {
      let newEquipped = [...state.user.equippedItems];
      if (newEquipped.includes(itemId)) { newEquipped = newEquipped.filter(id => id !== itemId); addToast('Artifact Unequipped', 'info'); }
      else { if (newEquipped.length >= 3) { addToast('Max 3 Artifacts', 'error'); return; } newEquipped.push(itemId); addToast('Artifact Equipped', 'success'); }
      updateUser({ equippedItems: newEquipped }); playSound('click', soundEnabled);
  };

  const addBadge = (badge: BadgeDefinition) => { if (state.badgesRegistry.some(b => b.id === badge.id)) return; setState(prev => ({ ...prev, badgesRegistry: [...prev.badgesRegistry, badge] })); };
  const awardBadge = (badgeId: string) => { if (!state.user.badges.includes(badgeId)) { updateUser({ badges: [...state.user.badges, badgeId] }); addToast('New Badge!', 'level-up'); playSound('level-up', soundEnabled); }};
  const addTheme = (theme: Theme) => { if (state.user.unlockedThemes.some(t => t.id === theme.id)) return; updateUser({ unlockedThemes: [...state.user.unlockedThemes, theme] }); };
  const deleteTheme = (themeId: string) => { if (state.user.preferences.theme === themeId) setTheme('standard'); updateUser({ unlockedThemes: state.user.unlockedThemes.filter(t => t.id !== themeId) }); addToast('Theme Deleted', 'info'); };
  const setTheme = (themeId: string) => { updateUser({ preferences: { ...state.user.preferences, theme: themeId } }); playSound('click', soundEnabled); };
  const importData = (jsonData: string) => { try { const data = JSON.parse(jsonData); if (!data.user) throw new Error(); setState(data); addToast('System Restored', 'success'); playSound('level-up', soundEnabled); } catch { addToast('Import Failed', 'error'); }};
  const exportData = () => JSON.stringify(state, null, 2);
  const triggerDailyReset = () => { 
      // 🟢 TRIGGER MIDNIGHT MANUALLY
      const { newUser, toastMessage, toastType, newBadge } = calculateMidnightUpdates(state.user, state.ui.debugDate); 
      
      let updatedRegistry = state.badgesRegistry;
      if (newBadge) {
          updatedRegistry = [...state.badgesRegistry, newBadge];
          if (!newUser.badges.includes(newBadge.id)) {
                newUser.badges.push(newBadge.id);
                newUser.badgeTiers[newBadge.id] = 'gold'; 
                if (!newUser.badgeHistory[newBadge.id]) newUser.badgeHistory[newBadge.id] = {};
                newUser.badgeHistory[newBadge.id]['gold'] = new Date().toISOString();
          }
      }

      setState(prev => ({ 
          ...prev, 
          user: newUser, 
          badgesRegistry: updatedRegistry
      }));
      addToast(toastMessage, toastType); 
      playSound('level-up', soundEnabled); 
  };
  const setDebugDate = (date: string | null) => setState(prev => ({ ...prev, ui: { ...prev.ui, debugDate: date } }));
  const setCustomAudio = (file: File) => { const url = URL.createObjectURL(file); setState(prev => ({ ...prev, ui: { ...prev.ui, customAudio: { name: file.name, url } } })); addToast(`Audio Loaded: ${file.name}`, 'success'); };

  return (
    <LifeOSContext.Provider value={{ state, isDataLoaded: !isLoading, dispatch: { updateUser, setView, setModal, addToast, removeToast, resetSystem, toggleSound, togglePreference, useItem, addBadge, awardBadge, addTheme, deleteTheme, setTheme, importData, exportData, triggerDailyReset, setDebugDate, startFocusSession, endFocusSession, completeOnboarding, setHabitsViewMode, setTasksViewMode, toggleEquip, enableNotifications, setCustomAudio, setDayStartHour } }}>
      {children}
    </LifeOSContext.Provider>
  );
};

export const useLifeOS = () => { const context = useContext(LifeOSContext); if (!context) throw new Error('useLifeOS must be used within a LifeOSProvider'); return context; };
