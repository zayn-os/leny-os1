
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Skill, SkillRank } from '../types/skillTypes';
import { Stat } from '../types/types';
import { calculateNextLevelXP, getSkillRank, checkIsRusty } from '../utils/skillEngine';
import { useLifeOS } from './LifeOSContext';
import { playSound } from '../utils/audio';

interface SkillState {
    skills: Skill[];
    activeSkillId: string | null;
}

interface SkillContextType {
    skillState: SkillState;
    skillDispatch: {
        addSkill: (title: string, relatedStats: Stat[], description?: string) => void;
        addSkillXP: (skillId: string, amount: number) => void;
        deleteSkill: (skillId: string) => void;
        setActiveSkill: (skillId: string | null) => void;
        restoreData: (skills: Skill[]) => void;
    };
}

const STORAGE_KEY_SKILLS = 'LIFE_OS_SKILLS_DATA';

const INITIAL_SKILLS: Skill[] = [
    {
        id: 'sk_01',
        title: 'Coding',
        description: 'Building the matrix.',
        relatedStats: [Stat.INT],
        level: 1,
        currentXP: 0,
        targetXP: 100, 
        rank: 'Novice',
        lastPracticed: new Date().toISOString(),
        isRusty: false,
        createdAt: new Date().toISOString()
    }
];

const SkillContext = createContext<SkillContextType | undefined>(undefined);

export const SkillProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { state: lifeState, dispatch: lifeDispatch } = useLifeOS();
    const soundEnabled = lifeState.user.preferences.soundEnabled;

    const safeLoad = (): Skill[] => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_SKILLS);
            if (saved) {
                const parsed = JSON.parse(saved);
                return Array.isArray(parsed) ? parsed : INITIAL_SKILLS;
            }
        } catch (e) {
            console.warn("Failed to load skills:", e);
        }
        return INITIAL_SKILLS;
    };

    const [skills, setSkills] = useState<Skill[]>(safeLoad);
    const [activeSkillId, setActiveSkillId] = useState<string | null>(null);

    useEffect(() => {
        const saveTimeout = setTimeout(() => {
            if (skills.length > 0 || localStorage.getItem(STORAGE_KEY_SKILLS)) {
                localStorage.setItem(STORAGE_KEY_SKILLS, JSON.stringify(skills));
            }
        }, 500);
        return () => clearTimeout(saveTimeout);
    }, [skills]);

    useEffect(() => {
        const checkRustRoutine = () => {
            setSkills(prev => prev.map(skill => ({
                ...skill,
                isRusty: checkIsRusty(skill.lastPracticed)
            })));
        };
        checkRustRoutine();
    }, []);

    // Actions
    const setActiveSkill = (skillId: string | null) => {
        if (skillId) playSound('click', soundEnabled);
        setActiveSkillId(skillId);
    };

    const addSkill = (title: string, relatedStats: Stat[], description: string = '') => {
        const newSkill: Skill = {
            id: `sk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title,
            description,
            relatedStats,
            level: 1,
            currentXP: 0,
            targetXP: calculateNextLevelXP(1),
            rank: 'Novice',
            lastPracticed: new Date().toISOString(),
            isRusty: false,
            createdAt: new Date().toISOString()
        };
        playSound('click', soundEnabled);
        setSkills(prev => [...prev, newSkill]);
        lifeDispatch.addToast(`Skill Acquired: ${title}`, 'success');
    };

    const addSkillXP = (skillId: string, amount: number) => {
        setSkills(prev => prev.map(skill => {
            if (skill.id !== skillId) return skill;

            const wasRusty = skill.isRusty;
            let newXP = skill.currentXP + amount;
            let newLevel = skill.level;
            let newTarget = skill.targetXP;
            let levelUpOccurred = false;

            while (newXP >= newTarget) {
                newXP -= newTarget;
                newLevel++;
                newTarget = calculateNextLevelXP(newLevel);
                levelUpOccurred = true;
            }

            const newRank = getSkillRank(newLevel);

            if (levelUpOccurred) {
                playSound('level-up', soundEnabled);
                lifeDispatch.addToast(`${skill.title} reached Level ${newLevel}!`, 'level-up');
            }
            
            if (wasRusty) {
                lifeDispatch.addToast(`${skill.title} is no longer Rusty!`, 'success');
            }

            return {
                ...skill,
                level: newLevel,
                currentXP: newXP,
                targetXP: newTarget,
                rank: newRank,
                lastPracticed: new Date().toISOString(), 
                isRusty: false 
            };
        }));
    };

    const deleteSkill = (skillId: string) => {
        playSound('delete', soundEnabled);
        setSkills(prev => prev.filter(s => s.id !== skillId));
        if (activeSkillId === skillId) setActiveSkillId(null);
        lifeDispatch.addToast('Skill Deleted', 'info');
    };

    const restoreData = (newSkills: Skill[]) => {
        setSkills(newSkills);
        lifeDispatch.addToast('Skills Restored', 'success');
    };

    return (
        <SkillContext.Provider value={{ 
            skillState: { skills, activeSkillId }, 
            skillDispatch: { addSkill, addSkillXP, deleteSkill, setActiveSkill, restoreData } 
        }}>
            {children}
        </SkillContext.Provider>
    );
};

export const useSkills = () => {
    const context = useContext(SkillContext);
    if (context === undefined) {
        throw new Error('useSkills must be used within a SkillProvider');
    }
    return context;
};
