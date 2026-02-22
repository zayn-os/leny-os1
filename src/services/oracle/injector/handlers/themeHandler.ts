import { HandlerContext } from '../types';

export const handleThemes = (ctx: HandlerContext) => {
    const { payload, dispatchers, summary } = ctx;
    
    if (payload.themes && Array.isArray(payload.themes)) {
        payload.themes.forEach(t => dispatchers.lifeDispatch.addTheme(t));
        summary.push(`${payload.themes.length} Themes`);
        
        // Auto-equip first new theme
        if (payload.themes.length > 0) {
            setTimeout(() => dispatchers.lifeDispatch.setTheme(payload.themes![0].id), 500);
        }
    }
};
