
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Campaign } from '../types/campaignTypes';
import { useLifeOS } from './LifeOSContext';
import { playSound } from '../utils/audio';

interface CampaignState {
    campaign: Campaign;
}

interface CampaignContextType {
    campaignState: CampaignState;
    campaignDispatch: {
        initCampaign: (title: string, startDate: string) => void;
        toggleFreeze: () => void;
        resetCampaign: () => void;
        completeCampaign: () => void; 
        updateStartDate: (newDate: string) => void;
        restoreData: (newCampaign: Campaign) => void;
    };
}

const STORAGE_KEY_CAMPAIGN = 'LIFE_OS_CAMPAIGN_DATA_V2';

const DEFAULT_CAMPAIGN: Campaign = {
    id: 'campaign_root',
    title: '',
    startDate: null,
    isFrozen: false,
    currentWeek: 0,
    currentDay: 0,
    totalWeeks: 12,
    isActive: false
};

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { state: lifeState, dispatch: lifeDispatch } = useLifeOS();
    const soundEnabled = lifeState.user.preferences.soundEnabled;

    // 🛡️ Safe Loader
    const safeLoad = (): Campaign => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_CAMPAIGN);
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.warn("Failed to load campaign persistence:", e);
        }
        return DEFAULT_CAMPAIGN;
    };

    const [campaign, setCampaign] = useState<Campaign>(safeLoad);

    useEffect(() => {
        if (!campaign.startDate || !campaign.isActive) return;

        const calculateTime = () => {
            if (campaign.isFrozen) return;

            const debugDate = lifeState.ui.debugDate;
            const now = debugDate ? new Date(debugDate) : new Date();
            const start = new Date(campaign.startDate!);
            
            const diffTime = now.getTime() - start.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                setCampaign(prev => ({ ...prev, currentWeek: 0, currentDay: 0 }));
            } else {
                const week = Math.floor(diffDays / 7) + 1;
                const day = (diffDays % 7) + 1;
                const cappedWeek = Math.min(week, 13);
                
                setCampaign(prev => {
                    if (prev.currentWeek !== cappedWeek || prev.currentDay !== day) {
                        return { ...prev, currentWeek: cappedWeek, currentDay: day };
                    }
                    return prev;
                });
            }
        };

        calculateTime();
        const interval = setInterval(calculateTime, 60000); 
        return () => clearInterval(interval);
    }, [campaign.startDate, campaign.isActive, campaign.isFrozen, lifeState.ui.debugDate]);

    useEffect(() => {
        const saveTimeout = setTimeout(() => {
            // Always save if active, or if key exists to allow "reset" state to persist
            if (campaign.isActive || localStorage.getItem(STORAGE_KEY_CAMPAIGN)) {
                localStorage.setItem(STORAGE_KEY_CAMPAIGN, JSON.stringify(campaign));
            }
        }, 500);
        return () => clearTimeout(saveTimeout);
    }, [campaign]);

    // Actions
    const initCampaign = (title: string, startDate: string) => {
        const newCampaign: Campaign = {
            ...DEFAULT_CAMPAIGN,
            id: `cmp_${Date.now()}`,
            title,
            startDate,
            isActive: true,
        };
        playSound('success', soundEnabled);
        setCampaign(newCampaign);
        lifeDispatch.addToast('Operation Tempo Initiated', 'success');
    };

    const toggleFreeze = () => {
        const newState = !campaign.isFrozen;
        setCampaign(prev => ({ ...prev, isFrozen: newState }));
        playSound('click', soundEnabled);
        lifeDispatch.addToast(newState ? 'Timeline Frozen ❄️' : 'Timeline Resumed ▶️', 'info');
    };

    const resetCampaign = () => {
        setCampaign(DEFAULT_CAMPAIGN);
        playSound('delete', soundEnabled);
        lifeDispatch.addToast('Campaign Aborted', 'info');
    };

    const completeCampaign = () => {
        if (confirm("🌾 REAP THE HARVEST?\nThis will conclude the current 12-week cycle and archive the results. Are you ready for the reset?")) {
            setCampaign(DEFAULT_CAMPAIGN);
            playSound('level-up', soundEnabled);
            lifeDispatch.addToast('Harvest Complete. Cycle Reset.', 'success');
        }
    };

    const updateStartDate = (newDate: string) => {
        setCampaign(prev => ({ ...prev, startDate: newDate }));
        playSound('click', soundEnabled);
        lifeDispatch.addToast('Timeline Shifted', 'info');
    };

    const restoreData = (newCampaign: Campaign) => {
        setCampaign(newCampaign);
        lifeDispatch.addToast('Campaign Restored', 'success');
    };

    return (
        <CampaignContext.Provider value={{ 
            campaignState: { campaign }, 
            campaignDispatch: { initCampaign, toggleFreeze, resetCampaign, completeCampaign, updateStartDate, restoreData } 
        }}>
            {children}
        </CampaignContext.Provider>
    );
};

export const useCampaign = () => {
    const context = useContext(CampaignContext);
    if (context === undefined) {
        throw new Error('useCampaign must be used within a CampaignProvider');
    }
    return context;
};
