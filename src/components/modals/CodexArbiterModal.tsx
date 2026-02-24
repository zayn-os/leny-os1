import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Scale, ScrollText, Gavel } from 'lucide-react';
import { useLifeOS } from '../../contexts/LifeOSContext';
import { useTasks } from '../../contexts/TaskContext';
import { useHabits } from '../../contexts/HabitContext';
import { useRaids } from '../../contexts/RaidContext';
import { useShop } from '../../contexts/ShopContext';

const CodexArbiterModal: React.FC = () => {
    const { state, dispatch } = useLifeOS();
    const { taskState } = useTasks();
    const { habitState } = useHabits();
    const { raidState } = useRaids();
    const { shopState } = useShop();
    
    const [copied, setCopied] = useState(false);

    // 🧠 GATHER USER DATA FOR CONTEXT
    const userData = {
        user: {
            level: state.user.level,
            title: state.user.title,
            stats: state.user.stats,
            gold: state.user.gold,
            xp: state.user.currentXP
        },
        activeTasks: taskState.tasks.filter(t => !t.isCompleted).map(t => ({
            title: t.title,
            difficulty: t.difficulty,
            stat: t.stat
        })),
        habits: habitState.habits.map(h => ({
            title: h.title,
            type: h.type
        })),
        activeRaids: raidState.raids.filter(r => r.status === 'active').map(r => ({
            title: r.title,
            difficulty: r.difficulty,
            progress: r.progress
        })),
        shopItems: shopState.storeItems.map(i => ({
            title: i.title,
            cost: i.cost,
            type: i.type
        }))
    };

    const PROMPT_TEXT = `
ROLE: You are the Codex Arbiter (AI_CODEX_GEN).
GOAL: Analyze the user's LifeOS data and generate a strict "Codex of Laws" (Consequences) to enforce discipline.

USER DATA SNAPSHOT:
${JSON.stringify(userData, null, 2)}

INSTRUCTIONS:
1. Analyze their Tasks, Habits, and Raids to identify potential areas of failure or laziness.
2. Create 5-10 "Laws" (Consequences) that punish them for specific failures.
   - Example: "If I miss [Habit Name], I lose 50 Gold."
   - Example: "If I abandon a Raid Step, I lose 100 XP."
   - Example: "If I buy a useless item, I lose 5 Honor."
3. Use the existing Shop Items to suggest "Fines" (e.g., must buy a "Penalty Token").

PENALTY GUIDELINES (DO NOT EXAGGERATE PUNISHMENT):
- **Stat Points:** -1 to -5 (Use sparingly for severe neglect).
- **Gold:** 50 to 1000 G (Scale with severity).
- **XP:** 100 to 1000 XP (Scale with severity).
- **Honor:** 5% to 25% (Reserved for breaking core habits or oaths).

4. RETURN ONLY VALID JSON in the following format (compatible with the injection engine):

{
  "laws": [
    {
      "title": "Law Name (e.g. Neglect of [Habit])",
      "penaltyType": "gold" | "xp" | "stat" | "honor",
      "penaltyValue": 50,
      "statTarget": "DIS" (only if penaltyType is 'stat')
    }
  ]
}

CRITICAL: Return ONLY the JSON. No markdown.
`;

    const handleCopy = () => {
        navigator.clipboard.writeText(PROMPT_TEXT);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-life-black border border-indigo-500/30 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl shadow-indigo-500/10">
                
                {/* HEADER */}
                <div className="p-4 border-b border-life-muted/20 flex items-center justify-between bg-life-paper/50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
                            <Scale size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                                Codex Arbiter <span className="text-[9px] bg-indigo-500 text-white px-1.5 rounded font-mono">V1</span>
                            </h2>
                            <p className="text-[10px] text-life-muted font-mono">Law Generation Protocol</p>
                        </div>
                    </div>
                    <button onClick={() => dispatch.setModal('none')} className="text-life-muted hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    
                    {/* INSTRUCTIONS */}
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex gap-3">
                        <div className="text-indigo-400 mt-1"><Gavel size={18} /></div>
                        <div>
                            <h3 className="text-xs font-bold text-indigo-400 uppercase mb-1">How to Legislate</h3>
                            <ol className="text-[10px] text-life-muted space-y-1 list-decimal list-inside marker:text-indigo-400">
                                <li>Copy the System Prompt below (it includes your data).</li>
                                <li>Open <strong>Google Gemini</strong> (or any AI Chat).</li>
                                <li>Paste the text. The AI will analyze your habits/tasks.</li>
                                <li>It will generate a list of "Laws" (Consequences).</li>
                                <li>Copy the JSON output and paste it into <strong>Data Injection</strong>.</li>
                            </ol>
                        </div>
                    </div>

                    {/* PROMPT DISPLAY */}
                    <div className="relative group">
                        <div className="absolute top-2 right-2 z-10">
                            <button 
                                onClick={handleCopy}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-lg ${copied ? 'bg-green-500 text-black' : 'bg-indigo-500 text-white hover:bg-indigo-400'}`}
                            >
                                {copied ? <Check size={12} /> : <Copy size={12} />}
                                {copied ? 'Copied!' : 'Copy Protocol'}
                            </button>
                        </div>
                        
                        <div className="bg-black border border-life-muted/20 rounded-xl p-4 font-mono text-[10px] text-life-muted/80 whitespace-pre-wrap leading-relaxed overflow-x-auto h-96 custom-scrollbar selection:bg-indigo-500/30 selection:text-white">
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

export default CodexArbiterModal;
