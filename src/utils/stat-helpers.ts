import { Stat } from '../types/types';
import { Brain, Heart, Shield, Zap, Dumbbell, Palette, Crown } from 'lucide-react';

export const getStatIcon = (stat: Stat) => {
    switch (stat) {
        case Stat.STR: return Dumbbell;
        case Stat.INT: return Brain;
        case Stat.DIS: return Zap;
        case Stat.CRT: return Palette;
        case Stat.PCE: return Shield;
        case Stat.EMT: return Heart;
        case Stat.CAM: return Crown;
        default: return Crown;
    }
};

export const getStatColor = (stat: Stat) => {
    switch (stat) {
        case Stat.STR: return '#ef4444'; // red-500
        case Stat.INT: return '#8b5cf6'; // violet-500
        case Stat.DIS: return '#3b82f6'; // blue-500
        case Stat.CRT: return '#ec4899'; // pink-500
        case Stat.PCE: return '#22c55e'; // emerald-500
        case Stat.EMT: return '#f97316'; // orange-500
        case Stat.CAM: return '#f59e0b'; // amber-500
        default: return '#6b7280'; // gray-500
    }
};
