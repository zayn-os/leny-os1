import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Brain, Zap, ScrollText, Activity } from 'lucide-react';
import { useLifeOS } from '../../contexts/LifeOSContext';

const HabitProtocolModal: React.FC = () => {
    const { dispatch } = useLifeOS();
    const [copied, setCopied] = useState(false);

    const PROMPT_TEXT = `ROLE: You are "The Protocol Foundry" (مصنع العادات).
GOAL: Design sustainable Habits (Protocols).

WHEN I ASK FOR A HABIT, OUTPUT A VALID JSON OBJECT.
DO NOT CHAT. JUST OUTPUT THE JSON.

--- INPUT ---
I will describe a routine, or provide an existing Habit JSON to modify.

--- OUTPUT RULES ---
1. **Updates:** If I provide an "id" (e.g., "h_123..."), YOU MUST include it to UPDATE the habit.
2. **Algorithm (Type):** "daily", "specific_days" (requires "specificDays": [0-6]), "interval" (requires "intervalValue": number).
3. **Repetitions:** Use "dailyTarget" (number) for habits that repeat within a day (e.g., "Drink Water" with dailyTarget: 8).
4. **Subtasks:** Habits can have steps! (e.g., Routine -> [Drink Water, Stretch]).
5. **Difficulty:** "easy", "normal", "hard".
6. **Stat:** Primary attribute [STR, INT, DIS, HEA, CRT, SPR, REL, FIN].
7. **Skill Link:** If known, link to a skill ID (e.g., "s_coding").
8. **Reminders:** Array of minutes before (e.g., [0, 10]).
9. **Time:** "scheduledTime" (24h format "HH:mm").

--- JSON TEMPLATE ---

\`\`\`json
{
  "habits": [
    {
      "id": "OPTIONAL_ID_FOR_UPDATE",
      "title": "HABIT_TITLE",
      "stat": "DIS",
      "skillId": "OPTIONAL_SKILL_ID",
      "difficulty": "normal",
      "type": "daily", 
      "dailyTarget": 1,
      "scheduledTime": "07:00",
      "reminders": [0],
      "subtasks": [
        { "title": "Step 1" },
        { "title": "Step 2" }
      ],
      "description": "🎯 Cue: ..."
    }
  ]
}
\`\`\`

--- EXAMPLES ---

**Input:** "Create a Morning Routine (Water, Meditate, Plan) at 6 AM."
**Output:**
\`\`\`json
{
  "habits": [
    {
      "title": "Protocol: Morning Prime",
      "stat": "SPR",
      "difficulty": "hard",
      "type": "daily",
      "dailyTarget": 1,
      "scheduledTime": "06:00",
      "reminders": [0],
      "subtasks": [
        { "title": "Hydrate (500ml)" },
        { "title": "Meditate (10m)" },
        { "title": "Tactical Planning" }
      ]
    }
  ]
}
\`\`\`

**Input:** "Drink 8 glasses of water daily."
**Output:**
\`\`\`json
{
  "habits": [
    {
      "title": "Protocol: Hydration",
      "stat": "HEA",
      "difficulty": "easy",
      "type": "daily",
      "dailyTarget": 8,
      "description": "🎯 Goal: 8 glasses (250ml each)."
    }
  ]
}
\`\`\`

**Input:** "Update habit 'h_555' to be every 2 days."
**Output:**
\`\`\`json
{
  "habits": [
    {
      "id": "h_555",
      "type": "interval",
      "intervalValue": 2
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
            <div className="bg-life-black border border-life-easy/30 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl shadow-life-easy/10">
                
                {/* HEADER */}
                <div className="p-4 border-b border-life-muted/20 flex items-center justify-between bg-life-paper/50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-life-easy/10 rounded-lg text-life-easy border border-life-easy/20">
                            <Activity size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-life-easy flex items-center gap-2">
                                The Protocol Foundry <span className="text-[9px] bg-life-easy text-black px-1.5 rounded font-mono">V2</span>
                            </h2>
                            <p className="text-[10px] text-life-muted font-mono">Habit Engineering Protocol</p>
                        </div>
                    </div>
                    <button onClick={() => dispatch.setModal('none')} className="text-life-muted hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    
                    {/* INSTRUCTIONS */}
                    <div className="bg-life-easy/10 border border-life-easy/20 rounded-xl p-4 flex gap-3">
                        <div className="text-life-easy mt-1"><ScrollText size={18} /></div>
                        <div>
                            <h3 className="text-xs font-bold text-life-easy uppercase mb-1">How to Initialize</h3>
                            <ol className="text-[10px] text-life-muted space-y-1 list-decimal list-inside marker:text-life-easy">
                                <li>Copy the System Prompt below.</li>
                                <li>Open <strong>Google Gemini</strong> (or any AI Chat).</li>
                                <li>Paste the text into the <strong>"System Instructions"</strong>.</li>
                                <li>Command the AI to design habits (e.g., "Build a morning routine").</li>
                                <li>Copy the JSON output and paste it into <strong>Data Injection</strong>.</li>
                            </ol>
                        </div>
                    </div>

                    {/* PROMPT DISPLAY */}
                    <div className="relative group">
                        <div className="absolute top-2 right-2 z-10">
                            <button 
                                onClick={handleCopy}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-lg ${copied ? 'bg-green-500 text-black' : 'bg-life-easy text-black hover:bg-emerald-400'}`}
                            >
                                {copied ? <Check size={12} /> : <Copy size={12} />}
                                {copied ? 'Copied!' : 'Copy Protocol'}
                            </button>
                        </div>
                        
                        <div className="bg-black border border-life-muted/20 rounded-xl p-4 font-mono text-[10px] text-life-muted/80 whitespace-pre-wrap leading-relaxed overflow-x-auto h-96 custom-scrollbar selection:bg-life-easy/30 selection:text-white">
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

export default HabitProtocolModal;
