import { InjectionPayload } from '../../../types/types';

// Dispatcher Interfaces to avoid circular dependencies and keep things clean
export interface Dispatchers {
    lifeDispatch: any;
    taskDispatch: any;
    habitDispatch: any;
    raidDispatch: any;
    skillDispatch: any;
    shopDispatch: any;
}

export interface InjectionResult {
    success: boolean;
    message: string;
}

export interface HandlerContext {
    payload: InjectionPayload;
    dispatchers: Dispatchers;
    summary: string[];
}
