
import React, { useState, useEffect } from 'react';
import { useHabits } from '../../contexts/HabitContext';
import { useLifeOS } from '../../contexts/LifeOSContext';
import HabitCard from '../cards/HabitCard'; // البطاقة موجودة داخل مجلد cards
import CalendarView from './CalendarView'; // 👈 IMPORT NEW COMPONENT
import { Habit, HabitCategory, DailyStatus } from '../../types/habitTypes';
import { checkHabitActive } from '../../utils/habitEngine';
import { Archive, ChevronDown, ChevronRight, ChevronUp, FolderPlus, Moon, Pencil, Plus, Trash, Calendar, Clock } from 'lucide-react';

const HabitsView: React.FC = () => {
  const { habitState, habitDispatch } = useHabits(); 
  const { state, dispatch } = useLifeOS(); // Access global state
  const { habits, categories } = habitState;
  
  // 🟢 PERSISTENT VIEW MODE STATE
  // Reads from global UI state (Controlled by Navbar now)
  const viewMode = state.ui.habitsViewMode;

  const [showSleepArchive, setShowSleepArchive] = useState(false);
  
  // 🟢 PERSISTENT LOG TOGGLE
  const [showDailyLog, setShowDailyLog] = useState(() => {
      return localStorage.getItem('LIFE_OS_LOG_OPEN') === 'true';
  });

  // Save toggle state
  useEffect(() => {
      localStorage.setItem('LIFE_OS_LOG_OPEN', String(showDailyLog));
  }, [showDailyLog]);

  const [newCatName, setNewCatName] = useState('');
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');

  // 1. FILTERING & SORTING LOGIC
  const activeHabits: Habit[] = [];
  const sleepPending: Habit[] = [];
  const dailyLogToday: Habit[] = []; 

  habits.forEach(habit => {
      if (habit.status !== 'pending') {
          dailyLogToday.push(habit);
          return;
      }
      if (checkHabitActive(habit)) {
          activeHabits.push(habit);
      } else {
          sleepPending.push(habit);
      }
  });

  // 🗓️ CALCULATE YESTERDAY'S LOG
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayIso = yesterday.toISOString();
  const yesterdayStr = yesterdayIso.split('T')[0];

  const yesterdayLog: Habit[] = habits.filter(h => {
      // 1. Must be created before yesterday
      const createdAt = new Date(h.createdAt);
      if (createdAt > yesterday && createdAt.getDate() !== yesterday.getDate()) return false;
      // 2. Must be active/scheduled for yesterday
      return checkHabitActive(h, yesterdayIso);
  }).map(h => {
      // Determine status for yesterday
      const isDone = h.history.some(d => d.startsWith(yesterdayStr));
      // Status is completed if in history, otherwise failed (since it was active)
      const status: DailyStatus = isDone ? 'completed' : 'failed'; 
      
      return {
          ...h,
          id: `log_yesterday_${h.id}`, // Unique virtual ID
          // We don't change title here, context is provided by section header
          status: status,
          // Ensure it looks processed
          shieldUsed: false 
      };
  });

  const handleCreateCategory = (e: React.FormEvent) => {
      e.preventDefault();
      if (newCatName.trim()) {
          habitDispatch.addCategory(newCatName);
          setNewCatName('');
          setIsAddingCat(false);
      }
  };

  const handleUpdateCategory = (id: string) => {
      if(editCatName.trim()) {
          habitDispatch.renameCategory(id, editCatName);
          setEditingCatId(null);
      }
  };

  const confirmDeleteCategory = (catId: string) => {
      const hasItems = habits.some(h => h.categoryId === catId);
      
      if (hasItems) {
          dispatch.setModal('confirmation', {
              title: 'Delete Section?',
              message: 'This section contains protocols. They will be moved to Uncategorized.',
              confirmText: 'Delete Section',
              isDangerous: true,
              onConfirm: () => habitDispatch.deleteCategory(catId)
          });
      } else {
          habitDispatch.deleteCategory(catId);
      }
  };

  const confirmDeleteHabit = (habitId: string) => {
      dispatch.setModal('confirmation', {
          title: 'Delete Protocol?',
          message: 'This action is permanent.',
          confirmText: 'Delete',
          isDangerous: true,
          onConfirm: () => habitDispatch.deleteHabit(habitId)
      });
  };

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 🟢 HEADER */}
      <div className="flex items-end justify-between mb-6 px-1">
        <div>
          <h2 className="text-2xl font-black text-life-text tracking-tight flex items-center gap-2 uppercase">
            {viewMode === 'calendar' ? 'Tactical Planner' : 'Habit Engine'}
          </h2>
          <p className="text-xs text-life-muted uppercase tracking-widest mt-1">
            {viewMode === 'calendar' ? 'Long-term Strategy' : `Execution Mode • ${activeHabits.length} Remaining`}
          </p>
        </div>
      </div>

      {/* 🟢 CONDITIONAL RENDERING */}
      {viewMode === 'calendar' ? (
          <CalendarView />
      ) : (
          <>
            {/* 🟢 LIST VIEW CONTENT */}
            
            {/* CATEGORY MANAGEMENT */}
            <div className="mb-4 flex justify-end">
                {isAddingCat ? (
                    <form onSubmit={handleCreateCategory} className="flex gap-2 animate-in fade-in">
                        <input 
                            type="text" 
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            placeholder="Section Title..."
                            autoFocus
                            className="bg-life-black border border-zinc-800 rounded-lg px-3 py-1 text-xs text-life-text focus:border-life-gold outline-none"
                        />
                        <button type="submit" className="text-life-gold hover:bg-life-gold/10 p-1 rounded">
                            <Plus size={16} />
                        </button>
                        <button type="button" onClick={() => setIsAddingCat(false)} className="text-life-muted hover:text-white p-1">
                            <Plus size={16} className="rotate-45" />
                        </button>
                    </form>
                ) : (
                    <button 
                        onClick={() => setIsAddingCat(true)}
                        className="text-[10px] uppercase font-bold text-life-muted hover:text-life-gold flex items-center gap-1 transition-colors"
                    >
                        <FolderPlus size={14} /> Add Section
                    </button>
                )}
            </div>

            {/* 1. ACTIVE HABITS (Grouped by Category) */}
            <div className="space-y-4 mb-8">
                
                {/* Render Categorized Habits */}
                {categories.map(cat => {
                    const catHabits = activeHabits.filter(h => h.categoryId === cat.id);

                    return (
                        <div key={cat.id} className="animate-in slide-in-from-bottom-2">
                            {/* Category Header */}
                            <div className="flex items-center justify-between mb-2 group relative">
                                {editingCatId === cat.id ? (
                                    <div className="flex gap-2 w-full">
                                        <input 
                                            type="text" 
                                            value={editCatName}
                                            onChange={(e) => setEditCatName(e.target.value)}
                                            className="bg-life-black border border-zinc-800 rounded px-2 py-0.5 text-xs text-life-text w-full focus:border-life-gold outline-none"
                                            autoFocus
                                            onBlur={() => handleUpdateCategory(cat.id)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory(cat.id)}
                                        />
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => habitDispatch.toggleCategory(cat.id)}
                                        className="flex items-center gap-2 text-life-muted hover:text-life-text transition-colors flex-1 text-left py-1"
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-widest text-life-gold/80">
                                            {cat.isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                                        </span>
                                        <span className="text-xs font-bold uppercase tracking-wider">{cat.title}</span>
                                        <span className="text-[9px] bg-life-muted/10 px-1.5 rounded-full text-life-muted">{catHabits.length}</span>
                                    </button>
                                )}

                                {/* Cat Actions (Edit/Delete) */}
                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            setEditingCatId(cat.id); 
                                            setEditCatName(cat.title); 
                                        }}
                                        className="p-2 text-life-muted hover:text-white hover:bg-life-muted/10 rounded cursor-pointer"
                                        title="Edit Name"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            confirmDeleteCategory(cat.id);
                                        }}
                                        className="p-2 text-life-muted hover:text-life-hard hover:bg-life-hard/10 rounded cursor-pointer"
                                        title="Delete Section"
                                    >
                                        <Trash size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Habits List */}
                            {!cat.isCollapsed && (
                                <div className="space-y-1 pl-1">
                                    {catHabits.map(habit => (
                                        <HabitCard 
                                            key={habit.id} 
                                            habit={habit} 
                                            onProcess={habitDispatch.processHabit} 
                                            onDelete={confirmDeleteHabit} 
                                        />
                                    ))}
                                    {catHabits.length === 0 && (
                                        <div className="text-[10px] text-life-muted/40 italic pl-2 py-1">
                                            No active protocols in section.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Render Uncategorized Habits */}
                {activeHabits.filter(h => !h.categoryId).length > 0 && (
                    <div className="animate-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 mb-2 text-life-muted/50 px-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest">General / Uncategorized</span>
                        </div>
                        <div className="space-y-1">
                            {activeHabits.filter(h => !h.categoryId).map(habit => (
                                <HabitCard 
                                    key={habit.id} 
                                    habit={habit} 
                                    onProcess={habitDispatch.processHabit} 
                                    onDelete={confirmDeleteHabit} 
                                />
                            ))}
                        </div>
                    </div>
                )}

                {activeHabits.length === 0 && categories.length === 0 && (
                    <div className="py-8 text-center border-2 border-dashed border-zinc-800 rounded-xl bg-life-paper/50">
                        <p className="text-life-muted text-sm font-medium">All protocols executed.</p>
                        <p className="text-[10px] text-life-muted/60 mt-1">Check the Daily Log.</p>
                    </div>
                )}
            </div>

            {/* 🟢 2. DAILY LOG VAULT (Completed/Missed) - UPDATED */}
            {(dailyLogToday.length > 0 || yesterdayLog.length > 0) && (
                <div className="animate-in slide-in-from-bottom-2 fade-in mb-4">
                    <button 
                        onClick={() => setShowDailyLog(!showDailyLog)}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-life-paper hover:bg-life-muted/5 transition-all mb-3 group shadow-sm"
                    >
                        <div className="flex items-center gap-2">
                            <Archive size={16} className="text-life-gold group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold text-life-text uppercase tracking-widest">
                                Activity Log ({dailyLogToday.length + yesterdayLog.length})
                            </span>
                        </div>
                        <div className="text-life-muted">
                            {showDailyLog ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                    </button>
                    
                    {showDailyLog && (
                        <div className="space-y-4 opacity-90 pb-4">
                            {/* 🌥️ YESTERDAY'S REPORT */}
                            {yesterdayLog.length > 0 && (
                                <div className="animate-in slide-in-from-top-1">
                                    <div className="flex items-center gap-2 mb-2 px-1 text-life-muted/60">
                                        <Calendar size={12} />
                                        <span className="text-[9px] font-bold uppercase tracking-widest">Yesterday's Report</span>
                                    </div>
                                    <div className="space-y-1">
                                        {yesterdayLog.map(habit => (
                                            <div key={habit.id} className="scale-95 origin-top opacity-80 hover:opacity-100 transition-opacity">
                                                <HabitCard 
                                                    habit={habit} 
                                                    onProcess={() => {}} // Read-only
                                                    onDelete={() => {}} 
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ☀️ TODAY'S ACTIVITY */}
                            {dailyLogToday.length > 0 && (
                                <div className="animate-in slide-in-from-top-1">
                                    <div className="flex items-center gap-2 mb-2 px-1 text-life-muted/60">
                                        <Clock size={12} />
                                        <span className="text-[9px] font-bold uppercase tracking-widest">Today's Activity</span>
                                    </div>
                                    <div className="space-y-1">
                                        {dailyLogToday.map(habit => (
                                            <div key={habit.id} className="scale-95 origin-top">
                                                <HabitCard 
                                                    habit={habit} 
                                                    onProcess={habitDispatch.processHabit}
                                                    onDelete={confirmDeleteHabit} 
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* 💤 3. SLEEP ARCHIVE (Collapsible) */}
            {sleepPending.length > 0 && (
                <div className="animate-in slide-in-from-bottom-2 fade-in">
                    <button 
                        onClick={() => setShowSleepArchive(!showSleepArchive)}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-life-black hover:bg-life-muted/5 transition-all mb-3 group"
                    >
                        <div className="flex items-center gap-2">
                            <Moon size={16} className="text-life-muted group-hover:text-life-gold transition-colors" />
                            <span className="text-xs font-bold text-life-muted uppercase tracking-widest">
                                Sleep Archive ({sleepPending.length})
                            </span>
                        </div>
                        <div className="text-life-muted">
                            {showSleepArchive ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                    </button>
                    
                    {showSleepArchive && (
                        <div className="space-y-1 opacity-70 hover:opacity-100 transition-opacity">
                            {sleepPending.map(habit => (
                                <div key={habit.id} className="scale-95 origin-top">
                                    <HabitCard 
                                        habit={habit} 
                                        onProcess={habitDispatch.processHabit}
                                        onDelete={confirmDeleteHabit} 
                                    />
                                </div>
                            ))}
                            <div className="text-center py-2">
                                <p className="text-[9px] text-life-muted uppercase tracking-widest">
                                    Recovery Mode • No Streak Penalty
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
          </>
      )}

    </div>
  );
};

export default HabitsView;
