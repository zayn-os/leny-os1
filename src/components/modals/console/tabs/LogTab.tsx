import React from 'react';
import { useLifeOS } from '../../../../contexts/LifeOSContext';

export const LogTab: React.FC = () => {
    const { state } = useLifeOS();

    return (
        <div className="space-y-2 animate-in fade-in">
            {state.ui.systemLogs?.map(t => (
                <div key={t.id} className="flex gap-2 border-b border-life-muted/10 pb-1">
                    <span className="text-[9px] text-life-muted min-w-[50px]">{t.timestamp ? new Date(t.timestamp).toLocaleTimeString() : '---'}</span>
                    <span className={`font-bold text-[9px] uppercase ${t.type === 'error' ? 'text-red-500' : 'text-life-gold'}`}>[{t.type}]</span>
                    <span className="text-[9px]">{t.message}</span>
                </div>
            ))}
        </div>
    );
};