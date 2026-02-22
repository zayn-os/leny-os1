
import React, { useState, useEffect } from 'react';
// Added Brain icon
import { X, Code, Eye, Music, Upload, Settings2, Zap, Palette, Clock, Terminal, ShieldAlert, Volume2, Calendar, FileText, Bell, Check, Brain, Database, BarChart3, Trash2, ChevronRight, Copy, Download, ArrowLeft } from 'lucide-react';
import { useLifeOS } from '../../contexts/LifeOSContext';
import { useCampaign } from '../../contexts/CampaignContext'; 
import { ConsoleActionTab } from './console/ConsoleActionTab';

type Tab = 'system' | 'oracle' | 'actions' | 'themes' | 'state' | 'log' | 'media';

// 📚 COMPREHENSIVE MANUALS DATA
const GEM_MANUALS = {
    commander: {
        title: "The Commander",
        role: "Strategic General & NLP Core",
        content: `/// CLASSIFIED: COMMANDER NODE MANUAL ///

1. OVERVIEW
The Commander is the central interface for the user. It is the only node that maintains conversational context (Memory). It acts as a router, deciding whether to handle a query itself or delegate it to a Specialist Node (Executor, Designer, etc.).

2. PERSONALITY PROFILE
- Tone: "The Godfather" / "Strategic General".
- Traits: Ruthless, Efficient, Protective, Authoritative.
- Language: Professional Arabic (Gulf/Saudi Dialect) or English (Based on toggle).

3. TRIGGERS & BEHAVIOR
- "Hello/Hi": Responds with status report.
- "Help/Guide": Explains the system.
- General Chat: Discusses productivity strategies.
- Complex Commands: If a user asks for multiple things ("Add a task AND change theme"), the Commander breaks this down or asks for clarification.

4. MEMORY PROTOCOL
- Storage: 'LIFE_OS_ORACLE_HISTORY' (Local Storage).
- Context Window: Sends last 20 messages to Gemini to maintain conversation flow.
- Reset: Can be purged via "Purge Context Memory" button.

5. DIRECTIVE
"If the user asks to create something, do NOT ask follow-up questions. Deploy defaults immediately."
`
    },
    executor: {
        title: "The Executor",
        role: "Tactical Injection Engine",
        content: `/// CLASSIFIED: EXECUTOR NODE MANUAL ///

1. OVERVIEW
The Executor is a "Silent Agent". It does not speak. It outputs raw JSON payloads to modify the application state directly. It handles Tasks, Habits, and Raids.

2. TRIGGER KEYWORDS
- Tasks: "Add task", "Mission", "Remind me to..."
- Habits: "New habit", "Protocol", "Routine..."
- Raids: "Start project", "Operation", "Plan a raid..."

3. JSON SCHEMA (TASKS)
{
  "tasks": [
    {
      "title": "String (Required)",
      "difficulty": "easy | normal | hard",
      "stat": "STR | INT | DIS | PCE | EMT | CAM | CRT",
      "energyLevel": "low | medium | high",
      "deadline": "YYYY-MM-DD",
      "subtasks": ["Step 1", "Step 2"]
    }
  ]
}

4. JSON SCHEMA (HABITS)
{
  "habits": [
    {
      "title": "String",
      "type": "daily | specific_days | interval",
      "stat": "DIS",
      "dailyTarget": 1
    }
  ]
}

5. ERROR HANDLING
If the Executor outputs invalid JSON, the "Refiner Node" (if active) attempts to repair syntax errors before injection.
`
    },
    designer: {
        title: "The Designer",
        role: "Visual Cortex & Theme Engine",
        content: `/// CLASSIFIED: DESIGNER NODE MANUAL ///

1. OVERVIEW
The Designer has full control over the CSS Variables and DOM styling of LifeOS. It can generate themes on the fly based on abstract descriptions (e.g., "Make it look like Cyberpunk 2077").

2. TRIGGER KEYWORDS
- "Change theme", "Colors", "Design", "Look like..."

3. INJECTION CAPABILITIES
- Colors: Modifies --color-life-black, --color-life-gold, etc.
- CSS: Can inject raw CSS blocks to change border-radius, fonts, or layout shapes.

4. JSON SCHEMA (THEMES)
{
  "themes": [
    {
      "id": "unique_id",
      "name": "Display Name",
      "colors": {
        "--color-life-black": "#000000",
        "--color-life-paper": "#111111",
        "--color-life-gold": "#FFD700",
        "--color-life-text": "#FFFFFF"
      },
      "customCss": "body { font-family: 'Courier New'; }"
    }
  ]
}

5. PERSISTENCE
Themes created by the Designer are saved to 'user.unlockedThemes' and persist across reloads.
`
    },
    observer: {
        title: "The Observer",
        role: "Data Analyst & Critic",
        content: `/// CLASSIFIED: OBSERVER NODE MANUAL ///

1. OVERVIEW
The Observer has read-only access to the entire User Profile (JSON). It analyzes Stats, Metrics, Streaks, and Badge History to provide tough love or strategic insights.

2. TRIGGER KEYWORDS
- "Analyze my stats", "How am I doing?", "Report", "Status"

3. DATA ACCESS LEVEL
- user.stats (STR, INT, DIS...)
- user.metrics (Total Tasks, Completion Rates)
- user.streakHistory (Calendar Heatmap)
- user.inventory (Items owned)

4. ANALYSIS MODES
- Roast Mode: Cruelly points out weaknesses (Low DIS stat).
- Coach Mode: Suggests which Skill Tree to focus on based on lowest stats.
- Prediction: Estimates time to next Level Up based on current XP velocity.

5. OUTPUT
Returns text-only analysis. Does not modify state.
`
    }
};

const DeveloperConsole: React.FC = () => {
    const { state, dispatch } = useLifeOS();
    const { campaignDispatch } = useCampaign();
    const [activeTab, setActiveTab] = useState<Tab>('system');
    const [dateOverride, setDateOverride] = useState('');
    
    // 📖 MANUAL STATE
    const [selectedManual, setSelectedManual] = useState<keyof typeof GEM_MANUALS | null>(null);

    useEffect(() => {
        if (state.ui.debugDate) {
            setDateOverride(state.ui.debugDate.split('T')[0]);
        }
    }, [state.ui.debugDate]);

    const handleDateChange = () => {
        if (!dateOverride) {
            dispatch.setDebugDate(null);
            dispatch.addToast('Debug Time: Synced', 'info');
        } else {
            const newDate = new Date(dateOverride);
            newDate.setHours(12, 0, 0, 0); 
            dispatch.setDebugDate(newDate.toISOString());
            campaignDispatch.updateStartDate(newDate.toISOString()); 
            dispatch.addToast(`Time Shift: ${dateOverride}`, 'level-up');
        }
    };

    const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) dispatch.setCustomAudio(file);
    };

    const handleClearOracleMemory = () => {
        if (confirm("⚠️ PURGE NEURAL MEMORY?\nThis will erase the AI's conversation history. Context will be reset.")) {
            localStorage.removeItem('LIFE_OS_ORACLE_HISTORY');
            window.dispatchEvent(new Event('oracle-memory-cleared')); // Signal AIChatView to reset
            dispatch.addToast('Neural Memory Purged', 'success');
        }
    };

    // 📥 DOWNLOAD MANUAL FUNCTION
    const handleDownloadManual = () => {
        if (!selectedManual) return;
        const data = GEM_MANUALS[selectedManual];
        const blob = new Blob([data.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Manual_${data.title.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        dispatch.addToast('Manual Downloaded', 'success');
    };

    // 📋 COPY MANUAL FUNCTION
    const handleCopyManual = () => {
        if (!selectedManual) return;
        navigator.clipboard.writeText(GEM_MANUALS[selectedManual].content);
        dispatch.addToast('Manual Copied to Clipboard', 'success');
    };

    const renderToggle = (label: string, icon: React.ReactNode, prefKey: keyof typeof state.user.preferences) => {
        const isActive = state.user.preferences[prefKey];
        return (
            <button 
                onClick={() => dispatch.togglePreference(prefKey)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-life-black border border-life-muted/20 hover:border-life-gold/50 transition-all group"
            >
                <div className="flex items-center gap-3">
                    <div className={isActive ? 'text-life-gold' : 'text-life-muted'}>{icon}</div>
                    <span className="text-[10px] font-bold text-life-text uppercase tracking-wider">{label}</span>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${isActive ? 'bg-life-gold' : 'bg-life-muted/30'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isActive ? 'left-4.5' : 'left-0.5'}`} />
                </div>
            </button>
        );
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#0a0a0a] border border-life-gold/30 w-full max-w-lg rounded-xl shadow-2xl flex flex-col h-[85vh] overflow-hidden font-mono text-xs">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-life-gold/20 bg-life-gold/5">
                    <div className="flex items-center gap-2 text-life-gold">
                        <Terminal size={18} />
                        <span className="font-black uppercase tracking-[0.2em] text-sm">God Mode Shell</span>
                    </div>
                    <button onClick={() => dispatch.setModal('none')} className="text-life-gold hover:text-white p-1">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-life-muted/10 overflow-x-auto no-scrollbar bg-black/40">
                    {[
                        { id: 'system', icon: <Settings2 size={12} /> },
                        { id: 'oracle', icon: <Brain size={12} /> }, 
                        { id: 'actions', icon: <Zap size={12} /> },
                        { id: 'themes', icon: <Palette size={12} /> },
                        { id: 'state', icon: <Eye size={12} /> },
                        { id: 'log', icon: <Terminal size={12} /> },
                        { id: 'media', icon: <Music size={12} /> }
                    ].map((tab) => (
                        <button 
                            key={tab.id} 
                            onClick={() => { setActiveTab(tab.id as Tab); setSelectedManual(null); }} 
                            className={`flex-1 min-w-[75px] py-4 flex flex-col items-center gap-1 uppercase font-black text-[9px] transition-all border-b-2 ${activeTab === tab.id ? 'bg-life-gold/10 text-life-gold border-life-gold' : 'text-life-muted border-transparent hover:text-life-silver'}`}
                        >
                            {tab.icon}
                            {tab.id}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-auto p-4 bg-[#050505] text-life-text/80">
                    
                    {/* SYSTEM TAB */}
                    {activeTab === 'system' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                            <div className="p-3 bg-life-gold/5 border border-life-gold/10 rounded text-[9px] text-life-gold/70 uppercase font-bold tracking-widest">
                                Core System Toggles & Calibration
                            </div>

                            {/* Day Start Hour */}
                            <div className="w-full flex items-center justify-between p-3 rounded-lg bg-life-black border border-life-muted/20">
                                <div className="flex items-center gap-3">
                                    <Clock size={16} className="text-life-gold" />
                                    <span className="text-[10px] font-bold uppercase text-life-text">Day Start (Reset Hour)</span>
                                </div>
                                <select 
                                    value={state.user.preferences.dayStartHour ?? 4} 
                                    onChange={(e) => dispatch.setDayStartHour(parseInt(e.target.value))}
                                    className="bg-black border border-life-gold/30 rounded px-2 py-1 text-xs font-mono font-bold text-life-gold outline-none"
                                >
                                    {Array.from({ length: 24 }).map((_, i) => (
                                        <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                                    ))}
                                </select>
                            </div>

                            {/* Standard Preferences */}
                            <div className="space-y-2">
                                {renderToggle("Neural Feedback (Sound)", <Volume2 size={16} />, "soundEnabled")}
                                {renderToggle("Google Calendar Sync", <Calendar size={16} />, "showCalendarSync")}
                                {renderToggle("AI Context: History Logs", <FileText size={16} />, "copyIncludesHistory")}
                                {renderToggle("System Alerts (Push)", <Bell size={16} />, "deviceNotificationsEnabled")}
                            </div>

                            <div className="h-px bg-life-muted/10 my-2" />

                            <div className="space-y-2">
                                {renderToggle("Show Spear Tip (Highlights)", <Zap size={16} />, "showHighlights")}
                                {renderToggle("Campaign Module UI", <Code size={16} />, "showCampaignUI")}
                                {renderToggle("Horus Eye (Unlock Weeks)", <Eye size={16} />, "unlockAllWeeks")}
                            </div>
                        </div>
                    )}

                    {/* 🧠 ORACLE TAB (GEM GUIDE & MEMORY) */}
                    {activeTab === 'oracle' && (
                        <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-2">
                            
                            {!selectedManual ? (
                                // 🟢 VIEW 1: GEM LIST
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <h3 className="text-life-gold font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                            <Database size={14} /> Gem Architecture (Select for Manual)
                                        </h3>
                                        
                                        {/* Commander Card */}
                                        <button onClick={() => setSelectedManual('commander')} className="w-full bg-life-black border border-life-muted/20 p-3 rounded-lg flex items-center gap-3 hover:border-life-easy/50 hover:bg-life-easy/5 transition-all text-left group">
                                            <div className="p-2 bg-life-easy/10 text-life-easy rounded-full"><Brain size={16} /></div>
                                            <div className="flex-1">
                                                <div className="font-bold text-xs text-life-text group-hover:text-life-easy">The Commander</div>
                                                <div className="text-[9px] text-life-muted">Strategic oversight & general conversation.</div>
                                            </div>
                                            <ChevronRight size={14} className="text-life-muted group-hover:text-life-easy" />
                                        </button>

                                        {/* Executor Card */}
                                        <button onClick={() => setSelectedManual('executor')} className="w-full bg-life-black border border-life-muted/20 p-3 rounded-lg flex items-center gap-3 hover:border-purple-400/50 hover:bg-purple-400/5 transition-all text-left group">
                                            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-full"><Terminal size={16} /></div>
                                            <div className="flex-1">
                                                <div className="font-bold text-xs text-life-text group-hover:text-purple-400">The Executor</div>
                                                <div className="text-[9px] text-life-muted">Tactical ops: Instantly Adds Tasks, Habits, Raids.</div>
                                            </div>
                                            <ChevronRight size={14} className="text-life-muted group-hover:text-purple-400" />
                                        </button>

                                        {/* Designer Card */}
                                        <button onClick={() => setSelectedManual('designer')} className="w-full bg-life-black border border-life-muted/20 p-3 rounded-lg flex items-center gap-3 hover:border-pink-400/50 hover:bg-pink-400/5 transition-all text-left group">
                                            <div className="p-2 bg-pink-500/10 text-pink-400 rounded-full"><Palette size={16} /></div>
                                            <div className="flex-1">
                                                <div className="font-bold text-xs text-life-text group-hover:text-pink-400">The Designer</div>
                                                <div className="text-[9px] text-life-muted">Visual cortex: Changes App Themes & Colors.</div>
                                            </div>
                                            <ChevronRight size={14} className="text-life-muted group-hover:text-pink-400" />
                                        </button>

                                        {/* Observer Card */}
                                        <button onClick={() => setSelectedManual('observer')} className="w-full bg-life-black border border-life-muted/20 p-3 rounded-lg flex items-center gap-3 hover:border-blue-400/50 hover:bg-blue-400/5 transition-all text-left group">
                                            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-full"><BarChart3 size={16} /></div>
                                            <div className="flex-1">
                                                <div className="font-bold text-xs text-life-text group-hover:text-blue-400">The Observer</div>
                                                <div className="text-[9px] text-life-muted">Analyzes your Stats, Metrics & Performance.</div>
                                            </div>
                                            <ChevronRight size={14} className="text-life-muted group-hover:text-blue-400" />
                                        </button>
                                    </div>

                                    {/* Actions */}
                                    <div className="border-t border-life-muted/10 pt-4">
                                        <h3 className="text-life-gold font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 mb-3">
                                            <Zap size={14} /> Maintenance
                                        </h3>
                                        <button onClick={handleClearOracleMemory} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-900/30 transition-all uppercase font-bold text-[10px]">
                                            <Trash2 size={14} /> Purge Context Memory
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // 🟢 VIEW 2: MANUAL DETAIL VIEW
                                <div className="flex flex-col h-full animate-in slide-in-from-right-4">
                                    <button 
                                        onClick={() => setSelectedManual(null)} 
                                        className="flex items-center gap-2 text-life-muted hover:text-life-gold mb-3 uppercase font-bold text-[10px]"
                                    >
                                        <ArrowLeft size={12} /> Back to Gem List
                                    </button>
                                    
                                    <div className="flex-1 bg-life-black/50 border border-life-muted/20 rounded-xl overflow-hidden flex flex-col">
                                        <div className="p-3 border-b border-life-muted/20 bg-life-black flex justify-between items-center">
                                            <div>
                                                <h3 className="text-sm font-black text-life-text uppercase tracking-widest">{GEM_MANUALS[selectedManual].title}</h3>
                                                <p className="text-[9px] text-life-gold font-mono">{GEM_MANUALS[selectedManual].role}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={handleCopyManual} className="p-2 text-life-muted hover:text-life-easy hover:bg-life-easy/10 rounded transition-all" title="Copy Text">
                                                    <Copy size={16} />
                                                </button>
                                                <button onClick={handleDownloadManual} className="p-2 text-life-muted hover:text-life-gold hover:bg-life-gold/10 rounded transition-all" title="Download File">
                                                    <Download size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-auto p-4">
                                            <pre className="whitespace-pre-wrap font-mono text-[10px] text-life-text/80 leading-relaxed">
                                                {GEM_MANUALS[selectedManual].content}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ACTIONS TAB */}
                    {activeTab === 'actions' && (
                        <div className="animate-in fade-in slide-in-from-right-2">
                            <ConsoleActionTab dateOverride={dateOverride} setDateOverride={setDateOverride} handleDateChange={handleDateChange} />
                        </div>
                    )}

                    {/* THEMES TAB */}
                    {activeTab === 'themes' && (
                        <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-right-2">
                            {state.user.unlockedThemes.map(theme => {
                                const isActive = state.user.preferences.theme === theme.id;
                                return (
                                    <button 
                                        key={theme.id}
                                        onClick={() => dispatch.setTheme(theme.id)}
                                        className={`p-3 rounded-xl border flex flex-col gap-2 transition-all text-left relative overflow-hidden ${isActive ? 'border-life-gold bg-life-gold/10' : 'border-life-muted/20 bg-life-black hover:border-life-gold/30'}`}
                                    >
                                        <div className="flex gap-1">
                                            <div className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: theme.colors['--color-life-black'] }} />
                                            <div className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: theme.colors['--color-life-paper'] }} />
                                            <div className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: theme.colors['--color-life-gold'] }} />
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-life-gold' : 'text-life-muted'}`}>{theme.name}</span>
                                        {isActive && <div className="absolute top-1 right-1"><Check size={10} className="text-life-gold" /></div>}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* STATE TAB */}
                    {activeTab === 'state' && (
                        <div className="p-3 bg-life-black border border-life-muted/20 rounded animate-in fade-in">
                            <h3 className="text-life-gold font-bold mb-2 flex items-center gap-2"><Eye size={12} /> Data Snapshot</h3>
                            <pre className="whitespace-pre-wrap opacity-70 text-[9px]">{JSON.stringify(state.user, null, 2)}</pre>
                        </div>
                    )}

                    {/* LOG TAB */}
                    {activeTab === 'log' && (
                        <div className="space-y-2 animate-in fade-in">
                            {state.ui.systemLogs?.map(t => (
                                <div key={t.id} className="flex gap-2 border-b border-life-muted/10 pb-1">
                                    <span className="text-[9px] text-life-muted min-w-[50px]">{t.timestamp ? new Date(t.timestamp).toLocaleTimeString() : '---'}</span>
                                    <span className={`font-bold text-[9px] uppercase ${t.type === 'error' ? 'text-red-500' : 'text-life-gold'}`}>[{t.type}]</span>
                                    <span className="text-[9px]">{t.message}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* MEDIA TAB */}
                    {activeTab === 'media' && (
                        <div className="p-4 bg-life-black border border-life-gold/20 rounded-lg text-center space-y-4 animate-in fade-in">
                            <div className="w-16 h-16 bg-life-gold/10 rounded-full flex items-center justify-center mx-auto border border-life-gold/30"><Music size={32} className="text-life-gold" /></div>
                            <label className="block w-full cursor-pointer">
                                <input type="file" accept="audio/*" onChange={handleCustomAudioUpload} className="hidden" />
                                <div className="w-full py-3 border border-dashed border-life-muted/50 rounded-lg hover:border-life-gold hover:bg-life-gold/5 transition-all flex items-center justify-center gap-2 text-life-text">
                                    <Upload size={14} /> Neural Audio Sync
                                </div>
                            </label>
                            {state.ui.customAudio && <div className="bg-green-900/20 border border-green-500/30 p-2 rounded text-green-400 text-[10px]">Active Uplink: <span className="font-bold text-white">{state.ui.customAudio.name}</span></div>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeveloperConsole;
