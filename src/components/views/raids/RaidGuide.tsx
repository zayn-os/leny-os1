import React from 'react';
import { BookOpen, Copy, CheckSquare, Zap, X } from 'lucide-react';

interface Props {
    onClose: () => void;
}

export const RaidGuide: React.FC<Props> = ({ onClose }) => {
    return (
        <div className="bg-life-black border border-life-muted/20 rounded-xl p-4 mb-6 animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-900/20 rounded-lg text-indigo-400">
                        <BookOpen size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-life-text uppercase tracking-wider">Field Manual: Operations</h3>
                        <p className="text-[10px] text-life-muted">Tactical Guide & AI Uplink</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-life-muted hover:text-white"><X size={16} /></button>
            </div>

            <div className="space-y-4">
                {/* 1. BASICS */}
                <div className="grid grid-cols-[1fr_2fr] gap-3 items-start border-b border-zinc-800 pb-3">
                    <div className="text-right pr-2 border-r border-zinc-800">
                        <div className="text-life-gold font-black text-xs">Structure</div>
                        <div className="text-[9px] text-life-muted">Raid Anatomy</div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] text-zinc-400 leading-relaxed">
                            <span className="text-white font-bold">Raids</span> are multi-step projects. Each step is a tactical objective.
                        </p>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            <div className="bg-life-black p-1.5 rounded border border-zinc-800 text-[9px] text-zinc-500">
                                <span className="text-life-easy font-bold">Easy:</span> +100 XP
                            </div>
                            <div className="bg-life-black p-1.5 rounded border border-zinc-800 text-[9px] text-zinc-500">
                                <span className="text-life-hard font-bold">Hard:</span> +500 XP
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. AI UPDATE FEATURE */}
                <div className="grid grid-cols-[1fr_2fr] gap-3 items-start border-b border-zinc-800 pb-3">
                    <div className="text-right pr-2 border-r border-zinc-800">
                        <div className="text-indigo-400 font-black text-xs">AI Uplink</div>
                        <div className="text-[9px] text-life-muted">Update Steps</div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] text-zinc-400 leading-relaxed">
                            You can ask AI to refine specific steps without rewriting the whole Raid.
                        </p>
                        
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] text-zinc-300">
                                <span className="bg-life-muted/20 p-1 rounded text-life-gold"><CheckSquare size={10} /></span>
                                <span>1. Click <span className="text-life-gold font-bold">Select Mode</span> on Raid Card.</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-300">
                                <span className="bg-life-muted/20 p-1 rounded text-life-gold"><CheckSquare size={10} /></span>
                                <span>2. Select the steps you want to improve.</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-300">
                                <span className="bg-life-muted/20 p-1 rounded text-life-gold"><Copy size={10} /></span>
                                <span>3. Click <span className="text-life-gold font-bold">Copy for AI</span>.</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-300">
                                <span className="bg-life-muted/20 p-1 rounded text-life-gold"><Zap size={10} /></span>
                                <span>4. Paste into AI, then paste result into <span className="text-life-gold font-bold">Data Uplink</span>.</span>
                            </div>
                        </div>

                        <div className="p-2 bg-indigo-900/10 border border-indigo-500/20 rounded text-[9px] text-indigo-300 italic">
                            "The system will intelligently merge the new details into your existing progress."
                        </div>
                    </div>
                </div>

                {/* 3. REWARDS */}
                <div className="grid grid-cols-[1fr_2fr] gap-3 items-center">
                    <div className="text-right pr-2 border-r border-zinc-800">
                        <div className="text-purple-400 font-black text-xs">Victory</div>
                        <div className="text-[9px] text-life-muted">Completion</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-[10px] text-zinc-400 leading-relaxed">
                            Completing a Raid grants a massive <span className="text-life-gold font-bold">5x Bonus</span> to XP and Gold.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
