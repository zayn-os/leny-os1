
import { HandlerContext } from '../types';

export const handleLaws = (ctx: HandlerContext) => {
    const { payload, dispatchers, summary } = ctx;

    if (payload.laws && Array.isArray(payload.laws)) {
        payload.laws.forEach((l: any) => {
            dispatchers.taskDispatch.addLaw(
                l.title || "Unknown Law", 
                l.penaltyType || 'gold', 
                l.penaltyValue || 50, 
                l.statTarget || undefined
            );
        });
        summary.push(`${payload.laws.length} Laws`);
    }
};
