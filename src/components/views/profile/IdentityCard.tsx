
import React from 'react';
import { User } from 'lucide-react';
import { UserProfile } from '../../../types/types';
import { BadgeProgress } from '../../../types/badgeTypes';

interface IdentityCardProps {
    user: UserProfile;
    dynamicTitle: string;
    featuredBadgesData: BadgeProgress[];
}

export const IdentityCard: React.FC<IdentityCardProps> = ({ user, dynamicTitle, featuredBadgesData }) => {
    return (
        <div className="bg-life-paper border border-life-muted/20 rounded-xl p-6 text-center mb-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-life-gold/5 to-transparent pointer-events-none" />
            
            {/* Avatar */}
            <div 
                className="w-24 h-24 mx-auto bg-life-black rounded-full border-4 border-life-muted/30 flex items-center justify-center mb-4 relative shadow-2xl z-10 transition-transform select-none"
            >
                <User size={48} className="text-life-silver" />
                <div className="absolute -bottom-2 bg-life-gold text-life-black text-xs font-black px-2 py-0.5 rounded shadow-sm border border-life-black">
                    Lvl {user.level}
                </div>
            </div>
            
            <h2 className="text-2xl font-black text-life-text tracking-tight uppercase relative z-10">{user.name}</h2>
            <p className="text-sm text-life-gold font-mono tracking-widest opacity-80 mb-5 relative z-10">
                {dynamicTitle}
            </p>
            
            {/* 🏅 FEATURED BADGES */}
            {featuredBadgesData.length > 0 && (
                <div className="flex justify-center gap-2 mb-5 relative z-10">
                    {featuredBadgesData.map(data => {
                        const tier = data!.currentTier;
                        let color = 'text-gray-400';
                        if (tier === 'gold') color = 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]';
                        if (tier === 'diamond') color = 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]';
                        if (tier === 'crimson') color = 'text-red-500 drop-shadow-[0_0_8px_rgba(220,38,38,0.6)]';
                        
                        return (
                            <div key={data!.badge.id} className="relative group/badge cursor-help" title={data!.badge.name}>
                                <div className={`w-8 h-8 rounded-full bg-life-black border border-life-muted/30 flex items-center justify-center ${color}`}>
                                    <span className="text-sm">{data!.badge.icon}</span>
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-life-paper bg-current ${color}`} />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* XP Progress Bar */}
            <div className="bg-black/40 rounded-lg p-3 backdrop-blur-sm border border-life-muted/10 relative z-10">
                <div className="flex justify-between text-[10px] text-life-muted mb-1 uppercase font-bold">
                    <span>XP Progress</span>
                    <span className="text-life-gold">{user.currentXP} <span className="text-life-muted">/ {user.targetXP}</span></span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-life-gold shadow-[0_0_10px_rgba(251,191,36,0.5)] transition-all duration-700" 
                        style={{ width: `${Math.min(100, (user.currentXP / user.targetXP) * 100)}%` }}
                    />
                </div>
            </div>
        </div>
    );
};
