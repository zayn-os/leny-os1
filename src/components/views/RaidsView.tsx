
import React, { useState } from 'react';
// --- تصحيح المسارات ---
import { useRaids } from '../../contexts/RaidContext'; // الدخول لمجلد contexts
import RaidCard from '../cards/RaidCard';
import { Zap, Archive, Trash2, FolderInput, ChevronUp, ChevronDown, RefreshCcw, Trophy, BookOpen } from 'lucide-react';
import { RaidGuide } from './raids/RaidGuide';

const RaidsView: React.FC = () => {
  const { raidState, raidDispatch } = useRaids(); 
  const { raids } = raidState;
  
  const [showCompleted, setShowCompleted] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const activeRaids = raids.filter(r => r.status === 'active');
  const completedRaids = raids.filter(r => r.status === 'completed');
  const archivedRaids = raids.filter(r => r.status === 'archived');

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 🟢 HEADER */}
      <div className="flex items-end justify-between mb-6 px-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-life-text tracking-tight uppercase">
                Active Operations
            </h2>
            <button 
                onClick={() => setShowGuide(!showGuide)}
                className="text-life-muted hover:text-life-gold transition-colors p-1"
                title="Field Manual"
            >
                <BookOpen size={16} />
            </button>
          </div>
          <p className="text-xs text-life-muted uppercase tracking-widest mt-1">
            {activeRaids.length} Strategic Objectives In-Progress
          </p>
        </div>
        <div className="text-life-hard opacity-50">
            <Zap size={24} />
        </div>
      </div>

      {/* 📖 GUIDE SECTION */}
      {showGuide && <RaidGuide onClose={() => setShowGuide(false)} />}

      {/* 🟢 ACTIVE RAIDS LIST */}
      <div className="space-y-4">
        {activeRaids.length > 0 ? (
          activeRaids.map(raid => (
            <div key={raid.id} className="relative group">
                <RaidCard 
                  raid={raid} 
                  onToggleStep={raidDispatch.toggleRaidStep} 
                />
                
                {/* Action Buttons (Archive & Delete) */}
                <div className="absolute -right-2 -top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                        onClick={() => raidDispatch.archiveRaid(raid.id)}
                        className="bg-life-black border border-life-muted/30 text-life-muted hover:text-life-text p-1.5 rounded-full shadow-sm hover:scale-110 transition-transform"
                        title="Archive Operation"
                    >
                        <Archive size={12} />
                    </button>
                    <button
                        onClick={() => raidDispatch.deleteRaid(raid.id)}
                        className="bg-life-black border border-life-muted/30 text-life-muted hover:text-life-hard p-1.5 rounded-full shadow-sm hover:scale-110 transition-transform"
                        title="Abort / Delete Operation"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center border-2 border-dashed border-life-muted/20 rounded-xl bg-life-paper/30">
            <p className="text-life-muted text-sm font-bold">No Active Operations</p>
            <p className="text-[10px] text-life-muted/60 mt-1 uppercase tracking-wider">
                Initiate a new Raid via Command Line (+).
            </p>
          </div>
        )}
      </div>

      {/* 🗄️ ARCHIVED OPERATIONS (Declassified) */}
      {archivedRaids.length > 0 && (
          <div className="mt-8">
              <button 
                onClick={() => setShowArchived(!showArchived)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-life-muted/10 bg-life-black hover:bg-life-muted/5 transition-all group"
              >
                  <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-life-muted/10 text-life-muted group-hover:text-life-text transition-colors">
                          <FolderInput size={16} />
                      </div>
                      <div className="text-left">
                          <h3 className="text-xs font-black text-life-muted uppercase tracking-widest group-hover:text-life-text transition-colors">Declassified Ops (Archive)</h3>
                          <p className="text-[9px] text-life-muted/60 uppercase tracking-wider">
                              {archivedRaids.length} Operations Stored
                          </p>
                      </div>
                  </div>
                  <div className="text-life-muted/50">
                      {showArchived ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
              </button>

              {showArchived && (
                  <div className="mt-4 space-y-4 animate-in slide-in-from-top-2">
                      {archivedRaids.map(raid => (
                        <div key={raid.id} className="opacity-60 hover:opacity-100 transition-opacity grayscale relative group">
                            <RaidCard 
                                raid={raid} 
                                onToggleStep={() => {}} // Disabled interactions in archive
                            />
                            {/* Archive Actions (Restore & Delete) */}
                            <div className="absolute top-2 right-2 flex gap-2 bg-life-black/80 backdrop-blur rounded-lg p-1 border border-life-muted/20">
                                <button
                                    onClick={() => raidDispatch.restoreRaid(raid.id)}
                                    className="flex items-center gap-1 px-2 py-1 rounded hover:bg-life-muted/20 text-[9px] font-bold text-life-gold uppercase"
                                >
                                    <RefreshCcw size={10} /> Restore
                                </button>
                                <div className="w-px bg-life-muted/20"></div>
                                <button
                                    onClick={() => raidDispatch.deleteRaid(raid.id)}
                                    className="flex items-center gap-1 px-2 py-1 rounded hover:bg-life-hard/20 text-[9px] font-bold text-life-hard uppercase"
                                >
                                    <Trash2 size={10} /> Delete
                                </button>
                            </div>
                        </div>
                      ))}
                  </div>
              )}
          </div>
      )}

      {/* 🏆 VICTORY LOG (Completed Raids) */}
      {completedRaids.length > 0 && (
          <div className="mt-4 pt-4 border-t border-life-muted/10">
              <button 
                onClick={() => setShowCompleted(!showCompleted)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-life-gold/5 border border-life-gold/10 hover:bg-life-gold/10 transition-all group"
              >
                  <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-life-gold/20 text-life-gold">
                          <Trophy size={16} />
                      </div>
                      <div className="text-left">
                          <h3 className="text-xs font-black text-life-gold uppercase tracking-widest">Victory Archive</h3>
                          <p className="text-[9px] text-life-gold/60 uppercase tracking-wider">
                              {completedRaids.length} Operations Conquered
                          </p>
                      </div>
                  </div>
                  <div className="text-life-gold/50">
                      {showCompleted ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
              </button>

              {showCompleted && (
                  <div className="mt-4 space-y-4 animate-in slide-in-from-top-2">
                      {completedRaids.map(raid => (
                        <div key={raid.id} className="opacity-70 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 relative group">
                            <RaidCard 
                                raid={raid} 
                                onToggleStep={raidDispatch.toggleRaidStep} 
                            />
                             {/* Actions for Completed */}
                             <div className="absolute -right-2 -top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                    onClick={() => raidDispatch.archiveRaid(raid.id)}
                                    className="bg-life-black border border-life-muted/30 text-life-muted hover:text-life-text p-1.5 rounded-full shadow-sm"
                                    title="Move to Archive"
                                >
                                    <Archive size={12} />
                                </button>
                                <button
                                    onClick={() => raidDispatch.deleteRaid(raid.id)}
                                    className="bg-life-black border border-life-muted/30 text-life-muted hover:text-life-hard p-1.5 rounded-full shadow-sm"
                                    title="Delete Log"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                      ))}
                  </div>
              )}
          </div>
      )}

    </div>
  );
};

export default RaidsView;
