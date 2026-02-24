import React from 'react';
import { useLifeOS } from '../../../../contexts/LifeOSContext';
import { Music, Upload } from 'lucide-react';

export const MediaTab: React.FC = () => {
    const { state, dispatch } = useLifeOS();

    const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) dispatch.setCustomAudio(file);
    };

    return (
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
    );
};