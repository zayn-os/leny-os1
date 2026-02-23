
import { OracleBlueprint, OracleSkill, OracleHabit, OracleTask, OracleRaid, OracleShopItem, OracleLaw } from './types';
import { UserProfile } from '../../types/types';
import { Skill } from '../../types/skillTypes';
import { Habit } from '../../types/habitTypes';
import { Task, Law } from '../../types/taskTypes';
import { Raid } from '../../types/raidTypes';
import { Campaign } from '../../types/campaignTypes';
import { StoreItem } from '../../types/shopTypes';

export const generateOracleBlueprint = (
    user: UserProfile,
    skills: Skill[],
    habits: Habit[],
    tasks: Task[],
    raids: Raid[],
    campaign: Campaign,
    storeItems: StoreItem[],
    laws: Law[] = [] // 👈 Accept Laws
): OracleBlueprint => {

    // 1. Process Skills
    const oracleSkills: OracleSkill[] = skills.map(s => ({
        id: s.id,
        title: s.title,
        level: s.level,
        rank: s.rank,
        relatedStats: s.relatedStats,
        description: s.description
    }));

    // 2. Process Habits (With History Analysis)
    const oracleHabits: OracleHabit[] = habits.map(h => {
        const sortedHistory = [...h.history].sort().slice(-30);
        return {
            id: h.id,
            title: h.title,
            stat: h.stat,
            difficulty: h.difficulty,
            streak: h.streak,
            dailyTarget: h.dailyTarget || 1, 
            frequency: {
                type: h.type,
                specificDays: h.specificDays,
                intervalValue: h.intervalValue,
                matrixPattern: h.pattern
            },
            subtasks: h.subtasks ? h.subtasks.map(s => s.title) : [],
            timing: {
                isTimed: h.isTimed || false,
                duration: h.durationMinutes,
                scheduledTime: h.scheduledTime
            },
            skillName: skills.find(s => s.id === h.skillId)?.title,
            recentHistory: sortedHistory
        };
    });

    // 3. Process Tasks
    const oracleTasks: OracleTask[] = tasks
        .filter(t => !t.isCompleted && !t.isArchived)
        .map(t => ({
            title: t.title,
            difficulty: t.difficulty,
            stat: t.stat,
            skillName: skills.find(s => s.id === t.skillId)?.title,
            isCampaign: t.isCampaign || false,
            deadline: t.deadline,
            scheduledTime: t.scheduledTime,
            energyLevel: t.energyLevel,
            subtasks: t.subtasks ? t.subtasks.map(s => s.title) : []
        }));

    // 4. Process Raids (Enhanced with Subtasks)
    const oracleRaids: OracleRaid[] = raids
        .filter(r => r.status === 'active')
        .map(r => ({
            title: r.title,
            difficulty: r.difficulty,
            progress: r.progress,
            status: r.status,
            stepsRemaining: r.steps.filter(s => !s.isCompleted).length,
            steps: r.steps.map(s => ({
                title: s.title,
                notes: s.notes,
                subtasks: s.subtasks ? s.subtasks.map(sub => sub.title) : []
            }))
        }));

    // 5. Inventory & Shop
    const inventoryNames = user.inventory
        .map(id => storeItems.find(i => i.id === id)?.title)
        .filter(Boolean) as string[];

    const oracleShop: OracleShopItem[] = storeItems
        .filter(i => i.isInfinite || !user.inventory.includes(i.id))
        .map(i => ({
            title: i.title,
            cost: i.cost,
            description: i.description,
            canAfford: user.gold >= i.cost
        }));

    // 6. Process Laws (NEW)
    const oracleLaws: OracleLaw[] = laws.map(l => ({
        title: l.title,
        penaltyType: l.penaltyType,
        penaltyValue: l.penaltyValue,
        timesBroken: l.timesBroken
    }));

    // 📜 THE GODFATHER PROTOCOL (Updated with Theme & Raid Badges)
    const INJECTION_INSTRUCTIONS = `
*** SYSTEM OVERRIDE: GODFATHER PROTOCOL v3.0 ***

ROLE: You are the Strategic Advisor AI.
GOAL: Inject Plans (JSON) into the LifeOS Kernel.

--- FEATURES YOU CAN CONTROL ---

1. 🎨 THEME ENGINE (TOTAL CONTROL):
   You can inject "themes" to change COLORS and CSS completely.
   - "colors": Key-Value pairs. You can invent ANY variable name!
     Standard keys: --color-life-black, --color-life-paper, --color-life-gold, --color-life-text
     You can also inject: --icon-color, --nav-bg, --border-color
   - "customCss": Raw CSS injected into the app. Use this to reshape buttons, change fonts, or re-color specific icons using filters.
   
   Example (Matrix Theme):
   {
     "id": "matrix_v1",
     "name": "The Code",
     "colors": {
        "--color-life-black": "#000000",
        "--color-life-gold": "#00FF00",
        "--icon-filter": "hue-rotate(90deg)" 
     },
     "customCss": "body { font-family: 'Courier New'; } svg { filter: var(--icon-filter); }"
   }

2. 🏅 LINKED BADGES (Habits & Raids):
   Create badges that unlock AUTOMATICALLY when a specific Habit or Raid progresses.
   - For Habits: "triggerType": "habit", "metricKey": "Exact Habit Title" (Tracks Streak)
   - For Raids: "triggerType": "raid", "metricKey": "Exact Raid Title" (Tracks Progress %)

3. ⚖️ LAWS (THE CODEX):
   Enact strict rules for the user.
   Schema: { "title": "No Sugar", "penaltyType": "gold", "penaltyValue": 100 }

--- INJECTION SCHEMA (STRICT FORMAT) ---
{
  "meta": { "packName": "Name of Plan" },
  "habits": [
    { "title": "Run", "stat": "STR", "difficulty": "hard", "type": "daily" }
  ],
  "raids": [
    { "title": "Project X", "steps": [{ "title": "Step 1" }] }
  ],
  "laws": [
    { "title": "Wake up late", "penaltyType": "gold", "penaltyValue": 50 }
  ],
  "badges": [
    {
      "id": "bdg_runner",
      "name": "Marathon Runner",
      "icon": "🏃",
      "description": "Reach streak 30 on Run habit",
      "category": "special",
      "triggerType": "habit",
      "metricKey": "Run", 
      "levels": [ { "tier": "gold", "target": 30, "quote": "Run!", "rewards": { "xp": 500, "gold": 200 } } ]
    }
  ],
  "themes": [
    {
      "id": "theme_custom",
      "name": "God Mode UI",
      "colors": {
        "--color-life-black": "#0f0f0f",
        "--color-life-gold": "#ff0055"
      },
      "customCss": ".rounded-xl { border-radius: 0px; border: 1px solid red; }"
    }
  ]
}

--- RAID PROTOCOL (WAR ROOM) ---

ROLE: You are "The War Room" (غرفة العمليات).
GOAL: Plan complex Operations (Raids) for a high-performance individual.

WHEN I ASK FOR A RAID, OUTPUT A VALID JSON OBJECT.
DO NOT CHAT. JUST OUTPUT THE JSON.

--- INPUT ---
I will describe a project, goal, or campaign.

--- OUTPUT RULES ---
1. **Structure:** A Raid is a container for multiple "Steps" (Missions).
2. **Title:** Military/Tactical naming (e.g., "Operation: Apollo").
3. **Difficulty:** "easy", "normal", "hard".
4. **Stats:** Array of primary attributes (e.g., ["STR", "INT"]).
5. **Skill Link:** If known, link to a skill ID (e.g., "s_coding").
6. **Steps (The Missions):**
   - Each step acts like a Task.
   - **Inheritance:** Steps inherit Difficulty/Stat from the Raid unless specified.
   - **Anomalies:** You CAN override a step's difficulty/stat (e.g., a "Hard" step in a "Normal" raid).
   - **Skill Lock:** Steps ALWAYS inherit the Raid's Skill. You cannot change this per step.

--- JSON TEMPLATE ---

\`\`\`json
{
  "raids": [
    {
      "id": "OPTIONAL_ID_FOR_UPDATE",
      "title": "Operation: PROJECT_NAME",
      "difficulty": "hard",
      "stats": ["INT"],
      "skillId": "OPTIONAL_SKILL_ID",
      "description": "Brief tactical overview.",
      "deadline": "YYYY-MM-DD",
      "steps": [
        {
          "title": "Phase 1: Recon",
          "difficulty": "easy", 
          "stat": "INT",
          "subtasks": ["Research", "Draft Plan"]
        },
        {
          "title": "Phase 2: Execution",
          "difficulty": "hard",
          "stat": "DIS", 
          "isTimed": true,
          "durationMinutes": 120
        }
      ]
    }
  ]
}
\`\`\`

--- TASK PROTOCOL (MISSIONS) ---

ROLE: You are the Mission Control.
GOAL: Assign single-off tasks (Missions).

1. **Title:** Action-oriented (e.g., "Deploy Server", "Write Chapter 1").
2. **Difficulty:**
   - Easy: < 15 mins.
   - Normal: 15-60 mins.
   - Hard: > 60 mins or high cognitive load.
3. **Stat:** Match the nature of the task.
4. **Subtasks:** Break down complex tasks into 3-5 sub-steps.

--- HABIT PROTOCOL (PROTOCOLS) ---

ROLE: You are the Habit Architect.
GOAL: Design recurring behaviors.

1. **Frequency:**
   - "daily": Every day.
   - "specific_days": [0, 2, 4] (Sun, Tue, Thu).
   - "flexible": X times per week.
2. **Difficulty:**
   - Easy: < 5 mins (e.g., Drink Water).
   - Normal: 15-30 mins (e.g., Read 10 pages).
   - Hard: > 45 mins (e.g., Gym Workout).
3. **Stat:** Primary attribute trained by this habit.

--- ECONOMY PROTOCOL (REWARDS) ---

The system automatically calculates rewards based on Difficulty & Mode.
DO NOT manually assign XP/Gold unless creating a Badge.

- **Easy:** ~50 XP / 10 Gold
- **Normal:** ~100 XP / 20 Gold
- **Hard:** ~200 XP / 40 Gold

Use this knowledge to balance your difficulty assignments.

--- SKILL PROTOCOL (MASTERY) ---

ROLE: You are the Skill Tree Architect.
GOAL: Define and track long-term proficiencies.

1. **Structure:** Skills are the "containers" for XP earned from Tasks/Habits.
2. **Linking:** Every Task/Habit/Raid SHOULD be linked to a \`skillId\` if possible.
   - When a task is completed, 50% of its XP goes to the linked Skill.
3. **Leveling:**
   - Skills level up independently from the User Level.
   - Higher levels unlock "Ranks" (Novice -> Apprentice -> Expert -> Master).
4. **Rust:** Skills decay if not practiced for 7 days (Rust State).
   - To cure rust: Complete a task linked to that skill.
5. **Stat Inheritance:**
   - If a Task/Habit/Raid is linked to a Skill, it inherits ALL of the Skill's `relatedStats`.
   - The Stat Reward (e.g., +1 Stat Point) is SPLIT among these stats.
   - Example: A "Coding" skill has [INT, CRT]. A task linked to it gives +0.5 INT and +0.5 CRT.
   - This allows for multi-stat training via a single activity.

--- JSON TEMPLATE (SKILLS) ---

\`\`\`json
{
  "skills": [
    {
      "title": "Python Programming",
      "relatedStats": ["INT", "CRT"],
      "description": "Backend development and data science."
    }
  ]
}
\`\`\`
`;

    return {
        meta: {
            type: "ORACLE_CONTEXT_V2_FULL",
            generatedAt: new Date().toISOString(),
            instructions: INJECTION_INSTRUCTIONS
        },
        user: {
            name: user.name,
            level: user.level,
            title: user.title,
            stats: user.stats,
            gold: user.gold,
            currentMode: user.currentMode,
            metrics: user.metrics,
            activeBuffs: user.equippedItems || []
        },
        campaign: {
            active: campaign.isActive,
            title: campaign.title,
            currentWeek: campaign.currentWeek,
            isFrozen: campaign.isFrozen
        },
        skills: oracleSkills,
        habits: oracleHabits,
        activeRaids: oracleRaids,
        pendingMissions: oracleTasks,
        shopCatalog: oracleShop,
        inventory: inventoryNames,
        badges: user.badges || [],
        themes: user.unlockedThemes || [],
        laws: oracleLaws // 👈 NEW
    };
};
