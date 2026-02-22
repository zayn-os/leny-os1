
import { Skill, SkillRank } from '../types/skillTypes';

// 📈 EXPONENTIAL XP CURVE
// Base * (Level ^ Exponent)
export const calculateNextLevelXP = (level: number): number => {
    const BASE_XP = 100;
    const EXPONENT = 1.5;
    return Math.floor(BASE_XP * Math.pow(level, EXPONENT));
};

// 🏅 RANK SYSTEM
export const getSkillRank = (level: number): SkillRank => {
    if (level >= 100) return 'Grandmaster';
    if (level >= 50) return 'Master';
    if (level >= 25) return 'Expert';
    if (level >= 10) return 'Adept';
    return 'Novice';
};

// 🍂 RUST MECHANIC
// Returns true if lastPracticed is > 30 days ago
export const checkIsRusty = (lastPracticedIso: string): boolean => {
    const lastDate = new Date(lastPracticedIso);
    const now = new Date();
    
    // Calculate difference in days
    const diffTime = Math.abs(now.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 30;
};
