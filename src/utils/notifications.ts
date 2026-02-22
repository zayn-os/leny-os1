
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

/**
 * 🔔 SYSTEM NOTIFICATION BRIDGE V2
 * Dual-Channel Architecture:
 * 1. Dashboard Channel: Silent, Persistent, Ongoing (The "Orange Box").
 * 2. Alert Channel: High Importance, Sound, Vibration (The Wake-up Call).
 */

const CHANNEL_DASHBOARD = 'lifeos_dashboard_channel';
const CHANNEL_ALERTS = 'lifeos_alerts_channel';

// 🛠️ SETUP CHANNELS
export const registerNotificationChannels = async () => {
    if (Capacitor.isNativePlatform()) {
        try {
            // 1. DASHBOARD CHANNEL (The Sticky Notification)
            // Importance: LOW (2) ensures it shows but doesn't make sound/popup
            await LocalNotifications.createChannel({
                id: CHANNEL_DASHBOARD,
                name: 'LifeOS Dashboard',
                description: 'Persistent Daily Summary',
                importance: 2, 
                visibility: 1, 
                sound: undefined,
                vibration: false,
            });

            // 2. ALERT CHANNEL (The Reminder)
            // Importance: HIGH (5) ensures sound and popup
            await LocalNotifications.createChannel({
                id: CHANNEL_ALERTS,
                name: 'Mission Alerts',
                description: 'Time-sensitive reminders',
                importance: 5,
                visibility: 1,
                sound: 'beep.wav', // Ensure beep.wav exists in android/app/src/main/res/raw
                vibration: true,
            });

            // 3. Register Actions
            await LocalNotifications.registerActionTypes({
                types: [
                    {
                        id: 'DASHBOARD_ACTIONS',
                        actions: [
                            { id: 'OPEN_APP', title: '🚀 Open Command', foreground: true }
                        ]
                    },
                    {
                        id: 'MISSION_ALERTS',
                        actions: [
                            { id: 'COMPLETE', title: '✅ Complete', foreground: false },
                            { id: 'SNOOZE', title: '💤 Snooze 10m', foreground: false }
                        ]
                    }
                ]
            });

            console.log("🔔 Channels Registered: Dashboard (Silent) & Alerts (Loud)");
        } catch (e) {
            console.error("Failed to register channels", e);
        }
    }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
    if (Capacitor.isNativePlatform()) {
        const result = await LocalNotifications.requestPermissions();
        if (result.display === 'granted') {
            await registerNotificationChannels(); 
            return true;
        }
        return false;
    }
    
    // 🌐 WEB FALLBACK (Browser / PWA)
    if (!('Notification' in window)) {
        console.log("This browser does not support desktop notification");
        return false;
    }
    
    if (Notification.permission === 'granted') return true;
    
    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    return false;
};

// 📌 SEND PERSISTENT DASHBOARD NOTIFICATION
export const updateDashboardNotification = async (summary: string, details: string) => {
    if (!Capacitor.isNativePlatform()) return;

    // We use a fixed ID (99999) so it updates the existing notification instead of creating a new one
    try {
        await LocalNotifications.schedule({
            notifications: [{
                id: 99999, // 🔒 FIXED ID
                title: summary,
                body: details,
                ongoing: true, // 🔒 MAKES IT STICKY (Cannot swipe away easily)
                autoCancel: false, // Clicking doesn't remove it
                silent: true, // No sound on update
                smallIcon: 'ic_stat_icon_config_sample',
                channelId: CHANNEL_DASHBOARD,
                actionTypeId: 'DASHBOARD_ACTIONS',
                schedule: { at: new Date(Date.now() + 100) } // Immediate
            }]
        });
    } catch (e) {
        console.error("Dashboard Update Failed", e);
    }
};

// ⏰ SEND TIMED ALERT
export const sendAlert = async (
    id: number,
    title: string, 
    body: string, 
    extraData?: any
) => {
    console.log(`🔔 sendAlert called: ${title} - ${body}`);

    if (Capacitor.isNativePlatform()) {
        try {
            await LocalNotifications.schedule({
                notifications: [{
                    id: id, // Unique ID based on task ID hash
                    title: `⚡ ${title}`,
                    body: body,
                    schedule: { at: new Date(Date.now() + 100) }, // Trigger logic handles timing
                    sound: 'beep.wav',
                    smallIcon: 'ic_stat_icon_config_sample',
                    actionTypeId: 'MISSION_ALERTS', 
                    extra: extraData || null,
                    channelId: CHANNEL_ALERTS // 🔊 LOUD CHANNEL
                }]
            });
        } catch (e) {
            console.error("Native alert failed:", e);
        }
    } else {
        // 🌐 WEB NOTIFICATION (Browser / PWA)
        if (!('Notification' in window)) {
            alert("This browser does not support desktop notification");
            return;
        }

        if (Notification.permission !== 'granted') {
            console.log("🔔 Permission not granted, requesting...");
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                alert("Please enable notifications to receive alerts.");
                return;
            }
        }

        try {
            // 🟢 TRY SERVICE WORKER FIRST (Better for PWA/Android/Background)
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                const reg = await navigator.serviceWorker.ready;
                await reg.showNotification(title, {
                    body: body,
                    icon: '/logo192.png',
                    badge: '/logo192.png',
                    vibrate: [200, 100, 200],
                    tag: String(id),
                    requireInteraction: true,
                    data: { url: window.location.href } // Pass data for click handler
                });
                console.log("🔔 Service Worker notification sent");
            } else {
                // 🟡 FALLBACK TO CLASSIC API
                const notification = new Notification(title, {
                    body: body,
                    icon: '/logo192.png',
                    badge: '/logo192.png',
                    vibrate: [200, 100, 200],
                    tag: String(id),
                    requireInteraction: true,
                });

                notification.onclick = () => {
                    window.focus();
                    notification.close();
                };
                console.log("🔔 Web notification sent (Classic API)");
            }
        } catch (e) {
            console.error("Web notification failed:", e);
            alert("Failed to send notification. See console for details.");
        }
    }
};

// 🔔 GENERIC IMMEDIATE NOTIFICATION
export const sendNotification = async (title: string, body: string) => {
    const id = Math.floor(Date.now() + Math.random() * 10000);
    await sendAlert(id, title, body);
};
