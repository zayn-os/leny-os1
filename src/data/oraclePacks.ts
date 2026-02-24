
import { InjectionPayload, Difficulty, Stat, DailyMode } from '../types/types';

// 📦 PACK 1: MONK MODE (Discipline & Peace)
export const PACK_MONK: InjectionPayload = {
    meta: {
        packName: "Monk Mode Protocol",
        author: "LifeOS Architect"
    },
    habits: [
        { title: "05:00 AM Rising", difficulty: "hard", stat: "DIS", type: "daily", description: "Wake up before the enemy." },
        { title: "Meditation (20m)", difficulty: "normal", stat: "SPR", type: "daily", description: "Clear the mind. Sharpen the blade." },
        { title: "Deep Reading", difficulty: "normal", stat: "INT", type: "daily", description: "Consume ancient wisdom." },
        { title: "Intermittent Fasting", difficulty: "hard", stat: "DIS", type: "daily", description: "16:8 Protocol. Hunger is clarity." }
    ],
    tasks: [
        { title: "Digital Detox (24h)", difficulty: "hard", stat: "SPR", description: "No screens. Only reality." },
        { title: "Journal Reflection", difficulty: "easy", stat: "HEA", description: "Audit your thoughts." }
    ],
    skills: [
        { title: "Mindfulness", relatedStats: ["SPR", "DIS"], description: "The art of being present." },
        { title: "Philosophy", relatedStats: ["INT"], description: "Understanding the why." }
    ],
    storeItems: [
        { id: "item_tea", title: "Ceremonial Tea", description: "A moment of zen in liquid form.", cost: 150, type: "custom", icon: "Coffee", isInfinite: true }
    ],
    themes: [
        {
            id: "zen",
            name: "Zen Garden",
            colors: {
                '--color-life-black': '#1c1917', // Warm Stone
                '--color-life-paper': '#292524', // Stone 800
                '--color-life-gold': '#a8a29e',  // Stone 400 (Muted Gold)
                '--color-life-text': '#e7e5e4'   // Stone 200
            }
        }
    ]
};

// 📦 PACK 2: FOUNDER MODE (Intelligence & Wealth)
export const PACK_FOUNDER: InjectionPayload = {
    meta: {
        packName: "Founder Mode",
        author: "Silicon Valley"
    },
    habits: [
        { title: "Deep Work Block (4h)", difficulty: "hard", stat: "INT", type: "daily", description: "No distractions. Pure output." },
        { title: "Zero Inbox", difficulty: "normal", stat: "DIS", type: "daily", description: "Clear comms channels." },
        { title: "Network Outreach", difficulty: "normal", stat: "REL", type: "specific_days", specificDays: [1, 3, 5], description: "Send 3 cold emails/DMs." }
    ],
    raids: [
        {
            title: "Launch MVP",
            difficulty: "hard",
            stats: ["INT", "REL"],
            status: "active",
            progress: 0,
            steps: [
                { title: "Define Core Value Prop", notes: "What problem are we solving?" },
                { title: "Build Landing Page", notes: "Framer/Webflow" },
                { title: "Setup Stripe", notes: "Get the money flowing." },
                { title: "First 10 Users", notes: "Do things that don't scale." }
            ]
        }
    ],
    skills: [
        { title: "Product Management", relatedStats: ["INT", "REL"], description: "Building the right thing." },
        { title: "Sales", relatedStats: ["REL", "DIS"], description: "Selling the thing." }
    ],
    storeItems: [
        { id: "item_lambo", title: "Rental Supercar", description: "Taste the dream.", cost: 50000, type: "custom", icon: "Zap", isInfinite: true }
    ]
};

// 📦 PACK 3: SPARTAN PROTOCOL (Strength & War)
export const PACK_SPARTAN: InjectionPayload = {
    meta: {
        packName: "Spartan Protocol",
        author: "Leonidas"
    },
    habits: [
        { title: "Calisthenics", difficulty: "normal", stat: "STR", type: "daily", description: "100 Pushups, 50 Pullups." },
        { title: "Cold Shower", difficulty: "hard", stat: "DIS", type: "daily", description: "Embrace the shock." },
        { title: "Clean Eating", difficulty: "normal", stat: "STR", type: "daily", description: "Fuel, not fun." }
    ],
    tasks: [
        { title: "Run 5k", difficulty: "normal", stat: "STR", description: "Cardio is survival." },
        { title: "Heavy Deadlift Session", difficulty: "hard", stat: "STR", description: "Pick up heavy things." }
    ],
    skills: [
        { title: "Combat", relatedStats: ["STR", "DIS"], description: "Self-defense arts." },
        { title: "Athletics", relatedStats: ["STR"], description: "Functional movement." }
    ],
    themes: [
        {
            id: "crimson",
            name: "Spartan Red",
            colors: {
                '--color-life-black': '#1a0505',
                '--color-life-paper': '#2b0a0a',
                '--color-life-gold': '#ef4444', // Red as Gold
                '--color-life-text': '#fecaca'
            }
        }
    ]
};

export const AVAILABLE_PACKS = [PACK_MONK, PACK_FOUNDER, PACK_SPARTAN];
