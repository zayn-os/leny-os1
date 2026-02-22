
import React from 'react';
import { Clock, Calendar, CheckSquare, Hash, Minus, Plus, RotateCcw } from 'lucide-react';
import { HabitType } from '../../../types/habitTypes';

interface HabitFrequencySectionProps {
    habitType: HabitType;
    setHabitType: (t: HabitType) => void;
    selectedDays: number[];
    toggleDay: (d: number) => void;
    intervalVal: number;
    setIntervalVal: (v: number) => void;
    pattern: string;
    setPattern: React.Dispatch<React.SetStateAction<string>>;
    reps: number;
    setReps: (r: number) => void;
}

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const HabitFrequencySection: React.FC<HabitFrequencySectionProps> = ({
    habitType, setHabitType, selectedDays, toggleDay, 
    intervalVal, setIntervalVal, pattern, setPattern,
    reps, setReps
}) => {

    const togglePatternBit = (index: number) => {
        const newPat = pattern.split('');
        newPat[index] = newPat[index] === '1' ? '0' : '1';
        setPattern(newPat.join(''));
    };

    const increaseLength = () => setPattern(prev => prev + "1");
    const decreaseLength = () => { if (pattern.length > 1) setPattern(prev => prev.slice(0, -1)); };

    return (
        <div className="p-4 bg-life-black/40 rounded-xl border border-life-muted/10 space-y-4">
            <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest">
                Habit Taxonomy
            </label>
            
            <div className="grid grid-cols-2 gap-2">
                    {[
                    { id: 'daily', label: 'Daily', icon: <Clock size={14} /> },
                    { id: 'specific_days', label: 'Specific Days', icon: <Calendar size={14} /> },
                    { id: 'interval', label: 'Interval', icon: <CheckSquare size={14} /> },
                    { id: 'custom', label: 'The Matrix', icon: <Hash size={14} /> },
                    ].map(opt => (
                        <button
                        key={opt.id}
                        type="button"
                        onClick={() => setHabitType(opt.id as HabitType)}
                        className={`
                            flex items-center justify-center gap-2 py-3 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all
                            ${habitType === opt.id 
                                ? 'bg-life-gold/10 border-life-gold text-life-gold' 
                                : 'bg-life-black border-life-muted/20 text-life-muted hover:border-life-muted/50'}
                        `}
                        >
                            {opt.icon} {opt.label}
                        </button>
                    ))}
            </div>

            {habitType === 'specific_days' && (
                <div className="flex justify-between gap-1 pt-2">
                    {DAYS.map((d, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => toggleDay(idx)}
                            className={`w-10 h-10 rounded-lg border flex items-center justify-center text-sm font-bold transition-all ${selectedDays.includes(idx) ? 'bg-life-easy border-life-easy text-life-black' : 'border-life-muted/30 text-life-muted hover:bg-life-muted/10'}`}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            )}

            {habitType === 'interval' && (
                <div className="pt-2 flex items-center gap-4">
                    <span className="text-sm text-life-muted">Every</span>
                    <input type="number" min="2" max="365" value={intervalVal} onChange={(e) => setIntervalVal(parseInt(e.target.value) || 2)} className="w-20 bg-life-black border border-life-muted/50 rounded-lg p-2 text-center text-life-text font-mono font-bold focus:border-life-gold focus:outline-none" />
                    <span className="text-sm text-life-muted">Days</span>
                </div>
            )}

            {habitType === 'custom' && (
                <div className="pt-2">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-[10px] text-life-muted">The Matrix Pattern</p>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={decreaseLength} className="w-6 h-6 flex items-center justify-center rounded border border-life-muted/30 text-life-muted hover:text-white hover:border-life-muted/50 transition-all"><Minus size={12} /></button>
                            <span className="text-[10px] font-mono text-life-gold min-w-[24px] text-center">{pattern.length}d</span>
                            <button type="button" onClick={increaseLength} className="w-6 h-6 flex items-center justify-center rounded border border-life-muted/30 text-life-muted hover:text-white hover:border-life-muted/50 transition-all"><Plus size={12} /></button>
                            <div className="w-px h-3 bg-life-muted/20 mx-1" />
                            <button type="button" onClick={() => setPattern(pattern.includes('0') ? "11111111111111" : "00000000000000")} className="text-[10px] text-life-gold hover:underline flex items-center gap-1"><RotateCcw size={10} /> Reset</button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {pattern.split('').map((bit, idx) => (
                            <button key={idx} type="button" onClick={() => togglePatternBit(idx)} className={`w-6 h-8 rounded border text-[9px] font-mono flex items-center justify-center transition-all ${bit === '1' ? 'bg-life-gold border-life-gold text-life-black' : 'bg-life-black border-life-muted/20 text-life-muted/30 hover:bg-life-muted/10'}`} title={bit === '1' ? 'Active Day' : 'Rest Day'}>{bit}</button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
