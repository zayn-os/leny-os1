
import React, { useState, useEffect } from 'react';
import { X, Code, Eye, Music, Settings2, Zap, Palette, Terminal, Brain } from 'lucide-react';
import { useLifeOS } from '../../contexts/LifeOSContext';
import { useCampaign } from '../../contexts/CampaignContext';
import { ConsoleActionTab } from './console/ConsoleActionTab';
import { SystemTab } from './console/tabs/SystemTab';
import { OracleTab } from './console/tabs/OracleTab';
import { ThemesTab } from './console/tabs/ThemesTab';
import { StateTab } from './console/tabs/StateTab';
import { LogTab } from './console/tabs/LogTab';
import { MediaTab } from './console/tabs/MediaTab';

type Tab = 'system' | 'oracle' | 'actions' | 'themes' | 'state' | 'log' | 'media';

const DeveloperConsole: React.FC = () => {
    const { state, dispatch } = useLifeOS();
    const { campaignDispatch } = useCampaign();
    const [activeTab, setActiveTab] = useState<Tab>('system');
    const [dateOverride, setDateOverride] = useState('');

    useEffect(() => {
        if (state.ui.debugDate) {
            setDateOverride(state.ui.debugDate.split('T')[0]);
        }
    }, [state.ui.debugDate]);

    const handleDateChange = () => {
        if (!dateOverride) {
            dispatch.setDebugDate(null);
            dispatch.addToast('Debug Time: Synced', 'info');
        } else {
            const newDate = new Date(dateOverride);
            newDate.setHours(12, 0, 0, 0);
            dispatch.setDebugDate(newDate.toISOString());
            campaignDispatch.updateStartDate(newDate.toISOString());
            dispatch.addToast(`Time Shift: ${dateOverride}`, 'level-up');
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'system':
                return <SystemTab />;
            case 'oracle':
                return <OracleTab />;
            case 'actions':
                return <ConsoleActionTab dateOverride={dateOverride} setDateOverride={setDateOverride} handleDateChange={handleDateChange} />;
            case 'themes':
                return <ThemesTab />;
            case 'state':
                return <StateTab />;
            case 'log':
                return <LogTab />;
            case 'media':
                return <MediaTab />;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#0a0a0a] border border-life-gold/30 w-full max-w-lg rounded-xl shadow-2xl flex flex-col h-[85vh] overflow-hidden font-mono text-xs">
                <div className="flex items-center justify-between p-4 border-b border-life-gold/20 bg-life-gold/5">
                    <div className="flex items-center gap-2 text-life-gold">
                        <Terminal size={18} />
                        <span className="font-black uppercase tracking-[0.2em] text-sm">God Mode Shell</span>
                    </div>
                    <button onClick={() => dispatch.setModal('none')} className="text-life-gold hover:text-white p-1">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex border-b border-life-muted/10 overflow-x-auto no-scrollbar bg-black/40">
                    {[
                        { id: 'system', icon: <Settings2 size={12} /> },
                        { id: 'oracle', icon: <Brain size={12} /> },
                        { id: 'actions', icon: <Zap size={12} /> },
                        { id: 'themes', icon: <Palette size={12} /> },
                        { id: 'state', icon: <Eye size={12} /> },
                        { id: 'log', icon: <Terminal size={12} /> },
                        { id: 'media', icon: <Music size={12} /> }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`flex-1 min-w-[75px] py-4 flex flex-col items-center gap-1 uppercase font-black text-[9px] transition-all border-b-2 ${activeTab === tab.id ? 'bg-life-gold/10 text-life-gold border-life-gold' : 'text-life-muted border-transparent hover:text-life-silver'}`}
                        >
                            {tab.icon}
                            {tab.id}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-auto p-4 bg-[#050505] text-life-text/80">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default DeveloperConsole;
