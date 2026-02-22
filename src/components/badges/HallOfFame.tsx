
import React, { useState } from 'react';
import { Award, Lock, Filter, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { useBadges } from '../../contexts/BadgeContext';
import { BadgeCategory } from '../../types/badgeTypes';
import BadgeModal from './BadgeModal';

const CATEGORIES: { id: BadgeCategory | 'all' | 'honor', label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'honor', label: 'Honor' }, // 👈 NEW CATEGORY
    { id: 'progression', label: 'Progression' },
    { id: 'combat', label: 'Combat' },
    { id: 'warfare', label: 'Warfare' },
    { id: 'consistency', label: 'Consistency' },
    { id: 'resilience', label: 'Resilience' },
    { id: 'economy', label: 'Economy' },
    { id: 'mastery', label: 'Stats' },
];

const HallOfFame: React.FC = () => {
    const { getAllBadges } = useBadges();
    const badges = getAllBadges();
    const [filter, setFilter] = useState<BadgeCategory | 'all' | 'honor'>('all');
    const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);
    const [showStats, setShowStats] = useState(false);

    const filteredBadges = filter === 'all' 
        ? badges 
        : filter === 'honor' 
            ? badges.filter(b => b.badge.id.startsWith('bdg_honor_')) // 👈 Filter by ID prefix for Honor badges
            : badges.filter(b => b.badge.category === filter);

    const selectedBadgeData = selectedBadgeId ? badges.find(b => b.badge.id === selectedBadgeId) : null;

    // Calculate Stats
    const totalUnlocked = badges.filter(b => b.isUnlocked).length;
    const completionPct = Math.round((totalUnlocked / badges.length) * 100);
    
    // Tier Counts
    const tierCounts = {
        silver: badges.filter(b => b.currentTier === 'silver').length,
        gold: badges.filter(b => b.currentTier === 'gold').length,
        diamond: badges.filter(b => b.currentTier === 'diamond').length,
        crimson: badges.filter(b => b.currentTier === 'crimson').length,
    };

    return (
        <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             {/* 🟢 HEADER */}
             <div className="flex items-end justify-between mb-6 px-1">
                <div>
                    <h2 className="text-2xl font-black text-life-text tracking-tight flex items-center gap-2">
                        HALL OF GLORY
                    </h2>
                    <p className="text-xs text-life-muted uppercase tracking-widest mt-1">
                        The Crimson Legacy • {completionPct}% Complete
                    </p>
                </div>
                <div className="text-life-crimson opacity-50 animate-pulse-slow">
                    <Award size={28} />
                </div>
            </div>

            {/* 🟢 STATS TOGGLE BUTTON (Wide Icon Button) */}
            <button 
                onClick={() => setShowStats(!showStats)}
                className="w-full mb-6 py-3 px-4 bg-life-black border border-life-muted/20 rounded-xl flex items-center justify-between hover:bg-life-muted/5 transition-all group shadow-sm"
            >
                <div className="flex items-center gap-2 text-life-muted group-hover:text-life-text">
                    <BarChart3 size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Protocol Analysis</span>
                </div>
                {showStats ? <ChevronUp size={16} className="text-life-muted" /> : <ChevronDown size={16} className="text-life-muted" />}
            </button>

            {/* 🟢 EXPANDED STATS */}
            {showStats && (
                <div className="grid grid-cols-4 gap-2 mb-6 animate-in slide-in-from-top-2">
                    <div className="bg-life-black border border-life-muted/20 p-2 rounded-lg text-center">
                        <span className="block text-lg font-black text-gray-400">{tierCounts.silver}</span>
                        <span className="text-[8px] text-life-muted uppercase font-bold">Silver</span>
                    </div>
                    <div className="bg-life-black border border-yellow-500/20 p-2 rounded-lg text-center">
                        <span className="block text-lg font-black text-yellow-500">{tierCounts.gold}</span>
                        <span className="text-[8px] text-life-muted uppercase font-bold">Gold</span>
                    </div>
                    <div className="bg-life-black border border-cyan-500/20 p-2 rounded-lg text-center">
                        <span className="block text-lg font-black text-cyan-400">{tierCounts.diamond}</span>
                        <span className="text-[8px] text-life-muted uppercase font-bold">Diamond</span>
                    </div>
                    <div className="bg-life-black border border-red-600/20 p-2 rounded-lg text-center">
                        <span className="block text-lg font-black text-red-500">{tierCounts.crimson}</span>
                        <span className="text-[8px] text-life-muted uppercase font-bold">Crimson</span>
                    </div>
                </div>
            )}

            {/* 🟢 FILTER BAR */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setFilter(cat.id as any)}
                        className={`
                            px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border transition-all
                            ${filter === cat.id 
                                ? 'bg-life-gold text-life-black border-life-gold' 
                                : 'bg-life-black text-life-muted border-life-muted/20 hover:border-life-gold/50'}
                        `}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* 🟢 BADGE GRID */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {filteredBadges.map((data) => {
                    const { badge, currentTier, isUnlocked } = data;
                    
                    let borderColor = 'border-life-muted/10';
                    let iconColor = 'text-life-muted/20';
                    let bgGlow = '';

                    if (currentTier === 'silver') { borderColor = 'border-gray-400/50'; iconColor = 'text-gray-300'; }
                    if (currentTier === 'gold') { borderColor = 'border-yellow-500/50'; iconColor = 'text-yellow-400'; bgGlow = 'shadow-[0_0_15px_rgba(250,204,21,0.1)]'; }
                    if (currentTier === 'diamond') { borderColor = 'border-cyan-500/50'; iconColor = 'text-cyan-400'; bgGlow = 'shadow-[0_0_20px_rgba(34,211,238,0.2)]'; }
                    if (currentTier === 'crimson') { borderColor = 'border-red-600'; iconColor = 'text-red-500'; bgGlow = 'shadow-[0_0_25px_rgba(220,38,38,0.3)] bg-red-900/10'; }

                    return (
                        <button
                            key={badge.id}
                            onClick={() => setSelectedBadgeId(badge.id)}
                            className={`
                                aspect-square rounded-xl border bg-life-paper relative flex flex-col items-center justify-center p-2 group transition-all
                                ${borderColor} ${bgGlow}
                                ${isUnlocked ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'opacity-50 grayscale hover:opacity-70'}
                            `}
                        >
                            {/* Icon */}
                            <div className={`text-3xl mb-2 transition-transform group-hover:scale-110 ${iconColor}`}>
                                {isUnlocked ? badge.icon : <Lock size={24} />}
                            </div>

                            {/* Name */}
                            <div className="text-[8px] font-bold text-center uppercase leading-tight text-life-text/80 line-clamp-2">
                                {badge.name}
                            </div>

                            {/* Tier Badge (Mini) */}
                            {currentTier && (
                                <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${iconColor.replace('text-', 'bg-')}`} />
                            )}
                        </button>
                    );
                })}
            </div>

            {filteredBadges.length === 0 && (
                <div className="py-12 text-center text-life-muted italic text-xs">
                    No badges found in this category.
                </div>
            )}

            {/* 🟢 MODAL */}
            {selectedBadgeData && (
                <BadgeModal 
                    data={selectedBadgeData} 
                    onClose={() => setSelectedBadgeId(null)} 
                />
            )}

        </div>
    );
};

export default HallOfFame;
