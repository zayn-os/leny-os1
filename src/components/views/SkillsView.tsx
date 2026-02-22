
import React, { useState } from 'react';
import { BookOpen, Zap, Plus, X, Download } from 'lucide-react';
import { useSkills } from '../../contexts/SkillContext';
import { useLifeOS } from '../../contexts/LifeOSContext';
import SkillCard from '../cards/SkillCard';
import SkillForm from '../forms/SkillForm';

const SkillsView: React.FC = () => {
    const { skillState } = useSkills();
    const { dispatch } = useLifeOS();
    const { skills } = skillState;
    const [isAdding, setIsAdding] = useState(false);

    // Sort: Rusty first (to annoy user), then High Rank to Low Rank
    const sortedSkills = [...skills].sort((a, b) => {
        if (a.isRusty && !b.isRusty) return -1;
        if (!a.isRusty && b.isRusty) return 1;
        return b.level - a.level;
    });

    const handleExportSkills = () => {
        const exportData = {
            meta: {
                type: "SKILL_ARSENAL_EXPORT",
                generatedAt: new Date().toISOString(),
                count: skills.length
            },
            skills: skills.map(s => ({
                id: s.id,
                title: s.title,
                level: s.level,
                rank: s.rank,
                relatedStats: s.relatedStats,
                description: s.description,
                currentXP: s.currentXP,
                targetXP: s.targetXP,
                isRusty: s.isRusty
            }))
        };

        const jsonString = JSON.stringify(exportData, null, 2);
        
        dispatch.setModal('dataExchange', {
            mode: 'export',
            title: 'The Arsenal Codex',
            data: jsonString
        });
    };

    return (
        <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* 🟢 HEADER */}
            <div className="flex items-end justify-between mb-6 px-1">
                <div>
                    <h2 className="text-2xl font-black text-life-text tracking-tight flex items-center gap-2">
                        THE ARSENAL
                    </h2>
                    <p className="text-xs text-life-muted uppercase tracking-widest mt-1">
                        Skill Tree • {skills.length} Abilities Acquired
                    </p>
                </div>
                <button 
                    onClick={handleExportSkills}
                    className="p-3 rounded-xl bg-life-paper/50 border border-life-muted/20 text-life-gold hover:bg-life-gold/10 hover:border-life-gold/50 transition-all group active:scale-95"
                    title="Export Skill Codex"
                >
                    <BookOpen size={20} className="group-hover:scale-110 transition-transform" />
                </button>
            </div>

            {/* 🟢 ACTION BUTTON (Specific to Skills) */}
            <div className="mb-6">
                <button 
                    onClick={() => setIsAdding(true)}
                    className="w-full py-3 rounded-xl border border-dashed border-life-muted/30 bg-life-paper/50 text-life-muted hover:text-life-gold hover:border-life-gold/50 hover:bg-life-gold/5 transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest group"
                >
                    <Plus size={16} className="group-hover:scale-110 transition-transform" />
                    Acquire New Skill
                </button>
            </div>

            {/* 🟢 SKILLS GRID */}
            <div>
                {sortedSkills.length > 0 ? (
                    sortedSkills.map(skill => (
                        <SkillCard key={skill.id} skill={skill} />
                    ))
                ) : (
                    <div className="py-12 text-center border-2 border-dashed border-life-muted/20 rounded-xl bg-life-paper/30">
                        <Zap size={32} className="mx-auto text-life-muted mb-3 opacity-50" />
                        <p className="text-life-muted text-sm font-bold">No Skills Learned</p>
                        <p className="text-[10px] text-life-muted/60 mt-1 uppercase tracking-wider">
                            Acquire new skills to track your progress.
                        </p>
                    </div>
                )}
            </div>

            {/* 🟢 LOCAL MODAL FOR ADDING SKILL */}
            {isAdding && (
                <div 
                    onClick={() => setIsAdding(false)} 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
                >
                    <div 
                        onClick={(e) => e.stopPropagation()} 
                        className="bg-life-paper w-full max-w-lg rounded-2xl border border-life-muted/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-4"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-life-muted/20 bg-life-black/50">
                            <h3 className="text-sm font-black tracking-tight text-life-text flex items-center gap-2 uppercase">
                                <BookOpen size={16} className="text-life-gold" /> Acquire Skill
                            </h3>
                            <button 
                                onClick={() => setIsAdding(false)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-life-muted hover:text-life-text hover:bg-life-muted/20 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <SkillForm onClose={() => setIsAdding(false)} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkillsView;
