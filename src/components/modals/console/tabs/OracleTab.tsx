import React, { useState } from 'react';
import { useLifeOS } from '../../../../contexts/LifeOSContext';
import { GEM_MANUALS } from '../data/manuals';
import { Database, Zap, Trash2, Brain, Terminal, Palette, BarChart3, ChevronRight, ArrowLeft, Copy, Download } from 'lucide-react';

export const OracleTab: React.FC = () => {
    const { dispatch } = useLifeOS();
    const [selectedManual, setSelectedManual] = useState<keyof typeof GEM_MANUALS | null>(null);

    const handleClearOracleMemory = () => {
        if (confirm("⚠️ PURGE NEURAL MEMORY?\nThis will erase the AI's conversation history. Context will be reset.")) {
            localStorage.removeItem('LIFE_OS_ORACLE_HISTORY');
            window.dispatchEvent(new Event('oracle-memory-cleared'));
            dispatch.addToast('Neural Memory Purged', 'success');
        }
    };

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

    const handleCopyManual = () => {
        if (!selectedManual) return;
        navigator.clipboard.writeText(GEM_MANUALS[selectedManual].content);
        dispatch.addToast('Manual Copied to Clipboard', 'success');
    };

    if (!selectedManual) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                <div className="space-y-3">
                    <h3 className="text-life-gold font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                        <Database size={14} /> Gem Architecture (Select for Manual)
                    </h3>
                    <button onClick={() => setSelectedManual('commander')} className="w-full bg-life-black border border-life-muted/20 p-3 rounded-lg flex items-center gap-3 hover:border-life-easy/50 hover:bg-life-easy/5 transition-all text-left group">
                        <div className="p-2 bg-life-easy/10 text-life-easy rounded-full"><Brain size={16} /></div>
                        <div className="flex-1">
                            <div className="font-bold text-xs text-life-text group-hover:text-life-easy">The Commander</div>
                            <div className="text-[9px] text-life-muted">Strategic oversight & general conversation.</div>
                        </div>
                        <ChevronRight size={14} className="text-life-muted group-hover:text-life-easy" />
                    </button>
                    <button onClick={() => setSelectedManual('executor')} className="w-full bg-life-black border border-life-muted/20 p-3 rounded-lg flex items-center gap-3 hover:border-purple-400/50 hover:bg-purple-400/5 transition-all text-left group">
                        <div className="p-2 bg-purple-500/10 text-purple-400 rounded-full"><Terminal size={16} /></div>
                        <div className="flex-1">
                            <div className="font-bold text-xs text-life-text group-hover:text-purple-400">The Executor</div>
                            <div className="text-[9px] text-life-muted">Tactical ops: Instantly Adds Tasks, Habits, Raids.</div>
                        </div>
                        <ChevronRight size={14} className="text-life-muted group-hover:text-purple-400" />
                    </button>
                    <button onClick={() => setSelectedManual('designer')} className="w-full bg-life-black border border-life-muted/20 p-3 rounded-lg flex items-center gap-3 hover:border-pink-400/50 hover:bg-pink-400/5 transition-all text-left group">
                        <div className="p-2 bg-pink-500/10 text-pink-400 rounded-full"><Palette size={16} /></div>
                        <div className="flex-1">
                            <div className="font-bold text-xs text-life-text group-hover:text-pink-400">The Designer</div>
                            <div className="text-[9px] text-life-muted">Visual cortex: Changes App Themes & Colors.</div>
                        </div>
                        <ChevronRight size={14} className="text-life-muted group-hover:text-pink-400" />
                    </button>
                    <button onClick={() => setSelectedManual('observer')} className="w-full bg-life-black border border-life-muted/20 p-3 rounded-lg flex items-center gap-3 hover:border-blue-400/50 hover:bg-blue-400/5 transition-all text-left group">
                        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-full"><BarChart3 size={16} /></div>
                        <div className="flex-1">
                            <div className="font-bold text-xs text-life-text group-hover:text-blue-400">The Observer</div>
                            <div className="text-[9px] text-life-muted">Analyzes your Stats, Metrics & Performance.</div>
                        </div>
                        <ChevronRight size={14} className="text-life-muted group-hover:text-blue-400" />
                    </button>
                </div>
                <div className="border-t border-life-muted/10 pt-4">
                    <h3 className="text-life-gold font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 mb-3">
                        <Zap size={14} /> Maintenance
                    </h3>
                    <button onClick={handleClearOracleMemory} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-900/30 transition-all uppercase font-bold text-[10px]">
                        <Trash2 size={14} /> Purge Context Memory
                    </button>
                </div>
            </div>
        );
    }

    return (
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
    );
};