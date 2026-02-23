import React from 'react';
import { AlertTriangle, Zap, Coins, Activity, Award, X } from 'lucide-react';

interface Props {
    onClose: () => void;
}

export const ConsequencesGuide: React.FC<Props> = ({ onClose }) => {
    return (
        <div className="bg-life-black border border-zinc-800 rounded-xl p-4 mb-6 animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-red-900/20 rounded-lg text-red-500">
                        <AlertTriangle size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-life-text uppercase tracking-wider">Sentencing Guidelines</h3>
                        <p className="text-[10px] text-life-muted">Economy of Pain & Discipline</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-life-muted hover:text-white"><X size={16} /></button>
            </div>

            <div className="space-y-4">
                {/* XP ECONOMY */}
                <div className="grid grid-cols-[1fr_2fr] gap-3 items-center border-b border-zinc-800 pb-3">
                    <div className="text-right pr-2 border-r border-zinc-800">
                        <div className="text-blue-400 font-black text-xs">XP (Experience)</div>
                        <div className="text-[9px] text-life-muted">Growth Metric</div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-life-muted">
                            <span>Easy Mission Reward</span>
                            <span className="text-life-easy">+100 XP</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-life-muted">
                            <span>Hard Mission Reward</span>
                            <span className="text-life-gold">+500 XP</span>
                        </div>
                        <div className="mt-1 p-2 bg-red-950/10 rounded border border-red-900/20">
                            <div className="text-[9px] text-red-400 font-bold mb-1">Recommended Penalties:</div>
                            <div className="grid grid-cols-2 gap-2 text-[9px]">
                                <span className="text-zinc-400">Minor Slip</span> <span className="text-red-400">-50 XP</span>
                                <span className="text-zinc-400">Bad Habit</span> <span className="text-red-400">-200 XP</span>
                                <span className="text-zinc-400">Major Failure</span> <span className="text-red-400">-1000 XP</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* GOLD ECONOMY */}
                <div className="grid grid-cols-[1fr_2fr] gap-3 items-center border-b border-zinc-800 pb-3">
                    <div className="text-right pr-2 border-r border-zinc-800">
                        <div className="text-life-gold font-black text-xs">Gold (Currency)</div>
                        <div className="text-[9px] text-life-muted">Reward Power</div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-life-muted">
                            <span>1 Hour of Work</span>
                            <span className="text-life-gold">~50-100 G</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-life-muted">
                            <span>Day of Perfection</span>
                            <span className="text-life-gold">~500 G</span>
                        </div>
                        <div className="mt-1 p-2 bg-red-950/10 rounded border border-red-900/20">
                            <div className="text-[9px] text-red-400 font-bold mb-1">Fines:</div>
                            <div className="grid grid-cols-2 gap-2 text-[9px]">
                                <span className="text-zinc-400">Wasted Time</span> <span className="text-red-400">-10 G / min</span>
                                <span className="text-zinc-400">Impulse Buy</span> <span className="text-red-400">-100 G</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* STAT ECONOMY */}
                <div className="grid grid-cols-[1fr_2fr] gap-3 items-center border-b border-zinc-800 pb-3">
                    <div className="text-right pr-2 border-r border-zinc-800">
                        <div className="text-purple-400 font-black text-xs">Attributes</div>
                        <div className="text-[9px] text-life-muted">Core Stats</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-[10px] text-zinc-400 leading-relaxed">
                            Stats are <span className="text-white font-bold">extremely hard</span> to earn. You only get <span className="text-purple-400">+1</span> per completed mission.
                        </div>
                        <div className="mt-1 p-2 bg-red-950/10 rounded border border-red-900/20">
                            <div className="text-[9px] text-red-400 font-bold mb-1">Severe Punishment:</div>
                            <div className="text-[9px] text-zinc-400">
                                Losing <span className="text-red-400">-1 Stat</span> is equivalent to erasing a completed mission from your history. Use sparingly for character flaws (e.g., Anger = -1 EMT).
                            </div>
                        </div>
                    </div>
                </div>

                {/* HONOR ECONOMY */}
                <div className="grid grid-cols-[1fr_2fr] gap-3 items-center">
                    <div className="text-right pr-2 border-r border-zinc-800">
                        <div className="text-indigo-400 font-black text-xs">Honor</div>
                        <div className="text-[9px] text-life-muted">Integrity Score</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-[10px] text-zinc-400 leading-relaxed">
                            Your daily score starts at <span className="text-indigo-400">100%</span>.
                        </div>
                        <div className="mt-1 p-2 bg-red-950/10 rounded border border-red-900/20">
                            <div className="text-[9px] text-red-400 font-bold mb-1">Impact:</div>
                            <div className="grid grid-cols-2 gap-2 text-[9px]">
                                <span className="text-zinc-400">Disappointment</span> <span className="text-red-400">-5%</span>
                                <span className="text-zinc-400">Broken Promise</span> <span className="text-red-400">-20%</span>
                                <span className="text-zinc-400">Betrayal</span> <span className="text-red-400">-50%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
