
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Coins, Shield, Plus, X, History, Box, Gift, Zap, Info } from 'lucide-react';
import { useLifeOS } from '../../contexts/LifeOSContext';
import { useShop } from '../../contexts/ShopContext';
import StoreItemCard from '../cards/StoreItemCard'; 
import { StoreItem } from '../../types/shopTypes';
import { ItemIcon } from './profile/ItemIcon';

// ✨ PARTICLE EFFECT COMPONENT
const Particle: React.FC<{ x: number, y: number }> = ({ x, y }) => {
    const style = {
        left: x,
        top: y,
        '--tx': `${(Math.random() - 0.5) * 200}px`,
        '--ty': `${(Math.random() - 1) * 200}px`,
        '--rot': `${Math.random() * 360}deg`,
        backgroundColor: ['#fbbf24', '#fcd34d', '#ffffff', '#10b981'][Math.floor(Math.random() * 4)]
    } as React.CSSProperties;

    return <div className="absolute w-2 h-2 rounded-full animate-explode pointer-events-none z-50" style={style} />;
};

const ShopView: React.FC = () => {
  const { state } = useLifeOS();
  const { shopState, shopDispatch } = useShop(); 
  const { storeItems } = shopState;
  const { user } = state;

  const [isAdding, setIsAdding] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCost, setNewItemCost] = useState(100);
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  
  // 💥 Visual Effects State
  const [particles, setParticles] = useState<{id: number, x: number, y: number}[]>([]);

  // 🧬 Filter Logic
  const systemItems = storeItems.filter(i => i.type === 'system');
  const artifactItems = storeItems.filter(i => i.type === 'artifact');
  const redemptionItems = storeItems.filter(i => i.type === 'redemption');
  const customItems = storeItems.filter(i => i.type === 'custom');

  const handleBuy = (id: string, e: { clientX: number, clientY: number }) => {
      const success = shopDispatch.buyItem(id);
      
      if (success) {
          // Trigger Particles at click location
          const newParticles = Array.from({ length: 12 }).map((_, i) => ({
              id: Date.now() + i,
              x: e.clientX,
              y: e.clientY
          }));
          setParticles(prev => [...prev, ...newParticles]);
      }
  };

  // Cleanup particles
  useEffect(() => {
      if (particles.length > 0) {
          const timer = setTimeout(() => setParticles([]), 1000);
          return () => clearTimeout(timer);
      }
  }, [particles]);

  const handleAddItem = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newItemTitle.trim()) return;
      if (newItemCost < 0) return; 
      
      const newItem: StoreItem = {
          id: `cust_${Date.now()}`,
          title: newItemTitle,
          description: 'Custom User Reward',
          cost: Math.max(0, newItemCost), 
          type: 'custom',
          icon: 'Gift',
          isInfinite: true
      };
      
      shopDispatch.addStoreItem(newItem);
      setNewItemTitle('');
      setIsAdding(false);
  };

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* 💥 PARTICLES LAYER */}
      {particles.map(p => (
          <div key={p.id} className="fixed w-2 h-2 rounded-full animate-[particle_0.8s_ease-out_forwards] pointer-events-none z-[100]" 
               style={{ 
                   left: p.x, 
                   top: p.y,
                   backgroundColor: ['#fbbf24', '#ffffff', '#10b981'][Math.floor(Math.random() * 3)],
                   boxShadow: '0 0 10px currentColor',
                   '--tx': `${(Math.random() - 0.5) * 200}px` as any,
                   '--ty': `${(Math.random() - 1) * 200}px` as any,
               } as React.CSSProperties} 
          />
      ))}

      {/* 🟢 HEADER & WALLET */}
      <div className="flex items-end justify-between mb-6 px-1">
        <div>
          <h2 className="text-2xl font-black text-life-text tracking-tight flex items-center gap-2">
            THE BAZAAR
          </h2>
          <p className="text-xs text-life-muted uppercase tracking-widest mt-1">
            Exchange Gold for Power & Pleasure
          </p>
        </div>
        <div className="flex items-center gap-2 text-life-gold bg-life-gold/5 px-3 py-1.5 rounded-lg border border-life-gold/20 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
            <Coins size={16} className="text-life-gold" />
            <span className="font-mono font-bold text-lg">{user.gold}</span>
        </div>
      </div>

      {/* 📦 SECTION 1: SYSTEM ARTIFACTS */}
      <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 text-life-muted px-1">
              <Box size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">System Upgrades</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {systemItems.map(item => (
                <div key={item.id} onClick={(e) => { }}>
                    <StoreItemCard 
                        item={item}
                        canAfford={user.gold >= item.cost}
                        onBuy={(id) => {
                            const dummyEvent = { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 };
                            handleBuy(id, dummyEvent);
                        }}
                        onInfo={(item) => setSelectedItem(item)}
                    />
                </div>
            ))}
          </div>
      </div>

      {/* ⚔️ SECTION 2: RARE ARTIFACTS */}
      {artifactItems.length > 0 && (
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 text-life-muted px-1">
                <Shield size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Rare Artifacts</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {artifactItems.map(item => (
                    <div key={item.id}>
                        <StoreItemCard 
                            item={item}
                            canAfford={user.gold >= item.cost}
                            onBuy={(id) => {
                                const dummyEvent = { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 };
                                handleBuy(id, dummyEvent);
                            }}
                            onInfo={(item) => setSelectedItem(item)}
                        />
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* 🎁 SECTION 3: REAL WORLD REWARDS (Redemption + Custom) */}
      <div className="mb-8">
          <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2 text-life-muted">
                  <Gift size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Real World Rewards</span>
              </div>
              <button 
                onClick={() => setIsAdding(!isAdding)}
                className="text-[10px] flex items-center gap-1 text-life-gold hover:text-white uppercase font-bold"
              >
                  <Plus size={12} /> Add Custom
              </button>
          </div>

          {/* Add Form */}
          {isAdding && (
              <form onSubmit={handleAddItem} className="mb-4 bg-life-black border border-zinc-800 p-3 rounded-lg flex gap-2 animate-in fade-in">
                  <input 
                    type="text" 
                    placeholder="Reward Name..." 
                    value={newItemTitle}
                    onChange={e => setNewItemTitle(e.target.value)}
                    className="flex-1 bg-transparent border-b border-zinc-800 text-xs text-white focus:outline-none focus:border-life-gold px-2"
                    autoFocus
                  />
                  <input 
                    type="number" 
                    placeholder="Cost" 
                    value={newItemCost}
                    min={0}
                    onChange={e => setNewItemCost(Number(e.target.value))}
                    className="w-16 bg-transparent border-b border-zinc-800 text-xs text-white focus:outline-none focus:border-life-gold text-center"
                  />
                  <button type="submit" className="text-life-gold"><Plus size={16} /></button>
              </form>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Redemption Items (Injected) */}
            {redemptionItems.map(item => (
                <div key={item.id} className="relative group">
                    <StoreItemCard 
                        item={item}
                        canAfford={user.gold >= item.cost}
                        onBuy={(id) => {
                             const dummyEvent = { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 };
                             handleBuy(id, dummyEvent);
                        }}
                        onInfo={(item) => setSelectedItem(item)}
                    />
                    <button 
                        onClick={() => shopDispatch.deleteStoreItem(item.id)}
                        className="absolute -top-2 -right-2 bg-life-black border border-life-hard/30 text-life-hard p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X size={12} />
                    </button>
                </div>
            ))}
            
            {/* Custom Items (User Added) */}
            {customItems.map(item => (
                <div key={item.id} className="relative group">
                    <StoreItemCard 
                        item={item}
                        canAfford={user.gold >= item.cost}
                        onBuy={(id) => {
                             const dummyEvent = { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 };
                             handleBuy(id, dummyEvent);
                        }}
                        onInfo={(item) => setSelectedItem(item)}
                    />
                    <button 
                        onClick={() => shopDispatch.deleteStoreItem(item.id)}
                        className="absolute -top-2 -right-2 bg-life-black border border-life-hard/30 text-life-hard p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X size={12} />
                    </button>
                </div>
            ))}
            
            {customItems.length === 0 && redemptionItems.length === 0 && (
                <div className="col-span-2 py-8 text-center border-2 border-dashed border-zinc-800 rounded-xl">
                    <p className="text-[10px] text-life-muted">No custom rewards defined.</p>
                </div>
            )}
          </div>
      </div>
      
      {/* 📜 SECTION 3: TRANSACTION LOG (Modified to show + and -) */}
      <div className="mt-8 pt-8 border-t border-zinc-800">
         <div className="flex items-center gap-2 mb-4 text-life-muted px-1 opacity-60">
              <History size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Transaction Log (Last 100)</span>
         </div>
         
         <div className="space-y-1 opacity-70">
             {user.purchaseHistory.map(log => {
                 const isXP = log.title.includes('[XP]');
                 const isAdd = log.cost < 0; // Negative cost = Gained
                 const absCost = Math.abs(log.cost);
                 const sign = isAdd ? '+' : '-';
                 
                 let colorClass = 'text-life-gold';
                 if (isXP) colorClass = 'text-life-easy'; // XP is Green/Easy
                 else if (isAdd) colorClass = 'text-green-400'; // Gold gain is Green
                 else colorClass = 'text-red-400'; // Gold spend is Red/Gold default

                 const currencyLabel = isXP ? 'XP' : 'G';

                 return (
                     <div key={log.id} className="flex justify-between items-center p-2 rounded bg-life-black border border-life-muted/10 text-[10px]">
                         <span className="text-life-text font-medium truncate flex-1 pr-2">{log.title.replace('[XP] ', '')}</span>
                         <div className="flex items-center gap-2">
                             <span className={`${colorClass} font-mono font-bold`}>{sign}{absCost} {currencyLabel}</span>
                             <span className="text-life-muted opacity-50 text-[9px]">{new Date(log.timestamp).toLocaleDateString()}</span>
                         </div>
                     </div>
                 );
             })}
             {user.purchaseHistory.length === 0 && (
                 <p className="text-[10px] text-life-muted italic text-center">No transaction data.</p>
             )}
         </div>
      </div>

      {/* 🟢 ITEM DETAILS MODAL */}
      {selectedItem && (
          <div 
            onClick={() => setSelectedItem(null)} 
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          >
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="bg-life-paper w-full max-w-xs rounded-xl border border-zinc-800 p-5 shadow-2xl relative"
              >
                  <button onClick={() => setSelectedItem(null)} className="absolute top-3 right-3 text-life-muted hover:text-life-text"><X size={20} /></button>
                  <div className="flex flex-col items-center text-center mb-6">
                      <div className="w-20 h-20 rounded-full bg-life-black border border-zinc-800 flex items-center justify-center mb-3 text-life-gold shadow-inner">
                          <ItemIcon icon={selectedItem.icon} size={40} />
                      </div>
                      <h3 className="font-black uppercase tracking-widest text-life-text">{selectedItem.title}</h3>
                      <div className="mt-2 flex items-center gap-2 justify-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-life-muted/10 text-life-muted border border-zinc-800">{selectedItem.type}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-life-gold/10 text-life-gold border border-life-gold/20">{selectedItem.cost} G</span>
                      </div>
                      <p className="text-xs text-life-muted mt-4 leading-relaxed">{selectedItem.description}</p>
                      
                      {selectedItem.effect && (
                          <div className="mt-4 w-full bg-life-black/50 p-3 rounded border border-zinc-800 text-left">
                              <h4 className="text-[9px] font-bold uppercase text-life-muted mb-1 flex items-center gap-1"><Zap size={10} /> Effect</h4>
                              <p className="text-[10px] text-life-text font-mono">
                                  {selectedItem.effect.type === 'xp_boost' && `+${selectedItem.effect.value * 100}% XP Gain`}
                                  {selectedItem.effect.type === 'gold_boost' && `+${selectedItem.effect.value * 100}% Gold Gain`}
                                  {selectedItem.effect.stat && ` (${selectedItem.effect.stat})`}
                              </p>
                          </div>
                      )}
                  </div>
                  <button 
                    onClick={() => {
                        if (user.gold >= selectedItem.cost) {
                            const dummyEvent = { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 };
                            handleBuy(selectedItem.id, dummyEvent);
                            setSelectedItem(null);
                        }
                    }}
                    disabled={user.gold < selectedItem.cost}
                    className={`
                        w-full py-3 font-black uppercase text-xs rounded-xl shadow-lg transition-all active:scale-95
                        ${user.gold >= selectedItem.cost 
                            ? 'bg-life-gold text-life-black hover:bg-yellow-400 shadow-life-gold/20' 
                            : 'bg-life-muted/10 text-life-muted cursor-not-allowed'}
                    `}
                  >
                      {user.gold >= selectedItem.cost ? 'Purchase Item' : 'Insufficient Funds'}
                  </button>
              </div>
          </div>
      )}

      <style>{`
        @keyframes particle {
            0% { transform: translate(0, 0) scale(1); opacity: 1; }
            100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ShopView;
