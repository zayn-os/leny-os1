import React, { useState } from 'react';
import { CheckCircle, ListTodo, StickyNote, VolumeX, Waves, CloudRain, Clock as ClockIcon, Music, ChevronUp } from 'lucide-react';
import { NoiseType } from '../hooks/useFocusAudio';

interface FocusControlsProps {
    noiseType: NoiseType;
    setNoiseType: (type: NoiseType) => void;
    activePanel: 'none' | 'notes' | 'subtasks';
    setActivePanel: (panel: 'none' | 'notes' | 'subtasks') => void;
    hasSubtasks: boolean;
    completedSubtasksCount: number;
    totalSubtasksCount: number;
    onComplete: () => void;
}

export const FocusControls: React.FC<FocusControlsProps> = (props) => {
    const { noiseType, setNoiseType, activePanel, setActivePanel, hasSubtasks, completedSubtasksCount, totalSubtasksCount, onComplete } = props;
    const [showNoiseMenu, setShowNoiseMenu] = useState(false);

    const getNoiseLabel = () => {
        switch(noiseType) {
            case 'brown': return 'Brown';
            case 'rain': return 'Rain';
            case 'clock': return 'Tick';
            case 'custom': return 'Track';
            default: return 'Mute';
        }
    };

    const getNoiseIcon = () => {
        switch(noiseType) {
            case 'brown': return <Waves size={18} />;
            case 'rain': return <CloudRain size={18} />;
            case 'clock': return <ClockIcon size={18} />;
            case 'custom': return <Music size={18} />;
            default: return <VolumeX size={18} />;
        }
    };

    return (
        <div className="flex items-center gap-2 w-full justify-center max-w-md relative">
            <div className="relative">
                {showNoiseMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-32 bg-life-black border border-life-gold/30 rounded-xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-2 z-50 flex flex-col">
                        {[
                            { id: 'none', label: 'Mute', icon: <VolumeX size={14} /> },
                            { id: 'brown', label: 'Brown Noise', icon: <Waves size={14} /> },
                            { id: 'rain', label: 'Rain', icon: <CloudRain size={14} /> },
                            { id: 'clock', label: 'Tick', icon: <ClockIcon size={14} /> },
                            { id: 'custom', label: 'Custom', icon: <Music size={14} /> },
                        ].map((opt) => (
                            <button 
                                key={opt.id}
                                onClick={() => { setNoiseType(opt.id as NoiseType); setShowNoiseMenu(false); }}
                                className={`flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider hover:bg-life-gold/10 transition-colors ${noiseType === opt.id ? 'text-life-gold bg-life-gold/5' : 'text-life-muted'}`}
                            >
                                {opt.icon} {opt.label}
                            </button>
                        ))}
                    </div>
                )}
                <button 
                    onClick={() => setShowNoiseMenu(!showNoiseMenu)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all w-20 shrink-0 ${noiseType !== 'none' ? 'bg-life-gold/20 border-life-gold text-life-gold' : 'bg-white/5 border-zinc-800 text-life-muted hover:text-white'}`}
                >
                    {getNoiseIcon()}
                    <div className="flex items-center gap-1">
                        <span className="text-[8px] font-bold uppercase">{getNoiseLabel()}</span>
                        <ChevronUp size={8} />
                    </div>
                </button>
            </div>

            <button onClick={() => setActivePanel(activePanel === 'notes' ? 'none' : 'notes')} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all w-20 shrink-0 ${activePanel === 'notes' ? 'bg-life-easy/20 border-life-easy text-life-easy' : 'bg-white/5 border-zinc-800 text-life-muted hover:text-white'}`}>
                <StickyNote size={18} />
                <span className="text-[8px] font-bold uppercase">Notes</span>
            </button>

            {hasSubtasks && (
                <button onClick={() => setActivePanel(activePanel === 'subtasks' ? 'none' : 'subtasks')} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all w-20 shrink-0 ${activePanel === 'subtasks' ? 'bg-life-gold/20 border-life-gold text-life-gold' : 'bg-white/5 border-zinc-800 text-life-muted hover:text-white'}`}>
                    <ListTodo size={18} />
                    <div className="flex flex-col items-center leading-none">
                        <span className="text-[8px] font-bold uppercase">Steps</span>
                        <span className="text-[7px] opacity-60">{completedSubtasksCount}/{totalSubtasksCount}</span>
                    </div>
                </button>
            )}

            <button onClick={onComplete} className="p-3 rounded-xl border border-life-easy/50 bg-life-easy/10 text-life-easy hover:bg-life-easy hover:text-black transition-all flex flex-col items-center gap-1 w-20 shrink-0 group">
                <CheckCircle size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-[8px] font-bold uppercase">Done</span>
            </button>
        </div>
    );
};