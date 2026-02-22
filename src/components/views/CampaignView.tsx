
import React, { useState } from 'react';
import { Target, Snowflake, RotateCcw, Eye, Clock, Plus, CheckCircle, CheckSquare, Crosshair, ChevronDown, Lock } from 'lucide-react';
import { useCampaign } from '../../contexts/CampaignContext';
import { useTasks } from '../../contexts/TaskContext';
import { useRaids } from '../../contexts/RaidContext';
import { useLifeOS } from '../../contexts/LifeOSContext';
import { Task } from '../../types/taskTypes';
import { RaidStep } from '../../types/raidTypes';

// 🟢 IMPORT NEW COMPONENTS
import { CampaignSetup } from './campaign/CampaignSetup';
import { CampaignHarvest } from './campaign/CampaignHarvest';

// 🛡️ SUB-COMPONENT: TACTICAL ITEM (Minimal Row)
const TacticalItem: React.FC<{ 
    title: string, isCompleted: boolean, type: 'mission' | 'raid', 
    onToggle: () => void, onOpenDetails: () => void, colorClass: string 
}> = ({ title, isCompleted, type, onToggle, onOpenDetails, colorClass }) => (
    <div onClick={(e) => { e.stopPropagation(); onOpenDetails(); }} className={`group flex items-center gap-3 p-2 rounded-lg border mb-1 cursor-pointer transition-all ${isCompleted ? 'bg-life-black border-life-muted/10 opacity-50' : `bg-life-paper border-life-muted/20 hover:border-life-gold/30 hover:bg-life-muted/5`}`}>
        <div onClick={(e) => { e.stopPropagation(); onToggle(); }} className={`w-6 h-6 rounded flex items-center justify-center transition-all cursor-pointer z-10 hover:scale-110 ${isCompleted ? 'bg-life-muted border border-life-muted text-life-black' : `border-2 border-life-muted/30 text-transparent hover:border-life-gold`}`}>
            <CheckCircle size={14} strokeWidth={4} className={isCompleted ? 'scale-100' : 'scale-0'} />
        </div>
        <div className="flex-1 min-w-0"><div className={`text-xs font-medium truncate ${isCompleted ? 'line-through text-life-muted' : 'text-life-text'}`}>{title}</div></div>
        {type === 'raid' && <div className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${colorClass} bg-opacity-10`}>OP</div>}
    </div>
);

const CampaignView: React.FC = () => {
  const { campaignState, campaignDispatch } = useCampaign();
  const { taskState, taskDispatch } = useTasks();
  const { raidState, raidDispatch } = useRaids();
  const { state, dispatch } = useLifeOS(); 
  
  const { campaign } = campaignState;
  const { unlockAllWeeks } = state.user.preferences;
  const [expandedWeekId, setExpandedWeekId] = useState<number | null>(null);

  const handleAbortCampaign = () => {
      dispatch.setModal('confirmation', {
          title: 'Abort Campaign?',
          message: 'Terminate timeline? All schedule data will be lost.',
          confirmText: 'Abort Protocol',
          isDangerous: true,
          onConfirm: () => campaignDispatch.resetCampaign()
      });
  };

  const getWeekRange = (startIso: string, weekNum: number) => {
      const start = new Date(startIso);
      const wStart = new Date(start.getTime() + (weekNum - 1) * 7 * 86400000);
      const wEnd = new Date(wStart.getTime() + 6 * 86400000);
      const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
      return `${wStart.toLocaleDateString(undefined, opts)} - ${wEnd.toLocaleDateString(undefined, opts)}`;
  };

  const getDayLabel = (startIso: string, weekNum: number, dayNum: number) => {
      const target = new Date(new Date(startIso).getTime() + (((weekNum - 1) * 7) + (dayNum - 1)) * 86400000);
      return target.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
  };

  const getDayIso = (startIso: string, weekNum: number, dayNum: number) => {
    const target = new Date(new Date(startIso).getTime() + (((weekNum - 1) * 7) + (dayNum - 1)) * 86400000);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}T12:00`;
  };

  const getWeekItems = (weekNum: number) => {
      if (!campaign.startDate) return { tasks: [], raidSteps: [] };
      const start = new Date(campaign.startDate);
      const wStart = new Date(start.getTime() + (weekNum - 1) * 7 * 86400000);
      wStart.setHours(0,0,0,0);
      const wEnd = new Date(wStart.getTime() + 6 * 86400000);
      wEnd.setHours(23,59,59,999);

      const weekTasks = taskState.tasks.filter(t => {
          if (!t.deadline || t.isArchived) return false;
          const d = new Date(t.deadline);
          return d >= wStart && d <= wEnd;
      });

      const weekRaidSteps: Array<{ raidId: string, raidTitle: string, step: RaidStep }> = [];
      raidState.raids.forEach(raid => {
          if (raid.status === 'archived') return;
          raid.steps.forEach(step => {
              if (step.scheduledDate && !step.isArchived) {
                  const d = new Date(step.scheduledDate);
                  if (d >= wStart && d <= wEnd) weekRaidSteps.push({ raidId: raid.id, raidTitle: raid.title, step });
              }
          });
      });
      return { weekTasks, weekRaidSteps };
  };

  const calculateHarvestStats = () => {
      if (!campaign.startDate) return { grade: 'F', completionRate: 0, totalTasks: 0, completedTasks: 0, raidCount: 0 };
      const start = new Date(campaign.startDate);
      let totalTasks = 0, completedTasks = 0, raidCount = 0;
      taskState.tasks.forEach(t => {
          if (t.isArchived) return;
          if (t.deadline && new Date(t.deadline) >= start) {
              totalTasks++;
              if (t.isCompleted) completedTasks++;
          }
      });
      raidState.raids.forEach(r => { if (r.status === 'completed') raidCount++; });
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      let grade = 'F';
      if (completionRate >= 95) grade = 'S'; else if (completionRate >= 85) grade = 'A'; else if (completionRate >= 70) grade = 'B'; else if (completionRate >= 50) grade = 'C'; else if (completionRate >= 30) grade = 'D';
      return { grade, completionRate, totalTasks, completedTasks, raidCount };
  };

  if (!campaign.isActive || !campaign.startDate) {
      return <CampaignSetup onStart={campaignDispatch.initCampaign} />;
  }

  const isHarvestWeek = campaign.currentWeek >= 13;
  const progressPercent = Math.min(100, ((campaign.currentWeek - 1) / 12) * 100);
  const weeks = Array.from({ length: 13 }, (_, i) => i + 1);

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-end justify-between mb-6 px-1">
        <div>
            <h2 className="text-2xl font-black text-life-text tracking-tight uppercase truncate max-w-[200px] sm:max-w-none">{campaign.title}</h2>
            <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider ${campaign.isFrozen ? 'bg-blue-500/20 text-blue-400' : 'bg-life-gold/20 text-life-gold'}`}>
                    {campaign.isFrozen ? '❄️ Frozen' : isHarvestWeek ? '🌾 Harvest' : `Week ${campaign.currentWeek} / 12`}
                </span>
                {!isHarvestWeek && <span className="text-[10px] text-life-muted uppercase tracking-widest">• Day {campaign.currentDay}</span>}
            </div>
        </div>
        <div className="text-life-gold opacity-50 flex items-center gap-2">
            {unlockAllWeeks && <span title="Horus Eye Active"><Eye size={16} className="animate-pulse text-life-crimson" /></span>}
            <Target size={24} />
        </div>
      </div>

      <div className="mb-8">
          <div className="h-2 w-full bg-life-black rounded-full overflow-hidden border border-life-muted/20 relative">
              <div className={`h-full transition-all duration-1000 ${campaign.isFrozen ? 'bg-blue-500' : 'bg-life-gold'}`} style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="flex justify-between mt-1 text-[9px] text-life-muted uppercase font-mono">
              <span>Start</span><span>Week 6</span><span>Harvest</span>
          </div>
      </div>

      <div className="space-y-3">
          {weeks.map((weekNum) => {
              const isPast = weekNum < campaign.currentWeek;
              const isActuallyActive = weekNum === campaign.currentWeek;
              const isActiveView = isActuallyActive || (unlockAllWeeks && !isPast);
              const isHarvest = weekNum === 13;
              const dateRange = getWeekRange(campaign.startDate!, weekNum);
              const { weekTasks, weekRaidSteps } = getWeekItems(weekNum);
              const hasItems = weekTasks.length > 0 || weekRaidSteps.length > 0;
              const completedCount = weekTasks.filter(t => t.isCompleted).length + weekRaidSteps.filter(r => r.step.isCompleted).length;
              const totalCount = weekTasks.length + weekRaidSteps.length;
              const weekProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

              if (isHarvest) return <CampaignHarvest key={weekNum} stats={calculateHarvestStats()} onComplete={campaignDispatch.completeCampaign} />;

              if (isPast) {
                  const isExpanded = expandedWeekId === weekNum;
                  return (
                      <div key={weekNum} onClick={() => setExpandedWeekId(isExpanded ? null : weekNum)} className={`border-l-4 rounded-r-lg bg-life-black transition-all cursor-pointer group ${isExpanded ? 'border-life-muted/50 bg-life-paper pb-2' : 'border-life-muted/20 opacity-60 hover:opacity-100'}`}>
                          <div className="p-3 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 rounded bg-life-muted/20 flex items-center justify-center text-[10px] font-bold text-life-muted">W{weekNum}</div>
                                  <div>
                                      <h4 className="text-xs font-bold text-life-muted group-hover:text-life-text transition-colors flex items-center gap-2"><span className="line-through">Week {weekNum}</span><span className="text-[9px] px-1.5 py-0.5 rounded bg-life-muted/10 text-life-muted no-underline">COMPLETE</span></h4>
                                      <p className="text-[9px] text-life-muted/50 font-mono mt-0.5">{dateRange} • {weekProgress}% Executed</p>
                                  </div>
                              </div>
                              <div className="text-life-muted">{isExpanded ? <ChevronDown size={14} /> : <CheckCircle size={14} />}</div>
                          </div>
                          {isExpanded && (
                              <div className="px-3 pt-0 animate-in slide-in-from-top-2">
                                  <div className="h-px w-full bg-life-muted/10 mb-2" />
                                  {hasItems ? <div className="space-y-1 opacity-70">{weekTasks.map(t => <div key={t.id} className="flex items-center gap-2 text-[10px] text-life-muted line-through"><CheckSquare size={10} /> {t.title}</div>)}{weekRaidSteps.map(({ raidTitle, step }) => <div key={step.id} className="flex items-center gap-2 text-[10px] text-life-muted line-through"><Crosshair size={10} /> {raidTitle}: {step.title}</div>)}</div> : <p className="text-[10px] text-life-muted italic">No logs recorded.</p>}
                              </div>
                          )}
                      </div>
                  );
              }

              if (isActiveView) {
                  return (
                      <div key={weekNum} className={`relative rounded-xl border ${isActuallyActive ? 'border-life-gold bg-life-paper' : 'border-life-muted/30 bg-life-black/50 border-dashed'} shadow-[0_0_15px_rgba(251,191,36,0.05)] overflow-hidden`}>
                          {campaign.isFrozen && isActuallyActive && (
                              <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-[1px] z-10 flex items-center justify-center border border-blue-500/30 rounded-xl"><div className="bg-life-black px-4 py-2 rounded-full border border-blue-500 text-blue-400 flex items-center gap-2 text-xs font-bold uppercase tracking-widest shadow-xl"><Snowflake size={14} /> Timeline Frozen</div></div>
                          )}
                          <div className={`p-4 border-b border-life-muted/10 flex justify-between items-start ${isActuallyActive ? 'bg-life-gold/5' : 'bg-transparent'}`}>
                              <div>
                                  <div className="flex items-center gap-2 mb-1"><span className={`text-xs font-black uppercase tracking-wider ${isActuallyActive ? 'text-life-gold' : 'text-life-muted'}`}>Week {weekNum}</span>{isActuallyActive && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}{!isActuallyActive && unlockAllWeeks && <div className="text-[8px] border border-life-crimson text-life-crimson px-1 rounded uppercase">God Mode</div>}</div>
                                  <div className="text-[10px] font-mono text-life-muted flex items-center gap-1"><Clock size={10} /> {dateRange}</div>
                              </div>
                              {isActuallyActive && <div className="text-[10px] px-2 py-1 rounded bg-life-gold text-life-black font-bold uppercase tracking-widest shadow-sm">Current Front</div>}
                          </div>
                          <div className="p-2 space-y-2">
                              {[1, 2, 3, 4, 5, 6, 7].map(dayNum => {
                                  const isToday = dayNum === campaign.currentDay && isActuallyActive;
                                  const dayTasks = weekTasks.filter(t => new Date(t.deadline!).getDate() === new Date(new Date(campaign.startDate!).getTime() + (((weekNum - 1) * 7) + (dayNum - 1)) * 86400000).getDate());
                                  const daySteps = weekRaidSteps.filter(({ step }) => new Date(step.scheduledDate!).getDate() === new Date(new Date(campaign.startDate!).getTime() + (((weekNum - 1) * 7) + (dayNum - 1)) * 86400000).getDate());
                                  const hasDayItems = dayTasks.length > 0 || daySteps.length > 0;
                                  if (!isToday && !hasDayItems) return null; 
                                  return (
                                      <div key={dayNum} className={`rounded-lg border ${isToday ? 'border-life-gold/30 bg-life-gold/5' : 'border-life-muted/10 bg-life-black/50'} p-2`}>
                                          <div className="flex items-center justify-between mb-2">
                                              <div className="flex items-center gap-2"><span className={`text-[10px] font-black uppercase ${isToday ? 'text-life-gold' : 'text-life-muted'}`}>Day {dayNum}</span><span className="text-[9px] text-life-muted font-mono opacity-70">{getDayLabel(campaign.startDate!, weekNum, dayNum)}</span></div>
                                              <div className="flex items-center gap-2">{isToday && <span className="text-[8px] px-1 rounded bg-life-gold text-life-black font-bold uppercase">Today</span>}<button onClick={() => dispatch.setModal('addTask', { date: getDayIso(campaign.startDate!, weekNum, dayNum), origin: 'campaign' })} className="w-5 h-5 rounded flex items-center justify-center bg-life-muted/10 hover:bg-life-gold text-life-muted hover:text-life-black transition-all" title="Tactical Insert"><Plus size={12} /></button></div>
                                          </div>
                                          {hasDayItems ? <div className="space-y-1">{dayTasks.map(t => <TacticalItem key={t.id} title={t.title} isCompleted={t.isCompleted} type="mission" onToggle={() => taskDispatch.toggleTask(t.id)} onOpenDetails={() => dispatch.setModal('itemDetails', { itemId: t.id, type: 'task' })} colorClass="text-life-text" />)}{daySteps.map(({ raidId, raidTitle, step }) => <TacticalItem key={step.id} title={`${raidTitle}: ${step.title}`} isCompleted={step.isCompleted} type="raid" onToggle={() => raidDispatch.toggleRaidStep(raidId, step.id)} onOpenDetails={() => dispatch.setModal('itemDetails', { itemId: step.id, parentId: raidId, type: 'raid_step' })} colorClass="text-life-hard" />)}</div> : <div className="text-[9px] text-life-muted/30 italic text-center py-2 border border-dashed border-life-muted/10 rounded">No tactical objectives.</div>}
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
                  );
              }
              return <div key={weekNum} className="border border-life-muted/10 rounded-xl bg-life-black opacity-60 hover:opacity-100 transition-opacity"><div className="p-3 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded bg-life-muted/10 flex items-center justify-center text-xs font-bold text-life-muted">{weekNum}</div><div><h4 className="text-xs font-bold text-life-text uppercase tracking-wider">Week {weekNum}</h4><p className="text-[9px] text-life-muted font-mono">{dateRange} • {totalCount} Objectives</p></div></div><Lock size={14} className="text-life-muted/30" /></div>{hasItems && <div className="px-3 pb-3 pt-0"><div className="h-px w-full bg-life-muted/10 mb-2" /><div className="flex flex-wrap gap-1">{weekTasks.map(t => <div key={t.id} className="w-2 h-2 rounded-full bg-life-muted" title={t.title} />)}{weekRaidSteps.map(({ raidTitle, step }) => <div key={step.id} className="w-2 h-2 rounded-full bg-life-hard" title={`${raidTitle}: ${step.title}`} />)}</div></div>}</div>;
          })}
      </div>

      <div className="mt-8 pt-8 border-t border-life-muted/10 flex justify-between">
          <button onClick={campaignDispatch.toggleFreeze} className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${campaign.isFrozen ? 'text-blue-400 hover:text-blue-300' : 'text-life-muted hover:text-blue-400'}`}><Snowflake size={14} className={campaign.isFrozen ? 'animate-pulse' : ''} /> {campaign.isFrozen ? 'Resume Timeline' : 'Freeze Time'}</button>
          <button onClick={handleAbortCampaign} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-life-muted hover:text-life-hard transition-colors"><RotateCcw size={14} /> Abort Campaign</button>
      </div>
    </div>
  );
};

export default CampaignView;
