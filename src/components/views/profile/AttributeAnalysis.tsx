import React, { useState } from 'react';
import { Stat, UserProfile } from '../../../types/types';
import StatsRadar from '../../StatsRadar';
import { getStatIcon, getStatColor } from '../../../utils/stat-helpers';
import { Hexagon, List } from 'lucide-react';

// --- HOOK: The Balance Algorithm ---
const useBalanceAlgorithm = (stats: Record<Stat, number>) => {
    const xpValues = {
        [Stat.STR]: stats.STR || 0,
        [Stat.INT]: stats.INT || 0,
        [Stat.DIS]: stats.DIS || 0,
        [Stat.CRT]: stats.CRT || 0,
        [Stat.PCE]: stats.PCE || 0,
        [Stat.EMT]: stats.EMT || 0,
        [Stat.CAM]: stats.CAM || 0,
    };

    const maxXP = Math.max(...Object.values(xpValues));

    let globalTarget = 20;
    if (maxXP >= 1280) globalTarget = 2560;
    else if (maxXP >= 640) globalTarget = 1280;
    else if (maxXP >= 320) globalTarget = 640;
    else if (maxXP >= 160) globalTarget = 320;
    else if (maxXP >= 80) globalTarget = 160;
    else if (maxXP >= 40) globalTarget = 80;
    else if (maxXP >= 20) globalTarget = 40;

    return { xpValues, globalTarget };
};

// --- CONSTANTS ---
const STAT_FULL_NAMES: Record<Stat, string> = {
    [Stat.STR]: 'Strength',
    [Stat.INT]: 'Intelligence',
    [Stat.DIS]: 'Discipline',
    [Stat.CRT]: 'Creativity',
    [Stat.PCE]: 'Peace',
    [Stat.EMT]: 'Emotion',
    [Stat.CAM]: 'Charisma',
};

// --- SUB-COMPONENT: Stat Data Row ---
interface StatRowProps {
    stat: Stat;
    xp: number;
    target: number;
}

const StatDataRow: React.FC<StatRowProps> = ({ stat, xp, target }) => {
    const percentage = target > 0 ? Math.min((xp / target) * 100, 100) : 0;
    const Icon = getStatIcon(stat);
    const color = getStatColor(stat);
    const fullName = STAT_FULL_NAMES[stat] || stat;

    return (
        <div className="flex flex-col w-full mb-2 group">
            {/* Top Row: Icon/Name & Numbers */}
            <div className="flex justify-between items-end px-0 mb-1">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-life-black border border-life-muted/20 flex items-center justify-center shadow-sm group-hover:border-life-muted/40 transition-colors">
                        <Icon size={14} style={{ color }} />
                    </div>
                    <div className="flex flex-col leading-none gap-0.5">
                        <span className="font-black text-[10px] text-life-text uppercase tracking-widest">{fullName}</span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[8px] font-mono text-life-muted font-bold opacity-50">{stat}</span>
                            <span className="text-[8px] font-mono text-life-gold font-bold bg-life-gold/10 px-1 rounded-[2px]">LVL {Math.floor(xp / 20) + 1}</span>
                        </div>
                    </div>
                </div>
                
                <p className="text-[10px] font-mono text-life-text text-right leading-none">
                    <span style={{ color }} className="font-black text-xs">{xp.toFixed(0)}</span>
                    <span className="text-life-muted/40 text-[9px] ml-1">/ {target}</span>
                </p>
            </div>

            {/* Bottom Row: Large Bar */}
            <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-life-muted/20 relative shadow-inner">
                <div 
                    className="h-full rounded-full transition-all duration-700 ease-out relative z-10"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                ></div>
                {/* Background glow effect */}
                <div 
                    className="absolute inset-0 opacity-30 blur-[3px]"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                ></div>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---
interface AttributeAnalysisProps {
    user: UserProfile;
}

export const AttributeAnalysis: React.FC<AttributeAnalysisProps> = ({ user }) => {
    const [viewMode, setViewMode] = useState<'graph' | 'data'>('data');
    const { xpValues, globalTarget } = useBalanceAlgorithm(user.stats);

    const statsOrder: Stat[] = [Stat.DIS, Stat.STR, Stat.INT, Stat.CRT, Stat.PCE, Stat.EMT, Stat.CAM];

    return (
        <div className="bg-life-black border border-life-muted/20 rounded-xl p-4 mb-4 shadow-lg shadow-black/50 relative overflow-hidden group">
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-life-muted/30 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-life-muted/30 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-life-muted/30 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-life-muted/30 rounded-br-lg"></div>

            {/* Header & Toggle */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-life-text flex items-center gap-2">
                        <span className="text-life-gold">⬡</span> Attribute Analysis
                    </h3>
                    <p className="text-[9px] text-life-muted uppercase font-mono tracking-[0.1em] mt-1 opacity-60">
                        Neural_Net_v1.4 // Connected
                    </p>
                </div>
                
                <div className="flex items-center bg-black border border-life-muted/20 p-1 rounded-lg gap-1">
                    <button 
                        onClick={() => setViewMode('graph')}
                        className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all ${viewMode === 'graph' ? 'bg-life-gold text-black shadow-sm' : 'text-life-muted hover:text-white hover:bg-white/5'}`}
                    >
                        <Hexagon size={12} className={viewMode === 'graph' ? 'fill-black stroke-black' : ''} />
                        Graph
                    </button>
                    <button 
                        onClick={() => setViewMode('data')}
                        className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all ${viewMode === 'data' ? 'bg-life-gold text-black shadow-sm' : 'text-life-muted hover:text-white hover:bg-white/5'}`}
                    >
                        <List size={14} />
                        Data
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="animate-in fade-in zoom-in-95 duration-300">
                {viewMode === 'graph' ? (
                    <div className="relative h-64 flex items-center justify-center">
                        <StatsRadar stats={user.stats} maxVal={globalTarget} />
                    </div>
                ) : (
                    <div className="space-y-3 py-1">
                        {statsOrder.map(stat => (
                            <StatDataRow 
                                key={stat}
                                stat={stat}
                                xp={xpValues[stat]}
                                target={globalTarget}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
