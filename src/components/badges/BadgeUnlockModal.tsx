
import React from 'react';
import { useLifeOS } from '../../contexts/LifeOSContext';
import { Trophy, Star, X } from 'lucide-react';
import { playSound } from '../../utils/audio';

const BadgeUnlockModal: React.FC = () => {
    const { state, dispatch } = useLifeOS();
    const { modalData } = state.ui;

    if (!modalData || !modalData.badge) return null;

    const { badge, tier, rewards } = modalData;

    const handleClose = () => {
        dispatch.setModal('none');
    };

    // Style logic based on Tier
    let tierColor = 'text-gray-300 border-gray-300';
    let bgGlow = 'bg-gray-500';
    if (tier === 'gold') { tierColor = 'text-yellow-400 border-yellow-400'; bgGlow = 'bg-yellow-500'; }
    if (tier === 'diamond') { tierColor = 'text-cyan-400 border-cyan-400'; bgGlow = 'bg-cyan-500'; }
    if (tier === 'crimson') { tierColor = 'text-red-600 border-red-600'; bgGlow = 'bg-red-600'; }

    return (
        <div 
            onClick={handleClose} 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300"
        >
            <div 
                onClick={(e) => e.stopPropagation()} 
                className="relative w-full max-w-sm flex flex-col items-center text-center animate-in zoom-in-50 slide-in-from-bottom-8 duration-700"
            >
                {/* 🎇 PARTICLES / GLOW */}
                <div className={`absolute inset-0 ${bgGlow} blur-[120px] opacity-20 rounded-full animate-pulse-slow pointer-events-none`} />

                {/* 🏅 ICON CONTAINER */}
                <div className="relative mb-6 group">
                    <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center text-6xl bg-life-black shadow-[0_0_50px_currentColor] animate-bounce ${tierColor}`}>
                        {badge.icon}
                    </div>
                    {/* Rotating Stars */}
                    <div className="absolute inset-0 animate-[spin_4s_linear_infinite] pointer-events-none">
                        <Star size={24} className={`absolute -top-4 left-1/2 -translate-x-1/2 ${tierColor.split(' ')[0]} fill-current`} />
                        <Star size={24} className={`absolute -bottom-4 left-1/2 -translate-x-1/2 ${tierColor.split(' ')[0]} fill-current`} />
                    </div>
                </div>

                {/* 📜 TEXT */}
                <div className="space-y-2 mb-8 relative z-10">
                    <h3 className={`text-sm font-black uppercase tracking-[0.3em] ${tierColor.split(' ')[0]}`}>
                        Protocol Achievement
                    </h3>
                    <h1 className="text-4xl font-black text-white tracking-tighter drop-shadow-xl">
                        {badge.name}
                    </h1>
                    <div className={`inline-block px-3 py-1 rounded border text-xs font-black uppercase tracking-widest bg-black/50 ${tierColor}`}>
                        {tier} Rank
                    </div>
                </div>

                {/* 🎁 REWARDS */}
                <div className="flex gap-4 mb-8">
                    <div className="bg-life-paper/80 border border-life-muted/30 px-4 py-2 rounded-xl">
                        <span className="block text-[10px] text-life-muted uppercase font-bold">XP Gain</span>
                        <span className="text-lg font-mono font-bold text-white">+{rewards.xp}</span>
                    </div>
                    <div className="bg-life-paper/80 border border-life-muted/30 px-4 py-2 rounded-xl">
                        <span className="block text-[10px] text-life-muted uppercase font-bold">Gold</span>
                        <span className="text-lg font-mono font-bold text-life-gold">+{rewards.gold}</span>
                    </div>
                </div>

                {/* 👇 ACTION */}
                <button 
                    onClick={handleClose}
                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-black shadow-xl hover:scale-105 active:scale-95 transition-all ${bgGlow.replace('bg-', 'bg-')}`}
                >
                    Claim Glory
                </button>

            </div>
        </div>
    );
};

export default BadgeUnlockModal;
