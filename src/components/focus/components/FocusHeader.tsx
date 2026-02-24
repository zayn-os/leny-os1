import React from 'react';
import { LogOut } from 'lucide-react';

interface FocusHeaderProps {
    onExit: () => void;
}

export const FocusHeader: React.FC<FocusHeaderProps> = ({ onExit }) => {
    return (
        <div className="relative z-10 flex justify-between items-center p-6">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-life-muted">Focus Protocol Active</span>
            </div>
            <button onClick={onExit} className="p-2 rounded-full hover:bg-white/10 text-life-muted hover:text-life-hard transition-all flex items-center gap-1">
                <span className="text-[10px] font-bold uppercase hidden sm:inline">Abort</span>
                <LogOut size={18} />
            </button>
        </div>
    );
};