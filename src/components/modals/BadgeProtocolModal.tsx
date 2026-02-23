import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Award, ScrollText } from 'lucide-react';
import { useLifeOS } from '../../contexts/LifeOSContext';

const BadgeProtocolModal: React.FC = () => {
    const { dispatch } = useLifeOS();
    const [copied, setCopied] = useState(false);

    const PROMPT_TEXT = `ROLE: You are "The Badge Architect" (صانع الأوسمة).
GOAL: Generate achievement badges for a gamified life operating system.

WHEN I ASK FOR BADGES, OUTPUT A VALID JSON OBJECT.
DO NOT CHAT. JUST OUTPUT THE JSON.

--- INPUT ---
I will describe a category (e.g., "Fitness", "Coding") or a specific achievement.

--- OUTPUT RULES ---
1. **ID:** Unique identifier (snake_case), e.g., "early_riser".
2. **Name:** Creative title (e.g., "Dawn Breaker").
3. **Description:** Clear criteria for unlocking.
4. **Icon:** A valid Lucide React icon name (e.g., "Sun", "Dumbbell", "Code").
5. **Category:** One of: "progression", "combat", "warfare", "consistency", "resilience", "economy", "mastery", "skill", "special".
6. **Trigger Type:** One of: "stat", "metric", "manual", "skill", "habit", "raid".
7. **Metric Key:** The specific metric to track (e.g., "totalTasksCompleted", "stats.STR", or the exact Habit Title).
8. **Levels:** Array of 4 tiers ("silver", "gold", "diamond", "crimson"). Each level needs a "target" (number), "quote" (string), and "rewards" (xp and gold).

--- JSON TEMPLATE ---

\`\`\`json
{
  "badges": [
    {
      "id": "badge_unique_id",
      "name": "Badge Name",
      "description": "Unlock criteria description.",
      "icon": "Award",
      "category": "combat",
      "triggerType": "metric",
      "metricKey": "totalTasksCompleted",
      "levels": [
        {
          "tier": "silver",
          "target": 10,
          "quote": "A good start.",
          "rewards": { "xp": 100, "gold": 50 }
        },
        {
          "tier": "gold",
          "target": 50,
          "quote": "You are getting stronger.",
          "rewards": { "xp": 250, "gold": 100 }
        },
        {
          "tier": "diamond",
          "target": 100,
          "quote": "Unstoppable force.",
          "rewards": { "xp": 500, "gold": 250 }
        },
        {
          "tier": "crimson",
          "target": 500,
          "quote": "A legend is born.",
          "rewards": { "xp": 1000, "gold": 500 }
        }
      ]
    }
  ]
}
\`\`\`

--- EXAMPLES ---

**Input:** "Create a badge for reading books."
**Output:**
\`\`\`json
{
  "badges": [
    {
      "id": "badge_bookworm",
      "name": "Keeper of Knowledge",
      "description": "Awarded for consistent reading habits.",
      "icon": "BookOpen",
      "category": "special",
      "triggerType": "habit",
      "metricKey": "Read a Book",
      "levels": [
        {
          "tier": "silver",
          "target": 5,
          "quote": "The mind is a muscle.",
          "rewards": { "xp": 100, "gold": 50 }
        },
        {
          "tier": "gold",
          "target": 20,
          "quote": "Knowledge is power.",
          "rewards": { "xp": 250, "gold": 100 }
        },
        {
          "tier": "diamond",
          "target": 50,
          "quote": "A library in your head.",
          "rewards": { "xp": 500, "gold": 250 }
        },
        {
          "tier": "crimson",
          "target": 100,
          "quote": "Omniscience achieved.",
          "rewards": { "xp": 1000, "gold": 500 }
        }
      ]
    }
  ]
}
\`\`\`

**Input:** "Create a system badge for daily streaks."
**Output:**
\`\`\`json
{
  "badges": [
    {
      "id": "badge_streak_master",
      "name": "Time Walker",
      "description": "Awarded for maintaining a daily streak.",
      "icon": "Flame",
      "category": "consistency",
      "triggerType": "metric",
      "metricKey": "currentStreak",
      "levels": [
        {
          "tier": "silver",
          "target": 7,
          "quote": "A week of focus.",
          "rewards": { "xp": 100, "gold": 50 }
        },
        {
          "tier": "gold",
          "target": 30,
          "quote": "A month of discipline.",
          "rewards": { "xp": 250, "gold": 100 }
        },
        {
          "tier": "diamond",
          "target": 100,
          "quote": "A hundred days of power.",
          "rewards": { "xp": 500, "gold": 250 }
        },
        {
          "tier": "crimson",
          "target": 365,
          "quote": "A year of mastery.",
          "rewards": { "xp": 1000, "gold": 500 }
        }
      ]
    }
  ]
}
\`\`\`
`;

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
                            <Award size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-life-gold flex items-center gap-2">
                                Badge Architect <span className="text-[9px] bg-life-gold text-black px-1.5 rounded font-mono">V1</span>
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
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex gap-3">
                        <div className="text-purple-400 mt-1"><ScrollText size={18} /></div>
                        <div>
                            <h3 className="text-xs font-bold text-purple-300 uppercase mb-1">How to Initialize</h3>
                            <ol className="text-[10px] text-life-muted space-y-1 list-decimal list-inside marker:text-purple-500">
                                <li>Copy the System Prompt below.</li>
                                <li>Open <strong>Google Gemini</strong> (or any AI Chat).</li>
                                <li>Paste the text into the <strong>"System Instructions"</strong> or start a new chat with it.</li>
                                <li>Command the AI to generate badges (e.g., "Create badges for fitness").</li>
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

export default BadgeProtocolModal;
