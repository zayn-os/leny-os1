
import React, { useState } from 'react';
import { useLifeOS } from '../contexts/LifeOSContext';
import { CheckCircle, AlertTriangle, Trophy, Info, X, Zap } from 'lucide-react';
import { Toast } from '../types/types';

// 🟢 SUB-COMPONENT: Individual Toast with Swipe Logic
const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
    const [startX, setStartX] = useState<number | null>(null);
    const [offsetX, setOffsetX] = useState(0);
    const [isExiting, setIsExiting] = useState(false);

    // Split message logic
    const parts = toast.message.split('|');
    const title = parts[0].trim();
    const details = parts.length > 1 ? parts[1].trim() : null;

    // 👆 TOUCH START
    const handleTouchStart = (e: React.TouchEvent) => {
        setStartX(e.targetTouches[0].clientX);
    };

    // 👈 TOUCH MOVE (Visual Feedback)
    const handleTouchMove = (e: React.TouchEvent) => {
        if (startX === null) return;
        const currentX = e.targetTouches[0].clientX;
        const diff = currentX - startX;
        // Only allow swiping right or slightly left (resistance)
        if (diff > 0) setOffsetX(diff);
    };

    // 👋 TOUCH END (Decide Action)
    const handleTouchEnd = () => {
        if (offsetX > 100) {
            // Swipe Threshold Met -> Dismiss
            handleDismiss();
        } else {
            // Snap back
            setOffsetX(0);
            setStartX(null);
        }
    };

    const handleDismiss = () => {
        setIsExiting(true); // Trigger exit animation
        setOffsetX(500); // Fly off screen
        setTimeout(() => {
            onDismiss(toast.id);
        }, 200); // Wait for animation
    };

    return (
        <div 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleDismiss}
            style={{ 
                transform: `translateX(${offsetX}px)`,
                opacity: isExiting ? 0 : 1 - (offsetX / 300), // Fade out as you swipe
                transition: startX !== null ? 'none' : 'all 0.2s ease-out' 
            }}
            className={`
                pointer-events-auto cursor-pointer relative overflow-hidden touch-pan-y
                min-w-[280px] max-w-sm w-full backdrop-blur-xl border shadow-2xl rounded-xl p-3
                flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300
                ${toast.type === 'error' ? 'bg-red-950/90 border-red-500/50 shadow-red-900/20' : 
                  toast.type === 'level-up' ? 'bg-life-gold/20 border-life-gold bg-black/90 shadow-life-gold/20' : 
                  toast.type === 'success' ? 'bg-green-950/90 border-green-500/50 shadow-green-900/20' : 
                  'bg-life-black/90 border-life-muted/30 shadow-black/50'}
            `}
        >
            {/* Icon Box */}
            <div className={`
                w-10 h-10 rounded-full flex items-center justify-center shrink-0 border
                ${toast.type === 'error' ? 'bg-red-500/20 border-red-500 text-red-500' : 
                  toast.type === 'level-up' ? 'bg-life-gold text-black border-life-gold animate-bounce' : 
                  toast.type === 'success' ? 'bg-green-500/20 border-green-500 text-green-500' : 
                  'bg-life-muted/20 border-life-muted text-life-muted'}
            `}>
                {toast.type === 'error' && <AlertTriangle size={20} />}
                {toast.type === 'level-up' && <Trophy size={20} strokeWidth={2.5} />}
                {toast.type === 'success' && <CheckCircle size={20} />}
                {toast.type === 'info' && <Info size={20} />}
                {toast.type === 'crit' && <Zap size={20} />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <span className="text-xs font-bold text-white leading-tight">
                    {title}
                </span>
                {details && (
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider mt-1 truncate ${toast.type === 'error' ? 'text-red-300' : 'text-life-gold'}`}>
                        {details}
                    </span>
                )}
            </div>

            {/* Dismiss Icon */}
            <div className="text-life-muted/50 hover:text-white transition-colors">
                <X size={14} />
            </div>
        </div>
    );
};

const ToastContainer: React.FC = () => {
    const { state, dispatch } = useLifeOS();
    const { toasts } = state.ui;

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-20 left-0 right-0 z-[150] flex flex-col items-center gap-2 pointer-events-none px-4">
            {toasts.map((toast) => (
                <ToastItem 
                    key={toast.id} 
                    toast={toast} 
                    onDismiss={(id) => dispatch.removeToast(id)} 
                />
            ))}
        </div>
    );
};

export default ToastContainer;
