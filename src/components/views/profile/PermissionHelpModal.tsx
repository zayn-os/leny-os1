
import React from 'react';
import { X, BellOff, Lock, Settings, RefreshCw, Zap, Battery, AlertTriangle } from 'lucide-react';

interface PermissionHelpModalProps {
    onClose: () => void;
    onReload: () => void;
}

export const PermissionHelpModal: React.FC<PermissionHelpModalProps> = ({ onClose, onReload }) => {
    return (
        <div 
            onClick={onClose}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
        >
            <div 
                onClick={(e) => e.stopPropagation()} 
                className="bg-life-black border border-life-gold/30 w-full max-w-sm rounded-xl p-5 relative overflow-hidden shadow-2xl animate-in zoom-in-95 text-right flex flex-col max-h-[85vh]"
            >
                <button onClick={onClose} className="absolute top-4 left-4 text-life-muted hover:text-white">
                    <X size={20} />
                </button>

                <div className="text-center mb-4 shrink-0">
                    <div className="w-12 h-12 bg-life-hard/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-life-hard/30 animate-pulse">
                        <AlertTriangle size={24} className="text-life-hard" />
                    </div>
                    <h3 className="text-lg font-black text-life-text uppercase">إعدادات Poco/Xiaomi</h3>
                    <p className="text-[10px] text-life-muted mt-1 leading-relaxed px-4">
                        نظام HyperOS/MIUI يمنع الإشعارات تلقائياً. يجب تفعيل هذه الخيارات يدوياً ليعمل التطبيق.
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 bg-life-paper/50 p-3 rounded-lg border border-zinc-800 mb-4 text-right pr-2" dir="rtl">
                    
                    {/* الخطوة 1: التشغيل التلقائي */}
                    <div className="flex items-start gap-3 border-b border-zinc-800 pb-2">
                        <div className="bg-blue-500/20 text-blue-400 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                            <Zap size={14} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-life-text mb-0.5">التشغيل التلقائي (Autostart)</p>
                            <p className="text-[10px] text-life-muted">اضغط مطولاً على التطبيق {'>'} معلومات التطبيق {'>'} فعل <span className="text-life-gold">Autostart</span>.</p>
                        </div>
                    </div>

                    {/* الخطوة 2: موفر البطارية */}
                    <div className="flex items-start gap-3 border-b border-zinc-800 pb-2">
                        <div className="bg-green-500/20 text-green-400 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                            <Battery size={14} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-life-text mb-0.5">موفر البطارية (Battery Saver)</p>
                            <p className="text-[10px] text-life-muted">اجعله <span className="text-life-easy font-bold">لا توجد قيود (No restrictions)</span> حتى لا يقتل النظام المؤقتات.</p>
                        </div>
                    </div>

                    {/* الخطوة 3: الإشعارات */}
                    <div className="flex items-start gap-3 border-b border-zinc-800 pb-2">
                        <div className="bg-life-gold/20 text-life-gold w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                            <BellOff size={14} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-life-text mb-0.5">الإشعارات (Notifications)</p>
                            <p className="text-[10px] text-life-muted">تأكد من تفعيل <span className="text-white">Allow Notifications</span> و <span className="text-white">Lock Screen</span>.</p>
                        </div>
                    </div>

                    {/* الخطوة 4: أذونات أخرى */}
                    <div className="flex items-start gap-3">
                        <div className="bg-purple-500/20 text-purple-400 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                            <Settings size={14} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-life-text mb-0.5">أذونات أخرى (Other Permissions)</p>
                            <p className="text-[10px] text-life-muted">اسمح بـ <span className="text-white">Pop-up windows</span> و <span className="text-white">Show on Lock screen</span>.</p>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 space-y-2">
                    <button 
                        onClick={onReload}
                        className="w-full py-3 bg-life-gold hover:bg-yellow-400 text-black font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 shadow-lg text-xs"
                    >
                        <RefreshCw size={14} /> تم التفعيل (إعادة تحميل)
                    </button>
                    
                    <a 
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            // This works on Android intent usually, otherwise just helper text
                            alert("اضغط مطولاً على أيقونة التطبيق في شاشتك الرئيسية واختر (App Info) للوصول لهذه الإعدادات.");
                        }}
                        className="block text-center text-[10px] text-life-muted underline opacity-60 hover:opacity-100"
                    >
                        كيف أصل لهذه الإعدادات؟
                    </a>
                </div>
            </div>
        </div>
    );
};
