
import React, { useState } from 'react';
import { Flame, Check, Brain, Dumbbell, Activity, Heart, Zap, Shield, Maximize2, X, FolderInput, Trash2, Clock, Play, TrendingUp, ChevronDown, ChevronUp, Palette } from 'lucide-react';
import { Habit, DailyStatus } from '../../types/habitTypes';
import { Stat } from '../../types/types';
import { STAT_COLORS, DIFFICULTY_COLORS } from '../../types/constants';
import { getHabitLevel } from '../../utils/habitEngine';
import { useHabits } from '../../contexts/HabitContext';
import { useLifeOS } from '../../contexts/LifeOSContext';
import { useSkills } from '../../contexts/SkillContext'; // 👈 IMPORT
import { calculateTaskReward } from '../../utils/economyEngine'; // 👈 IMPORT

interface HabitCardProps {
  habit: Habit;
  onProcess: (id: string, status: DailyStatus) => void;
  onDelete: (id: string) => void;
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

const HabitCard: React.FC<HabitCardProps> = ({ habit, onProcess, onDelete }) => {
  const { habitState, habitDispatch } = useHabits();
  const { dispatch, state } = useLifeOS();
  const { skillState } = useSkills(); // 👈 USE HOOK
  const { categories } = habitState;
  
  const [isExpanded, setIsExpanded] = useState(false);

  const levelData = getHabitLevel(habit.streak);
  const linkedSkill = habit.skillId ? state.user.skills?.find((s: any) => s.id === habit.skillId) || skillState.skills.find(s => s.id === habit.skillId) : null;

  const isCompleted = habit.status === 'completed';
  const isFailed = habit.status === 'failed';
  const isPending = habit.status === 'pending';

  // Calculate Rewards Preview
  const potentialReward = calculateTaskReward(habit.difficulty, state.user.currentMode);

  // 🟢 REPS LOGIC
  const currentReps = habit.dailyProgress || 0;
  const targetReps = habit.dailyTarget || 1;
  const repsPercentage = Math.min(100, (currentReps / targetReps) * 100);

  // Subtasks Progress
  const subtasks = habit.subtasks || [];
  const completedSubtasks = subtasks.filter(st => st.isCompleted).length;
  const totalSubtasks = subtasks.length;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  let borderClass = '';
  if (isCompleted) {
      borderClass = 'border-life-easy bg-life-easy/5';
  } else if (isFailed) {
      borderClass = 'border-life-hard bg-life-hard/5';
  } else if (habit.shieldUsed) {
      borderClass = 'border-life-diamond/40 bg-life-diamond/5';
  } else {
      borderClass = `${DIFFICULTY_COLORS[habit.difficulty]} border-l-[6px]`; 
  }

  const handleMove = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newCatId = e.target.value;
      habitDispatch.moveHabit(habit.id, newCatId || undefined);
  };

  const openDetails = (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch.setModal('itemDetails', { itemId: habit.id, type: 'habit' });
  };

  const openStats = (e: React.MouseEvent) => {
      e.stopPropagation();
      habitDispatch.setActiveHabit(habit.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(habit.id);
  };

  const startFocus = (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch.startFocusSession(habit.id, habit.durationMinutes || 25, 'habit');
  };

  // History Dots
  const historyDots = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const isoDate = d.toISOString().split('T')[0];
      const isDone = habit.history.some(h => h.startsWith(isoDate));
      const isToday = i === 6;
      let statusColor = 'bg-life-muted/10';
      if (isDone) statusColor = 'bg-life-easy';
      else if (isToday) {
          if (isCompleted) statusColor = 'bg-life-easy';
          else if (isFailed) statusColor = 'bg-life-hard';
          else statusColor = 'bg-life-muted/30 border border-zinc-800';
      }
      return { isoDate, statusColor, isToday };
  });

  return (
    <div 
      onClick={() => setIsExpanded(!isExpanded)}
      className={`
        relative overflow-hidden mb-3 rounded-xl border bg-life-paper transition-all duration-300 group cursor-pointer
        ${borderClass}
        ${isPending ? 'hover:bg-white/5 hover:scale-[1.01]' : ''}
      `}
    >
      {/* Background Progress Bar (Habit Level) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
          <div 
            className={`h-full transition-all duration-700 ease-out ${isCompleted ? 'bg-life-easy' : isFailed ? 'bg-life-hard' : habit.shieldUsed ? 'bg-life-diamond' : 'bg-life-gold'}`} 
            style={{ width: `${levelData.progress}%`, opacity: 0.5 }} 
          />
      </div>

      {/* 🟢 REPS PROGRESS LINE (If multiple reps and not done) */}
      {targetReps > 1 && isPending && (
          <div className="absolute bottom-0 left-0 right-0 h-full pointer-events-none">
               <div 
                 className="h-full bg-life-easy/10 transition-all duration-300" 
                 style={{ width: `${repsPercentage}%` }} 
               />
          </div>
      )}

      {/* 🟢 SUBTASK PROGRESS LINE (Above the main one) */}
      {totalSubtasks > 0 && isPending && (
          <div className="absolute bottom-1 left-0 right-0 h-0.5 bg-life-muted/10">
               <div 
                 className="h-full bg-life-gold transition-all duration-500" 
                 style={{ width: `${subtaskProgress}%` }} 
               />
          </div>
      )}

      <div className="flex items-center justify-between p-3 relative z-10">
        
        {/* 🟢 LEFT: Icon & Info */}
        <div className="flex items-center gap-3 flex-1 overflow-hidden">
            <div className="relative shrink-0">
                <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 bg-life-black
                    ${isCompleted ? 'border-life-easy text-life-easy' 
                     : isFailed ? 'border-life-hard text-life-hard'
                     : habit.shieldUsed ? 'border-life-diamond text-life-diamond shadow-[0_0_10px_rgba(96,165,250,0.3)]' 
                     : 'border-zinc-800 text-life-muted'}`}
                >
                    {habit.shieldUsed && isPending ? <Shield size={16} /> : 
                     isFailed ? <X size={16} /> :
                     isCompleted ? <Check size={16} /> :
                     <StatIcon stat={habit.stat} size={16} />
                    }
                </div>
                <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-1 py-px rounded text-[7px] font-black uppercase tracking-tighter border bg-life-black whitespace-nowrap ${levelData.phaseColor}`}>LVL {levelData.level}</div>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-0.5">
                    <h3 className={`font-bold text-sm leading-tight truncate ${isCompleted ? 'text-life-easy' : isFailed ? 'text-life-hard' : 'text-life-text'}`}>
                        {habit.title}
                    </h3>

                    {habit.isTimed && (
                        <span className="text-[9px] flex items-center gap-0.5 text-life-muted bg-life-muted/10 px-1.5 py-0.5 rounded">
                            <Clock size={8} /> {habit.durationMinutes}m
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] text-life-muted font-mono flex items-center gap-0.5"><Flame size={8} className={habit.streak > 0 ? 'text-life-gold' : 'text-life-muted'} /> {habit.streak}</span>
                    
                    <div className="flex items-center gap-1">
                        {/* 🟢 MULTI-STAT DISPLAY */}
                        {linkedSkill && linkedSkill.relatedStats && linkedSkill.relatedStats.length > 0 ? (
                            linkedSkill.relatedStats.map((stat: Stat) => (
                                <span key={stat} className="text-[8px] font-black px-1.5 py-0.5 rounded border border-zinc-800 bg-life-black text-life-muted flex items-center gap-1 uppercase tracking-wider" style={{ color: STAT_COLORS[stat], borderColor: `${STAT_COLORS[stat]}40` }}>
                                    <StatIcon stat={stat} size={8} /> {stat}
                                </span>
                            ))
                        ) : (
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded border border-zinc-800 bg-life-black text-life-muted flex items-center gap-1 uppercase tracking-wider" style={{ color: STAT_COLORS[habit.stat], borderColor: `${STAT_COLORS[habit.stat]}40` }}>
                                <StatIcon stat={habit.stat} size={8} /> {habit.stat}
                            </span>
                        )}
                        
                        {/* 🟢 XP REWARD LABEL (Moved Here) */}
                        {isPending && (
                            <span className="text-[8px] font-mono font-bold text-life-muted bg-life-black px-1.5 py-0.5 rounded border border-zinc-800">
                                +{potentialReward.xp} XP
                            </span>
                        )}

                        {linkedSkill && (
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded border border-life-gold/30 bg-life-gold/5 text-life-gold flex items-center gap-1 uppercase tracking-wider">
                                <Brain size={8} /> {linkedSkill.title}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-0.5">
                        {historyDots.map((dot, idx) => (
                            <div key={idx} className={`w-1 h-1 rounded-full ${dot.statusColor} ${dot.isToday && isPending ? 'animate-pulse' : ''}`} title={dot.isoDate} />
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* 🟢 RIGHT: Actions Stack */}
        <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
            {/* The primary action buttons remain here */}
            <div className="flex items-center gap-2">
                {isPending ? (
                    <>
                        <button onClick={(e) => { e.stopPropagation(); onProcess(habit.id, 'failed'); }} className="w-8 h-8 rounded-lg border border-zinc-800 hover:border-life-hard hover:bg-life-hard/10 text-life-muted hover:text-life-hard flex items-center justify-center transition-all active:scale-95 bg-life-black" title="Fail"><X size={16} strokeWidth={3} /></button>
                        
                        {/* 🟢 COMPLETE BUTTON / COUNTER */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); onProcess(habit.id, 'completed'); }} 
                            className="w-8 h-8 rounded-lg border border-zinc-800 hover:border-life-easy hover:bg-life-easy/10 text-life-muted hover:text-life-easy flex items-center justify-center transition-all active:scale-95 shadow-sm bg-life-black relative overflow-hidden" 
                            title={targetReps > 1 ? `Repetition ${currentReps + 1} of ${targetReps}` : "Complete"}
                        >
                            {targetReps > 1 ? (
                                <div className="flex flex-col items-center leading-none z-10">
                                    <span className={`text-[10px] font-black ${currentReps > 0 ? 'text-life-easy' : ''}`}>{currentReps}/{targetReps}</span>
                                    <span className="text-[6px] uppercase font-bold text-life-muted/70">Reps</span>
                                </div>
                            ) : (
                                <Check size={18} strokeWidth={3} />
                            )}
                            {/* Mini Rep Fill */}
                            {targetReps > 1 && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-life-muted/20">
                                    <div className="h-full bg-life-easy transition-all duration-300" style={{ width: `${repsPercentage}%` }} />
                                </div>
                            )}
                        </button>
                    </>
                ) : (
                    <div className={`h-8 px-3 flex items-center justify-center rounded-lg border text-[10px] font-black uppercase tracking-wider ${isCompleted ? 'bg-life-easy/10 border-life-easy text-life-easy' : 'bg-life-hard/10 border-life-hard text-life-hard'}`}>
                        {isCompleted ? 'DONE' : 'MISS'}
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* 🟢 EXPANDED AREA: ACTIONS & SUBTASKS */}
      {isExpanded && (
          <div className="px-3 pb-3 animate-in slide-in-from-top-2 border-t border-life-muted/10 pt-2">
              
              {/* 1. TOP ROW ACTIONS (Moved Here) */}
              <div className="flex justify-end mb-3">
                  <div className="flex items-center gap-1 bg-life-black/50 rounded-lg p-0.5 border border-life-muted/10">
                        <button onClick={openStats} className="w-6 h-6 flex items-center justify-center text-life-muted hover:text-life-gold hover:bg-life-gold/10 rounded transition-colors" title="View Progress Ladder">
                            <TrendingUp size={12} />
                        </button>
                        {habit.isTimed && isPending && (
                            <button onClick={startFocus} className="w-6 h-6 flex items-center justify-center text-life-gold hover:bg-life-gold/10 rounded transition-colors" title="Enter Focus Citadel">
                                <Play size={12} fill="currentColor" />
                            </button>
                        )}
                        <button onClick={openDetails} className="w-6 h-6 flex items-center justify-center text-life-muted hover:text-life-text hover:bg-life-muted/10 rounded transition-colors" title="Details & Edit">
                            <Maximize2 size={12} />
                        </button>
                        <div className="relative group/move w-6 h-6 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                            <button className="text-life-muted hover:text-life-gold transition-colors">
                                <FolderInput size={12} />
                            </button>
                            <select onChange={handleMove} value={habit.categoryId || ""} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full">
                                <option value="">(Uncat)</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.title}</option>)}
                            </select>
                        </div>
                        <button onClick={handleDelete} className="w-6 h-6 flex items-center justify-center text-life-muted hover:text-life-hard hover:bg-life-hard/10 rounded transition-colors" title="Delete">
                            <Trash2 size={12} />
                        </button>
                  </div>
              </div>

              {/* 2. SUBTASKS LIST */}
              {subtasks.length > 0 && (
                  <div className="space-y-1">
                      {subtasks.map(st => (
                          <div 
                            key={st.id} 
                            onClick={(e) => { e.stopPropagation(); habitDispatch.toggleSubtask(habit.id, st.id); }}
                            className="flex items-center gap-2 text-xs cursor-pointer hover:bg-life-muted/10 p-1.5 rounded transition-colors group/sub"
                          >
                               <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${st.isCompleted ? 'bg-life-gold border-life-gold text-life-black' : 'border-life-muted text-transparent group-hover/sub:border-life-gold'}`}>
                                    <Check size={12} strokeWidth={3} />
                               </div>
                               <span className={st.isCompleted ? 'text-life-muted line-through' : 'text-life-text'}>
                                   {st.title}
                               </span>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}
    </div>
  );
};

export default HabitCard;
