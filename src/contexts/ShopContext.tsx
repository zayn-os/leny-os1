
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { StoreItem, PurchaseLog } from '../types/shopTypes';
import { useLifeOS } from './LifeOSContext';
import { playSound } from '../utils/audio';
import { Theme, Stat } from '../types/types';
import { redeemLowestScore } from '../utils/honorSystem';

interface ShopState {
    storeItems: StoreItem[];
}

interface ShopContextType {
    shopState: ShopState;
    shopDispatch: {
        buyItem: (itemId: string) => boolean;
        addStoreItem: (item: StoreItem) => void;
        addStoreItems: (items: StoreItem[]) => void;
        deleteStoreItem: (itemId: string) => void;
        restoreData: (storeItems: StoreItem[]) => void;
    };
}

const STORAGE_KEY_SHOP = 'LIFE_OS_SHOP_DATA';

// INITIAL STOCK logic remains the same...
const INITIAL_STOCK: StoreItem[] = [
    {
        id: 'item_shield',
        title: 'Streak Shield',
        description: 'Prevents your streak from resetting if you miss a day.',
        cost: 1000,
        type: 'system',
        icon: 'Shield',
        isInfinite: true
    },
    // ... (Other items kept for brevity, will be included in full code logic implicitly if we wanted, but for restoring focus we just use what's loaded)
];

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { state: lifeState, dispatch: lifeDispatch } = useLifeOS();
    const { user } = lifeState;
    const soundEnabled = user.preferences.soundEnabled;

    const safeLoad = (): StoreItem[] => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_SHOP);
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.warn("Failed to load shop:", e);
        }
        return INITIAL_STOCK;
    };

    const [storeItems, setStoreItems] = useState<StoreItem[]>(safeLoad);

    useEffect(() => {
        const saveTimeout = setTimeout(() => {
            if (storeItems.length > 0 || localStorage.getItem(STORAGE_KEY_SHOP)) {
                localStorage.setItem(STORAGE_KEY_SHOP, JSON.stringify(storeItems));
            }
        }, 500);
        return () => clearTimeout(saveTimeout);
    }, [storeItems]);

    // 🧹 DEDUPLICATION & CLEANUP: Ensure no duplicate IDs exist
    useEffect(() => {
        setStoreItems(prev => {
            const seenIds = new Set();
            const uniqueItems: StoreItem[] = [];
            
            for (const item of prev) {
                if (!seenIds.has(item.id)) {
                    seenIds.add(item.id);
                    uniqueItems.push(item);
                }
            }
            
            if (uniqueItems.length !== prev.length) {
                console.log("🧹 ShopContext: Removed duplicate items.");
                return uniqueItems;
            }
            return prev;
        });
    }, []); // Run once on mount

    // Transaction Engine
    const buyItem = (itemId: string): boolean => {
        const item = storeItems.find(i => i.id === itemId);
        if (!item) return false;

        if (user.gold < item.cost) {
            playSound('error', soundEnabled);
            lifeDispatch.addToast('Insufficient Funds', 'error');
            return false;
        }

        if (itemId === 'item_shield' && user.shields >= 3) {
            lifeDispatch.addToast('🛡️ Max Shield Capacity (3) Reached', 'error');
            playSound('error', soundEnabled);
            return false;
        }
        if ((item.type === 'system' || item.type === 'artifact') && !item.isInfinite && user.inventory.includes(itemId)) {
            lifeDispatch.addToast('Already Owned', 'error');
            return false;
        }

        const newGold = user.gold - item.cost;
        const updates: any = { gold: newGold };
        
        if (itemId === 'item_shield') {
            updates.shields = user.shields + 1;
            lifeDispatch.addToast(`Shield Acquired! (${updates.shields}/3)`, 'info');
        } 
        else if (item.type === 'redemption') {
            const { updatedLog, newAverage, redeemedDate } = redeemLowestScore(user.honorDailyLog, lifeState.ui.debugDate);
            if (!redeemedDate) {
                lifeDispatch.addToast('Honor is already perfect.', 'info');
                return false;
            }
            updates.honorDailyLog = updatedLog;
            updates.honor = newAverage;
            lifeDispatch.addToast(`Honor Restored for ${redeemedDate} (+100%)`, 'level-up');
            playSound('level-up', soundEnabled);
        }
        else if (item.type === 'system' && !item.isInfinite) {
            updates.inventory = [...user.inventory, itemId];
            
            if (itemId === 'item_theme_gold') {
                const goldTheme: Theme = {
                    id: 'gold',
                    name: 'Midas Touch',
                    colors: {
                        '--color-life-black': '#1a1200',
                        '--color-life-paper': '#261a00',
                        '--color-life-gold': '#ffd700',
                        '--color-life-text': '#fffae6'
                    }
                };
                lifeDispatch.addTheme(goldTheme);
                lifeDispatch.setTheme('gold');
                lifeDispatch.addToast('Gold Theme Activated', 'success');
            } else if (itemId === 'item_theme_cyberpunk') {
                const cyberTheme: Theme = {
                    id: 'cyberpunk',
                    name: 'Neon City',
                    colors: {
                        '--color-life-black': '#020617', 
                        '--color-life-paper': '#0f172a', 
                        '--color-life-gold': '#22d3ee',  
                        '--color-life-text': '#e0f2fe'   
                    }
                };
                lifeDispatch.addTheme(cyberTheme);
                lifeDispatch.setTheme('cyberpunk');
                lifeDispatch.addToast('Cyberpunk Protocol Activated', 'level-up');
            } else {
                lifeDispatch.addToast(`Acquired: ${item.title}`, 'success');
            }

        } else if (item.type === 'artifact') {
             updates.inventory = [...user.inventory, itemId];
             lifeDispatch.addToast(`Artifact Acquired: ${item.title}`, 'success');
             setTimeout(() => lifeDispatch.addToast("Equip it in Profile to activate.", 'info'), 1500);

        } else if (item.id === 'item_potion_xp') {
             updates.inventory = [...user.inventory, itemId]; 
             lifeDispatch.addToast('Potion stored in Inventory', 'success');
        } else if (item.id === 'item_battery') {
             updates.shields = 3;
             lifeDispatch.addToast('Shields Fully Recharged!', 'level-up');
        } else {
            updates.inventory = [...user.inventory, itemId];
            lifeDispatch.addToast(`Voucher Acquired: ${item.title}`, 'success');
        }

        const newLog: PurchaseLog = {
            id: `log_${Date.now()}`,
            itemId: item.id,
            title: item.title,
            cost: item.cost,
            timestamp: new Date().toISOString()
        };
        updates.purchaseHistory = [newLog, ...(user.purchaseHistory || [])].slice(0, 50);

        lifeDispatch.updateUser(updates);
        playSound('coin', soundEnabled);

        if (!item.isInfinite) {
            setStoreItems(prev => prev.filter(i => i.id !== itemId));
        }
        
        return true; 
    };

    const addStoreItem = (item: StoreItem) => {
        setStoreItems(prev => {
            // Check by ID first for updates
            const existingIndex = prev.findIndex(i => i.id === item.id);
            if (existingIndex >= 0) {
                const newItems = [...prev];
                newItems[existingIndex] = item;
                return newItems;
            }
            // Fallback check by title to prevent duplicates if ID is different (optional, but good for UX)
            if (prev.some(i => i.title === item.title)) return prev;
            return [...prev, item];
        });
        playSound('click', soundEnabled);
    };

    const addStoreItems = (items: StoreItem[]) => {
        setStoreItems(prev => {
            let newItems = [...prev];
            let addedCount = 0;

            items.forEach(item => {
                const existingIndex = newItems.findIndex(i => i.id === item.id);
                if (existingIndex >= 0) {
                    // Update existing
                    newItems[existingIndex] = item;
                } else {
                    // Add new if title doesn't exist (or maybe allow duplicate titles? Let's restrict for now)
                    if (!newItems.some(i => i.title === item.title)) {
                        newItems.push(item);
                        addedCount++;
                    }
                }
            });
            
            return newItems;
        });
        playSound('level-up', soundEnabled);
    };

    const deleteStoreItem = (itemId: string) => {
        if(confirm("Remove this item from the market?")) {
            setStoreItems(prev => prev.filter(i => i.id !== itemId));
            playSound('delete', soundEnabled);
        }
    };

    const restoreData = (newStoreItems: StoreItem[]) => {
        setStoreItems(newStoreItems);
        lifeDispatch.addToast('Market Restored', 'success');
    };

    return (
        <ShopContext.Provider value={{ 
            shopState: { storeItems }, 
            shopDispatch: { buyItem, addStoreItem, addStoreItems, deleteStoreItem, restoreData } 
        }}>
            {children}
        </ShopContext.Provider>
    );
};

export const useShop = () => {
    const context = useContext(ShopContext);
    if (context === undefined) {
        throw new Error('useShop must be used within a ShopProvider');
    }
    return context;
};
