
import React from 'react';
import { Shield, FlaskConical, Coffee, Palette, ShoppingBag, Utensils, Gamepad, Info } from 'lucide-react';
import { StoreItem } from '../../types/shopTypes';

interface StoreItemCardProps {
  item: StoreItem;
  canAfford: boolean;
  onBuy: (id: string) => void;
  onInfo: (item: StoreItem) => void; // 👈 NEW PROP
}

const ItemIcon = ({ icon, size = 24 }: { icon: string; size?: number }) => {
  // ... (Keep existing switch case)
  switch (icon) {
    case 'Shield': return <Shield size={size} />;
    case 'Flask': return <FlaskConical size={size} />;
    case 'Coffee': return <Coffee size={size} />;
    case 'Palette': return <Palette size={size} />;
    case 'Burger': return <Utensils size={size} />;
    case 'Game': return <Gamepad size={size} />;
    default: return <ShoppingBag size={size} />;
  }
};

const StoreItemCard: React.FC<StoreItemCardProps> = ({ item, canAfford, onBuy, onInfo }) => {
  return (
    <div 
        onClick={() => onInfo(item)}
        className={`
        relative flex flex-col p-4 rounded-xl border bg-life-paper transition-all duration-300 group cursor-pointer
        ${canAfford 
            ? 'border-zinc-800 hover:border-life-gold/50 shadow-lg hover:shadow-life-gold/5' 
            : 'border-zinc-800 opacity-60'}
    `}>
      
      {/* 🟢 HEADER */}
      <div className="flex justify-between items-start mb-3">
        <div className={`p-3 rounded-lg border bg-life-black transition-colors ${canAfford ? 'border-life-gold/20 text-life-gold' : 'border-zinc-800 text-life-muted'}`}>
            <ItemIcon icon={item.icon} size={24} />
        </div>
        
        {/* Cost Tag */}
        <div className={`px-2 py-1 rounded text-xs font-mono font-bold border ${canAfford ? 'bg-life-gold/10 text-life-gold border-life-gold/20' : 'bg-life-muted/10 text-life-muted border-zinc-800'}`}>
            {item.cost} G
        </div>
      </div>

      {/* 🟢 CONTENT */}
      <h3 className="font-bold text-life-text mb-1 truncate">{item.title}</h3>
      <p className="text-xs text-life-muted leading-relaxed mb-4 flex-1 line-clamp-2">
        {item.description}
      </p>

      {/* 🟢 ACTION BUTTON */}
      <button
        onClick={(e) => {
            e.stopPropagation();
            if (canAfford) onBuy(item.id);
        }}
        disabled={!canAfford}
        className={`
            w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-95
            ${canAfford 
                ? 'bg-life-gold text-life-black hover:bg-yellow-400 shadow-[0_0_10px_rgba(251,191,36,0.2)]' 
                : 'bg-life-muted/10 text-life-muted cursor-not-allowed'}
        `}
      >
        {canAfford ? 'Buy' : 'Locked'}
      </button>

      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden pointer-events-none">
         <div className={`absolute top-0 right-0 w-4 h-4 -mr-2 -mt-2 rotate-45 transform ${canAfford ? 'bg-life-gold' : 'bg-life-muted'}`} />
      </div>
    </div>
  );
};

export default StoreItemCard;
