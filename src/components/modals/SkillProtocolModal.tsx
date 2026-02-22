import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Brain, ScrollText } from 'lucide-react';
import { useLifeOS } from '../../contexts/LifeOSContext';

const SkillProtocolModal: React.FC = () => {
    const { dispatch } = useLifeOS();
    const [copied, setCopied] = useState(false);

    const PROMPT_TEXT = `ROLE: You are the Skill Tree Architect.
GOAL: Define and track long-term proficiencies.

1. **Structure:** Skills are the "containers" for XP earned from Tasks/Habits.
2. **Linking:** Every Task/Habit/Raid SHOULD be linked to a \`skillId\` if possible.
   - When a task is completed, 50% of its XP goes to the linked Skill.
3. **Leveling:**
   - Skills level up independently from the User Level.
   - **Formula:** Next Level XP = 100 * (Level ^ 1.5).
   - **Ranks:**
     - Level 1-9: Novice
     - Level 10-24: Adept
     - Level 25-49: Expert
     - Level 50-99: Master
     - Level 100+: Grandmaster
4. **Rust:** Skills decay if not practiced for 30 days (Rust State).
   - To cure rust: Complete a task linked to that skill.

--- JSON TEMPLATE (SKILLS) ---

\`\`\`json
{
  "skills": [
    {
      "title": "Python Programming",
      "relatedStats": ["INT", "CRT"],
      "description": "Backend development and data science."
    }
  ]
}
\`\`\`

--- EXAMPLES ---

**Input:** "I want to learn Guitar."
**Output:**
\`\`\`json
{
  "skills": [
    {
      "title": "Guitar Mastery",
      "relatedStats": ["CRT", "DIS"],
      "description": "Acoustic and Electric guitar techniques."
    }
  ]
}
\`\`\`

**Input:** "Add a skill for Cooking."
**Output:**
\`\`\`json
{
  "skills": [
    {
      "title": "Culinary Arts",
      "relatedStats": ["CRT", "PCE"],
      "description": "Mastering flavors and techniques."
    }
  ]
}
\`\`\``;

    const handleCopy = () => {
        navigator.clipboard.writeText(PROMPT_TEXT);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-life-black border border-blue-500/30 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl shadow-blue-500/10">
                
                {/* HEADER */}
                <div className="p-4 border-b border-life-muted/20 flex items-center justify-between bg-life-paper/50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 border border-blue-500/20">
                            <Brain size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
                                Skill Tree Architect <span className="text-[9px] bg-blue-500 text-black px-1.5 rounded font-mono">V1</span>
                            </h2>
                            <p className="text-[10px] text-life-muted font-mono">Mastery Protocol</p>
                        </div>
                    </div>
                    <button onClick={() => dispatch.setModal('none')} className="text-life-muted hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    
                    {/* INSTRUCTIONS */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
                        <div className="text-blue-500 mt-1"><ScrollText size={18} /></div>
                        <div>
                            <h3 className="text-xs font-bold text-blue-500 uppercase mb-1">How to Initialize</h3>
                            <ol className="text-[10px] text-life-muted space-y-1 list-decimal list-inside marker:text-blue-500">
                                <li>Copy the System Prompt below.</li>
                                <li>Paste it into your AI's <strong>"System Instructions"</strong>.</li>
                                <li>Command the AI to define new skills (e.g., "Add a skill for Guitar").</li>
                                <li>Copy the JSON output and paste it into <strong>Data Injection</strong>.</li>
                            </ol>
                        </div>
                    </div>

                    {/* PROMPT DISPLAY */}
                    <div className="relative group">
                        <div className="absolute top-2 right-2 z-10">
                            <button 
                                onClick={handleCopy}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-lg ${copied ? 'bg-green-500 text-black' : 'bg-blue-500 text-black hover:bg-blue-400'}`}
                            >
                                {copied ? <Check size={12} /> : <Copy size={12} />}
                                {copied ? 'Copied!' : 'Copy Protocol'}
                            </button>
                        </div>
                        
                        <div className="bg-black border border-life-muted/20 rounded-xl p-4 font-mono text-[10px] text-life-muted/80 whitespace-pre-wrap leading-relaxed overflow-x-auto h-96 custom-scrollbar selection:bg-blue-500/30 selection:text-white">
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

export default SkillProtocolModal;
