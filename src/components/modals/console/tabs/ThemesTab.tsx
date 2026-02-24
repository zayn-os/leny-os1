import React from 'react';
import { useLifeOS } from '../../../../contexts/LifeOSContext';
import { Check } from 'lucide-react';

export const ThemesTab: React.FC = () => {
    const { state, dispatch } = useLifeOS();

    return (
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
                            <div className="w-3 h-3 rounded-full border border-zinc-800" style={{ backgroundColor: theme.colors['--color-life-black'] }} />
                            <div className="w-3 h-3 rounded-full border border-zinc-800" style={{ backgroundColor: theme.colors['--color-life-paper'] }} />
                            <div className="w-3 h-3 rounded-full border border-zinc-800" style={{ backgroundColor: theme.colors['--color-life-gold'] }} />
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-life-gold' : 'text-life-muted'}`}>{theme.name}</span>
                        {isActive && <div className="absolute top-1 right-1"><Check size={10} className="text-life-gold" /></div>}
                    </button>
                );
            })}
        </div>
    );
};