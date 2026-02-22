
import { InjectionPayload } from '../../../types/types';
import { Dispatchers, InjectionResult, HandlerContext } from './types';

// Import Handlers
import { handleThemes } from './handlers/themeHandler';
import { handleSkills } from './handlers/skillHandler';
import { handleHabits } from './handlers/habitHandler';
import { handleRaids } from './handlers/raidHandler';
import { handleTasks } from './handlers/taskHandler';
import { handleShop } from './handlers/shopHandler';
import { handleBadges } from './handlers/badgeHandler';
import { handleLaws } from './handlers/lawHandler'; // 👈 NEW IMPORT

// 🛡️ SECURITY CONSTANTS
const SECURITY_LIMITS = {
    MAX_ITEMS_PER_TYPE: 50, // Prevent Lag (DoS prevention)
    MAX_TEXT_LENGTH: 500,   // Prevent massive strings
    MAX_NUMBER_VALUE: 1000000 // Prevent integer overflow logic
};

// 🧼 SANITIZER FUNCTION
const sanitizeString = (str: string): string => {
    if (!str) return "";
    // Remove HTML tags and dangerous characters
    return str.replace(/[<>]/g, '').trim().slice(0, SECURITY_LIMITS.MAX_TEXT_LENGTH);
};

const sanitizeNumber = (num: number): number => {
    if (typeof num !== 'number' || isNaN(num)) return 0;
    return Math.min(Math.max(0, num), SECURITY_LIMITS.MAX_NUMBER_VALUE);
};

// 👮‍♀️ VALIDATOR & CLEANER
const securePayload = (payload: any): InjectionPayload => {
    const clean: any = { meta: payload.meta || {} };

    // Helper to process arrays safely
    const processArray = (arr: any[], key: string) => {
        if (!arr || !Array.isArray(arr)) return undefined;
        
        // Limit size to prevent lag
        const safeArray = arr.slice(0, SECURITY_LIMITS.MAX_ITEMS_PER_TYPE);
        
        return safeArray.map(item => {
            const cleanItem: any = {};
            // Recursively clean primitive fields
            for (const k in item) {
                if (typeof item[k] === 'string') {
                    cleanItem[k] = sanitizeString(item[k]);
                } else if (typeof item[k] === 'number') {
                    cleanItem[k] = sanitizeNumber(item[k]);
                } else if (typeof item[k] === 'boolean') {
                    cleanItem[k] = item[k];
                } else if (Array.isArray(item[k])) {
                    // Simple nested array handling (strings or numbers only for now)
                    cleanItem[k] = item[k].slice(0, 20).map((sub: any) => 
                        typeof sub === 'string' ? sanitizeString(sub) : sub
                    );
                } else if (typeof item[k] === 'object' && item[k] !== null) {
                    // Allow one level of nesting (e.g. effect object)
                    cleanItem[k] = item[k]; 
                }
            }
            return cleanItem;
        });
    };

    if (payload.tasks) clean.tasks = processArray(payload.tasks, 'tasks');
    if (payload.habits) clean.habits = processArray(payload.habits, 'habits');
    if (payload.raids) clean.raids = processArray(payload.raids, 'raids');
    if (payload.skills) clean.skills = processArray(payload.skills, 'skills');
    if (payload.storeItems) clean.storeItems = processArray(payload.storeItems, 'storeItems');
    if (payload.badges) clean.badges = processArray(payload.badges, 'badges');
    if (payload.themes) clean.themes = processArray(payload.themes, 'themes');
    if (payload.laws) clean.laws = processArray(payload.laws, 'laws'); // 👈 NEW PROCESSING

    return clean as InjectionPayload;
};

/**
 * 🏭 THE INJECTION ENGINE (MODULAR V2)
 * Parses JSON from "The Godfather" (AI) and injects it into the LifeOS state.
 */
export const processInjection = (jsonInput: string, dispatchers: Dispatchers): InjectionResult => {
    const { lifeDispatch } = dispatchers;

    try {
        // 1. Sanitize JSON String (Fix common AI formatting errors)
        const cleanJsonString = jsonInput.replace(/```json/g, '').replace(/```/g, '').trim();
        
        // 2. Parse JSON
        const rawPayload = JSON.parse(cleanJsonString);
        
        // 3. 🛡️ SECURITY & SANITIZATION LAYER
        const payload = securePayload(rawPayload);
        
        // 4. Prepare Context
        const context: HandlerContext = {
            payload,
            dispatchers,
            summary: []
        };

        // 5. Execute Handlers Pipeline
        handleThemes(context);
        handleSkills(context);
        handleHabits(context);
        handleRaids(context);
        handleTasks(context);
        handleShop(context);
        handleBadges(context);
        handleLaws(context); // 👈 NEW HANDLER

        // 6. Finalize
        const packName = payload.meta?.packName || "Unknown Protocol";
        
        if (context.summary.length === 0) {
            return { success: false, message: "Warning: Valid JSON but no recognizable data found." };
        }

        lifeDispatch.addToast(`Injecting: ${packName}...`, 'level-up');
        
        return { 
            success: true, 
            message: `SECURE INJECTION SUCCESS: ${packName}.\nVerified & Added: ${context.summary.join(', ')}.` 
        };

    } catch (e) {
        console.error("Injection Failed:", e);
        return { 
            success: false, 
            message: `SECURITY BLOCK: Invalid Data Structure.\n${(e as Error).message}` 
        };
    }
};
