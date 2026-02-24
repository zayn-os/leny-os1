import { useState, useEffect } from 'react';
import { playSound } from '../../../utils/audio';

export const useFocusTimer = (focusSessionActive: boolean, initialDurationMinutes: number) => {
    const [timeLeft, setTimeLeft] = useState(initialDurationMinutes * 60);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (focusSessionActive) {
            setTimeLeft(initialDurationMinutes * 60);
            setIsPaused(false);
        }
    }, [focusSessionActive, initialDurationMinutes]);

    useEffect(() => {
        let interval: number;
        if (!isPaused && timeLeft > 0 && focusSessionActive) {
            interval = window.setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && !isPaused && focusSessionActive) {
            playSound('level-up', true);
            setIsPaused(true);
        }
        return () => clearInterval(interval);
    }, [isPaused, timeLeft, focusSessionActive]);

    return { timeLeft, isPaused, setIsPaused, setTimeLeft };
};