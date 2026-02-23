
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Terminal, Download, CheckCircle, Database, ShieldCheck, ShieldAlert, AlignLeft, RotateCcw, Loader2, Sparkles, ShieldX, Upload, FileJson } from 'lucide-react';
import { useLifeOS } from '../../contexts/LifeOSContext';
import { useTasks } from '../../contexts/TaskContext';
import { useHabits } from '../../contexts/HabitContext';
import { useRaids } from '../../contexts/RaidContext';
import { useSkills } from '../../contexts/SkillContext';
import { useShop } from '../../contexts/ShopContext';
// Import missing context hook
import { useCampaign } from '../../contexts/CampaignContext';
import { processInjection } from '../../services/oracle/injector/index';

interface InjectionFormProps {
    onClose: () => void;
}

const InjectionForm: React.FC<InjectionFormProps> = ({ onClose }) => {
    // Collect all dispatchers & state for context aware validation
    const { state: lifeState, dispatch: lifeDispatch } = useLifeOS();
    const { taskDispatch } = useTasks();
    const { habitState, habitDispatch } = useHabits();
    const { raidState, raidDispatch } = useRaids();
    const { skillDispatch } = useSkills();
    const { shopDispatch } = useShop(); 
    // Destructure campaignDispatch to fix "Cannot find name 'campaignDispatch'" error
    const { campaignDispatch } = useCampaign();

    const [jsonInput, setJsonInput] = useState('');
    const [status, setStatus] = useState<'idle' | 'refining' | 'success' | 'error' | 'restoring'>('idle');
    const [log, setLog] = useState<string>('System Ready. Paste JSON Code or Upload Backup File.');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setJsonInput(content);
            setLog(`File Loaded: ${file.name}\nReady to Execute.`);
            setStatus('idle');
        };
        reader.readAsText(file);
    };

    const handleFormat = () => {
        try {
            if (!jsonInput.trim()) return;
            const parsed = JSON.parse(jsonInput);
            setJsonInput(JSON.stringify(parsed, null, 2));
            setLog("JSON Formatted. Structure Valid.");
            setStatus('idle');
        } catch (e) {
            setLog("Format Error: Invalid JSON Syntax.");
            setStatus('error');
        }
    };

    const handleClear = () => {
        setJsonInput('');
        setLog("Buffer Cleared.");
        setStatus('idle');
    };

    // 🛡️ REFINER CONTEXT GENERATOR
    const getRefinerContext = (jsonStr: string) => {
        const habitsList = habitState.habits.map(h => h.title).join(', ');
        const raidsList = raidState.raids.map(r => r.title).join(', ');
        const badgesList = lifeState.badgesRegistry.map(b => b.name).join(', ');
        // 🟢 NEW: Laws Context
        const lawsList = taskState.laws?.map(l => l.title).join(', ') || '';

        return `
        ROLE: You are the "Refiner Node" (QA & Compiler).
        TASK: Validate and Fix the INCOMING JSON Payload for the LifeOS System.
        
        CURRENT DATABASE SNAPSHOT:
        - Existing Habits: [${habitsList}]
        - Existing Raids: [${raidsList}]
        - Existing Badges: [${badgesList}]
        - Existing Laws: [${lawsList}]

        INCOMING JSON:
        ${jsonStr}

        RULES:
        1. BADGE LINKAGE: If the JSON adds a Badge with 'triggerType': 'habit' or 'raid', verify the 'metricKey' matches an EXACT title in 'Existing Habits/Raids' OR a new habit/raid being added in this same JSON.
           - If there's a mismatch (e.g. Badge says "Drink Water" but Habit is "Drinking Water"), UPDATE the Badge's 'metricKey' to match the Habit exactly.
           - If the metricKey refers to a generic term, try to match it to the closest existing item.
        
        2. LAWS & CONSEQUENCES:
           - If the input describes a rule, punishment, or consequence (e.g., "If I upset my girlfriend, deduct Emotion points"), convert it into a "laws" array.
           - Structure: { "title": "Short Title", "penaltyType": "gold" | "xp" | "stat" | "honor", "penaltyValue": number, "statTarget": "STR" | "INT" | "DIS" | "EMT" | "PCE" | "CAM" | "CRT" (only if type is stat) }
           - Example: "If I miss prayer, lose 50 Honor" -> { "laws": [{ "title": "Missed Prayer", "penaltyType": "honor", "penaltyValue": 50 }] }

        3. STRUCTURE: Ensure strict valid JSON. No trailing commas.
        4. OUTPUT:
           - Return ONLY the clean, fixed JSON string. No markdown code blocks. No explanations.
           - If the JSON is fundamentally broken and unfixable, return: "ERROR: [Reason]"
        `;
    };

    const handleExecute = async () => {
        if (!jsonInput.trim()) {
            setLog("Error: Empty Payload.");
            return;
        }

        try {
            // 🟢 INTELLIGENT DETECTION: RESTORE VS INJECT
            const rawPayload = JSON.parse(jsonInput);

            // 1. CHECK FOR FULL BACKUP (Restore Mode)
            // A full backup has 'user', 'badgesRegistry', and 'ui' at the root
            if (rawPayload.user && rawPayload.badgesRegistry) {
                setStatus('restoring');
                setLog("🔄 FULL SYSTEM BACKUP DETECTED.\nInitiating Total Recall Protocol...");
                
                // Add explicit delay to show loading
                setTimeout(() => {
                    // 🟢 RESTORE ALL CONTEXTS
                    lifeDispatch.importData(jsonInput); // Restores User, UI, Badges
                    
                    if (rawPayload.tasks) taskDispatch.restoreData(rawPayload.tasks, rawPayload.taskCategories || [], rawPayload.laws || []);
                    if (rawPayload.habits) habitDispatch.restoreData(rawPayload.habits, rawPayload.habitCategories || []);
                    if (rawPayload.raids) raidDispatch.restoreData(rawPayload.raids);
                    if (rawPayload.skills) skillDispatch.restoreData(rawPayload.skills);
                    if (rawPayload.storeItems) shopDispatch.restoreData(rawPayload.storeItems);
                    // FIXED: campaignDispatch is now defined from useCampaign()
                    if (rawPayload.campaign) campaignDispatch.restoreData(rawPayload.campaign);

                    setStatus('success');
                    setLog("✅ SYSTEM RESTORED SUCCESSFULLY.\nRebooting UI...");
                    setTimeout(onClose, 2000);
                }, 1000);
                return;
            }

            // 2. CONTINUE WITH INJECTION (Partial Mode)
            let payloadToInject = jsonInput;
            const apiKeys = lifeState.user.preferences.apiKeys;
            const enableRefiner = lifeState.user.preferences.enableRefiner; 

            // 🟢 AI REFINEMENT STEP
            if (apiKeys?.refiner && enableRefiner) {
                try {
                    setStatus('refining');
                    setLog("✨ Refiner Node Active: Validating Logic...");
                    
                    const ai = new GoogleGenAI({ apiKey: apiKeys.refiner });
                    const prompt = getRefinerContext(jsonInput);
                    
                    // Use correct Gemini model name per coding guidelines
                    const response = await ai.models.generateContent({
                        model: 'gemini-3-flash-preview',
                        contents: [{ role: 'user', parts: [{ text: "Fix this payload." }] }],
                        config: { systemInstruction: prompt }
                    });

                    const refinedText = response.text?.trim();

                    if (refinedText && refinedText.startsWith("ERROR:")) {
                        setStatus('error');
                        setLog(`Refiner Blocked Injection:\n${refinedText}`);
                        return;
                    } else if (refinedText) {
                        const jsonMatch = refinedText.match(/```json\n([\s\S]*?)\n```/) || refinedText.match(/{[\s\S]*}/);
                        payloadToInject = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : refinedText;
                        setJsonInput(payloadToInject);
                        setLog("✨ Payload Refined & Optimized.");
                    }
                } catch (e) {
                    console.error("Refiner failed", e);
                    setLog("⚠️ Refiner Offline. Attempting Raw Injection...");
                }
            }

            // 🟢 PROCESS INJECTION
            const result = processInjection(payloadToInject, {
                lifeDispatch, taskDispatch, habitDispatch, raidDispatch, skillDispatch, shopDispatch
            });

            if (result.success) {
                setStatus('success');
                setLog(result.message);
                setTimeout(onClose, 2500);
            } else {
                setStatus('error');
                setLog(result.message);
            }

        } catch (e: any) {
            setStatus('error');
            setLog("JSON Parse Error: " + e.message);
        }
    };

    const isRefinerOn = lifeState.user.preferences.apiKeys?.refiner && lifeState.user.preferences.enableRefiner;

    return (
        <div className="space-y-4 animate-in slide-in-from-right fade-in duration-300 h-full flex flex-col">
            
            {/* Header / Info */}
            <div className="bg-life-black border border-life-gold/20 p-3 rounded-lg flex items-start gap-3 shadow-[0_0_10px_rgba(251,191,36,0.1)]">
                <div className="p-2 bg-life-gold/10 rounded-md text-life-gold animate-pulse-slow">
                    <Database size={18} />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black uppercase text-life-gold tracking-widest mb-1">
                            Data Uplink
                        </h4>
                        <span className="flex items-center gap-1 text-[8px] font-bold uppercase bg-life-easy/10 text-life-easy px-1.5 py-0.5 rounded border border-life-easy/20">
                            <ShieldCheck size={8} /> Protected
                        </span>
                    </div>
                    <div className="text-[10px] text-life-muted leading-relaxed">
                        Paste <b>Backup JSON</b> to restore, or <b>AI Code</b> to inject items. The system will auto-detect the type.
                        {isRefinerOn && (
                            <span className="block text-life-easy/80 mt-1 flex items-center gap-1">
                                <Sparkles size={8} /> Refiner Node Active
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Code Editor Area */}
            <div className="flex-1 relative group flex flex-col">
                <div className="flex justify-between items-end mb-2">
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest">
                        Input Stream ({jsonInput.length} chars)
                    </label>
                    <div className="flex gap-2">
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".json"
                            className="hidden"
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[9px] flex items-center gap-1 text-life-black bg-life-easy hover:bg-emerald-400 px-3 py-1 rounded font-bold transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                        >
                            <Upload size={10} /> Upload File
                        </button>
                        <button 
                            onClick={handleFormat}
                            className="text-[9px] flex items-center gap-1 text-life-muted hover:text-life-gold bg-life-black px-2 py-1 rounded border border-zinc-800 hover:border-life-gold/30 transition-all"
                        >
                            <AlignLeft size={10} /> Format
                        </button>
                        <button 
                            onClick={handleClear}
                            className="text-[9px] flex items-center gap-1 text-life-muted hover:text-life-hard bg-life-black px-2 py-1 rounded border border-zinc-800 hover:border-life-hard/30 transition-all"
                        >
                            <RotateCcw size={10} /> Clear
                        </button>
                    </div>
                </div>
                
                <div className="relative flex-1">
                    <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder={`// PASTE HERE:\n// 1. Full Backup JSON (to Restore)\n// 2. AI Code (to Inject)`}
                        className="w-full h-full min-h-[180px] bg-[#050505] text-life-easy font-mono text-[10px] p-4 rounded-lg border border-zinc-800 focus:border-life-gold focus:outline-none resize-none shadow-inner leading-relaxed"
                        spellCheck={false}
                        maxLength={200000} // Increased limit for full backups
                    />
                </div>
            </div>

            {/* Console Log */}
            <div className={`p-2 rounded border font-mono text-[9px] whitespace-pre-wrap transition-colors duration-300 ${status === 'error' ? 'bg-life-hard/10 border-life-hard text-life-hard' : status === 'success' ? 'bg-life-easy/10 border-life-easy text-life-easy' : (status === 'refining' || status === 'restoring') ? 'bg-life-gold/10 border-life-gold text-life-gold' : 'bg-life-black border-zinc-800 text-life-muted'}`}>
                <div className="flex items-center gap-2 mb-1 opacity-50 border-b border-zinc-800 pb-1">
                    <Terminal size={10} />
                    <span>SYSTEM LOG</span>
                </div>
                <div>
                    <span className="opacity-50 mr-2">{new Date().toLocaleTimeString()}:</span>
                    {log}
                </div>
            </div>

            {/* Actions */}
            <button
                onClick={handleExecute}
                disabled={status === 'refining' || status === 'restoring'}
                className={`
                    w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all
                    ${status === 'success' ? 'bg-life-easy text-black' : 'bg-life-gold text-life-black hover:bg-yellow-400 shadow-[0_0_20px_rgba(251,191,36,0.3)]'}
                    ${(status === 'refining' || status === 'restoring') ? 'opacity-70 cursor-wait' : ''}
                `}
            >
                {status === 'success' ? <CheckCircle size={16} /> : (status === 'refining' || status === 'restoring') ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {status === 'success' ? 'Operation Complete' : status === 'refining' ? 'Refining Logic...' : status === 'restoring' ? 'Restoring System...' : 'Execute Data'}
            </button>
            
            {status === 'error' && (
                 <div className="flex items-center justify-center gap-1 text-[9px] text-life-hard opacity-70">
                    <ShieldAlert size={10} /> Operation Halted. Check Logs.
                 </div>
            )}
        </div>
    );
};

export default InjectionForm;
