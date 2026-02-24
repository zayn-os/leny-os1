import { useState, useEffect, useRef } from 'react';
import { useLifeOS } from '../../../contexts/LifeOSContext';

export type NoiseType = 'none' | 'brown' | 'rain' | 'clock' | 'custom';

export const useFocusAudio = (noiseType: NoiseType, focusSessionActive: boolean) => {
    const { state, dispatch } = useLifeOS();
    const audioCtxRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const customAudioElRef = useRef<HTMLAudioElement | null>(null);

    const stopAudio = () => {
        if (sourceNodeRef.current) {
            try { 
                sourceNodeRef.current.stop(); 
                sourceNodeRef.current.disconnect(); 
            } catch(e) {}
            sourceNodeRef.current = null;
        }
        if (gainNodeRef.current) {
            try { gainNodeRef.current.disconnect(); } catch(e) {}
            gainNodeRef.current = null;
        }
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
            try { audioCtxRef.current.close(); } catch(e) {}
            audioCtxRef.current = null;
        }
        if (customAudioElRef.current) {
            customAudioElRef.current.pause();
            customAudioElRef.current.src = "";
            customAudioElRef.current = null;
        }
    };

    useEffect(() => {
        return () => stopAudio();
    }, []);

    useEffect(() => {
        stopAudio();
        if (noiseType === 'none' || !focusSessionActive) return;

        if (noiseType === 'custom') {
            if (state.ui.customAudio?.url) {
                const audio = new Audio(state.ui.customAudio.url);
                audio.loop = true;
                audio.volume = 0.5;
                audio.play().catch(e => console.error("Playback failed", e));
                customAudioElRef.current = audio;
            } else {
                dispatch.addToast('No Custom Track Loaded', 'error');
            }
            return;
        }

        try {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            const ctx = audioCtxRef.current;
            gainNodeRef.current = ctx.createGain();
            gainNodeRef.current.connect(ctx.destination);

            let buffer: AudioBuffer | null = null;
            if (noiseType === 'brown') {
                const bufferSize = 2 * ctx.sampleRate;
                buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                let lastOut = 0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    data[i] = (lastOut + (0.02 * white)) / 1.02;
                    lastOut = data[i];
                    data[i] *= 3.5; 
                }
                gainNodeRef.current.gain.value = 0.15;
            } 
            else if (noiseType === 'rain') {
                const bufferSize = 2 * ctx.sampleRate;
                buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    b0 = 0.99886 * b0 + white * 0.0555179;
                    b1 = 0.99332 * b1 + white * 0.0750759;
                    b2 = 0.96900 * b2 + white * 0.1538520;
                    b3 = 0.86650 * b3 + white * 0.3104856;
                    b4 = 0.55000 * b4 + white * 0.5329522;
                    b5 = -0.7616 * b5 - white * 0.0168980;
                    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
                    b6 = white * 0.115926;
                }
                gainNodeRef.current.gain.value = 0.2;
            }
            else if (noiseType === 'clock') {
                const bufferSize = ctx.sampleRate; 
                buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    const t = i / ctx.sampleRate;
                    if (t < 0.15) { 
                        const noise = (Math.random() * 2 - 1) * Math.exp(-t * 80);
                        const tone = Math.sin(2 * Math.PI * 2800 * t) * Math.exp(-t * 100);
                        const body = Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 60);
                        data[i] = (noise * 0.4) + (tone * 0.3) + (body * 0.3);
                    } else {
                        data[i] = 0;
                    }
                }
                gainNodeRef.current.gain.value = 0.5; 
            }

            if (buffer) {
                sourceNodeRef.current = ctx.createBufferSource();
                sourceNodeRef.current.buffer = buffer;
                sourceNodeRef.current.loop = true;
                sourceNodeRef.current.connect(gainNodeRef.current);
                sourceNodeRef.current.start(0);
            }
        } catch (e) { console.error("Audio failed", e); }

        return () => stopAudio();
    }, [noiseType, focusSessionActive]);

    return { stopAudio };
};