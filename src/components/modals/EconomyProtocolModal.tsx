import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Coins, ScrollText, TrendingUp } from 'lucide-react';
import { useLifeOS } from '../../contexts/LifeOSContext';

const EconomyProtocolModal: React.FC = () => {
    const { dispatch } = useLifeOS();
    const [copied, setCopied] = useState(false);

    const PROMPT_TEXT = `ROLE: You are "The Treasury Archive" (سجل الخزينة).
GOAL: Understand the LifeOS Economy (XP, Gold, & Stats) to advise on growth strategies.

--- 1. CURRENCY & GROWTH ---
- **XP (Experience):** Levels up the User and Skills.
- **Gold (G):** Currency to buy Items, Themes, and Potions.
- **Stats (Attributes):** Core attributes (STR, INT, DIS, etc.) that level up based on actions.

--- 2. INCOME SOURCES (REVENUE STREAMS) ---

A. ACTIVE DUTY (Tasks & Habits)
   - **Easy:** 
     - XP: 20 | Gold: 10
     - Stat Points: +0.5 (to the linked Stat)
   - **Normal:** 
     - XP: 50 | Gold: 30
     - Stat Points: +1 (to the linked Stat)
   - **Hard:** 
     - XP: 100 | Gold: 100
     - Stat Points: +2 (to the linked Stat)
   
   * Note: Habits build "Streaks". High streaks increase "Daily Salary".
   * **Repetitions (Reps):** Habits can have a "Daily Target" (e.g., Drink Water 8x). 
     - Rewards and Streaks are ONLY awarded after ALL reps are completed.
     - Partial reps do not grant XP/Gold but prevent "Failure" penalties if at least 1 rep is done.

B. OPERATIONS (Raids)
   - **Raid Step (Sub-objective):** 
     - Treated as a Task based on difficulty (Easy/Normal/Hard).
     - Grants XP, Gold, and Stat Points immediately upon completion.
   - **Raid Completion (Victory):** 
     - **Bonus:** 5x the rewards of the final step.
     - **Loot:** Chance for rare items or badges.

C. DAILY SALARY (The Streak)
   - **Easy Mode:** Requires 300 XP.
   - **Normal Mode:** Requires 400 XP.
   - **Hard Mode:** Requires 500 XP.
   - Reward: 50-200 Gold (Scales with Streak length).

D. ACHIEVEMENTS (Badges)
   - **Bronze:** 500 XP | 100 G
   - **Silver:** 1000 XP | 250 G
   - **Gold:** 2000 XP | 500 G
   - **Diamond:** 5000 XP | 1000 G

--- 3. EXPENDITURES (GOLD USAGE) ---
- **Potions:** Restore Energy or Health (Cost: 50-150 G).
- **Artifacts:** Permanent buffs to XP/Gold gain (Cost: 500-5000 G).
- **Themes:** Visual skins for the OS (Cost: 1000+ G).
- **Penalties:** Failing tasks/habits deducts Gold.

--- 4. SKILL MASTERY ---
- Every Task/Habit linked to a Skill (e.g., "Coding") feeds 50% of its XP to that Skill.
- Leveling Skills unlocks specialized Badges.

--- HOW TO USE THIS DATA ---
When I ask "How do I get rich?" or "Plan my leveling", use these values to calculate the optimal path.`;

    const handleCopy = () => {
        navigator.clipboard.writeText(PROMPT_TEXT);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-life-black border border-life-gold/30 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl shadow-life-gold/10">
                
                {/* HEADER */}
                <div className="p-4 border-b border-life-muted/20 flex items-center justify-between bg-life-paper/50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-life-gold/10 rounded-lg text-life-gold border border-life-gold/20">
                            <Coins size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-life-gold flex items-center gap-2">
                                The Treasury Archive <span className="text-[9px] bg-life-gold text-black px-1.5 rounded font-mono">V1</span>
                            </h2>
                            <p className="text-[10px] text-life-muted font-mono">Economy Logic Protocol</p>
                        </div>
                    </div>
                    <button onClick={() => dispatch.setModal('none')} className="text-life-muted hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    
                    {/* INSTRUCTIONS */}
                    <div className="bg-life-gold/10 border border-life-gold/20 rounded-xl p-4 flex gap-3">
                        <div className="text-life-gold mt-1"><ScrollText size={18} /></div>
                        <div>
                            <h3 className="text-xs font-bold text-life-gold uppercase mb-1">How to Initialize</h3>
                            <ol className="text-[10px] text-life-muted space-y-1 list-decimal list-inside marker:text-life-gold">
                                <li>Copy the System Prompt below.</li>
                                <li>Paste it into your AI's <strong>"System Instructions"</strong>.</li>
                                <li>Now the AI understands how to reward you and plan your economy.</li>
                            </ol>
                        </div>
                    </div>

                    {/* PROMPT DISPLAY */}
                    <div className="relative group">
                        <div className="absolute top-2 right-2 z-10">
                            <button 
                                onClick={handleCopy}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-lg ${copied ? 'bg-green-500 text-black' : 'bg-life-gold text-black hover:bg-yellow-400'}`}
                            >
                                {copied ? <Check size={12} /> : <Copy size={12} />}
                                {copied ? 'Copied!' : 'Copy Protocol'}
                            </button>
                        </div>
                        
                        <div className="bg-black border border-life-muted/20 rounded-xl p-4 font-mono text-[10px] text-life-muted/80 whitespace-pre-wrap leading-relaxed overflow-x-auto h-96 custom-scrollbar selection:bg-life-gold/30 selection:text-white">
                            {PROMPT_TEXT}
                        </div>
                    </div>

                </div>

                {/* FOOTER */}
                <div className="p-4 border-t border-life-muted/20 bg-life-paper/30 rounded-b-2xl flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[9px] text-life-muted opacity-50">
                        <Terminal size={12} />
                        <span>Compatible with Gemini 1.5+, GPT-4, Claude 3</span>
                    </div>
                    <button 
                        onClick={() => dispatch.setModal('none')}
                        className="px-4 py-2 rounded-lg bg-life-muted/10 hover:bg-life-muted/20 text-xs font-bold text-life-muted transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EconomyProtocolModal;
