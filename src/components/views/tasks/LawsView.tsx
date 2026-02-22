
import React, { useState } from 'react';
import { ShieldAlert, Gavel, Plus, X, Coins, Zap, Activity, Pencil, Check, Award, BookOpen } from 'lucide-react';
import { useTasks } from '../../../contexts/TaskContext';
import { Stat } from '../../../types/types';
import { STAT_COLORS } from '../../../types/constants';
import { ConsequencesGuide } from './ConsequencesGuide';

export const LawsView: React.FC = () => {
    const { taskState, taskDispatch } = useTasks();
    const { laws } = taskState;

    // Form State (Adding)
    const [title, setTitle] = useState('');
    const [penaltyType, setPenaltyType] = useState<'gold' | 'xp' | 'stat' | 'honor'>('honor');
    const [penaltyValue, setPenaltyValue] = useState<number>(50);
    const [selectedStat, setSelectedStat] = useState<Stat>(Stat.DIS);
    const [isAdding, setIsAdding] = useState(false);
    const [showGuide, setShowGuide] = useState(false);

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editType, setEditType] = useState<'gold' | 'xp' | 'stat' | 'honor'>('honor');
    const [editValue, setEditValue] = useState(0);
    const [editStat, setEditStat] = useState<Stat>(Stat.DIS);

    const handleAddLaw = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        
        taskDispatch.addLaw(
            title, 
            penaltyType, 
            penaltyValue, 
            penaltyType === 'stat' ? selectedStat : undefined
        );
        
        setTitle('');
        setPenaltyValue(50);
        setIsAdding(false);
    };

    const startEditing = (law: any) => {
        setEditingId(law.id);
        setEditTitle(law.title);
        setEditType(law.penaltyType);
        setEditValue(law.penaltyValue);
        setEditStat(law.statTarget || Stat.DIS);
    };

    const saveEdit = () => {
        if (!editingId || !editTitle.trim()) return;
        taskDispatch.updateLaw(editingId, {
            title: editTitle,
            penaltyType: editType,
            penaltyValue: editValue,
            statTarget: editType === 'stat' ? editStat : undefined
        });
        setEditingId(null);
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
            
            {/* 🛑 HEADER INFO */}
            <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-xl mb-6 text-center relative">
                <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-2 animate-pulse" />
                <h2 className="text-lg font-black text-red-500 uppercase tracking-widest mb-1">The Codex</h2>
                <p className="text-[10px] text-red-400/70 font-mono uppercase tracking-wider">
                    "He who cannot obey himself will be commanded."
                </p>
                <button 
                    onClick={() => setShowGuide(!showGuide)}
                    className="absolute top-4 right-4 text-red-500/50 hover:text-red-400 transition-colors"
                    title="Sentencing Guidelines"
                >
                    <BookOpen size={16} />
                </button>
            </div>

            {/* 📖 GUIDE SECTION */}
            {showGuide && <ConsequencesGuide onClose={() => setShowGuide(false)} />}

            {/* ⚖️ LAWS LIST */}
            <div className="space-y-3 mb-8">
                {laws.map(law => {
                    const isEditing = editingId === law.id;

                    if (isEditing) {
                        return (
                            <div key={law.id} className="bg-life-black border border-life-gold/50 p-4 rounded-xl space-y-3 animate-in fade-in">
                                <input 
                                    type="text" 
                                    value={editTitle}
                                    onChange={e => setEditTitle(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-red-900/30 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-red-500"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <div className="flex-1 flex bg-[#0a0a0a] rounded-lg p-1 border border-red-900/30">
                                        <button type="button" onClick={() => setEditType('honor')} className={`flex-1 py-1 rounded text-[9px] font-bold ${editType === 'honor' ? 'bg-indigo-500 text-white' : 'text-zinc-500'}`}><Award size={10} className="mx-auto" /></button>
                                        <button type="button" onClick={() => setEditType('gold')} className={`flex-1 py-1 rounded text-[9px] font-bold ${editType === 'gold' ? 'bg-life-gold text-black' : 'text-zinc-500'}`}><Coins size={10} className="mx-auto" /></button>
                                        <button type="button" onClick={() => setEditType('xp')} className={`flex-1 py-1 rounded text-[9px] font-bold ${editType === 'xp' ? 'bg-blue-500 text-white' : 'text-zinc-500'}`}><Zap size={10} className="mx-auto" /></button>
                                        <button type="button" onClick={() => setEditType('stat')} className={`flex-1 py-1 rounded text-[9px] font-bold ${editType === 'stat' ? 'bg-purple-500 text-white' : 'text-zinc-500'}`}><Activity size={10} className="mx-auto" /></button>
                                    </div>
                                    <input 
                                        type="number" 
                                        value={editValue}
                                        onChange={e => setEditValue(Number(e.target.value))}
                                        className="w-20 bg-[#0a0a0a] border border-red-900/30 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-red-500 text-center"
                                    />
                                </div>
                                {editType === 'stat' && (
                                    <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                                        {Object.values(Stat).map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setEditStat(s)}
                                                className={`w-6 h-6 shrink-0 rounded flex items-center justify-center border transition-all text-[9px] ${editStat === s ? 'bg-red-900/50 border-red-500 text-white' : 'border-zinc-800 text-zinc-500'}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-2 pt-2">
                                    <button onClick={() => setEditingId(null)} className="flex-1 py-2 rounded bg-life-black border border-life-muted/20 text-life-muted text-xs font-bold hover:text-white">Cancel</button>
                                    <button onClick={saveEdit} className="flex-1 py-2 rounded bg-life-gold text-black text-xs font-bold hover:bg-yellow-400 flex items-center justify-center gap-1"><Check size={12} /> Save</button>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={law.id} className="bg-[#0f0505] border border-red-900/30 p-4 rounded-xl flex items-center justify-between group hover:border-red-600/50 transition-all">
                            <div className="flex-1 min-w-0 pr-4">
                                <h3 className="text-sm font-bold text-red-100 mb-1">{law.title}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] bg-red-900/30 text-red-400 px-2 py-0.5 rounded border border-red-900/50 uppercase font-black tracking-wider">
                                        Penalty: -{law.penaltyValue} {law.penaltyType === 'stat' ? law.statTarget : law.penaltyType.toUpperCase()}
                                    </span>
                                    {law.timesBroken > 0 && (
                                        <span className="text-[9px] text-zinc-600 font-mono">
                                            Broken {law.timesBroken}x
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => taskDispatch.enforceLaw(law.id)}
                                    className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-1 mr-1"
                                >
                                    <Gavel size={12} /> Pay Fine
                                </button>
                                <div className="flex flex-col gap-1">
                                    <button 
                                        onClick={() => startEditing(law)}
                                        className="text-zinc-600 hover:text-life-gold transition-colors p-1"
                                    >
                                        <Pencil size={12} />
                                    </button>
                                    <button 
                                        onClick={() => taskDispatch.deleteLaw(law.id)}
                                        className="text-zinc-600 hover:text-red-500 transition-colors p-1"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {laws.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-red-900/20 rounded-xl bg-red-950/10">
                        <p className="text-xs text-red-800/50 font-bold uppercase">No Laws Enacted</p>
                    </div>
                )}
            </div>

            {/* ➕ ADD LAW FORM */}
            <div className="border-t border-red-900/20 pt-6">
                {!isAdding ? (
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="w-full py-3 border border-dashed border-red-900/40 text-red-500/70 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase hover:bg-red-950/20 hover:text-red-400 hover:border-red-500/50 transition-all"
                    >
                        <Plus size={14} /> Enact New Law
                    </button>
                ) : (
                    <form onSubmit={handleAddLaw} className="bg-black/40 border border-red-900/30 p-4 rounded-xl space-y-4 animate-in slide-in-from-bottom-2">
                        <div>
                            <label className="block text-[9px] text-red-500 uppercase font-bold tracking-widest mb-2">Offense Name</label>
                            <input 
                                type="text" 
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Ate Sugar, Missed Prayer..."
                                className="w-full bg-[#0a0a0a] border border-red-900/30 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-red-500"
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[9px] text-red-500 uppercase font-bold tracking-widest mb-2">Penalty Type</label>
                                <div className="flex bg-[#0a0a0a] rounded-lg p-1 border border-red-900/30">
                                    <button type="button" onClick={() => setPenaltyType('honor')} className={`flex-1 py-1.5 rounded text-[10px] font-bold ${penaltyType === 'honor' ? 'bg-indigo-500 text-white' : 'text-zinc-500'}`} title="Honor"><Award size={12} className="mx-auto" /></button>
                                    <button type="button" onClick={() => setPenaltyType('gold')} className={`flex-1 py-1.5 rounded text-[10px] font-bold ${penaltyType === 'gold' ? 'bg-life-gold text-black' : 'text-zinc-500'}`} title="Gold"><Coins size={12} className="mx-auto" /></button>
                                    <button type="button" onClick={() => setPenaltyType('xp')} className={`flex-1 py-1.5 rounded text-[10px] font-bold ${penaltyType === 'xp' ? 'bg-blue-500 text-white' : 'text-zinc-500'}`} title="XP"><Zap size={12} className="mx-auto" /></button>
                                    <button type="button" onClick={() => setPenaltyType('stat')} className={`flex-1 py-1.5 rounded text-[10px] font-bold ${penaltyType === 'stat' ? 'bg-purple-500 text-white' : 'text-zinc-500'}`} title="Stat"><Activity size={12} className="mx-auto" /></button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[9px] text-red-500 uppercase font-bold tracking-widest mb-2">Cost Value</label>
                                <input 
                                    type="number" 
                                    value={penaltyValue}
                                    onChange={e => setPenaltyValue(Number(e.target.value))}
                                    className="w-full bg-[#0a0a0a] border border-red-900/30 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-red-500 text-center font-mono"
                                />
                            </div>
                        </div>

                        {penaltyType === 'stat' && (
                            <div>
                                <label className="block text-[9px] text-red-500 uppercase font-bold tracking-widest mb-2">Target Attribute</label>
                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                    {Object.values(Stat).map(s => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setSelectedStat(s)}
                                            className={`px-3 py-1.5 rounded border text-[9px] font-bold transition-all ${selectedStat === s ? 'bg-red-900/50 border-red-500 text-white' : 'border-zinc-800 text-zinc-500'}`}
                                            style={{ color: selectedStat === s ? STAT_COLORS[s] : undefined, borderColor: selectedStat === s ? STAT_COLORS[s] : undefined }}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-2 rounded-lg border border-zinc-800 text-zinc-500 text-[10px] font-bold uppercase hover:bg-zinc-900">Cancel</button>
                            <button type="submit" className="flex-1 py-2 rounded-lg bg-red-600 text-white text-[10px] font-bold uppercase hover:bg-red-500 shadow-[0_0_10px_rgba(220,38,38,0.3)]">Confirm Law</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
