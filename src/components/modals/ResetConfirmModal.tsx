
import React, { useState } from 'react';
import { AlertTriangle, Skull, Check, X, ShieldCheck, RefreshCw, Trash2 } from 'lucide-react';
import { useLifeOS } from '../../contexts/LifeOSContext';
const ResetConfirmModal: React.FC = () => {
    const { dispatch } = useLifeOS();
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = () => {
        setIsDeleting(true);
        // Add a small dramatic delay
        setTimeout(() => {
            dispatch.resetSystem();
        }, 1500);
    };

    const handleClose = () => {
        dispatch.setModal('none');
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-[#0f0505] border-2 border-red-600 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.3)] overflow-hidden relative flex flex-col animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                
                {/* 🚨 DANGER STRIPES */}
                <div className="h-2 w-full bg-[repeating-linear-gradient(45deg,#dc2626,#dc2626_10px,#000_10px,#000_20px)]" />

                {/* HEADER */}
                <div className="p-6 text-center border-b border-red-900/30 relative">
                    <div className="absolute top-4 right-4">
                        <button onClick={handleClose} className="text-red-800 hover:text-red-500 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <div className="w-20 h-20 bg-red-900/10 border border-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Skull size={40} className="text-red-600" />
                    </div>
                    
                    <h2 className="text-2xl font-black text-red-500 tracking-tighter uppercase mb-1">
                        System Rebirth
                    </h2>
                    <p className="text-[10px] text-red-400/60 font-mono tracking-widest uppercase">
                        Protocol 99: New Game Plus
                    </p>
                </div>

                {/* BODY */}
                <div className="p-6 space-y-6">
                    
                    <div className="text-center text-sm text-red-200/80 leading-relaxed font-medium">
                        Are you sure you want to wipe the current timeline? This action is <span className="text-red-500 font-bold underline decoration-red-500/50">irreversible</span>.
                    </div>

                    {/* COMPARISON GRID */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* DELETED */}
                        <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-3">
                            <div className="flex items-center gap-2 text-red-500 mb-2 border-b border-red-900/30 pb-2">
                                <Trash2 size={14} />
                                <span className="text-[10px] font-black uppercase tracking-wider">Deleted</span>
                            </div>
                            <ul className="space-y-1.5">
                                <li className="text-[10px] text-red-300 flex items-center gap-2"><span className="w-1 h-1 bg-red-500 rounded-full"/> Active Missions</li>
                                <li className="text-[10px] text-red-300 flex items-center gap-2"><span className="w-1 h-1 bg-red-500 rounded-full"/> Habit Streaks</li>
                                <li className="text-[10px] text-red-300 flex items-center gap-2"><span className="w-1 h-1 bg-red-500 rounded-full"/> Raid Progress</li>
                                <li className="text-[10px] text-red-300 flex items-center gap-2"><span className="w-1 h-1 bg-red-500 rounded-full"/> Gold & XP</li>
                            </ul>
                        </div>

                        {/* PRESERVED */}
                        <div className="bg-green-950/20 border border-green-900/30 rounded-xl p-3">
                            <div className="flex items-center gap-2 text-green-500 mb-2 border-b border-green-900/30 pb-2">
                                <ShieldCheck size={14} />
                                <span className="text-[10px] font-black uppercase tracking-wider">Preserved</span>
                            </div>
                            <ul className="space-y-1.5">
                                <li className="text-[10px] text-green-300/80 flex items-center gap-2"><Check size={10} /> Earned Badges</li>
                                <li className="text-[10px] text-green-300/80 flex items-center gap-2"><Check size={10} /> Store Items</li>
                                <li className="text-[10px] text-green-300/80 flex items-center gap-2"><Check size={10} /> Unlocked Themes</li>
                                <li className="text-[10px] text-green-300/80 flex items-center gap-2"><Check size={10} /> Skill Trees (Lvl 1)</li>
                            </ul>
                        </div>
                    </div>

                </div>

                {/* FOOTER ACTION */}
                <div className="p-6 pt-0">
                    <button 
                        onClick={handleConfirm}
                        disabled={isDeleting}
                        className={`
                            w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all
                            ${isDeleting 
                                ? 'bg-red-900 cursor-wait text-red-400' 
                                : 'bg-red-600 hover:bg-red-500 text-black shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:scale-[1.02] active:scale-[0.98]'}
                        `}
                    >
                        {isDeleting ? (
                            <>
                                <RefreshCw size={18} className="animate-spin" />
                                Wiping System...
                            </>
                        ) : (
                            <>
                                <AlertTriangle size={18} fill="currentColor" className="text-red-900" />
                                EXECUTE REBIRTH
                            </>
                        )}
                    </button>
                    {!isDeleting && (
                        <button 
                            onClick={handleClose}
                            className="w-full mt-3 py-2 text-[10px] font-bold text-red-500/50 uppercase tracking-widest hover:text-red-400"
                        >
                            Cancel Operation
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ResetConfirmModal;
