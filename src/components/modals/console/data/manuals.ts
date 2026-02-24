export const GEM_MANUALS = {
    commander: {
        title: "The Commander",
        role: "Strategic General & NLP Core",
        content: `/// CLASSIFIED: COMMANDER NODE MANUAL ///

1. OVERVIEW
The Commander is the central interface for the user. It is the only node that maintains conversational context (Memory). It acts as a router, deciding whether to handle a query itself or delegate it to a Specialist Node (Executor, Designer, etc.).

2. PERSONALITY PROFILE
- Tone: "The Godfather" / "Strategic General".
- Traits: Ruthless, Efficient, Protective, Authoritative.
- Language: Professional Arabic (Gulf/Saudi Dialect) or English (Based on toggle).

3. TRIGGERS & BEHAVIOR
- "Hello/Hi": Responds with status report.
- "Help/Guide": Explains the system.
- General Chat: Discusses productivity strategies.
- Complex Commands: If a user asks for multiple things ("Add a task AND change theme"), the Commander breaks this down or asks for clarification.

4. MEMORY PROTOCOL
- Storage: 'LIFE_OS_ORACLE_HISTORY' (Local Storage).
- Context Window: Sends last 20 messages to Gemini to maintain conversation flow.
- Reset: Can be purged via "Purge Context Memory" button.

5. DIRECTIVE
"If the user asks to create something, do NOT ask follow-up questions. Deploy defaults immediately."
`
    },
    executor: {
        title: "The Executor",
        role: "Tactical Injection Engine",
        content: `/// CLASSIFIED: EXECUTOR NODE MANUAL ///

1. OVERVIEW
The Executor is a "Silent Agent". It does not speak. It outputs raw JSON payloads to modify the application state directly. It handles Tasks, Habits, and Raids.

2. TRIGGER KEYWORDS
- Tasks: "Add task", "Mission", "Remind me to..."
- Habits: "New habit", "Protocol", "Routine..."
- Raids: "Start project", "Operation", "Plan a raid..."

3. JSON SCHEMA (TASKS)
{
  "tasks": [
    {
      "title": "String (Required)",
      "difficulty": "easy | normal | hard",
      "stat": "STR | INT | DIS | HEA | CRT | SPR | REL | FIN",
      "deadline": "YYYY-MM-DD",
      "subtasks": ["Step 1", "Step 2"]
    }
  ]
}

4. JSON SCHEMA (HABITS)
{
  "habits": [
    {
      "title": "String",
      "type": "daily | specific_days | interval",
      "stat": "DIS",
      "dailyTarget": 1
    }
  ]
}

5. ERROR HANDLING
If the Executor outputs invalid JSON, the "Refiner Node" (if active) attempts to repair syntax errors before injection.
`
    },
    designer: {
        title: "The Designer",
        role: "Visual Cortex & Theme Engine",
        content: `/// CLASSIFIED: DESIGNER NODE MANUAL ///

1. OVERVIEW
The Designer has full control over the CSS Variables and DOM styling of LifeOS. It can generate themes on the fly based on abstract descriptions (e.g., "Make it look like Cyberpunk 2077").

2. TRIGGER KEYWORDS
- "Change theme", "Colors", "Design", "Look like..."

3. INJECTION CAPABILITIES
- Colors: Modifies --color-life-black, --color-life-gold, etc.
- CSS: Can inject raw CSS blocks to change border-radius, fonts, or layout shapes.

4. JSON SCHEMA (THEMES)
{
  "themes": [
    {
      "id": "unique_id",
      "name": "Display Name",
      "colors": {
        "--color-life-black": "#000000",
        "--color-life-paper": "#111111",
        "--color-life-gold": "#FFD700",
        "--color-life-text": "#FFFFFF"
      },
      "customCss": "body { font-family: 'Courier New'; }"
    }
  ]
}

5. PERSISTENCE
Themes created by the Designer are saved to 'user.unlockedThemes' and persist across reloads.
`
    },
    observer: {
        title: "The Observer",
        role: "Data Analyst & Critic",
        content: `/// CLASSIFIED: OBSERVER NODE MANUAL ///

1. OVERVIEW
The Observer has read-only access to the entire User Profile (JSON). It analyzes Stats, Metrics, Streaks, and Badge History to provide tough love or strategic insights.

2. TRIGGER KEYWORDS
- "Analyze my stats", "How am I doing?", "Report", "Status"

3. DATA ACCESS LEVEL
- user.stats (STR, INT, DIS...)
- user.metrics (Total Tasks, Completion Rates)
- user.streakHistory (Calendar Heatmap)
- user.inventory (Items owned)

4. ANALYSIS MODES
- Roast Mode: Cruelly points out weaknesses (Low DIS stat).
- Coach Mode: Suggests which Skill Tree to focus on based on lowest stats.
- Prediction: Estimates time to next Level Up based on current XP velocity.

5. OUTPUT
Returns text-only analysis. Does not modify state.
`
    }
};