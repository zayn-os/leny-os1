
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLifeOS } from '../contexts/LifeOSContext';
import { useTasks } from '../contexts/TaskContext';
import { useHabits } from '../contexts/HabitContext'; 
import { X, Play, Pause, CheckCircle, Volume2, VolumeX, StickyNote, Minimize2, LogOut, ListTodo, Check, CloudRain, Clock as ClockIcon, Waves, Music, ChevronUp } from 'lucide-react';
import { playSound } from '../utils/audio';
import { Difficulty, Stat } from '../types/types'; 

type NoiseType = 'none' | 'brown' | 'rain' | 'clock' | 'custom';

const FocusMode: React.FC = () => {
    const { state, dispatch } = useLifeOS();
    const { taskState, taskDispatch } = useTasks();
    const { habitState, habitDispatch } = useHabits(); 
    const { focusSession } = state.ui;

    // Audio Refs
    const audioCtxRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const customAudioElRef = useRef<HTMLAudioElement | null>(null);

    // 1. ALL STATE HOOKS AT THE TOP
    const [timeLeft, setTimeLeft] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [noiseType, setNoiseType] = useState<NoiseType>('none');
    const [showNoiseMenu, setShowNoiseMenu] = useState(false);
    const [activePanel, setActivePanel] = useState<'none' | 'notes' | 'subtasks'>('none');
    const [notes, setNotes] = useState('');

    // Resolve Item for Logic
    const activeItem = useMemo(() => {
        if (!focusSession) return null;
        const isHabit = focusSession.itemType === 'habit';
        return isHabit 
            ? habitState.habits.find(h => h.id === focusSession.itemId)
            : taskState.tasks.find(t => t.id === focusSession.itemId);
    }, [focusSession, habitState.habits, taskState.tasks]);

    // 🛑 FORCE STOP AUDIO HELPER
    const stopAudio = () => {
        if (sourceNodeRef.current) {
            try { 
                sourceNodeRef.current.stop(); 
                sourceNodeRef.current.disconnect(); 
            } catch(e) {}
            sourceNodeRef.current = null;
        }
        if (gainNodeRef.current) {
            try { gainNodeRef.current.disconnect(); } catch(e) {}
            gainNodeRef.current = null;
        }
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
            try { audioCtxRef.current.close(); } catch(e) {}
            audioCtxRef.current = null;
        }
        if (customAudioElRef.current) {
            customAudioElRef.current.pause();
            customAudioElRef.current.src = "";
            customAudioElRef.current = null;
        }
    };

    // 2. ALL EFFECTS AT THE TOP
    
    // Timer Sync Effect
    useEffect(() => {
        if (focusSession) {
            setTimeLeft(focusSession.durationMinutes * 60);
            setIsPaused(false);
        }
    }, [focusSession?.itemId, focusSession?.startTime]);

    // Cleanup Effect
    useEffect(() => {
        return () => stopAudio();
    }, []);

    // Validation Effect
    useEffect(() => {
        if (focusSession && !activeItem) {
            stopAudio();
            dispatch.endFocusSession();
        }
    }, [focusSession, activeItem, dispatch]);

    // Audio Generator Engine
    useEffect(() => {
        stopAudio();
        if (noiseType === 'none' || !focusSession) return;

        if (noiseType === 'custom') {
            if (state.ui.customAudio?.url) {
                const audio = new Audio(state.ui.customAudio.url);
                audio.loop = true;
                audio.volume = 0.5;
                audio.play().catch(e => console.error("Playback failed", e));
                customAudioElRef.current = audio;
            } else {
                dispatch.addToast('No Custom Track Loaded', 'error');
                setNoiseType('none');
            }
            return;
        }

        try {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            const ctx = audioCtxRef.current;
            gainNodeRef.current = ctx.createGain();
            gainNodeRef.current.connect(ctx.destination);

            let buffer: AudioBuffer | null = null;
            if (noiseType === 'brown') {
                const bufferSize = 2 * ctx.sampleRate;
                buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                let lastOut = 0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    data[i] = (lastOut + (0.02 * white)) / 1.02;
                    lastOut = data[i];
                    data[i] *= 3.5; 
                }
                gainNodeRef.current.gain.value = 0.15;
            } 
            else if (noiseType === 'rain') {
                const bufferSize = 2 * ctx.sampleRate;
                buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    b0 = 0.99886 * b0 + white * 0.0555179;
                    b1 = 0.99332 * b1 + white * 0.0750759;
                    b2 = 0.96900 * b2 + white * 0.1538520;
                    b3 = 0.86650 * b3 + white * 0.3104856;
                    b4 = 0.55000 * b4 + white * 0.5329522;
                    b5 = -0.7616 * b5 - white * 0.0168980;
                    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
                    b6 = white * 0.115926;
                }
                gainNodeRef.current.gain.value = 0.2;
            }
            else if (noiseType === 'clock') {
                const bufferSize = ctx.sampleRate; 
                buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    const t = i / ctx.sampleRate;
                    if (t < 0.15) { 
                        const noise = (Math.random() * 2 - 1) * Math.exp(-t * 80);
                        const tone = Math.sin(2 * Math.PI * 2800 * t) * Math.exp(-t * 100);
                        const body = Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 60);
                        data[i] = (noise * 0.4) + (tone * 0.3) + (body * 0.3);
                    } else {
                        data[i] = 0;
                    }
                }
                gainNodeRef.current.gain.value = 0.5; 
            }

            if (buffer) {
                sourceNodeRef.current = ctx.createBufferSource();
                sourceNodeRef.current.buffer = buffer;
                sourceNodeRef.current.loop = true;
                sourceNodeRef.current.connect(gainNodeRef.current);
                sourceNodeRef.current.start(0);
            }
        } catch (e) { console.error("Audio failed", e); }

        return () => stopAudio();
    }, [noiseType, !!focusSession]);

    // Timer Interval Effect
    useEffect(() => {
        let interval: number;
        if (!isPaused && timeLeft > 0 && focusSession) {
            interval = window.setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && !isPaused && focusSession) {
            playSound('level-up', true);
            setIsPaused(true);
        }
        return () => clearInterval(interval);
    }, [isPaused, timeLeft, !!focusSession]);

    // 3. RENDER GUARDS (AFTER ALL HOOKS)
    if (!focusSession || !activeItem) return null;

    const isHabit = focusSession.itemType === 'habit';
    const hasSubtasks = activeItem.subtasks && activeItem.subtasks.length > 0;
    const completedSubtasksCount = activeItem.subtasks?.filter(s => s.isCompleted).length || 0;
    const totalSubtasksCount = activeItem.subtasks?.length || 0;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleExit = (shouldCompleteItem: boolean = false) => {
        stopAudio();
        const totalDurationSeconds = focusSession.durationMinutes * 60;
        const elapsedSeconds = totalDurationSeconds - timeLeft;
        const minutesFocused = Math.floor(elapsedSeconds / 60);
        
        if (minutesFocused >= 1) {
            const xpEarned = Math.floor(minutesFocused * 2);
            dispatch.updateUser({ 
                currentXP: state.user.currentXP + xpEarned,
                dailyXP: state.user.dailyXP + xpEarned
            });
            dispatch.addToast(`Focused for ${minutesFocused}m (+${xpEarned} XP)`, 'success');
        }

        if (notes.trim()) {
            const lines = notes.split('\n').filter(line => line.trim().length > 0);
            lines.forEach(line => {
                taskDispatch.addTask({
                    title: line.trim(),
                    difficulty: Difficulty.EASY,
                    stat: Stat.INT,
                    energyLevel: 'low',
                    isTimed: false,
                    subtasks: [],
                    categoryId: undefined
                });
            });
            dispatch.addToast(`${lines.length} Missions added from notes`, 'info');
        }
        
        if (shouldCompleteItem) {
            if (isHabit) habitDispatch.processHabit(activeItem.id, 'completed');
            else taskDispatch.toggleTask(activeItem.id);
        }

        dispatch.endFocusSession();
    };

    const handleToggleSubtask = (subId: string) => {
        playSound('click', true);
        if (isHabit) habitDispatch.toggleSubtask(activeItem.id, subId);
        else taskDispatch.toggleSubtask(activeItem.id, subId);
    };

    const getNoiseLabel = () => {
        switch(noiseType) {
            case 'brown': return 'Brown';
            case 'rain': return 'Rain';
            case 'clock': return 'Tick';
            case 'custom': return 'Track';
            default: return 'Mute';
        }
    };

    const getNoiseIcon = () => {
        switch(noiseType) {
            case 'brown': return <Waves size={18} />;
            case 'rain': return <CloudRain size={18} />;
            case 'clock': return <ClockIcon size={18} />;
            case 'custom': return <Music size={18} />;
            default: return <VolumeX size={18} />;
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black text-white flex flex-col animate-in fade-in duration-500">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] pointer-events-none" />
            <div className={`absolute inset-0 bg-life-gold/5 blur-[100px] rounded-full transition-opacity duration-[3000ms] ${isPaused ? 'opacity-10' : 'opacity-40 animate-pulse-slow'}`} />

            <div className="relative z-10 flex justify-between items-center p-6">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-life-muted">Focus Protocol Active</span>
                </div>
                <button onClick={() => handleExit(false)} className="p-2 rounded-full hover:bg-white/10 text-life-muted hover:text-life-hard transition-all flex items-center gap-1">
                    <span className="text-[10px] font-bold uppercase hidden sm:inline">Abort</span>
                    <LogOut size={18} />
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-6 text-center">
                <div className="mb-4 text-[9px] font-black uppercase tracking-[0.2em] bg-white/5 px-3 py-1 rounded-full border border-zinc-800 text-life-gold">
                    {isHabit ? 'PROTOCOL' : 'MISSION'} TARGET
                </div>
                <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-8 max-w-2xl leading-tight">
                    {activeItem.title}
                </h2>

                <div className="relative mb-12">
                    <svg className="w-64 h-64 md:w-80 md:h-80 transform -rotate-90">
                        <circle cx="50%" cy="50%" r="48%" className="stroke-life-muted/10 fill-none" strokeWidth="4" />
                        <circle cx="50%" cy="50%" r="48%" className={`fill-none transition-all duration-1000 ${isPaused ? 'stroke-life-muted' : 'stroke-life-gold'}`} strokeWidth="4" strokeDasharray="301.59" strokeDashoffset={301.59 * (1 - timeLeft / (focusSession.durationMinutes * 60))} pathLength="301.59" strokeLinecap="round" style={{ filter: isPaused ? 'none' : 'drop-shadow(0 0 15px rgba(251,191,36,0.5))' }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-6xl md:text-8xl font-mono font-bold tracking-tighter tabular-nums">{formatTime(timeLeft)}</div>
                        <button onClick={() => setIsPaused(!isPaused)} className="mt-4 px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-zinc-800 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all">
                            {isPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />} {isPaused ? "Resume" : "Pause"}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full justify-center max-w-md relative">
                    <div className="relative">
                        {showNoiseMenu && (
                            <div className="absolute bottom-full left-0 mb-2 w-32 bg-life-black border border-life-gold/30 rounded-xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-2 z-50 flex flex-col">
                                {[
                                    { id: 'none', label: 'Mute', icon: <VolumeX size={14} /> },
                                    { id: 'brown', label: 'Brown Noise', icon: <Waves size={14} /> },
                                    { id: 'rain', label: 'Rain', icon: <CloudRain size={14} /> },
                                    { id: 'clock', label: 'Tick', icon: <ClockIcon size={14} /> },
                                    { id: 'custom', label: 'Custom', icon: <Music size={14} /> },
                                ].map((opt) => (
                                    <button 
                                        key={opt.id}
                                        onClick={() => { setNoiseType(opt.id as NoiseType); setShowNoiseMenu(false); }}
                                        className={`flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider hover:bg-life-gold/10 transition-colors ${noiseType === opt.id ? 'text-life-gold bg-life-gold/5' : 'text-life-muted'}`}
                                    >
                                        {opt.icon} {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                        <button 
                            onClick={() => setShowNoiseMenu(!showNoiseMenu)}
                            className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all w-20 shrink-0 ${noiseType !== 'none' ? 'bg-life-gold/20 border-life-gold text-life-gold' : 'bg-white/5 border-zinc-800 text-life-muted hover:text-white'}`}
                        >
                            {getNoiseIcon()}
                            <div className="flex items-center gap-1">
                                <span className="text-[8px] font-bold uppercase">{getNoiseLabel()}</span>
                                <ChevronUp size={8} />
                            </div>
                        </button>
                    </div>

                    <button onClick={() => setActivePanel(activePanel === 'notes' ? 'none' : 'notes')} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all w-20 shrink-0 ${activePanel === 'notes' ? 'bg-life-easy/20 border-life-easy text-life-easy' : 'bg-white/5 border-zinc-800 text-life-muted hover:text-white'}`}>
                        <StickyNote size={18} />
                        <span className="text-[8px] font-bold uppercase">Notes</span>
                    </button>

                    {hasSubtasks && (
                        <button onClick={() => setActivePanel(activePanel === 'subtasks' ? 'none' : 'subtasks')} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all w-20 shrink-0 ${activePanel === 'subtasks' ? 'bg-life-gold/20 border-life-gold text-life-gold' : 'bg-white/5 border-zinc-800 text-life-muted hover:text-white'}`}>
                            <ListTodo size={18} />
                            <div className="flex flex-col items-center leading-none">
                                <span className="text-[8px] font-bold uppercase">Steps</span>
                                <span className="text-[7px] opacity-60">{completedSubtasksCount}/{totalSubtasksCount}</span>
                            </div>
                        </button>
                    )}

                    <button onClick={() => handleExit(true)} className="p-3 rounded-xl border border-life-easy/50 bg-life-easy/10 text-life-easy hover:bg-life-easy hover:text-black transition-all flex flex-col items-center gap-1 w-20 shrink-0 group">
                        <CheckCircle size={18} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[8px] font-bold uppercase">Done</span>
                    </button>
                </div>

                <div className={`absolute bottom-0 left-0 right-0 bg-[#111] border-t border-zinc-800 p-6 rounded-t-3xl transition-transform duration-300 ease-out z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] h-[40vh] flex flex-col ${activePanel === 'notes' ? 'translate-y-0' : 'translate-y-full'}`}>
                    <div className="flex justify-between items-center mb-4 shrink-0">
                        <h3 className="text-xs font-bold uppercase text-life-muted tracking-widest flex items-center gap-2"><StickyNote size={14} /> Distraction Pad</h3>
                        <button onClick={() => setActivePanel('none')} className="text-life-muted hover:text-white"><X size={16} /></button>
                    </div>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Dump thoughts here..." className="w-full h-full bg-black/50 rounded-xl border border-zinc-800 p-4 text-sm text-life-text focus:outline-none focus:border-life-gold resize-none font-mono leading-relaxed" />
                </div>

                <div className={`absolute bottom-0 left-0 right-0 bg-[#111] border-t border-zinc-800 p-6 rounded-t-3xl transition-transform duration-300 ease-out z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] h-[50vh] flex flex-col text-left ${activePanel === 'subtasks' ? 'translate-y-0' : 'translate-y-full'}`}>
                    <div className="flex justify-between items-center mb-4 shrink-0">
                        <h3 className="text-xs font-bold uppercase text-life-gold tracking-widest flex items-center gap-2"><ListTodo size={14} /> Tactical Objectives</h3>
                        <button onClick={() => setActivePanel('none')} className="text-life-muted hover:text-white"><X size={16} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {activeItem.subtasks?.map(st => (
                            <div key={st.id} onClick={() => handleToggleSubtask(st.id)} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${st.isCompleted ? 'bg-life-gold/10 border-life-gold/30 opacity-60' : 'bg-white/5 border-zinc-800 hover:bg-white/10'}`}>
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${st.isCompleted ? 'bg-life-gold border-life-gold text-black' : 'border-life-muted text-transparent'}`}><Check size={12} strokeWidth={4} /></div>
                                <span className={`text-sm ${st.isCompleted ? 'line-through text-life-gold' : 'text-life-text'}`}>{st.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FocusMode;
