
import { HandlerContext } from '../types';
import { hydrateSubtasks, hydrateReminders } from '../utils';

export const handleHabits = (ctx: HandlerContext) => {
    const { payload, dispatchers, summary } = ctx;

    // We need access to existing habits to check for IDs
    // Since we don't have direct state access here, we assume ID presence means "UPDATE"
    // The HabitContext.updateHabit usually takes partials but doesn't do deep merges of arrays like history.
    // However, for "Injection", we might be adding NEW history.
    // IMPORTANT: The HabitContext updateHabit implementation below needs to be flexible.
    
    // NOTE: The HabitContext provided in Dispatchers doesn't expose the full state list directly
    // but the `addHabit` creates new IDs.
    // To support updates properly, we rely on the context's update function if we knew the ID existed.
    // But since we can't check existence easily without the state, we will assume if an ID is provided, try update.
    // If it fails (silently in context), we might miss it.
    // BETTER APPROACH: We actually need to modify `HabitContext` to expose `updateHabit` that accepts `history`.
    // We already did that in the plan. Here we just dispatch.

    if (payload.habits && Array.isArray(payload.habits)) {
        payload.habits.forEach((h: any) => {
            let type = h.type || 'daily';
            let specificDays = h.specificDays;
            let intervalValue = h.intervalValue;
            let pattern = h.pattern;

            // Handle nested frequency object if present
            if (h.frequency) {
                type = h.frequency.type || type;
                specificDays = h.frequency.specificDays || specificDays;
                intervalValue = h.frequency.intervalValue || intervalValue;
                pattern = h.frequency.matrixPattern || pattern;
            }

            const subtasks = hydrateSubtasks(h.subtasks);
            const reminders = hydrateReminders(h.reminders);

            // 🟢 UPDATE LOGIC: If ID exists, try to update
            if (h.id && h.id.startsWith('h_')) {
                // We assume it's an update if a valid ID is passed
                dispatchers.habitDispatch.updateHabit(h.id, {
                    title: h.title,
                    description: h.description,
                    difficulty: h.difficulty,
                    stat: h.stat,
                    skillId: h.skillId,
                    type: type as any,
                    specificDays,
                    intervalValue,
                    pattern,
                    subtasks,
                    isTimed: !!h.durationMinutes,
                    durationMinutes: h.durationMinutes,
                    scheduledTime: h.scheduledTime,
                    reminders,
                    dailyTarget: h.dailyTarget,
                    // 🟢 CRITICAL: Allow history/streak injection for God Mode
                    history: h.history,
                    streak: h.streak
                } as any); // Cast to any to bypass strict Omit types in context if necessary
            } else {
                // Create New
                dispatchers.habitDispatch.addHabit({
                    title: h.title,
                    description: h.description,
                    difficulty: h.difficulty || 'normal',
                    stat: h.stat || 'DIS',
                    skillId: h.skillId, 
                    type: type as any,
                    specificDays: specificDays,
                    intervalValue: intervalValue,
                    pattern: pattern,
                    subtasks: subtasks,
                    isTimed: !!h.durationMinutes,
                    durationMinutes: h.durationMinutes,
                    scheduledTime: h.scheduledTime,
                    reminders: reminders,
                    dailyTarget: h.dailyTarget || 1
                });
            }
        });
        summary.push(`${payload.habits.length} Habits processed`);
    }
};
