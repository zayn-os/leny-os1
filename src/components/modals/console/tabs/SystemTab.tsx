import React from 'react';
import { useLifeOS } from '../../../../contexts/LifeOSContext';
import { Clock, Volume2, Calendar, FileText, Bell, Zap, Code, Eye } from 'lucide-react';

const renderToggle = (label: string, icon: React.ReactNode, prefKey: any, dispatch: any, state: any) => {
    const isActive = state.user.preferences[prefKey];
    return (
        <button 
            onClick={() => dispatch.togglePreference(prefKey)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-life-black border border-life-muted/20 hover:border-life-gold/50 transition-all group"
        >
            <div className="flex items-center gap-3">
                <div className={isActive ? 'text-life-gold' : 'text-life-muted'}>{icon}</div>
                <span className="text-[10px] font-bold text-life-text uppercase tracking-wider">{label}</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${isActive ? 'bg-life-gold' : 'bg-life-muted/30'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isActive ? 'left-4.5' : 'left-0.5'}`} />
            </div>
        </button>
    );
};

export const SystemTab: React.FC = () => {
    const { state, dispatch } = useLifeOS();

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
            <div className="p-3 bg-life-gold/5 border border-life-gold/10 rounded text-[9px] text-life-gold/70 uppercase font-bold tracking-widest">
                Core System Toggles & Calibration
            </div>

            <div className="w-full flex items-center justify-between p-3 rounded-lg bg-life-black border border-life-muted/20">
                <div className="flex items-center gap-3">
                    <Clock size={16} className="text-life-gold" />
                    <span className="text-[10px] font-bold uppercase text-life-text">Day Start (Reset Hour)</span>
                </div>
                <select 
                    value={state.user.preferences.dayStartHour ?? 4} 
                    onChange={(e) => dispatch.setDayStartHour(parseInt(e.target.value))}
                    className="bg-black border border-life-gold/30 rounded px-2 py-1 text-xs font-mono font-bold text-life-gold outline-none"
                >
                    {Array.from({ length: 24 }).map((_, i) => (
                        <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                {renderToggle("Neural Feedback (Sound)", <Volume2 size={16} />, "soundEnabled", dispatch, state)}
                {renderToggle("Google Calendar Sync", <Calendar size={16} />, "showCalendarSync", dispatch, state)}
                {renderToggle("AI Context: History Logs", <FileText size={16} />, "copyIncludesHistory", dispatch, state)}
                {renderToggle("System Alerts (Push)", <Bell size={16} />, "deviceNotificationsEnabled", dispatch, state)}
            </div>

            <div className="h-px bg-life-muted/10 my-2" />

            <div className="space-y-2">
                {renderToggle("Show Spear Tip (Highlights)", <Zap size={16} />, "showHighlights", dispatch, state)}
                {renderToggle("Campaign Module UI", <Code size={16} />, "showCampaignUI", dispatch, state)}
                {renderToggle("Horus Eye (Unlock Weeks)", <Eye size={16} />, "unlockAllWeeks", dispatch, state)}
            </div>
        </div>
    );
};