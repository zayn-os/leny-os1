
import React, { useState } from 'react';
import { Dumbbell, Brain, Zap, Shield, Heart, Activity, ChevronRight, BookOpen, Palette } from 'lucide-react';
// --- تصحيح المسارات (الرجوع خطوتين ../../ والدخول للمجلدات الصحيحة) ---
import { useSkills } from '../../contexts/SkillContext';
import { Stat } from '../../types/types';
import { STAT_COLORS } from '../../types/constants';
interface SkillFormProps {
    onClose: () => void;
}

const SkillForm: React.FC<SkillFormProps> = ({ onClose }) => {
    const { skillDispatch } = useSkills();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedStats, setSelectedStats] = useState<Stat[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        if (selectedStats.length === 0) return; // Must select at least one

        skillDispatch.addSkill(title, selectedStats, description);
        onClose();
    };

    const toggleStat = (stat: Stat) => {
        if (selectedStats.includes(stat)) {
            setSelectedStats(selectedStats.filter(s => s !== stat));
        } else {
            // Optional: Limit to max 3 stats to prevent "Everything Skill"
            if (selectedStats.length < 3) {
                setSelectedStats([...selectedStats, stat]);
            }
        }
    };

    const StatIcon = ({ type }: { type: Stat }) => {
        switch (type) {
          case Stat.STR: return <Dumbbell size={18} />;
          case Stat.INT: return <Brain size={18} />;
          case Stat.DIS: return <Zap size={18} />;
          case Stat.PCE: return <Shield size={18} />;
          case Stat.EMT: return <Heart size={18} />;
          case Stat.CAM: return <Activity size={18} />;
          case Stat.CRT: return <Palette size={18} />;
          default: return <Activity size={18} />;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
            {/* Title & Desc */}
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">
                        Skill Name
                    </label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Graphic Design, MMA..."
                        autoFocus
                        className="w-full bg-life-black border border-zinc-800 rounded-lg p-3 text-life-text placeholder:text-life-muted/50 focus:outline-none focus:border-life-gold/50 transition-all font-medium"
                    />
                </div>
                
                <div>
                    <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">
                        Description
                    </label>
                    <textarea 
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Define the scope of this ability..."
                        className="w-full bg-life-black border border-zinc-800 rounded-lg p-3 text-sm text-life-text placeholder:text-life-muted/50 focus:outline-none focus:border-life-gold/50 transition-all resize-none"
                    />
                </div>
            </div>

            {/* Stats Selection (Multi-Select) */}
            <div>
                <label className="block text-[10px] text-life-muted uppercase font-bold tracking-widest mb-2">
                    Parent Attributes (Select 1-3)
                </label>
                {/* 🟢 Updated grid cols to 7 */}
                <div className="grid grid-cols-7 gap-2">
                    {Object.values(Stat).map((s) => {
                        const isSelected = selectedStats.includes(s);
                        return (
                            <button
                                key={s}
                                type="button"
                                onClick={() => toggleStat(s)}
                                className={`
                                    flex flex-col items-center justify-center p-2 rounded-lg border transition-all aspect-square relative
                                    ${isSelected 
                                        ? 'bg-life-muted/10 border-current shadow-lg scale-105' 
                                        : 'border-zinc-800 text-life-muted hover:bg-life-muted/5 opacity-70 hover:opacity-100'}
                                `}
                                style={{ color: isSelected ? STAT_COLORS[s] : undefined }}
                            >
                                <StatIcon type={s} />
                                <span className="text-[9px] font-bold mt-1">{s}</span>
                                {isSelected && (
                                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-current shadow-[0_0_5px_currentColor]" />
                                )}
                            </button>
                        );
                    })}
                </div>
                {selectedStats.length === 0 && (
                     <p className="text-[10px] text-life-hard mt-2 opacity-80">* Required: Link at least one attribute.</p>
                )}
            </div>

            {/* Submit */}
            <button
                type="submit"
                className={`
                    w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all mt-4
                    ${title && selectedStats.length > 0 ? 'bg-life-gold text-life-black hover:bg-yellow-400 shadow-[0_0_20px_rgba(251,191,36,0.3)]' : 'border-zinc-800 text-life-muted cursor-not-allowed'}
                `}
                disabled={!title || selectedStats.length === 0}
            >
                Acquire Skill <ChevronRight size={16} />
            </button>
        </form>
    );
};

export default SkillForm;
