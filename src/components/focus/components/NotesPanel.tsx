import React from 'react';
import { X, StickyNote } from 'lucide-react';

interface NotesPanelProps {
    notes: string;
    setNotes: (notes: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ notes, setNotes, isOpen, onClose }) => {
    return (
        <div className={`absolute bottom-0 left-0 right-0 bg-[#111] border-t border-zinc-800 p-6 rounded-t-3xl transition-transform duration-300 ease-out z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] h-[40vh] flex flex-col ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="flex justify-between items-center mb-4 shrink-0">
                <h3 className="text-xs font-bold uppercase text-life-muted tracking-widest flex items-center gap-2"><StickyNote size={14} /> Distraction Pad</h3>
                <button onClick={onClose} className="text-life-muted hover:text-white"><X size={16} /></button>
            </div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Dump thoughts here..." className="w-full h-full bg-black/50 rounded-xl border border-zinc-800 p-4 text-sm text-life-text focus:outline-none focus:border-life-gold resize-none font-mono leading-relaxed" />
        </div>
    );
};