
import React, { useState } from 'react';
import { Cloud, Save, Download, ShieldCheck, Database } from 'lucide-react';
import { useLifeOS } from '../../../contexts/LifeOSContext';

export const CloudSyncSection: React.FC = () => {
    const { dispatch } = useLifeOS();
    const [isExporting, setIsExporting] = useState(false);

    const handleManualBackup = () => {
        setIsExporting(true);
        const dataStr = dispatch.exportData();
        
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `LifeOS_Backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
            setIsExporting(false);
            dispatch.addToast('Backup File Generated. Save to Safe Location.', 'success');
        }, 1500);
    };

    return (
        <div className="bg-life-black border border-life-muted/30 rounded-lg p-4 mb-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-transparent pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="p-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">
                    <Cloud size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-life-text">Data Persistence</h3>
                    <p className="text-[10px] text-life-muted">Local Storage & Manual Exports</p>
                </div>
            </div>

            <div className="space-y-3 relative z-10">
                {/* Manual Backup Only */}
                <button 
                    onClick={handleManualBackup}
                    disabled={isExporting}
                    className="w-full py-3 rounded-lg bg-life-black border border-life-muted/20 hover:border-life-gold/50 hover:bg-life-gold/5 text-life-muted hover:text-life-gold transition-all flex items-center justify-center gap-2"
                >
                    {isExporting ? <Save size={14} className="animate-bounce" /> : <Download size={14} />}
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                        {isExporting ? 'Packaging Data...' : 'Export Backup File'}
                    </span>
                </button>
            </div>

            <div className="mt-3 flex items-center gap-2 justify-center opacity-50">
                <Database size={10} className="text-life-easy" />
                <span className="text-[9px] text-life-muted">Data stored locally on this device.</span>
            </div>
        </div>
    );
};
