
import { Raid } from '../types/raidTypes';
import { playSound } from '../utils/audio';

/**
 * 🗑️ RAID DELETION MANAGER
 * هذا الملف مسؤول حصرياً عن منطق حذف الغارات.
 * يقوم بفلترة المصفوفة وإرجاع القائمة الجديدة.
 */

export const executeRaidDeletion = (
    currentRaids: Raid[],
    raidIdToDelete: string,
    soundEnabled: boolean,
    dispatchToast: (msg: string, type: 'info' | 'error') => void
): Raid[] => {
    
    // 1. التحقق من وجود الغارة (Validation)
    const exists = currentRaids.some(r => r.id === raidIdToDelete);
    
    if (!exists) {
        console.warn(`⚠️ Deletion Failed: Raid with ID [${raidIdToDelete}] not found in current state.`);
        // يمكننا إرسال تنبيه للمستخدم إذا أردنا، أو تجاهل الأمر
        return currentRaids;
    }

    // 2. تنفيذ الحذف (Filtering)
    // نقوم بإنشاء مصفوفة جديدة لا تحتوي على العنصر المراد حذفه
    const updatedRaids = currentRaids.filter(r => r.id !== raidIdToDelete);

    // 3. المؤثرات الجانبية (Sounds & Toasts)
    playSound('delete', soundEnabled);
    dispatchToast('Operation Erased Successfully', 'info');

    console.log(`✅ Raid [${raidIdToDelete}] deleted. Remaining: ${updatedRaids.length}`);

    return updatedRaids;
};
