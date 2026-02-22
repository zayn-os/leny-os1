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
5. **Category:** One of: "growth", "combat", "wealth", "social", "system".
6. **Tiers:** 
   - **Standard Badges:** Must have 4 tiers: "silver", "gold", "diamond", "crimson".
   - **Honor Badges:** Must have 7 tiers: "wood", "iron", "copper", "silver", "gold", "diamond", "crimson".
7. **System Badges:** If the badge is related to system stats (e.g., Streak), ensure the criteria matches the system logic (e.g., "7 Day Streak" requires checking the global streak counter).
8. **XP Reward:** Base XP for unlocking the badge.

--- JSON TEMPLATE ---

\`\`\`json
{
  "badges": [
    {
      "id": "badge_unique_id",
      "name": "Badge Name",
      "description": "Unlock criteria description.",
      "icon": "Award",
      "category": "growth",
      "tiers": {
        "silver": "Criteria for Silver",
        "gold": "Criteria for Gold",
        "diamond": "Criteria for Diamond",
        "crimson": "Criteria for Crimson"
      },
      "xpReward": 500
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
      "category": "growth",
      "tiers": {
        "silver": "Read 5 Books",
        "gold": "Read 20 Books",
        "diamond": "Read 50 Books",
        "crimson": "Read 100 Books"
      },
      "xpReward": 300
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
      "category": "system",
      "tiers": {
        "silver": "7 Day Streak",
        "gold": "30 Day Streak",
        "diamond": "100 Day Streak",
        "crimson": "365 Day Streak"
      },
      "xpReward": 1000
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
