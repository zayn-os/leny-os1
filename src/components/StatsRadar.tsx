
import React from 'react';
import { Stat } from '../types/types';
import { STAT_COLORS } from '../types/constants';
import { Brain, Heart, Shield, Zap, Dumbbell, Palette, Crown, Coins, Users, Flame } from 'lucide-react';

interface StatsRadarProps {
  stats: Record<Stat, number>;
  maxVal?: number;
}

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
        default: return <Crown size={size} />;
    }
};

const StatsRadar: React.FC<StatsRadarProps> = ({ stats, maxVal = 20 }) => {
  // --- CONFIGURATION ---
  const size = 300; // Increased size to fit labels comfortably
  const center = size / 2;
  const radius = 85; // The actual chart radius
  const maxStat = maxVal; // The scale reference (100% value)

  // Order of stats (Clockwise starting from Top) - Now 8 items
  const statOrder: Stat[] = [Stat.STR, Stat.INT, Stat.DIS, Stat.HEA, Stat.CRT, Stat.SPR, Stat.REL, Stat.FIN];
  
  // --- MATH HELPERS ---
  const getPoint = (value: number, index: number, offsetRadius: number = radius) => {
    // Dynamic angle based on number of stats (2*PI / 7 for Heptagon)
    const angleStep = (Math.PI * 2) / statOrder.length;
    const angle = angleStep * index - Math.PI / 2; // Start at -90deg (Top)
    
    const r = (value / maxStat) * offsetRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Generate polygon points
  const points = statOrder.map((stat, i) => {
    const val = Math.min(stats[stat], maxStat);
    const { x, y } = getPoint(val, i);
    return `${x},${y}`;
  }).join(' ');

  // Generate background webs
  const webs = [0.25, 0.5, 0.75, 1].map(scale => {
    return statOrder.map((_, i) => {
        const { x, y } = getPoint(maxStat * scale, i);
        return `${x},${y}`;
    }).join(' ');
  });

  return (
    <div className="relative flex justify-center animate-in fade-in zoom-in-95 duration-500">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        
        {/* 🕸️ Background Web */}
        {webs.map((points, i) => (
            <polygon key={i} points={points} fill="none" stroke="var(--color-life-text)" strokeWidth="1" opacity="0.1" />
        ))}
        
        {/* 📏 Axis Lines */}
        {statOrder.map((_, i) => {
            const { x, y } = getPoint(maxStat, i);
            return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="var(--color-life-text)" strokeWidth="1" opacity="0.1" />;
        })}

        {/* 📊 The Data Polygon (Filled) */}
        <polygon points={points} fill="rgba(251, 191, 36, 0.15)" stroke="#fbbf24" strokeWidth="2" className="drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]" />

        {/* 🏷️ LABELS & ICONS (ForeignObject for HTML/React inside SVG) */}
        {statOrder.map((stat, i) => {
            // Push labels out further (Radius + 40px padding)
            const labelPos = getPoint(maxStat, i, radius + 40); 
            const value = stats[stat];
            const color = STAT_COLORS[stat];

            return (
                <foreignObject 
                  key={stat} 
                  x={labelPos.x - 30} // Offset by half width
                  y={labelPos.y - 25} // Offset by half height
                  width="60" 
                  height="50"
                  className="overflow-visible"
                >
                    <div className="flex flex-col items-center justify-center text-center group cursor-pointer hover:scale-110 transition-transform">
                        {/* Icon Circle */}
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center bg-life-black border shadow-sm mb-1 z-10 relative"
                          style={{ borderColor: `${color}50`, color: color, boxShadow: `0 0 10px ${color}20` }}
                        >
                            <StatIcon stat={stat} size={12} />
                        </div>
                        
                        {/* Text Label */}
                        <div className="flex flex-col leading-none relative z-10 bg-life-black/80 px-1 rounded backdrop-blur-sm">
                            <span className="text-[8px] font-black uppercase tracking-wider text-life-muted group-hover:text-life-text transition-colors">{stat}</span>
                            <span className="text-[10px] font-mono font-bold text-life-text group-hover:text-life-gold transition-colors">{value}</span>
                        </div>
                    </div>
                </foreignObject>
            );
        })}

        {/* 📍 Data Dots (Vertices) */}
        {statOrder.map((stat, i) => {
            const val = Math.min(stats[stat], maxStat);
            const dotPos = getPoint(val, i);
            return <circle key={`dot-${i}`} cx={dotPos.x} cy={dotPos.y} r="3" fill="#fbbf24" stroke="#000" strokeWidth="1" />;
        })}

      </svg>
    </div>
  );
};

export default StatsRadar;
