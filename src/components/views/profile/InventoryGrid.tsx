
import React from 'react';
import { Package } from 'lucide-react';
import { StoreItem } from '../../../types/shopTypes';
import { ItemIcon } from './ItemIcon';

interface InventoryGridProps {
    items: StoreItem[];
    onSelectItem: (item: StoreItem) => void;
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({ items, onSelectItem }) => {
    // Group items by ID
    const groupedItems = items.reduce((acc, item) => {
        if (!acc[item.id]) {
            acc[item.id] = { ...item, count: 0 };
        }
        acc[item.id].count += 1;
        return acc;
    }, {} as Record<string, StoreItem & { count: number }>);

    const displayItems: (StoreItem & { count: number })[] = Object.values(groupedItems);

    return (
        <div className="mb-8">
            <h3 className="text-xs font-bold text-life-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                <Package size={14} /> Inventory ({items.length})
            </h3>
            {displayItems.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                    {displayItems.map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => onSelectItem(item)}
                            className="aspect-square bg-life-paper rounded-xl border border-zinc-800 flex flex-col items-center justify-center gap-1 hover:border-life-gold/50 hover:bg-life-muted/5 transition-all relative"
                        >
                            {item.count > 1 && (
                                <span className="absolute top-1 right-1 bg-life-gold text-life-black text-[9px] font-black px-1.5 rounded-full shadow-sm">
                                    x{item.count}
                                </span>
                            )}
                            <div className="text-life-gold"><ItemIcon icon={item.icon} size={20} /></div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="text-center py-6 border border-dashed border-zinc-800 rounded-xl">
                    <p className="text-[10px] text-life-muted">Inventory Empty</p>
                </div>
            )}
        </div>
    );
};
