
import React, { useEffect, useRef } from 'react';
import { LocalNotifications, ActionPerformed } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { useLifeOS } from '../contexts/LifeOSContext';
import { useTasks } from '../contexts/TaskContext';
import { useHabits } from '../contexts/HabitContext';
import { useRaids } from '../contexts/RaidContext';
import { registerNotificationChannels, updateDashboardNotification, sendAlert } from '../utils/notifications';
import { playSound } from '../utils/audio';
import { checkHabitActive } from '../utils/habitEngine';

const NotificationManager: React.FC = () => {
    const { state, dispatch } = useLifeOS();
    const { taskState, taskDispatch } = useTasks();
    const { habitState, habitDispatch } = useHabits();
    const { raidState, raidDispatch } = useRaids();

    const { deviceNotificationsEnabled } = state.user.preferences;
    const lastSummaryRef = useRef<string>('');

    // 1️⃣ INITIALIZE SYSTEM
    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            registerNotificationChannels();

            // Listen for buttons (Complete / Snooze)
            LocalNotifications.addListener('localNotificationActionPerformed', (notification: ActionPerformed) => {
                const actionId = notification.actionId;
                const extra = notification.notification.extra;

                if (actionId === 'OPEN_APP') {
                    // Just opens app (Default behavior)
                }

                if (actionId === 'COMPLETE' && extra) {
                    const { itemId, type, parentId } = extra;
                    if (type === 'task') {
                        taskDispatch.toggleTask(itemId);
                        dispatch.addToast('Mission Completed via Uplink', 'success');
                    } else if (type === 'habit') {
                        habitDispatch.processHabit(itemId, 'completed');
                        dispatch.addToast('Protocol Executed via Uplink', 'success');
                    } else if (type === 'raid_step' && parentId) {
                        raidDispatch.toggleRaidStep(parentId, itemId);
                        dispatch.addToast('Operation Step Secured', 'success');
                    }
                    playSound('success', true);
                }

                if (actionId === 'SNOOZE') {
                    dispatch.addToast('Alert Snoozed (Simulation)', 'info');
                }
            });
        }
    }, []);

    // 2️⃣ DASHBOARD MANAGER (The Persistent Notification)
    // Updates whenever state changes
    useEffect(() => {
        if (!deviceNotificationsEnabled || !Capacitor.isNativePlatform()) return;

        const updateStickyNotification = () => {
            const todayIso = state.ui.debugDate ? new Date(state.ui.debugDate).toISOString() : new Date().toISOString();
            
            // Calc Pending Habits
            const activeHabits = habitState.habits.filter(h => 
                h.status === 'pending' && checkHabitActive(h, todayIso)
            );

            // Calc Pending Tasks
            const activeTasks = taskState.tasks.filter(t => 
                !t.isCompleted && !t.isArchived && 
                (!t.scheduledTime || new Date(t.scheduledTime) <= new Date(new Date().getTime() + 86400000)) // Only today/overdue
            );

            // Calc Active Raid Steps
            let activeRaidSteps = 0;
            raidState.raids.forEach(r => {
                if (r.status === 'active') {
                    activeRaidSteps += r.steps.filter(s => !s.isCompleted && !s.isLocked).length;
                }
            });

            const totalPending = activeHabits.length + activeTasks.length + activeRaidSteps;
            const xpProgress = Math.floor((state.user.dailyXP / state.user.dailyTarget) * 100);

            // Construct Content
            const title = `LifeOS Active: ${totalPending} Pending`;
            const body = `⚔️ ${activeTasks.length} Missions  •  🔄 ${activeHabits.length} Protocols  •  ⚡ ${xpProgress}% XP`;

            // Only update if content changed to save battery
            const summaryKey = title + body;
            if (lastSummaryRef.current !== summaryKey) {
                updateDashboardNotification(title, body);
                lastSummaryRef.current = summaryKey;
            }
        };

        // Update immediately and then debounce slightly
        const t = setTimeout(updateStickyNotification, 1000);
        return () => clearTimeout(t);

    }, [
        taskState.tasks, 
        habitState.habits, 
        raidState.raids, 
        state.user.dailyXP, 
        deviceNotificationsEnabled
    ]);

    // 3️⃣ ALERT MANAGER (Timed Notifications)
    // Runs interval check for specific times
    useEffect(() => {
        if (!deviceNotificationsEnabled) return;

        const checkSchedules = () => {
            const now = new Date().getTime();
            // 🌐 Browser Throttling Safe-guard: Widen window to 5 minutes
            // Since we set isSent=true, this won't cause duplicates
            const WINDOW_MS = 5 * 60 * 1000; 

            // Check Tasks
            taskState.tasks.forEach(task => {
                if (task.isCompleted || task.isArchived || !task.scheduledTime) return;
                
                if (task.reminders) {
                    const scheduled = new Date(task.scheduledTime).getTime();
                    let updated = false;
                    const newReminders = task.reminders.map(rem => {
                        if (rem.isSent) return rem;
                        const triggerTime = scheduled - (rem.minutesBefore * 60000);
                        
                        // Check if trigger time is in the past (within window)
                        if (now >= triggerTime && now < triggerTime + WINDOW_MS) {
                            sendAlert(
                                parseInt(task.id.replace(/\D/g, '').slice(-8)) || Date.now(),
                                `Mission Critical: ${task.title}`,
                                `Time: ${new Date(task.scheduledTime!).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`,
                                { itemId: task.id, type: 'task' }
                            );
                            updated = true;
                            return { ...rem, isSent: true };
                        }
                        return rem;
                    });
                    if (updated) taskDispatch.updateTask(task.id, { reminders: newReminders });
                }
            });

            // Check Habits
            habitState.habits.forEach(habit => {
                if (habit.status === 'completed' || !habit.scheduledTime || !habit.reminders) return;
                
                const [h, m] = habit.scheduledTime.split(':').map(Number);
                const scheduledDate = new Date();
                scheduledDate.setHours(h, m, 0, 0);
                const scheduledTime = scheduledDate.getTime();

                let updated = false;
                const newReminders = habit.reminders.map(rem => {
                    if (rem.isSent) return rem;
                    const triggerTime = scheduledTime - (rem.minutesBefore * 60000);

                    if (now >= triggerTime && now < triggerTime + WINDOW_MS) {
                        sendAlert(
                            parseInt(habit.id.replace(/\D/g, '').slice(-8)) || Date.now(),
                            `Protocol: ${habit.title}`,
                            `Time: ${habit.scheduledTime}`,
                            { itemId: habit.id, type: 'habit' }
                        );
                        updated = true;
                        return { ...rem, isSent: true };
                    }
                    return rem;
                });
                if (updated) habitDispatch.updateHabit(habit.id, { reminders: newReminders });
            });
        };

        const interval = setInterval(checkSchedules, 15000); // Check every 15 sec
        return () => clearInterval(interval);

    }, [taskState.tasks, habitState.habits, deviceNotificationsEnabled]);

    return null; // Headless component
};

export default NotificationManager;
