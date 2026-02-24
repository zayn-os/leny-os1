
import React, { useState } from 'react';
import { X, Trophy, Calendar, Zap, AlertTriangle, Trash2, Dumbbell, Brain, Heart, Activity, Clock, Palette, Users, Coins, Flame, Edit2, BarChart2, ChevronLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
// --- تصحيح المسارات (الرجوع خطوتين ../../ والدخول للمجلدات الصحيحة) ---
import { useSkills } from '../../contexts/SkillContext';
import { useLifeOS } from '../../contexts/LifeOSContext';
import { SkillRank } from '../../types/skillTypes';
import { Stat } from '../../types/types';
import { STAT_COLORS } from '../../types/constants';
import SkillForm from '../forms/SkillForm';

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
        case Stat.HEA: return <Heart size={size} />;
        case Stat.CRT: return <Palette size={size} />;
        case Stat.SPR: return <Flame size={size} />;
        case Stat.REL: return <Users size={size} />;
        case Stat.FIN: return <Coins size={size} />;
        default: return <Activity size={size} />;
    }
};

const SkillDetails: React.FC = () => {
    const { skillState, skillDispatch } = useSkills();
    const { dispatch } = useLifeOS();
    const { skills, activeSkillId } = skillState;
    const [isEditing, setIsEditing] = useState(false);
    const [showChart, setShowChart] = useState(false);

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

    const startDate = new Date(skill.createdAt);
    const now = new Date();
    const daysSinceStart = Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const lastPracticedDate = new Date(skill.lastPracticed);
    const daysSincePractice = Math.floor((now.getTime() - lastPracticedDate.getTime()) / (1000 * 60 * 60 * 24));

    // Generate mock progression data for the chart based on current level
    const chartData = Array.from({ length: Math.max(5, skill.level) }).map((_, i) => ({
        level: i + 1,
        xp: Math.floor(Math.pow(i + 1, 1.5) * 100)
    }));

    return (
        <div 
            onClick={handleClose} 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        >
            <div 
                onClick={(e) => e.stopPropagation()} 
                className={`
                    relative bg-life-paper w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-8 duration-500
                    ${skill.isRusty ? 'border-orange-500/30' : 'border-zinc-800'}
                `}
            >
                {skill.isRusty && (
                    <div className="absolute inset-0 pointer-events-none z-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'1\' fill=\'#f97316\'/%3E%3C/svg%3E")' }} />
                )}

                {/* 🟢 HEADER AREA */}
                <div className="relative p-6 pb-6 border-b border-zinc-800 overflow-hidden z-10 bg-life-black/50">
                    <div className={`absolute top-0 right-0 w-64 h-64 bg-current opacity-5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none ${rankTextColor}`} />
                    
                    <div className="flex justify-between items-start relative z-10">
                        {isEditing ? (
                            <button onClick={() => setIsEditing(false)} className="flex items-center gap-1 text-life-muted hover:text-white text-xs font-bold uppercase tracking-widest">
                                <ChevronLeft size={14} /> Back
                            </button>
                        ) : (
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded border bg-life-black/50 text-[10px] font-black uppercase tracking-widest ${rankColorClass}`}>
                                <Trophy size={12} />
                                {skill.rank}
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            {!isEditing && (
                                <>
                                    <button onClick={() => setShowChart(!showChart)} className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${showChart ? 'bg-life-gold text-black' : 'bg-life-black/50 text-life-muted hover:text-white hover:bg-life-muted/20'}`}>
                                        <BarChart2 size={16} />
                                    </button>
                                    <button onClick={() => setIsEditing(true)} className="w-8 h-8 flex items-center justify-center rounded-full bg-life-black/50 text-life-muted hover:text-white hover:bg-life-muted/20 transition-all">
                                        <Edit2 size={16} />
                                    </button>
                                </>
                            )}
                            <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-life-black/50 text-life-muted hover:text-white hover:bg-life-muted/20 transition-all">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {!isEditing && (
                        <div className="mt-4">
                            <h2 className={`text-2xl font-black text-life-text tracking-tight mb-2 ${skill.isRusty ? 'opacity-80' : ''}`}>{skill.title}</h2>
                            <div className="p-3 rounded-lg bg-black/40 border border-zinc-800/50">
                                <p className="text-sm text-life-muted leading-relaxed">
                                    {skill.description || "No description provided."}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 🟢 SCROLLABLE CONTENT */}
                <div className="overflow-y-auto p-6 space-y-6 relative z-10">
                    {isEditing ? (
                        <SkillForm onClose={() => setIsEditing(false)} initialData={skill} />
                    ) : showChart ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-life-muted flex items-center gap-2">
                                <BarChart2 size={14} /> Progression Curve
                            </h3>
                            <div className="h-48 w-full bg-life-black rounded-xl border border-zinc-800 p-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="level" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} width={30} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }}
                                            itemStyle={{ color: '#fbbf24' }}
                                        />
                                        <Area type="monotone" dataKey="xp" stroke="#fbbf24" strokeWidth={2} fillOpacity={1} fill="url(#colorXp)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-[10px] text-life-muted text-center">Estimated XP required for future levels.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in">
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
                                
                                <div className="h-3 w-full bg-life-black rounded-full overflow-hidden border border-zinc-800 relative">
                                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(90deg, transparent 95%, #000 95%)', backgroundSize: '10% 100%' }} />
                                    <div 
                                        className={`h-full transition-all duration-1000 ease-out relative overflow-hidden ${skill.isRusty ? 'grayscale' : ''}`}
                                        style={{ width: `${progressPercent}%` }} 
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
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-life-black border border-zinc-800"
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
                                <div className="p-3 rounded-lg bg-life-black border border-zinc-800">
                                    <div className="flex items-center gap-2 text-life-muted mb-1">
                                        <Clock size={12} />
                                        <span className="text-[9px] uppercase font-bold">Time Invested</span>
                                    </div>
                                    <span className="text-xs font-mono text-life-text">
                                        {daysSinceStart} Days
                                    </span>
                                </div>

                                <div className="p-3 rounded-lg bg-life-black border border-zinc-800">
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
                            <div className="pt-4 border-t border-zinc-800">
                                <button 
                                    onClick={handleDelete}
                                    className="w-full py-3 flex items-center justify-center gap-2 text-life-muted hover:text-life-hard hover:bg-life-hard/5 rounded-lg transition-colors text-xs font-bold uppercase tracking-widest"
                                >
                                    <Trash2 size={14} />
                                    Forget Skill
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SkillDetails;
