
import React from 'react';
import { useLifeOS } from '../../contexts/LifeOSContext';
import { Crown, Sparkles, TrendingUp, Check } from 'lucide-react';

const LevelUpModal: React.FC = () => {
  const { state, dispatch } = useLifeOS();
  const { user } = state;

  const handleClose = () => {
    dispatch.setModal('none');
  };

  return (
    <div 
        onClick={handleClose} // 👈 Close on background click
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-500"
    >
      
      <div 
        onClick={(e) => e.stopPropagation()} // 👈 Stop click propagation
        className="relative w-full max-w-sm flex flex-col items-center animate-in zoom-in-50 slide-in-from-bottom-10 duration-700"
      >
        
        {/* 🟢 GLOW EFFECT */}
        <div className="absolute inset-0 bg-life-gold/20 blur-[100px] rounded-full animate-pulse-slow pointer-events-none" />

        {/* 🟢 ICON */}
        <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-life-gold border-4 border-life-black shadow-[0_0_50px_rgba(251,191,36,0.6)] flex items-center justify-center animate-bounce">
                <Crown size={48} className="text-life-black" strokeWidth={2.5} />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center animate-spin">
                <Sparkles size={16} className="text-life-gold" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-life-crimson rounded-full flex items-center justify-center animate-pulse">
                <TrendingUp size={16} className="text-white" />
            </div>
        </div>

        {/* 🟢 TEXT CONTENT */}
        <h2 className="text-5xl font-black text-white tracking-tighter italic mb-2 drop-shadow-lg">
            LEVEL UP!
        </h2>
        <div className="text-2xl font-mono font-bold text-life-gold mb-8 tracking-widest border px-4 py-1 rounded border-life-gold/50 bg-life-gold/10">
            LEVEL {user.level}
        </div>

        {/* 🟢 REWARDS CARD */}
        <div className="w-full bg-life-paper/80 border border-life-gold/30 rounded-xl p-6 mb-8 shadow-2xl backdrop-blur-md">
            <h3 className="text-xs text-life-muted uppercase font-bold tracking-widest mb-4 text-center">
                Rewards Acquired
            </h3>
            
            <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-life-muted/20">
                    <span className="text-sm font-bold text-life-gold">Gold Currency</span>
                    <span className="text-sm font-mono text-white">+100 G</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-life-muted/20">
                    <span className="text-sm font-bold text-life-diamond">Shield Max Capacity</span>
                    <span className="text-sm font-mono text-white">REFILLED</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-life-muted/20">
                    <span className="text-sm font-bold text-life-easy">XP Threshold</span>
                    <span className="text-sm font-mono text-white">INCREASED</span>
                </div>
            </div>
        </div>

        {/* 🟢 ACTION BUTTON */}
        <button 
            onClick={handleClose}
            className="w-full py-4 bg-life-gold hover:bg-yellow-400 text-life-black font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
            <Check size={20} strokeWidth={3} />
            Evolve & Continue
        </button>

      </div>
    </div>
  );
};

export default LevelUpModal;
