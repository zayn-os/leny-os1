
import React, { useState } from 'react';
import { Landmark, FileText, Plus, Minus, Clock, ShieldAlert, Moon } from 'lucide-react';
import { useLifeOS } from '../../../contexts/LifeOSContext';
import { PurchaseLog } from '../../../types/shopTypes';

interface ConsoleActionTabProps {
    dateOverride: string;
    setDateOverride: (d: string) => void;
    handleDateChange: () => void;
}

export const ConsoleActionTab: React.FC<ConsoleActionTabProps> = ({ 
    dateOverride, setDateOverride, handleDateChange 
}) => {
    const { state, dispatch } = useLifeOS();
    const [transAmount, setTransAmount] = useState<string>('');
    const [transReason, setTransReason] = useState<string>('');

    const handleTransaction = (type: 'gold' | 'xp', mode: 'add' | 'sub') => {
        const val = parseInt(transAmount);
        if (!val || val <= 0) { dispatch.addToast('Invalid Amount', 'error'); return; }
        if (!transReason.trim()) { dispatch.addToast('Reason Required', 'error'); return; }

        const multiplier = mode === 'add' ? 1 : -1;
        const change = val * multiplier;
        const updates: any = {};
        const timestamp = new Date().toISOString();

        if (type === 'gold') updates.gold = state.user.gold + change;
        else updates.currentXP = state.user.currentXP + change;

        const newLog: PurchaseLog = {
            id: `man_${Date.now()}`,
            itemId: 'manual_override',
            title: `[${type.toUpperCase()}] ${transReason}`,
            cost: -change, 
            timestamp
        };

        updates.purchaseHistory = [newLog, ...(state.user.purchaseHistory || [])].slice(0, 100);
        
        dispatch.updateUser(updates);
        dispatch.addToast('Transaction Logged', 'success');
        setTransAmount('');
        setTransReason('');
    };

    return (
        <div className="space-y-6">
            {/* Manual Transaction */}
            <div className="space-y-3">
                <h3 className="text-life-gold font-bold flex items-center gap-2"><Landmark size={14} /> Manual Override</h3>
                <div className="bg-life-black border border-life-muted/20 p-3 rounded-lg space-y-3">
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="text-[9px] text-life-muted uppercase font-bold block mb-1">Reason</label>
                            <div className="flex items-center gap-2 bg-[#0a0a0a] border border-life-muted/30 rounded px-2">
                                <FileText size={10} className="text-life-muted" />
                                <input type="text" value={transReason} onChange={(e) => setTransReason(e.target.value)} placeholder="Reason..." className="w-full bg-transparent p-2 text-xs outline-none" />
                            </div>
                        </div>
                        <div className="w-1/3">
                            <label className="text-[9px] text-life-muted uppercase font-bold block mb-1">Amount</label>
                            <input type="number" value={transAmount} onChange={(e) => setTransAmount(e.target.value)} placeholder="0" className="w-full bg-[#0a0a0a] border border-life-muted/30 rounded p-2 text-xs outline-none text-center font-mono font-bold" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <div className="text-[9px] text-center text-life-gold font-bold uppercase">Gold</div>
                            <div className="flex gap-1">
                                <button onClick={() => handleTransaction('gold', 'add')} className="flex-1 bg-life-gold/20 text-life-gold border border-life-gold/30 hover:bg-life-gold/30 py-2 rounded flex items-center justify-center gap-1 font-bold"><Plus size={12} /> Add</button>
                                <button onClick={() => handleTransaction('gold', 'sub')} className="flex-1 bg-life-black text-life-muted border border-life-muted/30 hover:text-red-400 hover:border-red-400 py-2 rounded flex items-center justify-center gap-1 font-bold"><Minus size={12} /> Sub</button>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[9px] text-center text-life-easy font-bold uppercase">XP</div>
                            <div className="flex gap-1">
                                <button onClick={() => handleTransaction('xp', 'add')} className="flex-1 bg-life-easy/20 text-life-easy border border-life-easy/30 hover:bg-life-easy/30 py-2 rounded flex items-center justify-center gap-1 font-bold"><Plus size={12} /> Add</button>
                                <button onClick={() => handleTransaction('xp', 'sub')} className="flex-1 bg-life-black text-life-muted border border-life-muted/30 hover:text-red-400 hover:border-red-400 py-2 rounded flex items-center justify-center gap-1 font-bold"><Minus size={12} /> Sub</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Time Travel */}
            <div className="space-y-2 pt-4 border-t border-life-muted/10">
                <h3 className="text-life-muted font-bold flex items-center gap-2"><Clock size={14} /> Chronos</h3>
                <div className="flex gap-2">
                    <input type="date" value={dateOverride} onChange={(e) => setDateOverride(e.target.value)} className="bg-life-black border border-life-muted/30 rounded p-2 text-white focus:border-life-gold outline-none flex-1" />
                    <button onClick={handleDateChange} className="bg-life-muted/10 border border-life-muted/30 px-4 py-2 rounded hover:bg-life-muted/20 uppercase font-bold text-[10px]">Shift Time</button>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="space-y-2 pt-4 border-t border-life-muted/10">
                <h3 className="text-red-500 font-bold flex items-center gap-2"><ShieldAlert size={14} /> Danger Zone</h3>
                <button onClick={() => dispatch.triggerDailyReset()} className="w-full bg-red-900/20 border border-red-500/30 text-red-400 p-2 rounded hover:bg-red-900/30 flex items-center justify-center gap-2 uppercase font-bold">
                    <Moon size={14} /> Force Midnight Protocol
                </button>
                <button onClick={() => dispatch.setModal('resetConfirm')} className="w-full bg-red-900/20 border border-red-500/30 text-red-400 p-2 rounded hover:bg-red-900/30 flex items-center justify-center gap-2 uppercase font-bold">
                    <ShieldAlert size={14} /> Wipe Save Data
                </button>
            </div>
        </div>
    );
};
