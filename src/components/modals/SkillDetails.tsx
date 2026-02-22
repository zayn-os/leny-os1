
import React from 'react';
import { X, Trophy, Calendar, Zap, AlertTriangle, Trash2, Dumbbell, Brain, Shield, Heart, Activity, Clock, Hourglass, Palette } from 'lucide-react';
// --- تصحيح المسارات (الرجوع خطوتين ../../ والدخول للمجلدات الصحيحة) ---
import { useSkills } from '../../contexts/SkillContext';
import { useLifeOS } from '../../contexts/LifeOSContext';
import { SkillRank } from '../../types/skillTypes';
import { Stat } from '../../types/types';
import { STAT_COLORS } from '../../types/constants';
const RANK_COLORS: Record<SkillRank, string> = {
    'Novice': 'text-life-muted border-life-muted',
    'Adept': 'text-life-normal border-life-normal',
    'Expert': 'text-purple-400 border-purple-400',
    'Master': 'text-life-gold border-life-gold',
    'Grandmaster': 'text-life-diamond border-life-diamond',
};

const StatIcon = ({ stat, size = 14 }: { stat: Stat; size?: number }) => {
    switch (stat) {
        case Stat.STR: return <Dumbbell size={size} />;
        case Stat.INT: return <Brain size={size} />;
        case Stat.DIS: return <Zap size={size} />;
        case Stat.PCE: return <Shield size={size} />;
        case Stat.EMT: return <Heart size={size} />;
        case Stat.CAM: return <Activity size={size} />;
        case Stat.CRT: return <Palette size={size} />;
        default: return <Activity size={size} />;
    }
};

const SkillDetails: React.FC = () => {
    const { skillState, skillDispatch } = useSkills();
    const { dispatch } = useLifeOS(); // 👈 Access dispatch
    const { skills, activeSkillId } = skillState;

    const skill = skills.find(s => s.id === activeSkillId);

    if (!skill) return null;

    const handleClose = () => {
        skillDispatch.setActiveSkill(null);
    };

    const handleMaintenance = () => {
        skillDispatch.addSkillXP(skill.id, 1);
    };

    const handleDelete = () => {
        dispatch.setModal('confirmation', {
            title: 'Forget Skill?',
            message: 'Are you sure you want to remove this skill? All accrued XP and progress will be lost permanently.',
            confirmText: 'Forget',
            isDangerous: true,
            onConfirm: () => {
                skillDispatch.deleteSkill(skill.id);
            }
        });
    };

    const rankColorClass = RANK_COLORS[skill.rank] || RANK_COLORS['Novice'];
    const rankTextColor = rankColorClass.split(' ')[0];
    const progressPercent = Math.min(100, (skill.currentXP / skill.targetXP) * 100);

    // Calculate Days Since Start & Last Practiced
    const startDate = new Date(skill.createdAt);
    const now = new Date();
    const daysSinceStart = Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    const lastPracticedDate = new Date(skill.lastPracticed);
    const daysSincePractice = Math.floor((now.getTime() - lastPracticedDate.getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div 
            onClick={handleClose} 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        >
            <div 
                onClick={(e) => e.stopPropagation()} 
                className={`
                    relative bg-life-paper w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-8 duration-500
                    ${skill.isRusty ? 'border-orange-500/30' : 'border-life-muted/20'}
                `}
            >
                
                {/* 🍂 RUST OVERLAY TEXTURE */}
                {skill.isRusty && (
                    <div className="absolute inset-0 pointer-events-none z-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'1\' fill=\'#f97316\'/%3E%3C/svg%3E")' }} />
                )}

                {/* 🟢 HEADER AREA */}
                <div className="relative p-6 pb-8 border-b border-life-muted/20 overflow-hidden z-10">
                    <div className={`absolute top-0 right-0 w-64 h-64 bg-current opacity-5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none ${rankTextColor}`} />
                    
                    <button 
                        onClick={handleClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-life-black/50 text-life-muted hover:text-white hover:bg-life-muted/20 transition-all z-10"
                    >
                        <X size={20} />
                    </button>

                    <div>
                        {/* Rank Badge */}
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded border bg-life-black/50 text-[10px] font-black uppercase tracking-widest mb-3 ${rankColorClass}`}>
                            <Trophy size={12} />
                            {skill.rank}
                        </div>

                        <h2 className={`text-3xl font-black text-life-text tracking-tighter mb-1 ${skill.isRusty ? 'opacity-80' : ''}`}>{skill.title}</h2>
                        
                        {/* Description */}
                        <p className="text-sm text-life-muted leading-relaxed">
                            {skill.description || "No description provided."}
                        </p>
                    </div>
                </div>

                {/* 🟢 SCROLLABLE CONTENT */}
                <div className="overflow-y-auto p-6 space-y-8 relative z-10">
                    
                    {/* 1. PROGRESS SECTION */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-4xl font-black font-mono leading-none" style={{ color: progressPercent >= 100 ? '#10b981' : undefined }}>
                                LVL {skill.level}
                            </span>
                            <span className="text-xs font-mono text-life-muted mb-1">
                                <span className="text-life-text">{skill.currentXP}</span> / {skill.targetXP} XP
                            </span>
                        </div>
                        
                        {/* Big Bar */}
                        <div className="h-4 w-full bg-life-black rounded-full overflow-hidden border border-life-muted/20 relative">
                             {/* Grid pattern overlay */}
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(90deg, transparent 95%, #000 95%)', backgroundSize: '10% 100%' }} />
                            
                            <div 
                                className={`h-full transition-all duration-1000 ease-out relative overflow-hidden ${skill.isRusty ? 'grayscale' : ''}`}
                                style={{ 
                                    width: `${progressPercent}%`,
                                }} 
                            >   
                                <div className={`absolute inset-0 opacity-80 ${rankTextColor.replace('text-', 'bg-')} shadow-[0_0_15px_currentColor]`} />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]" />
                            </div>
                        </div>
                    </div>

                    {/* 2. RUST STATUS */}
                    {skill.isRusty ? (
                        <div className="p-4 rounded-xl bg-orange-900/10 border border-orange-500/30 flex items-center gap-4 animate-pulse">
                            <div className="p-2 bg-orange-500/10 rounded-full text-orange-500">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-orange-400">Skill Rusting</h4>
                                <p className="text-[10px] text-orange-300/70">
                                    Inactive for {daysSincePractice} days. XP gain is paused.
                                </p>
                            </div>
                            <button 
                                onClick={handleMaintenance}
                                className="ml-auto px-3 py-1.5 rounded bg-orange-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/20"
                            >
                                Polish
                            </button>
                        </div>
                    ) : (
                         <div className="flex items-center gap-2 text-life-easy opacity-80 p-3 rounded-lg bg-life-easy/5 border border-life-easy/10">
                            <Zap size={16} />
                            <span className="text-xs font-bold uppercase">Active • {daysSincePractice}d since practice</span>
                        </div>
                    )}

                    {/* 3. RELATED ATTRIBUTES */}
                    <div>
                        <h4 className="text-[10px] text-life-muted uppercase font-bold tracking-widest mb-3">
                            DNA Source (Parent Stats)
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {skill.relatedStats.map(stat => (
                                <div 
                                    key={stat} 
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-life-black border border-life-muted/20"
                                >
                                    <div style={{ color: STAT_COLORS[stat] }}>
                                        <StatIcon stat={stat} size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-life-text leading-none">{stat}</span>
                                        <span className="text-[8px] text-life-muted leading-none mt-0.5">Linked</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. HISTORY */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-life-black border border-life-muted/20">
                            <div className="flex items-center gap-2 text-life-muted mb-1">
                                <Clock size={12} />
                                <span className="text-[9px] uppercase font-bold">Time Invested</span>
                            </div>
                            <span className="text-xs font-mono text-life-text">
                                {daysSinceStart} Days
                            </span>
                        </div>

                        <div className="p-3 rounded-lg bg-life-black border border-life-muted/20">
                            <div className="flex items-center gap-2 text-life-muted mb-1">
                                <Calendar size={12} />
                                <span className="text-[9px] uppercase font-bold">Last Session</span>
                            </div>
                            <span className="text-xs font-mono text-life-text">
                                {new Date(skill.lastPracticed).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    {/* 5. ACTIONS */}
                    <div className="pt-4 border-t border-life-muted/10">
                         <button 
                            onClick={handleDelete} // 👈 Use the new handler with modal
                            className="w-full py-3 flex items-center justify-center gap-2 text-life-muted hover:text-life-hard hover:bg-life-hard/5 rounded-lg transition-colors text-xs font-bold uppercase tracking-widest"
                        >
                            <Trash2 size={14} />
                            Forget Skill
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SkillDetails;
