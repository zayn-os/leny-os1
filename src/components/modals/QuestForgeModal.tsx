import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Brain, Zap, ScrollText } from 'lucide-react';
import { useLifeOS } from '../../contexts/LifeOSContext';

const QuestForgeModal: React.FC = () => {
    const { dispatch } = useLifeOS();
    const [copied, setCopied] = useState(false);

    const PROMPT_TEXT = `ROLE: You are "The Quest Forge" (مصنع المهام).
GOAL: Generate RPG-style quests (Tasks) for a high-performance individual.

WHEN I ASK FOR A MISSION, OUTPUT A VALID JSON OBJECT.
DO NOT CHAT. JUST OUTPUT THE JSON.

--- INPUT ---
I will describe a goal, or provide an existing Task JSON to modify.

--- OUTPUT RULES ---
1. **Updates:** If I provide an "id" (e.g., "t_123..."), YOU MUST include it in the output to UPDATE that task instead of creating a new one.
2. **Title:** Action-oriented (e.g., "Operation: Deep Dive").
3. **Difficulty:** "easy" (Scout), "normal" (Infantry), "hard" (SpecOps).
4. **Stat:** [STR, INT, DIS, HEA, CRT, SPR, REL, FIN].
5. **Skill Link:** If known, link to a skill ID (e.g., "s_coding").
6. **Reminders:** Array of minutes before due (e.g., [15, 60] = 15 mins & 1 hour before).
7. **Campaign:** Set "isCampaign": true if this is a strategic quarterly goal (G12).
8. **Time:**
   - "scheduledTime": ISO String (YYYY-MM-DDTHH:mm) for specific execution time.
   - "deadline": YYYY-MM-DD for due date.
   - "durationMinutes": Number (if timed session).

--- JSON TEMPLATE ---

\`\`\`json
{
  "tasks": [
    {
      "id": "OPTIONAL_ID_FOR_UPDATE",
      "title": "QUEST_TITLE",
      "difficulty": "hard",
      "stat": "INT",
      "skillId": "OPTIONAL_SKILL_ID",
      "description": "🎯 Objective: ... \\n🔗 Skill: ...",
      "subtasks": [
        "Step 1 (5m)",
        "Step 2 (10m)"
      ],
      "reminders": [15, 30],
      "isTimed": true,
      "durationMinutes": 45,
      "scheduledTime": "2024-10-25T09:00:00",
      "deadline": "2024-10-25",
      "energyLevel": "high",
      "isCampaign": false
    }
  ],
  "habits": [
    {
      "title": "HABIT_TITLE",
      "difficulty": "normal",
      "stat": "DIS",
      "skillId": "OPTIONAL_SKILL_ID",
      "type": "daily",
      "dailyTarget": 5,
      "description": "e.g. Drink 5 glasses of water"
    }
  ]
}
\`\`\`

--- EXAMPLES ---

**Input:** "Study Physics tomorrow at 10 AM, remind me 30 mins before."
**Output:**
\`\`\`json
{
  "tasks": [
    {
      "title": "Operation: Quantum Mechanics",
      "difficulty": "hard",
      "stat": "INT",
      "description": "🎯 Focus: Thermodynamics Chapter 4.",
      "subtasks": ["Review Notes", "Solve 3 Problems"],
      "scheduledTime": "2024-10-26T10:00:00",
      "reminders": [30],
      "isTimed": true,
      "durationMinutes": 60
    }
  ]
}
\`\`\`

**Input:** "Update task 't_999' to be harder and add a subtask."
**Output:**
\`\`\`json
{
  "tasks": [
    {
      "id": "t_999",
      "difficulty": "hard",
      "subtasks": ["Original Step 1", "New Step 2"]
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
            <div className="bg-life-black border border-life-gold/30 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl shadow-life-gold/10">
                
                {/* HEADER */}
                <div className="p-4 border-b border-life-muted/20 flex items-center justify-between bg-life-paper/50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-life-gold/10 rounded-lg text-life-gold border border-life-gold/20">
                            <Brain size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-life-gold flex items-center gap-2">
                                The Quest Forge <span className="text-[9px] bg-life-gold text-black px-1.5 rounded font-mono">V5</span>
                            </h2>
                            <p className="text-[10px] text-life-muted font-mono">AI Protocol Configuration</p>
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
                        <div className="text-blue-400 mt-1"><ScrollText size={18} /></div>
                        <div>
                            <h3 className="text-xs font-bold text-blue-300 uppercase mb-1">How to Initialize</h3>
                            <ol className="text-[10px] text-life-muted space-y-1 list-decimal list-inside marker:text-blue-500">
                                <li>Copy the System Prompt below.</li>
                                <li>Open <strong>Google Gemini</strong> (or any AI Chat).</li>
                                <li>Paste the text into the <strong>"System Instructions"</strong> or start a new chat with it.</li>
                                <li>Command the AI to generate tasks (e.g., "Study for exam").</li>
                                <li>Copy the JSON output and paste it into <strong>Data Injection</strong>.</li>
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

export default QuestForgeModal;
