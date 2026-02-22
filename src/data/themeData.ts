
import { Theme } from '../types/types';

export const DEFAULT_THEMES: Theme[] = [
    {
        id: 'standard',
        name: 'Shadow Protocol',
        colors: {
            '--color-life-black': '#0a0a0a',
            '--color-life-paper': '#121212',
            '--color-life-gold': '#fbbf24',
            '--color-life-text': '#e5e5e5'
        }
    },
    {
        id: 'grey',
        name: 'Zenith Grey',
        colors: {
            '--color-life-black': '#18181b', // Zinc 950
            '--color-life-paper': '#27272a', // Zinc 800
            '--color-life-gold': '#a1a1aa',  // Zinc 400
            '--color-life-text': '#f4f4f5'   // Zinc 100
        }
    },
    {
        id: 'gold',
        name: 'Midas Touch',
        colors: {
            '--color-life-black': '#1a1200',
            '--color-life-paper': '#261a00',
            '--color-life-gold': '#ffd700',
            '--color-life-text': '#fffae6'
        },
        customCss: `
            /* Royal Fonts & Shapes */
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap');
            
            body { 
                font-family: 'Cinzel', serif !important; 
            }
            .rounded-xl, .rounded-lg, .rounded-2xl {
                border-radius: 2px !important;
                border: 1px double #ffd700 !important;
            }
            .bg-life-gold {
                background: linear-gradient(135deg, #ffd700 0%, #b8860b 100%) !important;
                box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
            }
        `
    },
    {
        id: 'light',
        name: 'Light Protocol',
        colors: {
            '--color-life-black': '#f3f4f6', 
            '--color-life-paper': '#ffffff', 
            '--color-life-gold': '#d97706',  
            '--color-life-text': '#111827'   
        }
    },
    {
        id: 'cyberpunk',
        name: 'Neon City',
        colors: {
            '--color-life-black': '#020617', 
            '--color-life-paper': '#0f172a', 
            '--color-life-gold': '#22d3ee',  
            '--color-life-text': '#e0f2fe'   
        },
        customCss: `
            /* Cyberpunk Aesthetics */
            @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
            
            body { 
                font-family: 'Share Tech Mono', monospace !important; 
                letter-spacing: 0.5px;
            }
            
            /* Hard Corners */
            .rounded-xl, .rounded-lg, .rounded-2xl, .rounded-full, .rounded-md, button {
                border-radius: 0px !important;
                clip-path: polygon(
                    0 0, 
                    100% 0, 
                    100% calc(100% - 10px), 
                    calc(100% - 10px) 100%, 
                    0 100%
                );
            }
            
            /* Neon Borders */
            .border {
                border-color: rgba(34, 211, 238, 0.4) !important;
            }
            
            /* Icons Glow */
            svg {
                filter: drop-shadow(0 0 2px currentColor);
            }
            
            .bg-life-gold {
                box-shadow: 0 0 15px #22d3ee, inset 0 0 10px rgba(0,0,0,0.5);
            }
        `
    },
    {
        id: 'gamify',
        name: 'Super Duo',
        colors: {
            '--color-life-black': '#ffffff',   
            '--color-life-paper': '#f3f4f6',   
            '--color-life-gold': '#58cc02',    
            '--color-life-text': '#3c3c3c'     
        },
        customCss: `
            /* Bubbly UI */
            @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
            
            body { font-family: 'Nunito', sans-serif !important; }
            
            .rounded-xl, .rounded-lg {
                border-radius: 20px !important;
            }
            
            /* 3D Buttons */
            button, .bg-life-paper {
                border-bottom-width: 4px !important;
                border-color: rgba(0,0,0,0.1) !important;
                transition: transform 0.1s;
            }
            
            button:active {
                transform: translateY(4px);
                border-bottom-width: 0px !important;
            }
            
            .bg-life-gold {
                border-color: #46a302 !important; /* Darker Green Border */
            }
        `
    },
    {
        id: 'gamify_purple',
        name: 'Super Duo Dark',
        colors: {
            '--color-life-black': '#13111C',   
            '--color-life-paper': '#1F1C2E',   
            '--color-life-gold': '#9333ea',    
            '--color-life-text': '#E9D5FF'     
        },
        customCss: `
            /* Bubbly Dark UI */
            @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
            
            body { font-family: 'Nunito', sans-serif !important; }
            
            .rounded-xl, .rounded-lg {
                border-radius: 20px !important;
            }
            
            button, .bg-life-paper {
                border-bottom-width: 4px !important;
                border-color: rgba(0,0,0,0.4) !important;
                transition: transform 0.1s;
            }
            
            button:active {
                transform: translateY(4px);
                border-bottom-width: 0px !important;
            }
        `
    }
];
