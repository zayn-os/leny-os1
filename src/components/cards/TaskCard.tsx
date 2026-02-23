
import React, { useState } from 'react';
import { Check, Clock, Brain, Dumbbell, Activity, Heart, Zap, Shield, BookOpen, Play, AlignLeft, Calendar, FolderInput, Maximize2, Trash2, Target, Bell, Palette, CalendarPlus, Coins, Users, Flame } from 'lucide-react';
import { Task } from '../../types/taskTypes';
import { Stat, Difficulty } from '../../types/types';
import { DIFFICULTY_COLORS, STAT_COLORS } from '../../types/constants';
import { useSkills } from '../../contexts/SkillContext';
import { useTasks } from '../../contexts/TaskContext';
import { useLifeOS } from '../../contexts/LifeOSContext';
import { useCampaign } from '../../contexts/CampaignContext'; 
import { getCampaignTimeCode } from '../../utils/campaignEngine';
import { openInGoogleCalendar } from '../../utils/googleCalendar'; 
import { calculateTaskReward } from '../../utils/economyEngine'; // 👈 IMPORT

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const StatIcon = ({ stat, size = 14 }: { stat: Stat; size?: number }) => {
  switch (stat) {
    case Stat.STR: return <Dumbbell size={size} />;
    case Stat.INT: return <Brain size={size} />;
    case Stat.DIS: return <Zap size={size} />;
    case Stat.HEA: return <Heart size={size} />;
    case Stat.CRT: return <Palette size={size} />;
    case Stat.SPR: return <Flame size={size} />;
    case Stat.REL: return <Users size={size} />;
    case Stat.FIN: return <Coins size={size} />;
    default: return <Activity size={size} />;
  }
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete }) => {
  const { dispatch, state } = useLifeOS(); 
  const { skillState } = useSkills();
  const { taskState, taskDispatch } = useTasks(); 
  const { campaignState } = useCampaign(); 
  
  const linkedSkill = task.skillId ? skillState.skills.find(s => s.id === task.skillId) : null;
  const statColor = STAT_COLORS[task.stat];
  const borderColorClass = DIFFICULTY_COLORS[task.difficulty].split(' ')[0];

  const showCalendarSync = state.user.preferences.showCalendarSync ?? true;

  // Calculate Rewards Preview
  const potentialReward = calculateTaskReward(task.difficulty, state.user.currentMode);
  const xpValue = task.isCampaign ? Math.ceil(potentialReward.xp * 1.1) : potentialReward.xp;

  // Calculate G12 Code (e.g., W1D4)
  const g12Code = task.isCampaign 
    ? getCampaignTimeCode(campaignState.campaign.startDate, task.deadline || task.scheduledTime)
    : null;

  // UI States
  const [isExpanded, setIsExpanded] = useState(false);

  // Subtask Stats
  const completedSubtasks = task.subtasks?.filter(st => st.isCompleted).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const formatTime = (minutes: number) => `${minutes}m`;

  const startFocus = (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch.startFocusSession(task.id, task.durationMinutes || 25);
  };

  const openDetails = (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch.setModal('itemDetails', { itemId: task.id, type: 'task' });
  };

  const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(task.id);
  };

  const handleMove = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newCatId = e.target.value;
      taskDispatch.moveTask(task.id, newCatId || undefined);
  };

  const handleAddToCalendar = (e: React.MouseEvent) => {
      e.stopPropagation();
      openInGoogleCalendar(
          task.title,
          task.description,
          task.scheduledTime || task.deadline,
          task.durationMinutes || 60
      );
  };

  const remindersCount = task.reminders ? task.reminders.length : 0;

  return (
    <div 
      onClick={() => setIsExpanded(!isExpanded)}
      className={`
        relative group flex flex-col p-4 mb-3 rounded-xl border border-zinc-800 bg-life-black/40 backdrop-blur-sm shadow-sm cursor-pointer transition-all duration-300 overflow-hidden
        ${task.isCompleted 
            ? 'opacity-50 grayscale border-gray-800' 
            : `hover:border-zinc-700 hover:bg-life-black/60 hover:shadow-md`}
        ${isExpanded ? 'ring-1 ring-life-gold/20 bg-life-black/80' : ''}
      `}
    >
      {/* 🟢 LEFT BORDER INDICATOR (Difficulty) */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${borderColorClass.replace('border-', 'bg-')}`} />
      {/* 🟢 SUBTASK PROGRESS BAR (Background) */}
      {totalSubtasks > 0 && !task.isCompleted && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-life-muted/10">
               <div 
                 className="h-full bg-life-gold transition-all duration-500" 
                 style={{ width: `${subtaskProgress}%` }} 
               />
          </div>
      )}

      <div className="flex items-center w-full">
        {/* 🟢 CHECKBOX AREA */}
        <div className="mr-4 relative">
            <div 
                onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
                className={`
                w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300 hover:scale-110
                ${task.isCompleted 
                    ? 'bg-life-easy border-life-easy text-life-black' 
                    : 'border-life-muted group-hover:border-life-silver bg-transparent'}
                `}
            >
            <Check size={16} className={`transition-transform duration-300 ${task.isCompleted ? 'scale-100' : 'scale-0'}`} strokeWidth={3} />
            </div>
        </div>

        {/* 🟢 HEADER CONTENT */}
        <div className="flex-1 min-w-0">
            {/* Metadata Row */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
                
                {/* 🔵 G12 BADGE (INDIGO) */}
                {task.isCampaign && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded border border-indigo-500/50 bg-indigo-500/10 text-indigo-300 flex items-center gap-1 uppercase tracking-wider shadow-[0_0_8px_rgba(99,102,241,0.2)]">
                        <Target size={10} /> 
                        {g12Code ? `G12 • ${g12Code}` : 'G12'}
                    </span>
                )}

                {/* 🔵 C30 BADGE (BLUE) - CALENDAR ORIGIN */}
                {task.isCalendarEvent && !task.isCampaign && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded border border-blue-500/50 bg-blue-500/10 text-blue-300 flex items-center gap-1 uppercase tracking-wider shadow-[0_0_8px_rgba(59,130,246,0.2)]">
                        <Calendar size={10} /> C30
                    </span>
                )}

                {/* 🟢 MULTI-STAT DISPLAY */}
                {linkedSkill && linkedSkill.relatedStats && linkedSkill.relatedStats.length > 0 ? (
                    linkedSkill.relatedStats.map((stat: Stat) => (
                        <span key={stat} className={`text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 uppercase tracking-wider ${task.isCompleted ? 'border-gray-600 text-gray-500' : ''}`} style={{ borderColor: task.isCompleted ? undefined : `${STAT_COLORS[stat]}40`, color: task.isCompleted ? undefined : STAT_COLORS[stat], backgroundColor: task.isCompleted ? undefined : `${STAT_COLORS[stat]}10` }}>
                            <StatIcon stat={stat} size={10} />
                            {stat}
                        </span>
                    ))
                ) : (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 uppercase tracking-wider ${task.isCompleted ? 'border-gray-600 text-gray-500' : ''}`} style={{ borderColor: task.isCompleted ? undefined : `${statColor}40`, color: task.isCompleted ? undefined : statColor, backgroundColor: task.isCompleted ? undefined : `${statColor}10` }}>
                        <StatIcon stat={task.stat} size={10} />
                        {task.stat}
                    </span>
                )}
                
                {/* 🟢 XP VALUE BADGE (NEW) */}
                {!task.isCompleted && (
                    <span className="text-[9px] font-mono font-bold text-life-muted bg-life-black px-1.5 py-0.5 rounded border border-life-muted/20">
                        +{xpValue} XP
                    </span>
                )}

                {linkedSkill && (
                    <span className="text-[9px] text-life-gold border border-life-gold/30 bg-life-gold/10 px-1.5 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                        <BookOpen size={10} /> {linkedSkill.title}
                    </span>
                )}
                {/* 🟢 HIDE CLOCK IF NOT TIMED */}
                {task.isTimed && !isExpanded && <span className="text-[10px] flex items-center gap-1 text-life-muted"><Clock size={10} /> {formatTime(task.durationMinutes || 0)}</span>}
                
                {/* ⏰ Scheduled Time Display (If exists) */}
                {task.scheduledTime && !isExpanded && (
                    <span className="text-[9px] flex items-center gap-1 text-life-gold bg-life-gold/10 px-1.5 py-0.5 rounded border border-life-gold/20">
                        {new Date(task.scheduledTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        {remindersCount > 0 && <Bell size={8} className="fill-current" />}
                    </span>
                )}
            </div>
            
            <h3 className={`text-sm font-medium truncate pr-2 ${task.isCompleted ? 'line-through text-life-muted' : 'text-life-text'}`}>
                {task.title}
            </h3>
        </div>

        {/* 🟢 ACTION BUTTONS - VISIBLE ON MOBILE (REMOVED - MOVED TO EXPANDED VIEW) */}
    </div>

      {/* 🟢 EXPANDED DETAILS */}
      {isExpanded && (
          <div className="mt-3 pt-3 border-t border-life-muted/10 animate-in slide-in-from-top-2">
              
              {/* 🟢 ACTION BUTTONS ROW (Moved Here) */}
              <div className="flex justify-end mb-3">
                  <div className="flex items-center gap-1 bg-life-black/50 rounded-lg p-0.5 border border-life-muted/10">
                        {/* 🗓️ ADD TO CALENDAR BUTTON */}
                        {!task.isCompleted && !task.isArchived && (task.scheduledTime || task.deadline) && showCalendarSync && (
                            <button 
                                onClick={handleAddToCalendar} 
                                className="w-6 h-6 flex items-center justify-center text-blue-400 hover:bg-blue-500/10 rounded transition-all" 
                                title="Add to Google Calendar"
                            >
                                <CalendarPlus size={12} />
                            </button>
                        )}

                        {!task.isCompleted && !task.isArchived && (
                            <button onClick={startFocus} className="w-6 h-6 flex items-center justify-center text-life-gold hover:bg-life-gold/10 rounded transition-all" title="Enter Focus Citadel">
                                <Play size={12} fill="currentColor" />
                            </button>
                        )}
                        
                        {!task.isCompleted && !task.isArchived && (
                            <div className="relative group/move w-6 h-6 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                                <button className="text-life-muted hover:text-life-gold transition-colors">
                                    <FolderInput size={12} />
                                </button>
                                <select onChange={handleMove} value={task.categoryId || ""} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" title="Move to Section">
                                    <option value="">(Uncategorized)</option>
                                    {taskState.categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.title}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* 🟢 DETAILS BUTTON */}
                        <button 
                            onClick={openDetails} 
                            className="w-6 h-6 flex items-center justify-center text-life-muted hover:text-life-text hover:bg-life-muted/10 rounded transition-colors" 
                            title="Mission Details"
                        >
                            <Maximize2 size={12} />
                        </button>

                        {/* 🔴 DELETE BUTTON */}
                        <button 
                            onClick={handleDelete} 
                            className="w-6 h-6 flex items-center justify-center text-life-muted hover:text-life-hard hover:bg-life-hard/10 rounded transition-colors" 
                            title="Delete Mission"
                        >
                            <Trash2 size={12} />
                        </button>
                  </div>
              </div>

              {/* Description */}
              {task.description && (
                  <div className="flex gap-2 text-xs text-life-muted mb-3">
                      <AlignLeft size={14} className="shrink-0 mt-0.5" />
                      <p className="leading-relaxed whitespace-pre-wrap">{task.description}</p>
                  </div>
              )}

              {/* 🟢 SUBTASKS LIST */}
              {totalSubtasks > 0 && (
                  <div className="mb-3 space-y-1 pl-1">
                      {task.subtasks.map(st => (
                          <div 
                            key={st.id} 
                            onClick={(e) => { e.stopPropagation(); taskDispatch.toggleSubtask(task.id, st.id); }}
                            className="flex items-center gap-2 text-xs cursor-pointer hover:bg-life-muted/10 p-1 rounded transition-colors group/sub"
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

              {/* Deadline & Schedule */}
              <div className="flex justify-between items-end mt-2">
                  <div className="flex gap-2 text-[10px] text-life-muted uppercase tracking-wider items-center">
                       {task.scheduledTime ? (
                           <><Bell size={12} /> {remindersCount} Alerts | {new Date(task.scheduledTime).toLocaleString()}</>
                       ) : (
                           task.deadline && <><Calendar size={12} /> Due: {new Date(task.deadline).toLocaleString()}</>
                       )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default TaskCard;
