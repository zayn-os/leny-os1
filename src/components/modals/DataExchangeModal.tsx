
import React, { useState, useRef } from 'react';
import { X, Copy, Check, Download, Upload, FileText, Database } from 'lucide-react';
import { useLifeOS } from '../../contexts/LifeOSContext';
import { playSound } from '../../utils/audio';
import InjectionForm from '../forms/InjectionForm'; // 👈 Import the advanced form

const DataExchangeModal: React.FC = () => {
    const { state, dispatch } = useLifeOS();
    const { modalData } = state.ui;
    
    // mode: 'export' (Read only + Copy) OR 'import' (Editable + Injection Form)
    const mode = modalData?.mode || 'export'; 
    const title = modalData?.title || (mode === 'export' ? 'System Backup' : 'Neural Injection Protocol');
    const initialData = modalData?.data || '';

    const [inputText, setInputText] = useState(initialData);
    const [copied, setCopied] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const handleClose = () => {
        dispatch.setModal('none');
    };

    const handleCopy = () => {
        if (textAreaRef.current) {
            textAreaRef.current.select();
            navigator.clipboard.writeText(inputText);
            setCopied(true);
            playSound('success', true);
            dispatch.addToast('Copied to Clipboard', 'success');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        const blob = new Blob([inputText], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lifeos-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        dispatch.addToast('Backup Downloaded', 'success');
        playSound('success', true);
    };

    return (
        <div 
            onClick={handleClose}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300"
        >
            <div 
                onClick={(e) => e.stopPropagation()} 
                className="bg-life-black border border-life-gold/30 w-full max-w-lg rounded-xl shadow-2xl flex flex-col h-[85vh] relative overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-life-muted/20 bg-life-paper/50 shrink-0">
                    <div className="flex items-center gap-2">
                        {mode === 'export' ? <Download size={18} className="text-life-gold" /> : <Database size={18} className="text-life-easy" />}
                        <h3 className="text-sm font-black uppercase tracking-widest text-life-text">
                            {title}
                        </h3>
                    </div>
                    <button onClick={handleClose} className="text-life-muted hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 p-4 relative overflow-hidden flex flex-col">
                    {mode === 'import' ? (
                        // 🟢 ADVANCED INJECTION FORM (For Import Mode)
                        <div className="h-full overflow-y-auto pr-1">
                            <InjectionForm onClose={handleClose} />
                        </div>
                    ) : (
                        // 🟡 READ-ONLY EXPORT VIEW
                        <>
                            <textarea
                                ref={textAreaRef}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                readOnly={true}
                                className="w-full h-full bg-[#050505] rounded-lg border border-life-muted/20 p-4 font-mono text-[10px] leading-relaxed resize-none focus:outline-none text-life-gold focus:border-life-gold/50 cursor-text"
                                spellCheck={false}
                                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                            />
                            <div className="absolute bottom-6 right-6 text-[9px] text-life-muted/50 pointer-events-none">
                                SYSTEM DUMP // READ ONLY
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Actions (Only for Export Mode) */}
                {mode === 'export' && (
                    <div className="p-4 border-t border-life-muted/20 bg-life-paper/50 shrink-0 flex gap-3">
                        <button 
                            onClick={handleDownload}
                            className="flex-1 py-3 rounded-lg font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all bg-life-gold text-black hover:bg-yellow-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                        >
                            <Download size={16} />
                            Download JSON
                        </button>
                        <button 
                            onClick={handleCopy}
                            className={`px-6 py-3 rounded-lg font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-life-muted/30 hover:bg-white/5 ${copied ? 'text-life-easy border-life-easy' : 'text-life-muted'}`}
                        >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataExchangeModal;
