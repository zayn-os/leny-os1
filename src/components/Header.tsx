
import React, { useState, useEffect } from 'react';
import { User, Shield, Flame, Award, Settings } from 'lucide-react';

// --- تصحيح المسارات (الرجوع خطوة واحدة ../ والدخول للمجلدات الصحيحة) ---
import { useLifeOS } from '../contexts/LifeOSContext';
import { useSkills } from '../contexts/SkillContext';
import { playSound } from '../utils/audio';

const Header: React.FC = () => {
  const { state, dispatch } = useLifeOS();
  const { user } = state;
  const { skillState } = useSkills(); 

  // 🧠 CALCULATE DYNAMIC TITLE
  const skills = skillState?.skills || [];
  
  let displayTitle = user.title; // Default to user's main title

  const linkedSkill = (user.preferences.useSkillAsTitle && user.preferences.linkedSkillId)
    ? skills.find(s => s.id === user.preferences.linkedSkillId)
    : null;

  if (linkedSkill) {
      displayTitle = `${linkedSkill.rank} ${linkedSkill.title}`;
  } else {
      displayTitle = user.title; // Fallback to user title
  }

  const xpPercentage = Math.min(100, (user.currentXP / user.targetXP) * 100);

  // 🔥 DAILY SURVIVAL RING CALCULATIONS
  const dailyProgress = Math.min(100, (user.dailyXP / user.dailyTarget) * 100);
  const isSafe = dailyProgress >= 100;
  const radius = 18;
  const stroke = 3;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (dailyProgress / 100) * circumference;

  // 🔒 GOD MODE UNLOCK LOGIC (Kept as legacy easter egg)
  const [tapCount, setTapCount] = useState(0);

  useEffect(() => {
      if (tapCount > 0) {
          const timer = setTimeout(() => setTapCount(0), 1000);
          return () => clearTimeout(timer);
      }
  }, [tapCount]);

  const handleIdentityClick = () => {
      setTapCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 5) {
              playSound('level-up', true);
              dispatch.setModal('devConsole');
              return 0;
          }
          return newCount;
      });

      // Standard Navigation (Single Tap)
      if (state.ui.currentView !== 'profile') {
          dispatch.setView('profile');
      }
  };

  const openHonorBreakdown = () => {
      playSound('click', true);
      dispatch.setModal('honorBreakdown');
  };

  return (
    <header className="h-16 px-4 border-b border-zinc-800 flex items-center justify-between bg-life-black/60 backdrop-blur-xl z-20 shadow-lg transition-all duration-300 select-none sticky top-0">
      
      {/* 🟢 LEFT SECTION: IDENTITY (Clickable) */}
      <div 
        onClick={handleIdentityClick}
        className="flex items-center gap-3 cursor-pointer active:opacity-80 transition-opacity"
      >
        {/* Avatar & Level */}
        <div className="w-10 h-10 rounded-full bg-life-muted/20 border border-life-silver flex items-center justify-center relative overflow-hidden ring-1 ring-life-muted/50 group">
           {linkedSkill && linkedSkill.icon ? (
             <span className="text-xl">{linkedSkill.icon}</span>
           ) : (
             <User size={20} className="text-life-silver group-hover:scale-110 transition-transform" />
           )}
          
          {/* Level Badge */}
          <div className="absolute bottom-0 right-0 bg-life-gold text-life-black text-[9px] font-black px-1.5 py-0.5 rounded-tl-md shadow-sm z-10">
            L{user.level}
          </div>
          
          {/* Visual Feedback for Taps */}
          {tapCount > 0 && (
             <div className="absolute inset-0 bg-life-crimson/20 animate-pulse" />
          )}
        </div>

        {/* Name & XP */}
        <div className="flex flex-col justify-center">
          <h1 className="text-sm font-bold leading-none tracking-wide text-life-text/90 mb-1.5 truncate max-w-[150px] sm:max-w-none">
            {displayTitle.toUpperCase()} 
          </h1>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-life-gold/80">{user.currentXP}/{user.targetXP} XP</span>
            
            {/* Level XP Bar */}
            <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-700/50">
              <div 
                className="h-full bg-gradient-to-r from-life-gold to-yellow-200 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(251,191,36,0.5)]" 
                style={{ width: `${xpPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 🟢 RIGHT SECTION: SETTINGS, ECONOMY & SURVIVAL */}
      <div className="flex items-center gap-3">
          
          {/* ⚙️ SETTINGS BUTTON (Replaces 5-tap requirement) */}
          <button 
            onClick={() => dispatch.setModal('devConsole')}
            className="p-2 rounded-full text-life-muted hover:text-life-gold hover:bg-life-gold/10 transition-all active:scale-95"
            title="System Settings"
          >
            <Settings size={20} />
          </button>



          {/* 💰 Resources Container */}
          <div className="hidden sm:flex flex-col items-end gap-0.5 mr-1">
            <div className="flex items-center text-life-gold font-mono text-xs">
                <span className="mr-1.5 text-xs">💰</span> {user.gold}
            </div>
            {/* 🛡️ CLICKABLE HONOR */}
            <div 
                onClick={openHonorBreakdown}
                className="flex items-center text-indigo-400 font-mono text-xs cursor-pointer hover:text-indigo-300 hover:scale-105 transition-all"
            >
                <Award size={10} className="mr-1 fill-current opacity-80" /> {user.honor}%
            </div>
          </div>

          {/* 🛡️ Mobile Resource (Compact) */}
          <div className="sm:hidden flex items-center gap-2 mr-1">
             <div className="flex flex-col items-center justify-center w-8 h-8 rounded bg-life-gold/10 border border-life-gold/20">
                <span className="text-[8px]">💰</span>
                <span className="text-[9px] font-bold text-life-gold">{user.gold}</span>
             </div>
             {/* 🛡️ CLICKABLE HONOR MOBILE */}
             <div 
                onClick={openHonorBreakdown}
                className="flex flex-col items-center justify-center w-8 h-8 rounded bg-indigo-500/10 border border-indigo-500/20 cursor-pointer active:scale-95 transition-transform"
             >
                <Award size={8} className="text-indigo-400 mb-0.5" />
                <span className="text-[9px] font-bold text-indigo-400">{user.honor}%</span>
             </div>
          </div>

          {/* 🔥 STREAK WIDGET (With Survival Ring) - CLICKABLE */}
          <div 
            onClick={() => dispatch.setModal('streak')} // 👈 Opens Modal
            className="relative w-12 h-12 flex items-center justify-center group cursor-pointer hover:scale-105 transition-transform"
          >
             
             {/* Progress Ring */}
             <svg
                height={radius * 2}
                width={radius * 2}
                className="transform -rotate-90 absolute z-0"
             >
                <circle
                    stroke="#333"
                    strokeWidth={stroke}
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    opacity={0.3}
                />
                <circle
                    stroke={isSafe ? '#10b981' : '#fbbf24'} // Green if safe, Gold if pending
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                    strokeLinecap="round"
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className={isSafe ? 'drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]' : ''}
                />
             </svg>

             {/* Center Flame */}
             <div className={`
                w-8 h-8 rounded-full flex flex-col items-center justify-center z-10 transition-colors
                ${isSafe ? 'bg-life-easy/10' : 'bg-life-black'}
             `}>
                <Flame size={12} className={`
                    absolute -top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity 
                    ${isSafe ? 'text-life-easy fill-life-easy/50' : 'text-life-crimson fill-life-crimson/50'}
                `} />
                <span className="text-[6px] text-life-muted uppercase leading-none mt-0.5 tracking-tighter">Day</span>
                <span className={`text-sm font-black leading-none ${isSafe ? 'text-life-easy' : 'text-life-crimson'}`}>
                    {user.streak}
                </span>
             </div>
          </div>
      </div>
    </header>
  );
};

export default Header;
