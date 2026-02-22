
import React, { useState } from 'react';
import { X, CheckCircle, Lock, Trophy, Calendar, Pin, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { BadgeProgress, BadgeTier } from '@/src/types/badgeTypes';
import { useLifeOS } from '../../contexts/LifeOSContext';
interface BadgeModalProps {
    data: BadgeProgress;
    onClose: () => void;
}

const TIER_COLORS: Record<BadgeTier, string> = {
    silver: 'text-gray-300 border-gray-300 bg-gray-300/10',
    gold: 'text-yellow-400 border-yellow-400 bg-yellow-400/10',
    diamond: 'text-cyan-400 border-cyan-400 bg-cyan-400/10',
    crimson: 'text-red-600 border-red-600 bg-red-600/10 shadow-[0_0_20px_rgba(220,38,38,0.4)]',
};

const BadgeModal: React.FC<BadgeModalProps> = ({ data, onClose }) => {
    const { badge, currentTier, history, currentValue } = data;
    const { state, dispatch } = useLifeOS();
    const { user } = state;

    // 1. Determine Initial View (Start at current level or 0)
    const getInitialIndex = () => {
        if (!currentTier) return 0;
        const idx = badge.levels.findIndex(l => l.tier === currentTier);
        // If current tier is unlocked, maybe show the next one? 
        // For now, let's show the highest unlocked tier so they feel proud, 
        // unless it's maxed, then show max.
        return idx >= 0 ? idx : 0;
    };

    const [viewIndex, setViewIndex] = useState(getInitialIndex());
    const activeLevel = badge.levels[viewIndex];
    
    // View Logic
    const viewTier = activeLevel.tier;
    const isUnlocked = !!history[viewTier];
    
    // Check if this level is the *current active target*
    // It is the target if: It's NOT unlocked, AND (it's the first level OR the previous level IS unlocked)
    const isTarget = !isUnlocked && (viewIndex === 0 || !!history[badge.levels[viewIndex - 1].tier]);

    // Style based on the VIEWED tier (Dynamic Theme)
    const viewColorClass = TIER_COLORS[viewTier];
    const textColor = viewColorClass.split(' ')[0];
    
    // Pin Logic
    const isPinned = user.featuredBadges?.includes(badge.id);
    
    const togglePin = () => {
        let newFeatured = [...(user.featuredBadges || [])];
        if (isPinned) {
            newFeatured = newFeatured.filter(id => id !== badge.id);
            dispatch.addToast('Badge unpinned', 'info');
        } else {
            if (newFeatured.length >= 3) {
                dispatch.addToast('Max 3 pinned badges allowed', 'error');
                return;
            }
            newFeatured.push(badge.id);
            dispatch.addToast('Badge pinned to Profile', 'success');
        }
        dispatch.updateUser({ featuredBadges: newFeatured });
    };

    // 2. Navigation Handlers
    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (viewIndex > 0) setViewIndex(viewIndex - 1);
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (viewIndex < badge.levels.length - 1) setViewIndex(viewIndex + 1);
    };

    // Calculate Progress for Display
    let displayProgress = 0;
    if (isUnlocked) {
        displayProgress = 100;
    } else if (isTarget) {
        // Safe calculation
        const prevTarget = viewIndex > 0 ? badge.levels[viewIndex - 1].target : 0;
        const tierGap = activeLevel.target - prevTarget;
        const currentInTier = Math.max(0, currentValue - prevTarget);
        // Simple percentage of TOTAL target is usually better for badges
        displayProgress = Math.min(100, (currentValue / activeLevel.target) * 100);
    } else {
        displayProgress = 0; // Future locked tiers
    }

    return (
        <div onClick={onClose} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-life-paper border border-life-muted/20 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 flex flex-col">
                
                {/* 🟢 DYNAMIC HEADER (Changes color based on Tier) */}
                <div className={`relative p-6 text-center border-b border-life-muted/10 overflow-hidden transition-colors duration-500 ${viewTier === 'crimson' ? 'bg-red-900/10' : ''}`}>
                    {/* Background Glow */}
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-current opacity-10 blur-[60px] rounded-full pointer-events-none transition-colors duration-500 ${textColor}`} />
                    
                    <button onClick={onClose} className="absolute top-4 right-4 text-life-muted hover:text-white z-20">
                        <X size={20} />
                    </button>

                    {/* Pin Button */}
                    {currentTier && (
                        <button 
                            onClick={togglePin}
                            className={`absolute top-4 left-4 p-2 rounded-full border transition-all z-20 ${isPinned ? 'bg-life-gold text-life-black border-life-gold' : 'bg-transparent text-life-muted border-life-muted/20 hover:text-white'}`}
                            title={isPinned ? "Unpin" : "Pin to Profile"}
                        >
                            <Pin size={16} className={isPinned ? 'fill-current' : ''} />
                        </button>
                    )}

                    {/* 🎠 CAROUSEL CONTROLS & ICON */}
                    <div className="flex items-center justify-between mt-2 mb-4 relative z-10">
                        {/* Left Arrow */}
                        <button 
                            onClick={handlePrev}
                            disabled={viewIndex === 0}
                            className={`p-2 rounded-full transition-all ${viewIndex === 0 ? 'opacity-0 pointer-events-none' : 'text-life-gold hover:bg-life-gold/10 hover:scale-110'}`}
                        >
                            <ChevronLeft size={32} strokeWidth={3} />
                        </button>

                        {/* Central Icon */}
                        <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center text-5xl shadow-2xl transition-all duration-500 bg-life-black ${viewColorClass} ${isUnlocked ? 'scale-100' : 'scale-90 opacity-50 grayscale'}`}>
                            {isUnlocked ? badge.icon : <Lock size={40} />}
                        </div>

                        {/* Right Arrow */}
                        <button 
                            onClick={handleNext}
                            disabled={viewIndex === badge.levels.length - 1}
                            className={`p-2 rounded-full transition-all ${viewIndex === badge.levels.length - 1 ? 'opacity-0 pointer-events-none' : 'text-life-gold hover:bg-life-gold/10 hover:scale-110'}`}
                        >
                            <ChevronRight size={32} strokeWidth={3} />
                        </button>
                    </div>

                    <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-1">
                        {badge.name}
                    </h2>
                    <div className={`inline-block px-3 py-0.5 rounded text-[10px] font-black uppercase tracking-[0.2em] border transition-colors duration-500 ${viewColorClass}`}>
                        {viewTier}
                    </div>
                </div>

                {/* 🟢 CONTENT BODY */}
                <div className="p-6 space-y-6 flex-1 bg-life-paper relative">
                    
                    {/* Quote */}
                    <div className="text-center flex flex-col items-center justify-center min-h-[40px]">
                        <p key={viewIndex} className="text-sm italic font-serif text-life-muted/80 leading-relaxed animate-in fade-in duration-500">
                            "{activeLevel.quote}"
                        </p>
                    </div>

                    {/* 3. EXPLICIT OBJECTIVE */}
                    <div className="bg-life-black/40 rounded-xl p-3 border border-life-muted/10 text-center relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-life-gold/50" />
                        <span className="text-[9px] text-life-muted uppercase font-bold tracking-widest block mb-1 flex items-center justify-center gap-1">
                            <Target size={10} /> Requirement
                        </span>
                        <p className="text-xs text-life-text font-medium leading-relaxed">
                            {badge.description} <br/>
                            <span className="text-life-gold font-bold bg-life-gold/10 px-2 py-0.5 rounded mt-1 inline-block">
                                Target: {activeLevel.target}
                            </span>
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-mono font-bold uppercase tracking-wider">
                            <span className="text-life-muted">Progress</span>
                            <span className={isUnlocked ? 'text-life-easy' : 'text-life-gold'}>
                                {isUnlocked ? 'COMPLETE' : `${currentValue} / ${activeLevel.target}`}
                            </span>
                        </div>
                        <div className="h-2 bg-life-black rounded-full overflow-hidden border border-life-muted/20">
                            <div 
                                className={`h-full transition-all duration-500 ${isUnlocked ? 'bg-life-easy' : 'bg-life-gold'}`} 
                                style={{ width: `${displayProgress}%` }} 
                            />
                        </div>
                    </div>

                    {/* Status & Rewards Grid */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-colors duration-500 ${isUnlocked ? 'bg-life-easy/10 border-life-easy/30' : 'bg-life-black border-life-muted/20'}`}>
                            <span className="text-[9px] text-life-muted uppercase font-bold">Status</span>
                            <span className={`text-xs font-black uppercase tracking-wider ${isUnlocked ? 'text-life-easy' : 'text-life-muted'}`}>
                                {isUnlocked ? 'ACQUIRED' : 'LOCKED'}
                            </span>
                        </div>
                        
                        {isUnlocked && history[viewTier] ? (
                             <div className="p-3 rounded-xl bg-life-black border border-life-muted/20 flex flex-col items-center justify-center gap-1">
                                <span className="text-[9px] text-life-muted uppercase font-bold">Unlocked</span>
                                <span className="text-[10px] font-mono text-life-text">
                                    {/* Date Formatting YYMMDD... */}
                                    {(() => {
                                        const timeCode = history[viewTier] || "";
                                        if (timeCode.length >= 6) {
                                            return `20${timeCode.substring(0,2)}-${timeCode.substring(2,4)}-${timeCode.substring(4,6)}`;
                                        }
                                        return "Unknown";
                                    })()}
                                </span>
                            </div>
                        ) : (
                            <div className="p-3 rounded-xl bg-life-black border border-life-muted/20 flex flex-col items-center justify-center gap-1 opacity-60">
                                <span className="text-[9px] text-life-muted uppercase font-bold">Reward</span>
                                <span className="text-xs font-bold text-life-gold">
                                    {activeLevel.rewards.gold} G
                                </span>
                            </div>
                        )}
                    </div>

                </div>

                {/* Pagination Dots */}
                <div className="p-4 bg-life-black border-t border-life-muted/10 flex justify-center gap-2">
                    {badge.levels.map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === viewIndex ? 'bg-life-gold w-3' : 'bg-life-muted/30'}`} 
                        />
                    ))}
                </div>

            </div>
        </div>
    );
};

export default BadgeModal;
