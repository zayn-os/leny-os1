import { useEffect } from 'react';
import { LifeOSState } from '../../types/types';
import { playSound } from '../../utils/audio';

export const useLevelUp = (state: LifeOSState, setState: React.Dispatch<React.SetStateAction<LifeOSState>>) => {
    useEffect(() => {
        if (state.user.currentXP < state.user.targetXP) return;

        let userCopy = { ...state.user };
        let hasLeveledUp = false;
        const oldLevel = userCopy.level;

        while (userCopy.currentXP >= userCopy.targetXP) {
            hasLeveledUp = true;
            const remainingXP = userCopy.currentXP - userCopy.targetXP;
            const newLevel = userCopy.level + 1;
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
    }, [state.user.currentXP, state.user.targetXP, setState, state.user.preferences.soundEnabled]);
};