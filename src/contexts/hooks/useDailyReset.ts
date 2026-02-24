import { useEffect } from 'react';
import { LifeOSState } from '../../types/types';
import { calculateMidnightUpdates } from '../lifeos_internals/midnightStrategy';

export const useDailyReset = (state: LifeOSState, setState: React.Dispatch<React.SetStateAction<LifeOSState>>) => {
    useEffect(() => {
        const checkDailyReset = () => {
            const now = state.ui.debugDate ? new Date(state.ui.debugDate) : new Date();
            const lastProcessed = new Date(state.user.lastProcessedDate);
            
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
    }, [state.ui.debugDate, state.user.lastProcessedDate, state.user.preferences.dayStartHour, setState]);
};