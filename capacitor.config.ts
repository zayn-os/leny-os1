
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lifeos.app',
  appName: 'LifeOS',
  webDir: 'dist',
  server: {    url: 'https://zayn-os.netlify.app',
    cleartext: true
   },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample", // Uses default system icon if not found
      iconColor: "#fbbf24",
      sound: "beep.wav",
    },
  },
};

export default config;
