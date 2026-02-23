
import React from 'react';
import { Download, Upload, Skull, ShieldCheck, Database, RefreshCw, FileText, Share2, Smartphone, Brain, Activity, Coins, Star, ShoppingCart, Scale, Bell } from 'lucide-react';
import { UserProfile } from '../../../types/types';
import { usePWAInstall } from '../../../hooks/usePWAInstall';
import { useSkills } from '../../../contexts/SkillContext';
import { requestNotificationPermission, sendAlert } from '../../../utils/notifications';

interface SettingsSectionProps {
    user: UserProfile;
    dispatch: any;
    onExport: () => void;
    onImport: () => void;
    onForceSleep: () => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
    user, dispatch, onExport, onImport, onForceSleep
}) => {
    const { isInstallable, promptInstall } = usePWAInstall();
    const { skillState } = useSkills();

    const handleTitleOverrideToggle = () => {
        dispatch.togglePreference('useSkillAsTitle');
    };

    const handleSkillLink = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const skillId = e.target.value;
        dispatch.updateUser({ preferences: { ...user.preferences, linkedSkillId: skillId } });
    };

    return (
        <div className="space-y-4">
            
            {/* 👑 NEW: TITLE OVERRIDE */}
            <div className="bg-life-black border border-zinc-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Star size={14} className="text-life-muted" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-life-muted">Title Override</h3>
                </div>

                {/* Toggle Switch */}
                <div className="flex items-center justify-between p-3 bg-life-paper rounded-lg border border-zinc-800">
                    <label htmlFor="title-override-toggle" className="text-xs font-bold text-life-text">Use Skill as Title</label>
                    <button 
                        id="title-override-toggle"
                        onClick={handleTitleOverrideToggle}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${user.preferences.useSkillAsTitle ? 'bg-life-gold' : 'bg-life-muted/20'}`}>
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${user.preferences.useSkillAsTitle ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                {/* Skill Selector (Conditional) */}
                {user.preferences.useSkillAsTitle && (
                    <div className="animate-in fade-in duration-300">
                        <select 
                            value={user.preferences.linkedSkillId || ''}
                            onChange={handleSkillLink}
                            className="w-full p-3 bg-life-paper border border-zinc-800 rounded-lg text-xs font-bold text-life-text focus:outline-none focus:ring-2 focus:ring-life-gold/50"
                        >
                            <option value="" disabled>Select a Skill...</option>
                            {skillState.skills.map(skill => (
                                <option key={skill.id} value={skill.id}>{skill.title}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* 📥 DATA MANAGEMENT GROUP */}
            <div className="bg-life-black border border-zinc-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Database size={14} className="text-life-muted" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-life-muted">Data Persistence</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={onExport} 
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-life-paper border border-zinc-800 hover:border-life-gold/50 transition-all group"
                    >
                        <Download size={20} className="text-life-gold group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-life-text">Backup System</span>
                    </button>
                    
                    <button 
                        onClick={onImport} 
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-life-paper border border-zinc-800 hover:border-life-easy/50 transition-all group"
                    >
                        <Upload size={20} className="text-life-easy group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-life-text">Restore Data</span>
                    </button>
                </div>

                <div className="flex items-center justify-center gap-2 pt-2 opacity-50">
                    <ShieldCheck size={10} className="text-life-easy" />
                    <span className="text-[8px] text-life-muted uppercase font-bold">Local Storage Protocol Active</span>
                </div>
            </div>

            {/* ⚙️ SYSTEM ACTIONS */}
            <div className="space-y-2">
                {/* 🧠 QUEST FORGE PROTOCOL (TASKS) */}
                <button 
                    onClick={() => dispatch.setModal('questForge')}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 hover:bg-indigo-900/40 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400 group-hover:text-indigo-300">
                            <Brain size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200 group-hover:text-white">
                            Quest Forge (Tasks)
                        </span>
                    </div>
                    <span className="text-[8px] font-mono text-indigo-400/60 bg-indigo-950/50 px-2 py-1 rounded border border-indigo-500/10">
                        AI_TASK_GEN
                    </span>
                </button>

                {/* 🔄 PROTOCOL FOUNDRY (HABITS) */}
                <button 
                    onClick={() => dispatch.setModal('habitProtocol')}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 hover:bg-emerald-900/40 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400 group-hover:text-emerald-300">
                            <Activity size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200 group-hover:text-white">
                            Protocol Foundry (Habits)
                        </span>
                    </div>
                    <span className="text-[8px] font-mono text-emerald-400/60 bg-emerald-950/50 px-2 py-1 rounded border border-emerald-500/10">
                        AI_HABIT_GEN
                    </span>
                </button>

                {/* 🛒 SHOP ARCHIVES (ECONOMY) */}
                <button 
                    onClick={() => dispatch.setModal('shopProtocol')}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-pink-950/30 border border-pink-500/30 hover:bg-pink-900/40 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-pink-500/20 rounded-lg text-pink-400 group-hover:text-pink-300">
                            <ShoppingCart size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-pink-200 group-hover:text-white">
                            Shop Archives
                        </span>
                    </div>
                    <span className="text-[8px] font-mono text-pink-400/60 bg-pink-950/50 px-2 py-1 rounded border border-pink-500/10">
                        AI_SHOP_DOCS
                    </span>
                </button>

                {/* 💰 TREASURY ARCHIVE (ECONOMY) */}
                <button 
                    onClick={() => dispatch.setModal('economyProtocol')}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 hover:bg-amber-900/40 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400 group-hover:text-amber-300">
                            <Coins size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-200 group-hover:text-white">
                            Treasury Archive (Economy)
                        </span>
                    </div>
                    <span className="text-[8px] font-mono text-amber-400/60 bg-amber-950/50 px-2 py-1 rounded border border-amber-500/10">
                        AI_ECON_DOCS
                    </span>
                </button>

                {/* ⚔️ THE WAR ROOM (RAIDS) */}
                <button 
                    onClick={() => dispatch.setModal('raidProtocol')}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-red-950/30 border border-red-500/30 hover:bg-red-900/40 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-red-500/20 rounded-lg text-red-400 group-hover:text-red-300">
                            <ShieldCheck size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-200 group-hover:text-white">
                            The War Room (Raids)
                        </span>
                    </div>
                    <span className="text-[8px] font-mono text-red-400/60 bg-red-950/50 px-2 py-1 rounded border border-red-500/10">
                        AI_RAID_OPS
                    </span>
                </button>

                {/* ⚖️ CODEX ARBITER (LAWS) */}
                <button 
                    onClick={() => dispatch.setModal('codexArbiter')}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 hover:bg-indigo-900/40 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400 group-hover:text-indigo-300">
                            <Scale size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200 group-hover:text-white">
                            Codex Arbiter (Laws)
                        </span>
                    </div>
                    <span className="text-[8px] font-mono text-indigo-400/60 bg-indigo-950/50 px-2 py-1 rounded border border-indigo-500/10">
                        AI_CODEX_GEN
                    </span>
                </button>

                {/* 🏅 BADGE ARCHITECT (BADGES) */}
                <button 
                    onClick={() => dispatch.setModal('badgeProtocol')}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-yellow-950/30 border border-yellow-500/30 hover:bg-yellow-900/40 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-yellow-500/20 rounded-lg text-yellow-400 group-hover:text-yellow-300">
                            <Star size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-yellow-200 group-hover:text-white">
                            Badge Architect
                        </span>
                    </div>
                    <span className="text-[8px] font-mono text-yellow-400/60 bg-yellow-950/50 px-2 py-1 rounded border border-yellow-500/10">
                        AI_BADGE_GEN
                    </span>
                </button>

                {/* 🧠 SKILL TREE ARCHITECT (SKILLS) */}
                <button 
                    onClick={() => dispatch.setModal('skillProtocol')}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 hover:bg-blue-900/40 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400 group-hover:text-blue-300">
                            <Brain size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-200 group-hover:text-white">
                            Skill Tree Architect
                        </span>
                    </div>
                    <span className="text-[8px] font-mono text-blue-400/60 bg-blue-950/50 px-2 py-1 rounded border border-blue-500/10">
                        AI_SKILL_GEN
                    </span>
                </button>

                {/* 🔔 NOTIFICATION CONTROLS */}
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={async () => {
                            const granted = await requestNotificationPermission();
                            if (granted) alert("Notifications Enabled! 🔔");
                            else alert("Notifications Denied or Not Supported 🔕");
                        }}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-life-paper border border-life-muted/20 hover:border-life-gold/50 transition-all group"
                    >
                        <Bell size={20} className="text-life-gold group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-life-text">Enable Alerts</span>
                    </button>
                    
                    <button 
                        onClick={() => sendAlert(Date.now(), "Life OS", "System Test: Notifications Operational ⚡")} 
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-life-paper border border-life-muted/20 hover:border-life-easy/50 transition-all group"
                    >
                        <Activity size={20} className="text-life-easy group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-life-text">Test Alert</span>
                    </button>
                </div>

                <button 
                    onClick={onForceSleep}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-life-black border border-life-muted/10 hover:bg-life-muted/5 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <RefreshCw size={16} className="text-life-gold group-hover:rotate-180 transition-transform duration-700" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-life-text">Trigger Daily Reset</span>
                    </div>
                    <span className="text-[8px] font-mono text-life-muted opacity-50">MANUAL_OVERRIDE</span>
                </button>

                <button 
                    onClick={() => dispatch.setModal('resetConfirm')} 
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-red-950/10 border border-red-900/30 hover:bg-red-900/20 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <Skull size={16} className="text-red-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Rebirth Protocol</span>
                    </div>
                    <span className="text-[8px] font-mono text-red-900 font-bold">DANGER_ZONE</span>
                </button>
            </div>

            {/* Version Footer */}
            <div className="text-center pt-4">
                <p className="text-[8px] text-life-muted font-mono opacity-40 uppercase tracking-[0.3em]">
                    LifeOS Neural Kernel v2.4.0 // Secured
                </p>
            </div>
        </div>
    );
};
