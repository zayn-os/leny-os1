import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Shield, ScrollText } from 'lucide-react';
import { useLifeOS } from '../../contexts/LifeOSContext';

const RaidProtocolModal: React.FC = () => {
    const { dispatch } = useLifeOS();
    const [copied, setCopied] = useState(false);

    const PROMPT_TEXT = `ROLE: You are "The War Room" (غرفة العمليات).
GOAL: Plan complex Operations (Raids) for a high-performance individual.

WHEN I ASK FOR A RAID, OUTPUT A VALID JSON OBJECT.
DO NOT CHAT. JUST OUTPUT THE JSON.

--- INPUT ---
I will describe a project, goal, or campaign.

--- OUTPUT RULES ---
1. **Structure:** A Raid is a container for multiple "Steps" (Missions).
2. **Title:** Military/Tactical naming (e.g., "Operation: Apollo").
3. **Difficulty:** "easy", "normal", "hard".
4. **Stat:** Primary attribute [STR, INT, DIS, CAM, CRT, PCE, EMT].
5. **Skill Link:** If known, link to a skill ID (e.g., "s_coding").
6. **Steps (The Missions):**
   - Each step acts like a Task.
   - **Inheritance:** Steps inherit Difficulty/Stat from the Raid unless specified.
   - **Anomalies:** You CAN override a step's difficulty/stat (e.g., a "Hard" step in a "Normal" raid).
   - **Skill Lock:** Steps ALWAYS inherit the Raid's Skill. You cannot change this per step.

--- JSON TEMPLATE ---

\`\`\`json
{
  "raids": [
    {
      "id": "OPTIONAL_ID_FOR_UPDATE",
      "title": "Operation: PROJECT_NAME",
      "difficulty": "hard",
      "stat": "INT",
      "skillId": "OPTIONAL_SKILL_ID",
      "description": "Brief tactical overview.",
      "deadline": "YYYY-MM-DD",
      "steps": [
        {
          "title": "Phase 1: Recon",
          "difficulty": "easy", 
          "stat": "INT",
          "subtasks": ["Research", "Draft Plan"]
        },
        {
          "title": "Phase 2: Execution",
          "difficulty": "hard",
          "stat": "DIS", 
          "isTimed": true,
          "durationMinutes": 120
        }
      ]
    }
  ]
}
\`\`\`

--- EXAMPLES ---

**Input:** "Plan a workout month. 3 days cardio, 3 days weights."
**Output:**
\`\`\`json
{
  "raids": [
    {
      "title": "Operation: Iron Body",
      "difficulty": "hard",
      "stat": "STR",
      "description": "Monthly physical conditioning cycle.",
      "steps": [
        { "title": "Week 1: Endurance", "difficulty": "normal", "stat": "STR" },
        { "title": "Week 2: Hypertrophy", "difficulty": "hard", "stat": "STR" }
      ]
    }
  ]
}
\`\`\`

**Input:** "Launch a blog. Needs design and coding."
**Output:**
\`\`\`json
{
  "raids": [
    {
      "title": "Operation: Digital Voice",
      "difficulty": "normal",
      "stat": "INT",
      "steps": [
        { "title": "UI Design", "stat": "CRT", "difficulty": "normal" },
        { "title": "Backend Setup", "stat": "INT", "difficulty": "hard" }
      ]
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
            <div className="bg-life-black border border-red-500/30 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl shadow-red-500/10">
                
                {/* HEADER */}
                <div className="p-4 border-b border-life-muted/20 flex items-center justify-between bg-life-paper/50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg text-red-500 border border-red-500/20">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                                The War Room <span className="text-[9px] bg-red-500 text-black px-1.5 rounded font-mono">V1</span>
                            </h2>
                            <p className="text-[10px] text-life-muted font-mono">Raid Operations Protocol</p>
                        </div>
                    </div>
                    <button onClick={() => dispatch.setModal('none')} className="text-life-muted hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    
                    {/* INSTRUCTIONS */}
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3">
                        <div className="text-red-500 mt-1"><ScrollText size={18} /></div>
                        <div>
                            <h3 className="text-xs font-bold text-red-500 uppercase mb-1">How to Initialize</h3>
                            <ol className="text-[10px] text-life-muted space-y-1 list-decimal list-inside marker:text-red-500">
                                <li>Copy the System Prompt below.</li>
                                <li>Paste it into your AI's <strong>"System Instructions"</strong>.</li>
                                <li>Command the AI to plan complex projects (e.g., "Plan a marketing campaign").</li>
                                <li>Copy the JSON output and paste it into <strong>Data Injection</strong>.</li>
                            </ol>
                        </div>
                    </div>

                    {/* PROMPT DISPLAY */}
                    <div className="relative group">
                        <div className="absolute top-2 right-2 z-10">
                            <button 
                                onClick={handleCopy}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-lg ${copied ? 'bg-green-500 text-black' : 'bg-red-500 text-black hover:bg-red-400'}`}
                            >
                                {copied ? <Check size={12} /> : <Copy size={12} />}
                                {copied ? 'Copied!' : 'Copy Protocol'}
                            </button>
                        </div>
                        
                        <div className="bg-black border border-life-muted/20 rounded-xl p-4 font-mono text-[10px] text-life-muted/80 whitespace-pre-wrap leading-relaxed overflow-x-auto h-96 custom-scrollbar selection:bg-red-500/30 selection:text-white">
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

export default RaidProtocolModal;
