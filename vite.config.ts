
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Expose API_KEY to the client-side code as process.env.API_KEY
      // We check for both API_KEY and GEMINI_API_KEY to be safe
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.GEMINI_API_KEY || '')
    },
    server: {
      host: true, // 🟢 This allows you to open the app on your phone's browser via IP
      port: 3000,
    }
  }
})
