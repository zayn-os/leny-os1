
import React from 'react';
import { AlertTriangle, Trash2, X, Check } from 'lucide-react';
import { useLifeOS } from '../../contexts/LifeOSContext';
const ConfirmationModal: React.FC = () => {
    const { state, dispatch } = useLifeOS();
    const { modalData } = state.ui;

    if (!modalData) return null;
    const { title, message, onConfirm, confirmText = "Confirm", isDangerous = false } = modalData;

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        dispatch.setModal('none');
    };

    return (
        <div 
            onClick={() => dispatch.setModal('none')}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                className="bg-life-paper border border-life-muted/20 w-full max-w-sm rounded-xl shadow-2xl p-6 relative overflow-hidden"
            >
                {isDangerous && <div className="absolute top-0 left-0 w-full h-1 bg-life-hard" />}
                
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-black text-life-text uppercase tracking-tight flex items-center gap-2">
                        {isDangerous && <AlertTriangle size={20} className="text-life-hard" />}
                        {title || 'Confirmation'}
                    </h3>
                    <button onClick={() => dispatch.setModal('none')} className="text-life-muted hover:text-white">
                        <X size={18} />
                    </button>
                </div>
                
                <p className="text-sm text-life-muted mb-6 leading-relaxed font-medium">
                    {message}
                </p>

                <div className="flex gap-3">
                    <button 
                        onClick={() => dispatch.setModal('none')}
                        className="flex-1 py-3 rounded-lg border border-life-muted/20 text-life-muted hover:text-life-text text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm}
                        className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${isDangerous ? 'bg-life-hard text-life-black hover:bg-red-500' : 'bg-life-gold text-life-black hover:bg-yellow-400'}`}
                    >
                        {isDangerous ? <Trash2 size={14} /> : <Check size={14} />}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
