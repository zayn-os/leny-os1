import React, { useState } from 'react';
import { auth } from '../../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Zap, Shield, Globe, Terminal } from 'lucide-react';

interface LoginScreenProps {
    onGuestLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onGuestLogin }) => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError(null);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            // Auth state change will be handled in App.tsx
        } catch (err: any) {
            console.error("Login Error:", err);
            if (err.code === 'auth/unauthorized-domain') {
                setError(`Domain not authorized: ${window.location.hostname}. Please add this domain to Firebase Console > Authentication > Settings.`);
            } else {
                setError(err.message || "Access Denied. Neural Link Failed.");
            }
            setIsLoading(false);
        }
    };

    const copyDomain = () => {
        navigator.clipboard.writeText(window.location.hostname);
        alert('Domain copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-life-black text-life-text flex flex-col items-center justify-center p-6 relative overflow-hidden font-mono selection:bg-life-gold selection:text-life-black">
            
            {/* 🟢 BACKGROUND EFFECTS */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-life-gold/50 to-transparent opacity-50" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-life-gold/50 to-transparent opacity-50" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] bg-[length:100%_2px,3px_100%] pointer-events-none" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-life-gold/5 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-life-crimson/5 rounded-full blur-[80px] animate-pulse delay-1000" />
            </div>

            {/* 🟢 MAIN CARD */}
            <div className="relative z-10 w-full max-w-md bg-life-paper/80 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-500 group">
                
                {/* Decorative Corners */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-life-gold rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-life-gold rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-life-gold rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-life-gold rounded-br-lg" />

                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-life-black border-2 border-life-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(251,191,36,0.3)] group-hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all duration-500">
                        <Zap size={40} className="text-life-gold animate-pulse" />
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2 glitch-text" data-text="LAYN OS">
                        LAYN OS
                    </h1>
                    <p className="text-xs text-life-gold font-bold uppercase tracking-[0.3em] opacity-80">
                        Neural Interface v2.0
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-xs text-life-muted font-mono border-b border-zinc-800 pb-2">
                            <Terminal size={14} className="text-life-gold" />
                            <span>System Status: <span className="text-life-easy">ONLINE</span></span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-life-muted font-mono border-b border-zinc-800 pb-2">
                            <Shield size={14} className="text-life-gold" />
                            <span>Security Protocol: <span className="text-life-easy">ACTIVE</span></span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-life-muted font-mono border-b border-zinc-800 pb-2">
                            <Globe size={14} className="text-life-gold" />
                            <span>Network Uplink: <span className="text-life-easy">READY</span></span>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-life-hard/10 border border-life-hard/30 text-life-hard text-xs p-3 rounded-lg text-center font-bold animate-shake flex flex-col gap-2">
                            <span>⚠️ {error}</span>
                            {error.includes('Domain not authorized') && (
                                <button 
                                    onClick={copyDomain}
                                    className="text-[10px] underline text-life-gold hover:text-white"
                                >
                                    Copy Domain
                                </button>
                            )}
                            <button 
                                onClick={onGuestLogin}
                                className="mt-2 py-2 px-4 bg-life-muted/20 hover:bg-life-muted/30 text-life-muted hover:text-white rounded border border-life-muted/30 text-[10px] uppercase tracking-wider transition-colors"
                            >
                                Continue as Guest (Dev Mode)
                            </button>
                        </div>
                    )}

                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full py-4 bg-life-gold hover:bg-yellow-400 text-life-black font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group/btn"
                    >
                        {isLoading ? (
                            <span className="animate-pulse">Initializing...</span>
                        ) : (
                            <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Sign in with Google
                            </>
                        )}
                    </button>
                    
                    <p className="text-[10px] text-life-muted text-center uppercase tracking-wider opacity-60">
                        By connecting, you accept the Neural Link Protocol.
                    </p>
                </div>
            </div>
            
            {/* Footer */}
            <div className="absolute bottom-6 text-[10px] text-life-muted font-mono opacity-40">
                SYSTEM_ID: {Math.random().toString(36).substring(7).toUpperCase()} // SECURE_CONNECTION
            </div>
        </div>
    );
};

export default LoginScreen;
