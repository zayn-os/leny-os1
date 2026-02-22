import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './src/App';
import './src/index.css';

// Import Context Providers
import { LifeOSProvider } from './src/contexts/LifeOSContext';
import { SkillProvider } from './src/contexts/SkillContext';
import { TaskProvider } from './src/contexts/TaskContext';
import { HabitProvider } from './src/contexts/HabitContext';
import { RaidProvider } from './src/contexts/RaidContext';
import { ShopProvider } from './src/contexts/ShopContext';
import { CampaignProvider } from './src/contexts/CampaignContext';
import { BadgeProvider } from './src/contexts/BadgeContext';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <LifeOSProvider>
        <SkillProvider>
          <TaskProvider>
            <HabitProvider>
              <RaidProvider>
                <ShopProvider>
                  <CampaignProvider>
                    <BadgeProvider>
                      <App />
                    </BadgeProvider>
                  </CampaignProvider>
                </ShopProvider>
              </RaidProvider>
            </HabitProvider>
          </TaskProvider>
        </SkillProvider>
      </LifeOSProvider>
    </React.StrictMode>
  );
}