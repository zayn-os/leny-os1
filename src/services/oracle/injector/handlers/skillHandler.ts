import { HandlerContext } from '../types';

export const handleSkills = (ctx: HandlerContext) => {
    const { payload, dispatchers, summary } = ctx;

    if (payload.skills && Array.isArray(payload.skills)) {
        payload.skills.forEach((s: any) => {
            dispatchers.skillDispatch.addSkill(s.title, s.relatedStats, s.description);
        });
        summary.push(`${payload.skills.length} Skills`);
    }
};
