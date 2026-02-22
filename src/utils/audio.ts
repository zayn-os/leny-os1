
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

// 🔊 NEURAL FEEDBACK ENGINE 2.0 (Harmonic Synthesizer)
// Generates polyphonic chords and haptic feedback patterns.

let audioCtx: AudioContext | null = null;

const getContext = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtx;
};

export type SoundType = 'success' | 'complete' | 'coin' | 'level-up' | 'delete' | 'click' | 'error' | 'hover' | 'crit';

// 🎵 MUSIC THEORY CONSTANTS
const NOTES = {
    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    F4: 349.23,
    G4: 392.00,
    A4: 440.00,
    B4: 493.88,
    C5: 523.25,
    D5: 587.33,
    E5: 659.25,
    G5: 783.99,
    A5: 880.00,
    C6: 1046.50
};

// 📳 WEB HAPTIC PATTERNS (ms) - Fallback
const WEB_HAPTICS = {
    click: [5],
    success: [10, 30, 10],
    error: [50, 20, 50, 20, 50],
    levelUp: [50, 50, 50, 50, 100, 50, 200],
    crit: [10, 10, 10, 50, 50, 100], 
    delete: [30]
};

const playTone = (ctx: AudioContext, freq: number, type: OscillatorType, startTime: number, duration: number, vol: number = 0.1) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
};

export const playSound = async (type: SoundType, enabled: boolean = true) => {
    // 📳 HAPTICS ENGINE (Hybrid)
    if (enabled) {
        if (Capacitor.isNativePlatform()) {
            // 📱 Native Capacitor Haptics
            try {
                switch (type) {
                    case 'click': 
                        await Haptics.impact({ style: ImpactStyle.Light }); 
                        break;
                    case 'hover':
                        // No haptic on hover for mobile usually, maybe very light
                        break;
                    case 'success': 
                        await Haptics.notification({ type: NotificationType.Success }); 
                        break;
                    case 'level-up':
                        await Haptics.notification({ type: NotificationType.Success });
                        break;
                    case 'crit': 
                        await Haptics.impact({ style: ImpactStyle.Heavy }); 
                        break;
                    case 'error': 
                        await Haptics.notification({ type: NotificationType.Error }); 
                        break;
                    case 'delete': 
                        await Haptics.impact({ style: ImpactStyle.Medium }); 
                        break;
                    default:
                        await Haptics.impact({ style: ImpactStyle.Light });
                }
            } catch (e) {
                // Ignore haptic errors
            }
        } else if (navigator.vibrate) {
            // 🌐 Web Fallback
            switch (type) {
                case 'click': navigator.vibrate(WEB_HAPTICS.click); break;
                case 'success': navigator.vibrate(WEB_HAPTICS.success); break;
                case 'level-up': navigator.vibrate(WEB_HAPTICS.levelUp); break;
                case 'crit': navigator.vibrate(WEB_HAPTICS.crit); break;
                case 'error': navigator.vibrate(WEB_HAPTICS.error); break;
                case 'delete': navigator.vibrate(WEB_HAPTICS.delete); break;
            }
        }
    }

    if (!enabled) return;
    
    // 🎵 AUDIO SYNTHESIS (Web Audio API works on Android WebViews)
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    switch (type) {
        case 'success': 
            playTone(ctx, NOTES.C5, 'sine', now, 0.2, 0.1);
            playTone(ctx, NOTES.E5, 'sine', now + 0.05, 0.2, 0.1);
            playTone(ctx, NOTES.G5, 'sine', now + 0.1, 0.4, 0.08);
            break;

        case 'coin': 
            playTone(ctx, 1200, 'square', now, 0.1, 0.05);
            playTone(ctx, 1800, 'square', now + 0.05, 0.2, 0.05);
            break;

        case 'level-up': 
            playTone(ctx, NOTES.C4, 'triangle', now, 0.2, 0.15);
            playTone(ctx, NOTES.G4, 'triangle', now + 0.15, 0.2, 0.15);
            playTone(ctx, NOTES.C5, 'triangle', now + 0.3, 0.4, 0.15);
            playTone(ctx, NOTES.E5, 'triangle', now + 0.45, 0.6, 0.15);
            playTone(ctx, NOTES.C5, 'sine', now, 0.8, 0.05);
            break;

        case 'crit':
            playTone(ctx, NOTES.G5, 'sine', now, 0.3, 0.2);
            playTone(ctx, NOTES.C6, 'sine', now + 0.05, 0.4, 0.2);
            playTone(ctx, NOTES.E5, 'square', now, 0.1, 0.05);
            playTone(ctx, NOTES.A5, 'triangle', now + 0.1, 0.5, 0.1);
            break;

        case 'delete': 
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.3);
            break;
            
        case 'click': 
            playTone(ctx, 800, 'sine', now, 0.05, 0.02);
            break;

        case 'hover':
            playTone(ctx, 400, 'sine', now, 0.02, 0.005);
            break;

        case 'error': 
            playTone(ctx, 150, 'sawtooth', now, 0.3, 0.1);
            playTone(ctx, 140, 'sawtooth', now + 0.05, 0.3, 0.1);
            break;
    }
};
