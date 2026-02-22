
// 🕰️ THE CHRONO ENGINE
// Parses text codes [WxDy] and converts them to actual dates based on the Campaign Start Date.

interface TimeCode {
    week: number;
    day: number;
}

interface ParseResult {
    cleanedTitle: string;
    timeCode: TimeCode | null;
}

interface CalendarCodeResult {
    cleanedTitle: string;
    dateIso: string | null;
}

/**
 * Extracts [W#D#] or W#D# from a string.
 * Example: "Run 5k [W1D3]" -> { week: 1, day: 3, cleanedTitle: "Run 5k" }
 */
export const parseTimeCode = (text: string): ParseResult => {
    // Regex matches: [W1D1], W1D1, w1d1, [w12d7]
    // Group 1: Week number
    // Group 2: Day number
    const regex = /\[?w(\d{1,2})d(\d)\]?/i;
    const match = text.match(regex);

    if (match) {
        const week = parseInt(match[1], 10);
        const day = parseInt(match[2], 10);
        
        // Remove the code from the text and trim
        const cleanedTitle = text.replace(regex, '').replace(/\s+/, ' ').trim();

        return {
            cleanedTitle,
            timeCode: { week, day }
        };
    }

    return {
        cleanedTitle: text,
        timeCode: null
    };
};

/**
 * 🗓️ PARSE CALENDAR CODE (10 Digits)
 * Format: YYMMDDHHmm (Year, Month, Day, Hour, Minute)
 * Example: 2602250930 -> 2026-02-25 09:30:00
 */
export const parseCalendarCode = (text: string): CalendarCodeResult => {
    // Regex matches exactly 10 digits surrounded by word boundaries or space
    // format: YY MM DD HH mm
    const regex = /\b(\d{10})\b/;
    const match = text.match(regex);

    if (match) {
        const code = match[1];
        
        // Extract parts
        const yy = parseInt(code.substring(0, 2), 10);
        const mm = parseInt(code.substring(2, 4), 10) - 1; // Month is 0-indexed in JS
        const dd = parseInt(code.substring(4, 6), 10);
        const hh = parseInt(code.substring(6, 8), 10);
        const min = parseInt(code.substring(8, 10), 10);

        // Assume 20xx for year
        const year = 2000 + yy;

        // Create Date Object
        const date = new Date(year, mm, dd, hh, min);
        
        // Validate Date
        if (!isNaN(date.getTime())) {
            // Remove the code from title
            const cleanedTitle = text.replace(regex, '').replace(/\s+/, ' ').trim();
            
            return {
                cleanedTitle,
                dateIso: date.toISOString()
            };
        }
    }

    return {
        cleanedTitle: text,
        dateIso: null
    };
};

/**
 * Calculates a specific ISO Date based on Campaign Start + Week/Day
 * Week 1, Day 1 = StartDate.
 */
export const calculateCampaignDate = (startDateIso: string, week: number, day: number): string => {
    const start = new Date(startDateIso);
    
    // Calculate offset
    // (Week - 1) * 7 days + (Day - 1) days
    const offsetDays = ((week - 1) * 7) + (day - 1);
    
    const targetDate = new Date(start);
    targetDate.setDate(targetDate.getDate() + offsetDays);
    
    // Set to end of day? Or start? Let's assume deadline is usually End of Day.
    // But for sorting, start of day is cleaner. Let's stick to YYYY-MM-DD for checking.
    // Return ISO String
    return targetDate.toISOString();
};

/**
 * Calculates "W{week}D{day}" based on a target date relative to campaign start.
 */
export const getCampaignTimeCode = (startDateIso: string | null, targetDateIso: string | undefined): string | null => {
    if (!startDateIso || !targetDateIso) return null;

    const start = new Date(startDateIso);
    const target = new Date(targetDateIso);
    
    // Normalize to midnight to avoid hour differences
    start.setHours(0,0,0,0);
    target.setHours(0,0,0,0);

    const diffTime = target.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return null; // Before campaign started

    const week = Math.floor(diffDays / 7) + 1;
    const day = (diffDays % 7) + 1;

    return `W${week}D${day}`;
};

/**
 * Reads the Active Campaign from Local Storage directly.
 * Useful for Contexts that don't want to subscribe to CampaignContext to avoid circular deps.
 */
export const getActiveCampaignData = () => {
    try {
        const saved = localStorage.getItem('LIFE_OS_CAMPAIGN_DATA_V2');
        if (saved) {
            const data = JSON.parse(saved);
            if (data.isActive && data.startDate) {
                return data;
            }
        }
    } catch (e) {
        return null;
    }
    return null;
};
