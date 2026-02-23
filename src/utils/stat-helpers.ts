import { Stat } from '../types/types';
import { Brain, Heart, Shield, Zap, Dumbbell, Palette, Crown, Coins, Users, Flame } from 'lucide-react';

export const getStatIcon = (stat: Stat) => {
    switch (stat) {
        case Stat.STR: return Dumbbell;
        case Stat.INT: return Brain;
        case Stat.DIS: return Zap;
        case Stat.HEA: return Heart;
        case Stat.CRT: return Palette;
        case Stat.SPR: return Flame;
        case Stat.REL: return Users;
        case Stat.FIN: return Coins;
        default: return Crown;
    }
};

export const getStatColor = (stat: Stat) => {
    switch (stat) {
        case Stat.STR: return '#ef4444'; // red-500
        case Stat.INT: return '#8b5cf6'; // violet-500
        case Stat.DIS: return '#3b82f6'; // blue-500
        case Stat.HEA: return '#10b981'; // emerald-500
        case Stat.CRT: return '#ec4899'; // pink-500
        case Stat.SPR: return '#f43f5e'; // rose-500
        case Stat.REL: return '#fbbf24'; // amber-500
        case Stat.FIN: return '#14b8a6'; // teal-500
        default: return '#6b7280'; // gray-500
    }
};
