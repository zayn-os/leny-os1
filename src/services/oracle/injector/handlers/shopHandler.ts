import { HandlerContext } from '../types';

export const handleShop = (ctx: HandlerContext) => {
    const { payload, dispatchers, summary } = ctx;

    if (payload.storeItems && payload.storeItems.length > 0) {
        dispatchers.shopDispatch.addStoreItems(payload.storeItems);
        summary.push(`${payload.storeItems.length} Rewards`);
    }
};
