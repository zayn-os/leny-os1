
import React from 'react';
import { useLifeOS } from '../../contexts/LifeOSContext';
import { Sparkles, X, Zap } from 'lucide-react';
import { LootPayload } from '../../types/types';
const LootModal: React.FC = () => {
    const { state, dispatch } = useLifeOS();
    const { modalData } = state.ui;

    if (!modalData) return null;
    const { title, xp, gold, multiplier, message } = modalData as LootPayload;

    const handleClose = () => {
        dispatch.setModal('none');
    };

    return (
        <div 
            onClick={handleClose} 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
        >
            <div 
                onClick={(e) => e.stopPropagation()} 
                className="relative w-full max-w-sm flex flex-col items-center text-center animate-in zoom-in-50 slide-in-from-bottom-12 duration-500"
            >
                {/* 🎇 CRIT GLOW */}
                <div className="absolute inset-0 bg-life-gold/30 blur-[80px] rounded-full animate-pulse-slow pointer-events-none" />
                <div className="absolute inset-0 bg-life-diamond/20 blur-[120px] rounded-full animate-pulse pointer-events-none" />

                {/* 💥 ICON */}
                <div className="relative mb-6">
                    <div className="w-28 h-28 rounded-full bg-life-gold border-4 border-life-black shadow-[0_0_50px_rgba(251,191,36,0.8)] flex items-center justify-center animate-[bounce_1s_infinite]">
                        <Zap size={56} className="text-life-black fill-life-black" />
                    </div>
                    {/* Floating Sparkles */}
                    <Sparkles className="absolute -top-4 -right-4 text-life-diamond animate-spin-slow w-10 h-10" />
                    <Sparkles className="absolute bottom-0 -left-4 text-life-easy animate-pulse w-8 h-8" />
                </div>

                {/* 📜 TEXT */}
                <div className="space-y-2 mb-8 relative z-10">
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-life-gold animate-pulse">
                        Critical Success
                    </h3>
                    <h1 className="text-3xl font-black text-white tracking-tighter drop-shadow-2xl italic">
                        {title}
                    </h1>
                    <p className="text-life-muted text-xs font-mono bg-black/50 px-3 py-1 rounded border border-life-muted/30 inline-block">
                        {message}
                    </p>
                </div>

                {/* 🎁 REWARDS */}
                <div className="grid grid-cols-2 gap-4 w-full mb-8 relative z-10">
                    {/* XP Card */}
                    <div className="bg-life-paper/90 border border-life-gold/50 px-4 py-4 rounded-2xl shadow-[0_0_20px_rgba(251,191,36,0.2)] flex flex-col items-center">
                        <span className="text-[10px] text-life-muted uppercase font-bold tracking-widest mb-1">XP Gain</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-life-text">{xp}</span>
                            <span className="text-xs font-bold text-life-gold bg-life-gold/10 px-1 rounded">x{multiplier}</span>
                        </div>
                    </div>
                    
                    {/* Gold Card */}
                    <div className="bg-life-paper/90 border border-life-gold/50 px-4 py-4 rounded-2xl shadow-[0_0_20px_rgba(251,191,36,0.2)] flex flex-col items-center">
                        <span className="text-[10px] text-life-muted uppercase font-bold tracking-widest mb-1">Gold Loot</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-life-gold">{gold}</span>
                            <span className="text-xs font-bold text-life-gold bg-life-gold/10 px-1 rounded">x{multiplier}</span>
                        </div>
                    </div>
                </div>

                {/* 👇 ACTION */}
                <button 
                    onClick={handleClose}
                    className="w-full py-4 rounded-xl font-black uppercase tracking-widest text-black bg-life-gold shadow-[0_0_30px_rgba(251,191,36,0.6)] hover:scale-105 active:scale-95 transition-all relative z-10"
                >
                    Claim Rewards
                </button>

            </div>
        </div>
    );
};

export default LootModal;
