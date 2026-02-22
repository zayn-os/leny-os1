
import React, { useState } from 'react';
import { Target, Play } from 'lucide-react';

interface CampaignSetupProps {
    onStart: (title: string, date: string) => void;
}

export const CampaignSetup: React.FC<CampaignSetupProps> = ({ onStart }) => {
    const [setupTitle, setSetupTitle] = useState('');
    const [setupDate, setSetupDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (setupTitle) onStart(setupTitle, setupDate);
    };

    return (
        <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col justify-center">
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-life-black border border-life-gold rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(251,191,36,0.2)]">
                    <Target size={40} className="text-life-gold" />
                </div>
                <h2 className="text-3xl font-black text-life-text tracking-tighter uppercase mb-2">
                    Operation Tempo
                </h2>
                <p className="text-sm text-life-muted max-w-xs mx-auto">
                    "The year is not 12 months. It is 12 weeks. No time for hesitation."
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-life-paper border border-life-muted/20 p-6 rounded-2xl shadow-xl space-y-6">
                <div>
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">
                        Campaign Objective (Title)
                    </label>
                    <input 
                        type="text" 
                        value={setupTitle}
                        onChange={(e) => setSetupTitle(e.target.value)}
                        placeholder="e.g. Project Spartan, Winter Arc..."
                        className="w-full bg-life-black border border-life-muted/30 rounded-lg p-3 text-life-text focus:border-life-gold outline-none font-bold"
                        autoFocus
                    />
                </div>
                <div>
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">
                        Start Date (Zero Point)
                    </label>
                    <input 
                        type="date" 
                        value={setupDate}
                        onChange={(e) => setSetupDate(e.target.value)}
                        className="w-full bg-life-black border border-life-muted/30 rounded-lg p-3 text-life-text focus:border-life-gold outline-none"
                    />
                </div>
                <button 
                    type="submit"
                    disabled={!setupTitle}
                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all
                        ${setupTitle ? 'bg-life-gold text-life-black hover:bg-yellow-400 shadow-lg shadow-life-gold/20' : 'bg-life-muted/20 text-life-muted cursor-not-allowed'}
                    `}
                >
                    <Play size={18} fill="currentColor" /> Initiate Campaign
                </button>
            </form>
        </div>
    );
};
