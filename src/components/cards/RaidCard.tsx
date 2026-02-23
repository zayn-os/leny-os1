
import React, { useState } from 'react';
import { Shield, AlertTriangle, Check, ChevronDown, ChevronUp, Brain, Dumbbell, Activity, Heart, Zap, BookOpen, Calendar, FileText, Maximize2, Target, Palette, Copy, CheckSquare, Square } from 'lucide-react';
import { Raid, RaidStep } from '../../types/raidTypes';
import { Stat } from '../../types/types';
import { DIFFICULTY_COLORS, STAT_COLORS } from '../../types/constants';
import { useSkills } from '../../contexts/SkillContext';
import { useLifeOS } from '../../contexts/LifeOSContext';

interface RaidCardProps {
  raid: Raid;
  onToggleStep: (raidId: string, stepId: string) => void;
}

const StatIcon = ({ stat, size = 14 }: { stat: Stat; size?: number }) => {
  switch (stat) {
    case Stat.STR: return <Dumbbell size={size} />;
    case Stat.INT: return <Brain size={size} />;
    case Stat.DIS: return <Zap size={size} />;
    case Stat.PCE: return <Shield size={size} />;
    case Stat.EMT: return <Heart size={size} />;
    case Stat.CAM: return <Activity size={size} />;
    case Stat.CRT: return <Palette size={size} />;
    default: return <Activity size={size} />;
  }
};

const RaidCard: React.FC<RaidCardProps> = ({ raid, onToggleStep }) => {
  const { dispatch } = useLifeOS();
  const [isExpanded, setIsExpanded] = useState(false);
  const { skillState } = useSkills();
  
  // 🟢 SELECTION MODE STATE
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedSteps, setSelectedSteps] = useState<Set<string>>(new Set());

  const linkedSkill = raid.skillId ? skillState.skills.find(s => s.id === raid.skillId) : null;
  
  // Under-leveled logic
  let isUnderLeveled = false;
  let warningMsg = "";
  if (raid.requirements) {
      const reqSkill = skillState.skills.find(s => s.id === raid.requirements!.skillId);
      if (reqSkill && reqSkill.level < raid.requirements.minLevel) {
          isUnderLeveled = true;
          warningMsg = `Rec: ${reqSkill.title} Lv.${raid.requirements.minLevel}`;
      } else if (!reqSkill) {
          isUnderLeveled = true;
          warningMsg = `Req: Lv.${raid.requirements.minLevel}`;
      }
  }

  // 🛡️ SAFE GUARD: Check if stats exist and has at least one item
  const primaryStat = (raid.stats && raid.stats.length > 0) ? raid.stats[0] : Stat.STR;
  const statColor = STAT_COLORS[primaryStat]; 

  const openRaidDetails = (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch.setModal('itemDetails', { itemId: raid.id, type: 'raid' });
  };

  const openStepDetails = (e: React.MouseEvent, stepId: string) => {
      e.stopPropagation();
      dispatch.setModal('itemDetails', { itemId: stepId, parentId: raid.id, type: 'raid_step' });
  };

  // 📋 SELECTION LOGIC
  const toggleStepSelection = (stepId: string) => {
      setSelectedSteps(prev => {
          const next = new Set(prev);
          if (next.has(stepId)) next.delete(stepId);
          else next.add(stepId);
          return next;
      });
  };

  const handleCopyForAI = (e: React.MouseEvent) => {
      e.stopPropagation();
      
      const stepsToExport = raid.steps.filter(s => selectedSteps.has(s.id));
      if (stepsToExport.length === 0) return;

      const payload = {
          context: "UPDATE_RAID_STEPS",
          raidId: raid.id,
          raidTitle: raid.title,
          selectedSteps: stepsToExport.map(s => ({
              id: s.id,
              title: s.title,
              notes: s.notes,
              difficulty: s.difficulty,
              stat: s.stat
          })),
          instruction: "Update these steps with more details, better notes, or adjust difficulty/stats. CRITICAL: Preserve all IDs. Return valid JSON: { \"raids\": [{ \"id\": \"...\", \"steps\": [...] }] }"
      };

      navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      dispatch.addToast(`${selectedSteps.size} Steps Copied for AI`, 'info');
      setIsSelectionMode(false);
      setSelectedSteps(new Set());
  };

  return (
    <div className={`mb-4 bg-life-paper border rounded-xl overflow-hidden shadow-lg relative transition-all ${isUnderLeveled ? 'border-orange-500/30' : 'border-zinc-800'}`}>
      
      {/* 🟢 RAID HEADER */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 bg-life-paper relative cursor-pointer active:bg-life-muted/5 transition-colors group"
      >
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-life-muted/20">
             <div 
                className="h-full transition-all duration-700 ease-out"
                style={{ width: `${raid.progress}%`, backgroundColor: statColor }} 
             />
        </div>

        <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
                 {/* Raid Stats Icons Box */}
                 <div className={`w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center bg-life-black ${DIFFICULTY_COLORS[raid.difficulty]}`} style={{ borderColor: statColor }}>
                    <div className="flex flex-wrap items-center justify-center gap-0.5 p-0.5">
                        {(raid.stats || []).slice(0, 4).map(s => (
                            <div key={s} style={{ color: STAT_COLORS[s] }}>
                                <StatIcon stat={s} size={10} />
                            </div>
                        ))}
                    </div>
                 </div>
                 
                 <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-life-text leading-tight">{raid.title}</h3>
                        
                        {/* 🔵 G12 BADGE (INDIGO) */}
                        {raid.isCampaign && (
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded border border-indigo-500/50 bg-indigo-500/10 text-indigo-300 flex items-center gap-1 uppercase tracking-wider shadow-[0_0_5px_rgba(99,102,241,0.2)]">
                                <Target size={8} /> G12
                            </span>
                        )}

                        {linkedSkill && (
                            <span className="text-[8px] border px-1.5 py-px rounded flex items-center gap-1 uppercase tracking-wider text-life-gold border-life-gold/30 bg-life-gold/10">
                                <BookOpen size={8} /> {linkedSkill.title}
                            </span>
                        )}

                        {/* 🟢 MULTI-STAT DISPLAY */}
                        {linkedSkill && linkedSkill.relatedStats && linkedSkill.relatedStats.length > 0 ? (
                            linkedSkill.relatedStats.map((stat: Stat) => (
                                <span key={stat} className="text-[8px] font-black px-1.5 py-0.5 rounded border border-zinc-800 bg-life-black text-life-muted flex items-center gap-1 uppercase tracking-wider" style={{ color: STAT_COLORS[stat], borderColor: `${STAT_COLORS[stat]}40` }}>
                                    <StatIcon stat={stat} size={8} /> {stat}
                                </span>
                            ))
                        ) : (
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded border border-zinc-800 bg-life-black text-life-muted flex items-center gap-1 uppercase tracking-wider" style={{ color: statColor, borderColor: `${statColor}40` }}>
                                <StatIcon stat={primaryStat} size={8} /> {primaryStat}
                            </span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-life-muted bg-life-muted/10 px-1.5 rounded">
                            {raid.difficulty.toUpperCase()}
                        </span>
                        
                        {/* Deadline */}
                        {raid.deadline && (
                            <span className="text-[10px] font-mono text-life-muted flex items-center gap-1">
                                <Calendar size={10} /> {new Date(raid.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                        )}

                        {isUnderLeveled && (
                             <span className="text-[9px] font-bold text-orange-400 flex items-center gap-1 bg-orange-400/10 px-1.5 rounded border border-orange-400/20">
                                <AlertTriangle size={10} /> {warningMsg}
                            </span>
                        )}
                    </div>
                 </div>
            </div>

            <div className="flex items-center gap-2 text-life-muted">
                {/* 📋 SELECTION TOGGLE */}
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsSelectionMode(!isSelectionMode); setIsExpanded(true); }}
                    className={`p-1.5 rounded-full transition-all ${isSelectionMode ? 'bg-life-gold text-black' : 'hover:bg-life-muted/10 text-life-muted'}`}
                    title="Select Steps for AI Update"
                >
                    <CheckSquare size={16} />
                </button>

                <button onClick={openRaidDetails} className="p-1.5 rounded-full hover:bg-life-muted/10 opacity-0 group-hover:opacity-100 transition-all">
                    <Maximize2 size={16} />
                </button>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
        </div>
      </div>

      {/* 🟢 STEPS LIST (EXPANDABLE) */}
      {isExpanded && (
        <div className="bg-black/20 border-t border-life-muted/10 p-2">
            
            {/* 📋 SELECTION ACTIONS */}
            {isSelectionMode && (
                <div className="flex justify-between items-center mb-2 px-2 animate-in slide-in-from-top-2">
                    <span className="text-[10px] font-bold text-life-gold uppercase tracking-widest">
                        {selectedSteps.size} Selected
                    </span>
                    <button 
                        onClick={handleCopyForAI}
                        disabled={selectedSteps.size === 0}
                        className="flex items-center gap-1 bg-life-gold text-black px-3 py-1 rounded text-[10px] font-black uppercase hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Copy size={10} /> Copy for AI
                    </button>
                </div>
            )}

            <div className="space-y-1">
                {raid.steps.map((step) => {
                    const isDiffOverride = step.difficulty && step.difficulty !== raid.difficulty;
                    const isStatOverride = step.stat && step.stat !== primaryStat;
                    const isSelected = selectedSteps.has(step.id);
                    
                    // Difficulty Override Colors
                    let overrideBorderColor = statColor;
                    if (isDiffOverride) {
                        if (step.difficulty === 'easy') overrideBorderColor = '#10b981'; // Green
                        else if (step.difficulty === 'normal') overrideBorderColor = '#3b82f6'; // Blue
                        else if (step.difficulty === 'hard') overrideBorderColor = '#ef4444'; // Red
                    }

                    return (
                        <div key={step.id} className="group flex gap-2 items-center">
                            
                            {/* 📋 CHECKBOX FOR SELECTION */}
                            {isSelectionMode && (
                                <button 
                                    onClick={() => toggleStepSelection(step.id)}
                                    className={`shrink-0 transition-all ${isSelected ? 'text-life-gold' : 'text-life-muted/30 hover:text-life-muted'}`}
                                >
                                    {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                                </button>
                            )}

                            <div 
                                className={`
                                    w-full flex items-center justify-between p-3 rounded-lg text-left transition-all
                                    ${step.isCompleted 
                                        ? 'bg-life-easy/5 text-life-muted line-through opacity-70' 
                                        : step.isLocked
                                            ? 'bg-transparent text-life-muted/30'
                                            : 'bg-life-paper hover:bg-life-muted/10 text-life-text border-l-2'}
                                `}
                                style={{ 
                                    borderLeftColor: !step.isLocked && !step.isCompleted ? overrideBorderColor : 'transparent'
                                }}
                            >
                                <div 
                                    className="flex items-center gap-3 flex-1 cursor-pointer"
                                    onClick={() => !isSelectionMode && openStepDetails({ stopPropagation: () => {} } as any, step.id)}
                                >
                                    {/* Checkbox / Lock Icon (Disabled in Selection Mode) */}
                                    {!isSelectionMode && (
                                        <button
                                            disabled={step.isLocked}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleStep(raid.id, step.id);
                                            }}
                                            className={`
                                                w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0
                                                ${step.isCompleted 
                                                    ? 'bg-life-easy border-life-easy text-life-black' 
                                                    : step.isLocked 
                                                        ? 'border-zinc-800 bg-life-muted/5 cursor-not-allowed'
                                                        : 'border-life-muted text-transparent hover:border-life-gold'}
                                            `}
                                        >
                                            {step.isCompleted && <Check size={14} strokeWidth={3} />}
                                            {step.isLocked && !step.isCompleted && <div className="w-1.5 h-1.5 rounded-full bg-life-muted/30" />}
                                        </button>
                                    )}

                                    <div className="flex flex-col flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-medium truncate">{step.title}</span>
                                            
                                            {/* 🟢 OVERRIDE TAGS */}
                                            {isDiffOverride && (
                                                <span className={`text-[7px] font-black px-1 rounded border uppercase tracking-tighter ${
                                                    step.difficulty === 'easy' ? 'border-life-easy text-life-easy bg-life-easy/5' :
                                                    step.difficulty === 'normal' ? 'border-blue-500 text-blue-400 bg-blue-500/5' :
                                                    'border-life-hard text-life-hard bg-life-hard/5'
                                                }`}>
                                                    {step.difficulty?.substring(0, 3)}
                                                </span>
                                            )}
                                            
                                            {isStatOverride && (
                                                <span className="text-[7px] font-black px-1 rounded border border-zinc-800 bg-life-black flex items-center gap-0.5 uppercase tracking-tighter" style={{ color: STAT_COLORS[step.stat!], borderColor: `${STAT_COLORS[step.stat!]}40` }}>
                                                    <StatIcon stat={step.stat!} size={6} /> {step.stat}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Details Button */}
                                    {!isSelectionMode && (
                                        <button 
                                            onClick={(e) => openStepDetails(e, step.id)} 
                                            className="p-1 rounded-full text-life-muted hover:text-life-gold transition-colors"
                                        >
                                            {step.notes ? <FileText size={12} className="text-life-gold" /> : <Maximize2 size={12} />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      )}
    </div>
  );
};

export default RaidCard;
