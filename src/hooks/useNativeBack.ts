import React, { useEffect, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { LifeOSState } from '../types/types';

export const useNativeBack = (
    state: LifeOSState, 
    setState: React.Dispatch<React.SetStateAction<LifeOSState>>
) => {
    // 🔄 REF TO TRACK STATE INSIDE LISTENERS
    const stateRef = useRef(state);
    useEffect(() => { stateRef.current = state; }, [state]);

    // 🔙 NATIVE BACK BUTTON HANDLER
    useEffect(() => {
        const setupBackListener = async () => {
            try {
                await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
                    const currentState = stateRef.current;
                    const { ui } = currentState;

                    // Priority 1: Focus Session
                    if (ui.focusSession) {
                        setState(prev => ({ ...prev, ui: { ...prev.ui, focusSession: null } }));
                        return;
                    }

                    // Priority 2: Modals
                    if (ui.activeModal !== 'none') {
                        setState(prev => ({ ...prev, ui: { ...prev.ui, activeModal: 'none', modalData: undefined } }));
                        return;
                    }

                    // Priority 3: Navigation
                    if (ui.currentView !== 'tasks') {
                        setState(prev => ({ ...prev, ui: { ...prev.ui, currentView: 'tasks' } }));
                        return;
                    }

                    // Priority 4: Exit App
                    CapacitorApp.exitApp();
                });
            } catch (e) {
                console.warn("Native back button listener failed", e);
            }
        };

        setupBackListener();
        return () => { CapacitorApp.removeAllListeners(); };
    }, []);

    // 🔙 BROWSER HISTORY FALLBACK
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            setState(prev => {
                if (prev.ui.activeModal !== 'none') {
                    return { ...prev, ui: { ...prev.ui, activeModal: 'none', modalData: undefined } };
                }
                if (event.state && event.state.view) {
                    return { ...prev, ui: { ...prev.ui, currentView: event.state.view } };
                }
                return prev;
            });
        };
        window.addEventListener('popstate', handlePopState);
        window.history.replaceState({ view: state.ui.currentView }, '');
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);
};