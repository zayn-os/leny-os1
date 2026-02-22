
import React, { useState, useEffect } from 'react';
import { Activity, ChevronRight, Terminal } from 'lucide-react';
import { useLifeOS } from '../contexts/LifeOSContext';
import { Stat } from '../types/types';
import { playSound } from '../utils/audio';

const OnboardingSequence: React.FC = () => {
    const { dispatch } = useLifeOS();
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [isExiting, setIsExiting] = useState(false);

    // Typing effect logic
    const [text, setText] = useState('');
    const [targetText, setTargetText] = useState("INITIALIZING NEURAL LINK...");
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        setText('');
        setIsTyping(true);
        let i = 0;
        const interval = setInterval(() => {
            setText(targetText.slice(0, i + 1));
            i++;
            if (i >= targetText.length) {
                clearInterval(interval);
                setIsTyping(false);
            }
        }, 30);
        return () => clearInterval(interval);
    }, [targetText]);

    const handleNext = () => {
        playSound('click', true);
        if (step === 0) {
            setTargetText("IDENTITY VERIFICATION REQUIRED.");
            setStep(1);
        } else if (step === 1 && name) {
            setTargetText("SYNCHRONIZATION COMPLETE. WELCOME.");
            setStep(2); // Skip straight to final step
        }
    };

    const handleComplete = () => {
        if (name) {
            setIsExiting(true);
            playSound('level-up', true);
            setTimeout(() => {
                // Auto-assign defaults for skipped steps: Title="Initiate", Stat=DIS (Discipline)
                dispatch.completeOnboarding(name, "Initiate", Stat.DIS);
            }, 1000);
        }
    };

    if (isExiting) {
        return (
            <div className="fixed inset-0 z-[999] bg-black flex items-center justify-center animate-out fade-out duration-1000">
                <div className="text-life-gold text-sm font-mono animate-pulse">SYSTEM ONLINE</div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[999] bg-[#050505] flex flex-col items-center justify-center p-6 font-mono overflow-hidden">
            
            {/* BACKGROUND MATRIX */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, #222 25%, #222 26%, transparent 27%, transparent 74%, #222 75%, #222 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, #222 25%, #222 26%, transparent 27%, transparent 74%, #222 75%, #222 76%, transparent 77%, transparent)', backgroundSize: '50px 50px' }}>
            </div>

            <div className="w-full max-w-md relative z-10 flex flex-col h-full justify-center">
                
                {/* 🟢 TERMINAL OUTPUT */}
                <div className="mb-8 min-h-[60px] border-l-2 border-life-gold pl-4 py-2">
                    <div className="text-xs text-life-gold/50 mb-1 flex items-center gap-2">
                        <Terminal size={12} /> PROTOCOL_INIT_V1.0
                    </div>
                    <h1 className="text-lg md:text-xl text-life-gold font-bold leading-tight">
                        {text}
                        <span className="animate-pulse">_</span>
                    </h1>
                </div>

                {/* 🟢 STEP 0: WELCOME */}
                {step === 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="w-24 h-24 bg-life-gold/10 rounded-full border border-life-gold/30 flex items-center justify-center mx-auto mb-8 relative">
                            <Activity size={40} className="text-life-gold animate-pulse-slow" />
                            <div className="absolute inset-0 border border-life-gold rounded-full animate-[spin_10s_linear_infinite] opacity-30 border-t-transparent border-l-transparent" />
                        </div>
                        <p className="text-center text-life-muted text-xs mb-12 max-w-xs mx-auto leading-relaxed">
                            Welcome to LifeOS. This interface will augment your daily operations, turning chaos into order and effort into progression.
                        </p>
                        <button onClick={handleNext} disabled={isTyping} className="w-full py-4 bg-life-gold hover:bg-yellow-400 text-black font-black uppercase tracking-[0.2em] rounded-sm transition-all hover:scale-[1.02]">
                            Initialize System
                        </button>
                    </div>
                )}

                {/* 🟢 STEP 1: NAME */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="mb-8">
                            <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">Codename</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter Name..."
                                autoFocus
                                className="w-full bg-transparent border-b-2 border-life-muted/30 py-2 text-2xl font-bold text-white focus:outline-none focus:border-life-gold transition-colors text-center"
                            />
                        </div>
                        <button onClick={handleNext} disabled={!name} className="w-full py-4 border border-life-gold text-life-gold hover:bg-life-gold hover:text-black font-black uppercase tracking-[0.2em] rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            Confirm Identity
                        </button>
                    </div>
                )}

                {/* 🟢 STEP 2: FINAL */}
                {step === 2 && (
                    <div className="animate-in fade-in zoom-in-95 duration-700 text-center">
                        <div className="mb-8 border border-life-gold/30 bg-life-gold/5 p-6 rounded-lg relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-life-gold animate-[loading_2s_ease-in-out_infinite]" />
                            <h2 className="text-2xl font-black text-white uppercase mb-1">{name}</h2>
                            <p className="text-life-gold font-mono text-sm uppercase tracking-widest">READY</p>
                            <div className="mt-4 pt-4 border-t border-life-gold/20 flex justify-center gap-4 text-[10px] text-life-muted uppercase font-bold">
                                <span>Lvl 1</span>
                                <span>Status: ONLINE</span>
                            </div>
                        </div>
                        
                        <button onClick={handleComplete} className="w-full py-4 bg-life-gold hover:bg-yellow-400 text-black font-black uppercase tracking-[0.2em] rounded-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
                            Enter LifeOS <ChevronRight size={18} />
                        </button>
                    </div>
                )}

            </div>
            
            {/* Step Indicators */}
            <div className="absolute bottom-8 flex gap-2">
                {[0,1,2].map(i => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === step ? 'bg-life-gold' : 'bg-life-muted/20'}`} />
                ))}
            </div>

            <style>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(0); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};

export default OnboardingSequence;
