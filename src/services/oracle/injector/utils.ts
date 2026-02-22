import { Subtask } from '../../../types/taskTypes';
import { Reminder } from '../../../types/types';

// Helper to convert string array or object array to Subtask objects
export const hydrateSubtasks = (items: string[] | any[]): Subtask[] => {
    if (!items || !Array.isArray(items)) return [];
    return items.map((item, idx) => {
        const title = typeof item === 'string' ? item : item.title;
        const isCompleted = typeof item === 'object' && item.isCompleted ? item.isCompleted : false;
        
        return {
            id: `st_ai_${Date.now()}_${idx}`,
            title: title || "Unknown Step",
            isCompleted: isCompleted
        };
    });
};

// Helper to convert number array [15, 60] to Reminder objects
export const hydrateReminders = (minutesArray: number[]): Reminder[] => {
    if (!minutesArray || !Array.isArray(minutesArray)) return [];
    return minutesArray.map((mins, idx) => ({
        id: `rem_ai_${Date.now()}_${idx}`,
        minutesBefore: mins,
        isSent: false
    }));
};
