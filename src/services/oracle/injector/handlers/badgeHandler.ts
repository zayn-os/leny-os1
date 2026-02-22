import { HandlerContext } from '../types';

export const handleBadges = (ctx: HandlerContext) => {
    const { payload, dispatchers, summary } = ctx;

    if (payload.badges && Array.isArray(payload.badges)) {
        payload.badges.forEach((b: any) => {
            // Ensure ID exists
            if (!b.id) b.id = `bdg_ai_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            dispatchers.lifeDispatch.addBadge(b);
        });
        summary.push(`${payload.badges.length} Badges`);
    }
};
