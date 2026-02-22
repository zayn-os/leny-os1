
import { useLifeOS } from '../../contexts/LifeOSContext';
import { useSkills } from '../../contexts/SkillContext';
import { useTasks } from '../../contexts/TaskContext';
import { useHabits } from '../../contexts/HabitContext';
import { useRaids } from '../../contexts/RaidContext';
import { useCampaign } from '../../contexts/CampaignContext';
import { useShop } from '../../contexts/ShopContext';
import { generateOracleBlueprint } from './generator';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export const useOracle = () => {
    const { state: lifeState, dispatch } = useLifeOS();
    const { skillState } = useSkills();
    const { taskState } = useTasks();
    const { habitState } = useHabits();
    const { raidState } = useRaids();
    const { campaignState } = useCampaign();
    const { shopState } = useShop();

    const exportBlueprint = async () => {
        try {
            // 1. Generate the clean JSON structure
            const blueprint = generateOracleBlueprint(
                lifeState.user,
                skillState.skills,
                habitState.habits,
                taskState.tasks,
                raidState.raids,
                campaignState.campaign,
                shopState.storeItems,
                taskState.laws // 👈 Pass Laws
            );

            const dataStr = JSON.stringify(blueprint, null, 2);
            const fileName = `Oracle_Blueprint_${new Date().toISOString().split('T')[0]}.json`;

            // 📱 NATIVE ANDROID/IOS SAVING
            if (Capacitor.isNativePlatform()) {
                try {
                    await Filesystem.writeFile({
                        path: fileName,
                        data: dataStr,
                        directory: Directory.Documents,
                        encoding: Encoding.UTF8,
                    });
                    dispatch.addToast(`Saved to Documents/${fileName}`, 'success');
                    return true;
                } catch (nativeError) {
                    console.error("Native Save Failed:", nativeError);
                    dispatch.addToast('Permission Denied: Cannot Write File', 'error');
                    return false;
                }
            } 
            
            // 🌐 WEB SAVING (Fallback)
            else {
                const blob = new Blob([dataStr], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                dispatch.addToast('Oracle Blueprint Extracted', 'success');
                return true;
            }

        } catch (error) {
            console.error("Oracle Export Failed:", error);
            dispatch.addToast('Export Failed', 'error');
            return false;
        }
    };

    return { exportBlueprint };
};
