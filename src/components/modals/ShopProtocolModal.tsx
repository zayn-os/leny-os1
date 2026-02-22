import React, { useState } from 'react';
import { X, Copy, Check, Terminal, ShoppingCart, ScrollText, Coins } from 'lucide-react';
import { useLifeOS } from '../../contexts/LifeOSContext';

const ShopProtocolModal: React.FC = () => {
    const { dispatch } = useLifeOS();
    const [copied, setCopied] = useState(false);

    const PROMPT_TEXT = `ROLE: You are "The Bazaar Architect" (مهندس المتجر).
GOAL: Generate RPG-style Shop Items for a gamified productivity app.

WHEN I ASK FOR ITEMS, OUTPUT A VALID JSON OBJECT.
DO NOT CHAT. JUST OUTPUT THE JSON.

--- INPUT ---
I will describe a theme (e.g., "Cyberpunk Gear", "Magic Potions") or specific items.

--- OUTPUT RULES ---
1. **IDs:** Must be unique strings (e.g., "item_cyber_deck").
2. **Type:** 
   - "custom": Consumables (e.g., "Skip Gym", "Cheat Meal").
   - "artifact": Permanent passive bonuses (e.g., +10% INT XP).
   - "redemption": Real-world rewards (e.g., "1 Hour Gaming").
3. **Cost:** Balanced (100-500 for consumables, 1000+ for artifacts).
4. **Icons:** Use Lucide React icon names (e.g., "Zap", "Shield", "Coffee").
5. **Effects:** Only for "artifact" type.
   - "xp_boost": Multiplier for XP (0.1 = +10%).
   - "gold_boost": Multiplier for Gold.
   - "stat": Optional. If set (STR, INT, etc.), applies only to that stat.

--- JSON TEMPLATE ---

\`\`\`json
{
  "storeItems": [
    {
      "id": "item_unique_id",
      "title": "ITEM_NAME",
      "description": "Flavor text description.",
      "cost": 500,
      "icon": "Zap",
      "type": "artifact",
      "isInfinite": false,
      "effect": {
        "type": "xp_boost",
        "value": 0.1,
        "stat": "INT"
      }
    },
    {
      "id": "item_potion_01",
      "title": "Health Potion",
      "description": "Restores energy instantly.",
      "cost": 50,
      "icon": "Heart",
      "type": "custom",
      "isInfinite": true
    }
  ]
}
\`\`\`

--- EXAMPLES ---

**Input:** "Create a set of productivity potions."
**Output:**
\`\`\`json
{
  "storeItems": [
    {
      "id": "pot_focus",
      "title": "Elixir of Focus",
      "description": "Grants deep work capability for 2 hours.",
      "cost": 150,
      "icon": "FlaskConical",
      "type": "custom",
      "isInfinite": true
    },
    {
      "id": "pot_rest",
      "title": "Draught of Sleep",
      "description": "Ensures a perfect night's rest.",
      "cost": 100,
      "icon": "Moon",
      "type": "custom",
      "isInfinite": true
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
            <div className="bg-life-black border border-pink-500/30 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl shadow-pink-500/10">
                
                {/* HEADER */}
                <div className="p-4 border-b border-life-muted/20 flex items-center justify-between bg-life-paper/50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-500/10 rounded-lg text-pink-500 border border-pink-500/20">
                            <ShoppingCart size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-pink-500 flex items-center gap-2">
                                Shop Archives <span className="text-[9px] bg-pink-500 text-black px-1.5 rounded font-mono">V1</span>
                            </h2>
                            <p className="text-[10px] text-life-muted font-mono">AI Economy Protocol</p>
                        </div>
                    </div>
                    <button onClick={() => dispatch.setModal('none')} className="text-life-muted hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    
                    {/* INSTRUCTIONS */}
                    <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4 flex gap-3">
                        <div className="text-pink-400 mt-1"><ScrollText size={18} /></div>
                        <div>
                            <h3 className="text-xs font-bold text-pink-300 uppercase mb-1">How to Initialize</h3>
                            <ol className="text-[10px] text-life-muted space-y-1 list-decimal list-inside marker:text-pink-500">
                                <li>Copy the System Prompt below.</li>
                                <li>Open <strong>Google Gemini</strong> (or any AI Chat).</li>
                                <li>Paste the text into the <strong>"System Instructions"</strong> or start a new chat with it.</li>
                                <li>Command the AI to generate items (e.g., "Create legendary coding artifacts").</li>
                                <li>Copy the JSON output and paste it into <strong>Data Injection</strong>.</li>
                            </ol>
                        </div>
                    </div>

                    {/* PROMPT DISPLAY */}
                    <div className="relative group">
                        <div className="absolute top-2 right-2 z-10">
                            <button 
                                onClick={handleCopy}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-lg ${copied ? 'bg-green-500 text-black' : 'bg-pink-500 text-black hover:bg-pink-400'}`}
                            >
                                {copied ? <Check size={12} /> : <Copy size={12} />}
                                {copied ? 'Copied!' : 'Copy Protocol'}
                            </button>
                        </div>
                        
                        <div className="bg-black border border-life-muted/20 rounded-xl p-4 font-mono text-[10px] text-life-muted/80 whitespace-pre-wrap leading-relaxed overflow-x-auto h-96 custom-scrollbar selection:bg-pink-500/30 selection:text-white">
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

export default ShopProtocolModal;
