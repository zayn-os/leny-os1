import React from 'react';
import { useLifeOS } from '../../../../contexts/LifeOSContext';
import { Eye } from 'lucide-react';

export const StateTab: React.FC = () => {
    const { state } = useLifeOS();

    return (
        <div className="p-3 bg-life-black border border-life-muted/20 rounded animate-in fade-in">
            <h3 className="text-life-gold font-bold mb-2 flex items-center gap-2"><Eye size={12} /> Data Snapshot</h3>
            <pre className="whitespace-pre-wrap opacity-70 text-[9px]">{JSON.stringify(state.user, null, 2)}</pre>
        </div>
    );
};