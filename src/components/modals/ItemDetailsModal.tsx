
import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Trash2, Archive, Edit2, Activity, Shield, Zap, Brain, Heart, Dumbbell, BookOpen, Lock, Hash, AlertTriangle, Clock, Bell, Check, Palette, CalendarPlus, ChevronDown, Copy } from 'lucide-react';
import { useLifeOS } from '../../contexts/LifeOSContext';
import { useTasks } from '../../contexts/TaskContext';
import { useHabits } from '../../contexts/HabitContext';
import { useRaids } from '../../contexts/RaidContext';
import { useSkills } from '../../contexts/SkillContext';
import { Stat, Reminder, Difficulty } from '../../types/types';
import { Subtask } from '../../types/taskTypes'; 
import { DIFFICULTY_COLORS, STAT_COLORS, DIFFICULTY_BG } from '../../types/constants';
import { openInGoogleCalendar } from '../../utils/googleCalendar';

// 🟢 NEW IMPORTS (Split Components)
import { TaskDetailsEditor } from './details/TaskDetailsEditor';

// Helper for Stats Icons
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

const ItemDetailsModal: React.FC = () => {
    const { state, dispatch } = useLifeOS();
    const { taskState, taskDispatch } = useTasks();
    const { habitState, habitDispatch } = useHabits();
    const { raidState, raidDispatch } = useRaids();
    const { skillState } = useSkills();
    
    const { modalData } = state.ui;

    // 1. RESOLVE DATA BASED ON TYPE
    const resolvedData = useMemo(() => {
        if (!modalData) return null;
        const { itemId, type, parentId } = modalData;

        if (type === 'task') {
            const item = taskState.tasks.find(t => t.id === itemId);
            if (!item) return null;
            return {
                item, title: item.title, desc: item.description, difficulty: item.difficulty, stat: item.stat, skillId: item.skillId,
                scheduledTime: item.scheduledTime || item.deadline, reminders: item.reminders, subtasks: item.subtasks,
                isEditable: true, canArchive: true, isFullControl: true
            };
        }
        
        if (type === 'habit') {
            const item = habitState.habits.find(h => h.id === itemId);
            if (!item) return null;
            return {
                item, title: item.title, desc: item.description, difficulty: item.difficulty, stat: item.stat, skillId: item.skillId,
                scheduledTime: item.scheduledTime, reminders: item.reminders, subtasks: item.subtasks,
                isEditable: true, canArchive: false, isFullControl: true
            };
        }

        if (type === 'raid' || type === 'raid_step') {
            if (type === 'raid') {
                const item = raidState.raids.find(r => r.id === itemId);
                if (!item) return null;
                // For Raids, we handle the primary stat (index 0) for editing simplicity
                const primaryStat = (item.stats && item.stats.length > 0) ? item.stats[0] : Stat.STR;
                return { 
                    item, title: item.title, desc: item.description, difficulty: item.difficulty, stat: primaryStat, skillId: item.skillId, 
                    scheduledTime: item.deadline, reminders: [], subtasks: [], // Raids main don't typically have reminders/subtasks on the container
                    isEditable: true, canArchive: true, isFullControl: true 
                };
            } else {
                const parentRaid = raidState.raids.find(r => r.id === parentId);
                const item = parentRaid?.steps.find(s => s.id === itemId);
                if (!item || !parentRaid) return null;
                
                // 🟢 GRANULAR STEP RESOLUTION
                // If step has its own stat/diff, use it. Otherwise inherit from parent.
                // Skill is ALWAYS inherited (Enforced Rule).
                const stepStat = item.stat || ((parentRaid.stats && parentRaid.stats.length > 0) ? parentRaid.stats[0] : Stat.STR);
                const stepDiff = item.difficulty || parentRaid.difficulty;
                const stepSkill = parentRaid.skillId; // 🔒 LOCKED TO PARENT

                return { 
                    item, parentRaid, title: item.title, desc: item.notes, 
                    difficulty: stepDiff, stat: stepStat, skillId: stepSkill, 
                    scheduledTime: item.scheduledTime, reminders: item.reminders, subtasks: item.subtasks, 
                    isTimed: item.isTimed, durationMinutes: item.durationMinutes, // 👈 NEW
                    isEditable: true, canArchive: true, isFullControl: true,
                    isSkillLocked: true // 🔒 UI Flag to disable skill editing
                };
            }
        }
        return null;
    }, [modalData, taskState.tasks, habitState.habits, raidState.raids]);

    // 🎭 LOCAL UI STATE
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [editTime, setEditTime] = useState("");
    const [editReminders, setEditReminders] = useState<Reminder[]>([]);
    const [editSubtasks, setEditSubtasks] = useState<Subtask[]>([]);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    
    // 🟢 NEW EDITABLE STATES
    const [editDifficulty, setEditDifficulty] = useState<Difficulty | undefined>(undefined);
    const [editStat, setEditStat] = useState<Stat | undefined>(undefined);
    const [editSkillId, setEditSkillId] = useState<string>('');

    useEffect(() => {
        if (resolvedData) {
            setEditTitle(resolvedData.title);
            setEditDesc(resolvedData.desc || "");
            
            // Difficulty / Stat / Skill
            // Use RAW values from item to support inheritance logic
            setEditDifficulty(resolvedData.item.difficulty);
            setEditStat(resolvedData.item.stat);
            setEditSkillId(resolvedData.skillId || '');

            let timeStr = resolvedData.scheduledTime || "";
            if (modalData?.type !== 'habit' && timeStr) {
                const d = new Date(timeStr);
                if (!isNaN(d.getTime())) {
                    const offset = d.getTimezoneOffset() * 60000;
                    timeStr = new Date(d.getTime() - offset).toISOString().slice(0, 16);
                }
            }
            setEditTime(timeStr);
            setEditReminders(resolvedData.reminders || []);
            setEditSubtasks(resolvedData.subtasks || []); 
        }
    }, [resolvedData]); 

    if (!modalData || !resolvedData) return null;

    const handleClose = () => dispatch.setModal('none');

    const handleCopyJSON = () => {
        const itemCopy: any = { ...resolvedData.item };
        const shouldKeepHistory = state.user.preferences.copyIncludesHistory ?? true;

        if (!shouldKeepHistory) {
            delete itemCopy.history;
            delete itemCopy.streak;
            delete itemCopy.streakHistory;
            delete itemCopy.purchaseHistory;
        }

        // Wrap in injection format
        let payload: any = {};
        if (modalData.type === 'habit') payload = { habits: [itemCopy] };
        else if (modalData.type === 'task') payload = { tasks: [itemCopy] };
        else if (modalData.type === 'raid') payload = { raids: [itemCopy] };
        else payload = itemCopy;

        navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
        dispatch.addToast('Item Copied to Clipboard (JSON)', 'success');
    };

    const handleSave = () => {
        if (!editTitle.trim()) return;
        const { itemId, type, parentId } = modalData;
        let timePayload = editTime || undefined;
        
        // Ensure date format for Tasks/Raids
        if (timePayload && type !== 'habit') {
            const d = new Date(timePayload);
            if (!isNaN(d.getTime())) timePayload = d.toISOString();
        }

        // Base payload
        const payload: any = { 
            title: editTitle, 
            reminders: editReminders.length > 0 ? editReminders : undefined,
            subtasks: editSubtasks
        };

        // Specific field mapping
        if (type === 'raid_step') {
            payload.notes = editDesc;
            payload.scheduledTime = timePayload;
            // 🟢 SAVE GRANULAR STEP DATA
            payload.difficulty = editDifficulty;
            payload.stat = editStat;
            // Skill ID is NOT saved for steps (Inherited)
            
            // ⏱️ TIMER DATA
            payload.isTimed = resolvedData.item.isTimed; // Preserve unless we add UI for it (we should add UI later)
            // For now, let's assume if user edits time, they might want to toggle timer? 
            // Actually, let's just save what we have.
        } else {
            payload.description = editDesc;
            payload.difficulty = editDifficulty; // 🟢 Save Difficulty
            payload.stat = editStat;             // 🟢 Save Stat
            payload.skillId = editSkillId || undefined; // 🟢 Save Skill Link
            
            if (type === 'raid') {
                payload.deadline = timePayload; // Raids use deadline
                payload.stats = [editStat]; // Update primary stat
            } else {
                payload.scheduledTime = timePayload; // Tasks/Habits use scheduledTime
                if (type === 'task') payload.deadline = timePayload; // Sync deadline for tasks
            }
        }

        // Dispatch Updates
        if (type === 'task') taskDispatch.updateTask(itemId, payload);
        else if (type === 'habit') habitDispatch.updateHabit(itemId, payload);
        else if (type === 'raid') raidDispatch.updateRaid(itemId, payload);
        else if (type === 'raid_step' && parentId) raidDispatch.updateRaidStep(parentId, itemId, payload);

        setIsEditing(false);
        dispatch.addToast("Changes applied successfully", "success");
    };

    const handleArchive = () => {
        if (modalData.type === 'task') taskDispatch.archiveTask(modalData.itemId);
        else if (modalData.type === 'raid') raidDispatch.archiveRaid(modalData.itemId);
        else if (modalData.type === 'raid_step') raidDispatch.archiveRaidStep(modalData.parentId!, modalData.itemId);
        handleClose();
    };

    const handleDelete = () => {
        dispatch.setModal('confirmation', {
            title: 'Confirm Deletion',
            message: 'Permanently delete this item?',
            confirmText: 'Delete',
            isDangerous: true,
            onConfirm: () => {
                if (modalData.type === 'task') taskDispatch.deleteTask(modalData.itemId);
                else if (modalData.type === 'habit') habitDispatch.deleteHabit(modalData.itemId);
                else if (modalData.type === 'raid') raidDispatch.deleteRaid(modalData.itemId);
                else if (modalData.type === 'raid_step') raidDispatch.deleteRaidStep(modalData.parentId!, modalData.itemId);
            }
        });
    };

    const handleAddToCalendar = () => {
        if (!resolvedData.scheduledTime) return;
        openInGoogleCalendar(resolvedData.title, resolvedData.desc || '', resolvedData.scheduledTime);
    };

    const diffColor = DIFFICULTY_COLORS[resolvedData.difficulty];
    const statColor = STAT_COLORS[resolvedData.stat];
    const linkedSkill = resolvedData.skillId ? skillState.skills.find(s => s.id === resolvedData.skillId) : null;

    return (
        <div onClick={handleClose} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
            <div onClick={(e) => e.stopPropagation()} className="bg-life-paper w-full max-w-md rounded-xl border border-life-muted/20 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300 relative group">
                
                {/* HEADER */}
                <div className="p-5 border-b border-life-muted/10 flex justify-between items-start bg-life-black/40">
                    <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-life-gold bg-life-gold/10 px-2 py-0.5 rounded border border-life-gold/20">{modalData.type.replace('_', ' ')}</span>
                            {modalData.parentId && <span className="text-[9px] text-life-muted border border-life-muted/20 px-1.5 py-0.5 rounded bg-life-black">Linked</span>}
                        </div>
                        {isEditing ? (
                            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-black border border-life-gold/50 rounded px-2 py-1 text-lg font-bold text-life-text focus:outline-none" autoFocus />
                        ) : (
                            <h2 className="text-xl font-bold text-life-text leading-tight font-mono">{resolvedData.title}</h2>
                        )}
                    </div>
                    <button onClick={handleClose} className="text-life-muted hover:text-white"><X size={18} /></button>
                </div>

                {/* META BAR (READ ONLY) */}
                {!isEditing && (
                    <div className="px-5 py-3 bg-life-black border-b border-life-muted/10 flex flex-wrap gap-2 items-center">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-black uppercase ${diffColor} bg-opacity-10`}><Lock size={10} />{resolvedData.difficulty}</div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-black uppercase bg-life-paper" style={{ borderColor: `${statColor}40`, color: statColor }}><StatIcon stat={resolvedData.stat} size={10} />{resolvedData.stat}</div>
                        {linkedSkill && <div className="flex items-center gap-1 px-2 py-1 rounded border border-life-gold/30 text-life-gold bg-life-gold/5 text-[10px] font-bold"><BookOpen size={10} /> {linkedSkill.title}</div>}
                    </div>
                )}

                {/* BODY */}
                <div className="flex-1 overflow-y-auto p-5 bg-life-paper relative">
                    {isEditing ? (
                        <div className="space-y-4">
                            {/* 🟢 EDIT: META CONTROLS (Diff, Skill, Stat) */}
                            {resolvedData.isFullControl && (
                                <div className="bg-life-black/30 p-3 rounded-lg border border-life-muted/10 space-y-3">
                                    
                                    {/* Difficulty */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-[9px] text-life-muted uppercase font-bold tracking-widest">Difficulty</label>
                                            {!editDifficulty && modalData.type === 'raid_step' && <span className="text-[8px] uppercase font-black text-life-gold/50 tracking-widest">Inherited</span>}
                                        </div>
                                        <div className="grid grid-cols-3 gap-1">
                                            {Object.values(Difficulty).map(d => {
                                                const activeDiff = editDifficulty || resolvedData.difficulty;
                                                const isSelected = activeDiff === d;
                                                return (
                                                    <button
                                                        key={d}
                                                        onClick={() => {
                                                            if (editDifficulty === d) setEditDifficulty(undefined);
                                                            else setEditDifficulty(d);
                                                        }}
                                                        className={`py-2 rounded text-[9px] font-black uppercase border transition-all ${isSelected ? `${DIFFICULTY_COLORS[d]} ${DIFFICULTY_BG[d]} shadow-sm` : 'border-life-muted/20 text-life-muted hover:bg-life-muted/5'}`}
                                                    >
                                                        {d}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Skill & Stat Row */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[9px] text-life-muted uppercase font-bold tracking-widest mb-1">
                                                Skill Link {resolvedData.isSkillLocked && <span className="text-life-gold/50">(Inherited)</span>}
                                            </label>
                                            <div className="relative">
                                                <select 
                                                    value={editSkillId} 
                                                    onChange={(e) => setEditSkillId(e.target.value)}
                                                    disabled={resolvedData.isSkillLocked} // 🔒 LOCK IF STEP
                                                    className={`w-full bg-life-black border border-life-muted/30 rounded p-1.5 pl-2 text-[10px] text-life-text appearance-none outline-none ${resolvedData.isSkillLocked ? 'opacity-50 cursor-not-allowed' : 'focus:border-life-gold'}`}
                                                >
                                                    <option value="">None</option>
                                                    {skillState.skills.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                                </select>
                                                {!resolvedData.isSkillLocked && <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-x-1/2 text-life-muted pointer-events-none" />}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="block text-[9px] text-life-muted uppercase font-bold tracking-widest">Attribute</label>
                                                {!editStat && modalData.type === 'raid_step' && <span className="text-[8px] uppercase font-black text-life-gold/50 tracking-widest">Inherited</span>}
                                            </div>
                                            <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                                                {Object.values(Stat).map(s => {
                                                    const activeStat = editStat || resolvedData.stat;
                                                    const isSelected = activeStat === s;
                                                    return (
                                                        <button 
                                                            key={s} 
                                                            onClick={() => {
                                                                if (editStat === s) setEditStat(undefined);
                                                                else setEditStat(s);
                                                            }}
                                                            className={`w-7 h-7 shrink-0 rounded flex items-center justify-center border transition-all ${isSelected ? 'bg-life-muted/20 border-life-muted text-life-text' : 'border-life-muted/10 text-life-muted opacity-50'}`}
                                                            style={{ color: isSelected ? STAT_COLORS[s] : undefined }}
                                                        >
                                                            <StatIcon stat={s} size={12} />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 🟢 EDIT: TIME & ALERTS */}
                            <TaskDetailsEditor 
                                editTime={editTime} setEditTime={setEditTime}
                                editReminders={editReminders} setEditReminders={setEditReminders}
                                editSubtasks={editSubtasks} setEditSubtasks={setEditSubtasks}
                                newSubtaskTitle={newSubtaskTitle} setNewSubtaskTitle={setNewSubtaskTitle}
                                hideSubtasks={modalData.type === 'raid'} // 👈 HIDE SUBTASKS FOR RAID PARENT
                                // ⏱️ Pass Timer Props (We need to add state for these in Modal first, but for now let's just pass placeholders or update Modal state)
                            />
                            
                            {/* 🟢 RAID STEPS MANAGEMENT (EDIT MODE) */}
                            {modalData.type === 'raid' && resolvedData.item.steps && (
                                <div className="mt-4 border-t border-life-muted/10 pt-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-[10px] text-life-muted uppercase font-bold flex items-center gap-1"><Activity size={12} /> Operation Steps</h4>
                                        <button 
                                            onClick={() => {
                                                const newStep = {
                                                    id: `rs_new_${Date.now()}`,
                                                    title: "New Tactical Step",
                                                    isCompleted: false,
                                                    isLocked: false,
                                                    difficulty: resolvedData.difficulty,
                                                    stat: resolvedData.stat,
                                                };
                                                const updatedSteps = [...resolvedData.item.steps, newStep];
                                                raidDispatch.updateRaid(modalData.itemId, { steps: updatedSteps });
                                                dispatch.addToast("Step Added", "success");
                                            }}
                                            className="text-[9px] bg-life-gold/10 text-life-gold px-2 py-1 rounded border border-life-gold/20 hover:bg-life-gold/20 transition-colors"
                                        >
                                            + Add Step
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {resolvedData.item.steps.map((step: any, idx: number) => (
                                            <div key={step.id} className="flex items-center justify-between p-3 rounded bg-life-black border border-life-muted/20 group hover:border-life-gold/30 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[9px] font-mono text-life-muted opacity-50">{(idx + 1).toString().padStart(2, '0')}</span>
                                                    <div className="flex flex-col">
                                                        <span className={`text-xs font-bold ${step.isCompleted ? 'text-life-muted line-through' : 'text-life-text'}`}>{step.title}</span>
                                                        <div className="flex gap-1 mt-0.5">
                                                            {step.difficulty && step.difficulty !== resolvedData.item.difficulty && (
                                                                <span className={`text-[7px] font-black uppercase px-1 rounded border ${DIFFICULTY_COLORS[step.difficulty]}`}>{step.difficulty}</span>
                                                            )}
                                                            {step.stat && step.stat !== resolvedData.item.stats?.[0] && (
                                                                <span className="text-[7px] font-black uppercase px-1 rounded border border-life-muted/20 flex items-center gap-0.5" style={{ color: STAT_COLORS[step.stat], borderColor: `${STAT_COLORS[step.stat]}40` }}>
                                                                    <StatIcon stat={step.stat} size={6} /> {step.stat}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Open step details (even while editing parent, this switches context)
                                                            dispatch.setModal('details', { itemId: step.id, type: 'raid_step', parentId: modalData.itemId });
                                                        }}
                                                        className="p-1.5 rounded bg-life-muted/10 hover:bg-life-gold/20 text-life-muted hover:text-life-gold"
                                                    >
                                                        <Edit2 size={10} />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            raidDispatch.deleteRaidStep(modalData.itemId, step.id);
                                                        }}
                                                        className="p-1.5 rounded bg-life-hard/10 hover:bg-life-hard/20 text-life-hard"
                                                    >
                                                        <Trash2 size={10} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 🟢 EDIT: DESCRIPTION */}
                            <div className="relative flex flex-col mt-4">
                                <label className="block text-[9px] text-life-muted uppercase font-bold tracking-widest mb-1">Description / Intel</label>
                                <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="w-full h-24 bg-life-black border border-life-muted/30 rounded-lg p-3 text-sm text-life-text focus:border-life-gold outline-none resize-none font-mono" />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {resolvedData.scheduledTime && (
                                <div className="flex gap-2 items-center text-xs text-life-gold bg-life-gold/10 px-3 py-2 rounded-lg border border-life-gold/20 inline-flex">
                                    <Clock size={12} />
                                    <span className="font-mono font-bold">{modalData.type === 'habit' ? `Daily at ${resolvedData.scheduledTime}` : new Date(resolvedData.scheduledTime).toLocaleString()}</span>
                                    <button onClick={handleAddToCalendar} className="ml-2 border-l border-life-gold/30 pl-2 text-life-gold hover:text-white"><CalendarPlus size={14} /></button>
                                </div>
                            )}
                            <p className="text-sm text-life-text/90 leading-relaxed font-mono whitespace-pre-wrap">{resolvedData.desc || <span className="text-life-muted italic">No Description</span>}</p>
                            {resolvedData.subtasks && resolvedData.subtasks.length > 0 && (
                                <div className="mt-4 border-t border-life-muted/10 pt-4">
                                    <h4 className="text-[10px] text-life-muted uppercase font-bold mb-2 flex items-center gap-1"><Check size={12} /> Steps</h4>
                                    <div className="space-y-2">{resolvedData.subtasks.map(st => (
                                        <div key={st.id} className="flex items-center gap-2 p-2 rounded bg-life-black border border-life-muted/20">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${st.isCompleted ? 'bg-life-gold border-life-gold text-life-black' : 'border-life-muted/50'}`}><Check size={12} strokeWidth={3} /></div>
                                            <span className={`text-xs ${st.isCompleted ? 'text-life-muted line-through' : 'text-life-text'}`}>{st.title}</span>
                                        </div>
                                    ))}</div>
                                </div>
                            )}

                            {/* 🟢 RAID STEPS MANAGEMENT (ONLY FOR RAID PARENT) */}
                            {modalData.type === 'raid' && resolvedData.item.steps && (
                                <div className="mt-6 border-t border-life-muted/10 pt-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-[10px] text-life-muted uppercase font-bold flex items-center gap-1"><Activity size={12} /> Operation Steps</h4>
                                        <button 
                                            onClick={() => {
                                                // Quick Add Step Logic
                                                const newStep = {
                                                    id: `rs_new_${Date.now()}`,
                                                    title: "New Tactical Step",
                                                    isCompleted: false,
                                                    isLocked: false,
                                                    difficulty: resolvedData.difficulty, // Inherit
                                                    stat: resolvedData.stat, // Inherit
                                                };
                                                const updatedSteps = [...resolvedData.item.steps, newStep];
                                                raidDispatch.updateRaid(modalData.itemId, { steps: updatedSteps });
                                                dispatch.addToast("Step Added", "success");
                                            }}
                                            className="text-[9px] bg-life-gold/10 text-life-gold px-2 py-1 rounded border border-life-gold/20 hover:bg-life-gold/20 transition-colors"
                                        >
                                            + Add Step
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {resolvedData.item.steps.map((step: any, idx: number) => (
                                            <div key={step.id} className="flex items-center justify-between p-3 rounded bg-life-black border border-life-muted/20 group hover:border-life-gold/30 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[9px] font-mono text-life-muted opacity-50">{(idx + 1).toString().padStart(2, '0')}</span>
                                                    <div className="flex flex-col">
                                                        <span className={`text-xs font-bold ${step.isCompleted ? 'text-life-muted line-through' : 'text-life-text'}`}>{step.title}</span>
                                                        <div className="flex gap-1 mt-0.5">
                                                            {step.difficulty && step.difficulty !== resolvedData.item.difficulty && (
                                                                <span className={`text-[7px] font-black uppercase px-1 rounded border ${DIFFICULTY_COLORS[step.difficulty]}`}>{step.difficulty}</span>
                                                            )}
                                                            {step.stat && step.stat !== resolvedData.item.stats?.[0] && (
                                                                <span className="text-[7px] font-black uppercase px-1 rounded border border-life-muted/20 flex items-center gap-0.5" style={{ color: STAT_COLORS[step.stat], borderColor: `${STAT_COLORS[step.stat]}40` }}>
                                                                    <StatIcon stat={step.stat} size={6} /> {step.stat}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            dispatch.setModal('details', { itemId: step.id, type: 'raid_step', parentId: modalData.itemId });
                                                        }}
                                                        className="p-1.5 rounded bg-life-muted/10 hover:bg-life-gold/20 text-life-muted hover:text-life-gold"
                                                    >
                                                        <Edit2 size={10} />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            raidDispatch.deleteRaidStep(modalData.itemId, step.id);
                                                        }}
                                                        className="p-1.5 rounded bg-life-hard/10 hover:bg-life-hard/20 text-life-hard"
                                                    >
                                                        <Trash2 size={10} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="p-4 bg-life-black border-t border-life-muted/20 flex items-center justify-between gap-3">
                    <div className="flex gap-2">
                        <button onClick={handleDelete} className="p-2 rounded-lg text-life-hard hover:bg-life-hard/10"><Trash2 size={16} /></button>
                        {resolvedData.canArchive && <button onClick={handleArchive} className="p-2 rounded-lg text-life-muted hover:bg-life-muted/10"><Archive size={16} /></button>}
                        
                        {/* 🟢 COPY JSON BUTTON */}
                        <button onClick={handleCopyJSON} className="p-2 rounded-lg text-life-gold hover:bg-life-gold/10 border border-life-gold/20" title="Copy JSON Code">
                            <Copy size={16} />
                        </button>
                    </div>
                    {isEditing ? (
                        <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-life-gold text-life-black text-xs font-black uppercase hover:bg-yellow-400 flex items-center gap-2"><Save size={14} /> Save</button>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="px-6 py-2 rounded-lg border border-life-muted/30 bg-life-paper text-life-text hover:text-life-gold text-xs font-black uppercase flex items-center gap-2"><Edit2 size={14} /> Edit</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItemDetailsModal;
