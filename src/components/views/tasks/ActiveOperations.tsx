
import React from 'react';
import { Crosshair, FileText, CheckSquare, AlignLeft, Maximize2, Check, Edit } from 'lucide-react';
import { DIFFICULTY_COLORS } from '../../../types/constants';

// Props needed from parent
interface ActiveOperationsProps {
    raidOperations: any[];
    expandedNotes: Set<string>;
    expandedSubtasks: Set<string>;
    toggleNotes: (id: string) => void;
    toggleSubtasksView: (id: string) => void;
    raidDispatch: any;
    openRaidStepDetails: (stepId: string, raidId: string) => void;
}

export const ActiveOperations: React.FC<ActiveOperationsProps> = ({
    raidOperations, expandedNotes, expandedSubtasks, toggleNotes, toggleSubtasksView, raidDispatch, openRaidStepDetails
}) => {
    return (
        <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2 px-1 text-life-hard animate-pulse-slow">
                <Crosshair size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Active Operations (Tip of the Spear)</span>
            </div>
            
            {raidOperations.map(({ raid, step }) => {
                const showNotes = expandedNotes.has(step.id);
                const showSubtasks = expandedSubtasks.has(step.id);
                const subtaskCount = step.subtasks?.length || 0;
                const completedSubtasks = step.subtasks?.filter((s: any) => s.isCompleted).length || 0;

                return (
                    <div 
                        key={step.id} 
                        onClick={() => toggleSubtasksView(step.id)}
                        className={`bg-life-paper border-l-4 rounded-r-xl shadow-lg relative overflow-hidden group transition-all duration-300 cursor-pointer ${DIFFICULTY_COLORS[raid.difficulty].split(' ')[0]} hover:bg-white/5`}
                    >
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
                        <div className="p-3">
                            <div className="flex justify-between items-start relative z-10">
                                <div className="flex-1 min-w-0 pr-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[9px] bg-life-black px-1.5 py-0.5 rounded text-life-muted font-bold uppercase tracking-wider border border-zinc-800">
                                            OP: {raid.title}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-life-text flex items-center gap-2">{step.title}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleNotes(step.id); }}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${showNotes ? 'text-life-gold bg-life-gold/10' : 'text-life-muted hover:text-white hover:bg-life-muted/10'}`}
                                    >
                                        <FileText size={16} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); raidDispatch.toggleRaidStep(raid.id, step.id); }}
                                        className="w-8 h-8 rounded-lg bg-life-black border border-zinc-800 flex items-center justify-center text-life-muted hover:text-life-gold hover:border-life-gold transition-all relative z-20"
                                    >
                                        <CheckSquare size={16} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="mt-2 flex items-center gap-3 text-[10px] text-life-muted/60">
                                <span className="uppercase font-bold text-life-hard">{raid.difficulty}</span>
                                <span>•</span>
                                <span>Step {raid.steps.findIndex((s:any) => s.id === step.id) + 1} of {raid.steps.length}</span>
                                {subtaskCount > 0 && (
                                    <><span>•</span><span className={`flex items-center gap-1 ${showSubtasks ? 'text-life-gold' : ''}`}><CheckSquare size={10} /> {completedSubtasks}/{subtaskCount} Subtasks</span></>
                                )}
                            </div>

                            {showNotes && (
                                <div className="mt-3 pt-3 border-t border-zinc-800 animate-in slide-in-from-top-2 cursor-default" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-start gap-2">
                                        <AlignLeft size={12} className="text-life-gold mt-0.5 shrink-0" />
                                        <div className="text-xs text-life-text leading-relaxed whitespace-pre-wrap flex-1">{step.notes || <span className="text-life-muted italic">No intel provided.</span>}</div>
                                    </div>
                                    <div className="flex justify-end mt-2">
                                        <button onClick={(e) => { e.stopPropagation(); openRaidStepDetails(step.id, raid.id); }} className="text-[9px] flex items-center gap-1 text-life-muted hover:text-life-gold bg-life-black px-2 py-1 rounded border border-zinc-800">
                                            <Maximize2 size={10} /> Full View
                                        </button>
                                    </div>
                                </div>
                            )}

                            {showSubtasks && (
                                <div className="mt-3 pt-3 border-t border-zinc-800 animate-in slide-in-from-top-2 cursor-default" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-[9px] text-life-muted uppercase font-bold tracking-widest flex items-center gap-1"><Check size={10} /> Tactical Checklist</h4>
                                        <button onClick={(e) => { e.stopPropagation(); openRaidStepDetails(step.id, raid.id); }} className="text-[9px] flex items-center gap-1 text-life-muted hover:text-white"><Edit size={10} /> Edit</button>
                                    </div>
                                    {subtaskCount > 0 ? (
                                        <div className="space-y-1 pl-1 mb-2">
                                            {step.subtasks!.map((sub: any) => (
                                                <div key={sub.id} onClick={(e) => { e.stopPropagation(); raidDispatch.toggleRaidStepSubtask(raid.id, step.id, sub.id); }} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border ${sub.isCompleted ? 'bg-life-black border-zinc-800 opacity-60' : 'bg-life-paper/50 border-zinc-800 hover:border-life-gold/30 hover:bg-life-muted/10'}`}>
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${sub.isCompleted ? 'bg-life-gold border-life-gold text-life-black' : 'border-life-muted text-transparent group-hover:border-life-gold'}`}><Check size={12} strokeWidth={4} className={sub.isCompleted ? 'scale-100' : 'scale-0'} /></div>
                                                    <span className={`text-xs font-medium leading-tight ${sub.isCompleted ? 'text-life-muted line-through' : 'text-life-text'}`}>{sub.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <div className="text-[10px] text-life-muted italic text-center py-2 border border-dashed border-zinc-800 rounded mb-2">No subtasks defined.</div>}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
