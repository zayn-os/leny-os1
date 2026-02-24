import { HandlerContext } from '../types';
import { hydrateSubtasks, hydrateReminders } from '../utils';

export const handleTasks = (ctx: HandlerContext) => {
    const { payload, dispatchers, summary } = ctx;

    if (payload.tasks && Array.isArray(payload.tasks)) {
        payload.tasks.forEach((t: any) => {
            const subtasks = hydrateSubtasks(t.subtasks);
            const reminders = hydrateReminders(t.reminders); 

            // 🟢 UPDATE LOGIC
            if (t.id && t.id.startsWith('t_')) {
                dispatchers.taskDispatch.updateTask(t.id, {
                    title: t.title,
                    description: t.description,
                    difficulty: t.difficulty,
                    stat: t.stat,
                    skillId: t.skillId, // 👈 Added skillId
                    isTimed: !!t.durationMinutes,
                    durationMinutes: t.durationMinutes,
                    deadline: t.deadline,
                    scheduledTime: t.scheduledTime,
                    subtasks,
                    reminders: reminders,
                    isCampaign: t.isCampaign
                });
            } else {
                // CREATE NEW
                dispatchers.taskDispatch.addTask({
                    title: t.title,
                    description: t.description,
                    difficulty: t.difficulty || 'normal',
                    stat: t.stat || 'STR',
                    skillId: t.skillId, // 👈 Added skillId
                    isTimed: !!t.durationMinutes,
                    durationMinutes: t.durationMinutes,
                    deadline: t.deadline,
                    scheduledTime: t.scheduledTime,
                    subtasks,
                    reminders: reminders,
                    isCampaign: t.isCampaign || false
                });
            }
        });
        summary.push(`${payload.tasks.length} Missions`);
    }
};
