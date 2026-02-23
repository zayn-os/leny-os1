
import React, { useState, useEffect } from 'react';
import { User, ShoppingBag, CheckSquare, Zap, Calendar, BookOpen, Plus, LayoutList, Target, Scale, Brain, LogIn } from 'lucide-react';
import { useLifeOS } from '../contexts/LifeOSContext';
import { ViewState } from '../types/types';
import { auth } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

const Navigation: React.FC = () => {
  const { state, dispatch } = useLifeOS();
  const { currentView, habitsViewMode, tasksViewMode } = state.ui; 
  const { user } = state;
  const showCampaign = user.preferences.showCampaignUI;

  // 🟢 AUTH STATE
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    return () => unsubscribe();
  }, []);

  // 🧠 MEMORY STATE
  // Left Button: Profile -> Skills -> Shop
  const [leftBtnMode, setLeftBtnMode] = useState<'profile' | 'skills' | 'shop'>('profile');
  
  // Right Button: Raids -> Campaign
  const [rightBtnMode, setRightBtnMode] = useState<'raids' | 'campaign'>('raids');

  const handleLeftClick = () => {
    if (currentView === leftBtnMode) {
      // Cycle: Profile -> Skills -> Shop -> Profile
      let newMode: 'profile' | 'skills' | 'shop' = 'profile';
      if (leftBtnMode === 'profile') newMode = 'skills';
      else if (leftBtnMode === 'skills') newMode = 'shop';
      else newMode = 'profile';
      
      setLeftBtnMode(newMode);
      dispatch.setView(newMode);
    } else {
      // Restore Memory
      dispatch.setView(leftBtnMode);
    }
  };

  const handleRightClick = () => {
    // 🛑 If Campaign Module is DISABLED, stay on Raids
    if (!showCampaign) {
        if (currentView !== 'raids') {
             dispatch.setView('raids');
        }
        return;
    }

    // 🟢 If Enabled: Cycle Raids -> Campaign -> Raids
    if (currentView === rightBtnMode) {
      let newMode: 'raids' | 'campaign' = 'raids';
      if (rightBtnMode === 'raids') newMode = 'campaign';
      else newMode = 'raids';

      setRightBtnMode(newMode);
      dispatch.setView(newMode);
    } else {
      // Restore Memory
      dispatch.setView(rightBtnMode);
    }
  };

  // 🤖 MISSIONS BUTTON LOGIC (Toggle between Missions and Laws)
  const handleMissionsClick = () => {
      if (currentView === 'tasks') {
          const newMode = tasksViewMode === 'missions' ? 'codex' : 'missions';
          dispatch.setTasksViewMode(newMode);
      } else {
          dispatch.setView('tasks');
      }
  };

  // 🟢 SMART ADD BUTTON LOGIC
  const handleAddClick = () => {
      let defaultType = 'mission'; // Default to Tasks

      if (currentView === 'habits') {
          defaultType = 'protocol';
      } else if (currentView === 'raids' || currentView === 'campaign') {
          defaultType = 'operation';
      }

      dispatch.setModal('addTask', { defaultType });
  };

  // 🎯 HABITS TOGGLE LOGIC (List <-> Calendar)
  const handleHabitsClick = () => {
      if (currentView === 'habits') {
          // Toggle View Mode
          const newMode = habitsViewMode === 'list' ? 'calendar' : 'list';
          dispatch.setHabitsViewMode(newMode);
      } else {
          // Just go to Habits view (keeps last mode from context)
          dispatch.setView('habits');
      }
  };

  const handleLoginClick = () => {
      dispatch.setModal('login'); // We need to add 'login' to ModalType
  };

  const isActive = (view: ViewState) => currentView === view;
  const isLeftActive = isActive('profile') || isActive('shop') || isActive('skills');
  const isRightActive = isActive('raids') || isActive('campaign');
  const isMissionsActive = isActive('tasks'); 
  const isHabitsActive = isActive('habits');

  // Ensure visual state matches preference force (if preference was just turned off)
  const currentRightIcon = (!showCampaign && rightBtnMode === 'campaign') ? 'raids' : rightBtnMode;

  return (
    <nav className="h-24 pb-6 pt-2 bg-life-black/80 backdrop-blur-xl border-t border-zinc-800 flex items-center justify-around px-4 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] relative">
      
      {/* 🟢 BUTTON 1: THE CHARACTER (Profile / Skills / Shop) */}
      <button 
        onClick={handleLeftClick}
        className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-300 relative group ${
          isLeftActive ? 'text-life-gold bg-life-gold/10 scale-105' : 'text-life-muted hover:text-life-silver'
        }`}
      >
        <div className="relative">
            <div className={`transition-all duration-300 transform ${leftBtnMode === 'profile' ? 'scale-100 opacity-100' : 'scale-0 opacity-0 absolute top-0'}`}>
                <User size={24} />
            </div>
            <div className={`transition-all duration-300 transform ${leftBtnMode === 'skills' ? 'scale-100 opacity-100' : 'scale-0 opacity-0 absolute top-0'}`}>
                <BookOpen size={24} />
            </div>
            <div className={`transition-all duration-300 transform ${leftBtnMode === 'shop' ? 'scale-100 opacity-100' : 'scale-0 opacity-0 absolute top-0'}`}>
                <ShoppingBag size={24} />
            </div>
        </div>
        <span className="text-[10px] mt-1 font-bold uppercase tracking-wider">
          {leftBtnMode}
        </span>
        {isLeftActive && <div className="absolute -bottom-1 w-1 h-1 bg-life-gold rounded-full" />}
      </button>

      {/* 🟢 BUTTON 2: MISSIONS (Tasks / Laws) */}
      <button 
        onClick={handleMissionsClick}
        className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-300 relative ${
          isMissionsActive ? (tasksViewMode === 'codex' ? 'text-red-500 bg-red-950/20 scale-105' : 'text-life-easy bg-life-easy/10 scale-105') : 'text-life-muted hover:text-life-silver'
        }`}
      >
        <div className="relative">
             {/* Missions Icon */}
             <div className={`transition-all duration-300 transform ${tasksViewMode === 'missions' ? 'scale-100 opacity-100' : 'scale-0 opacity-0 absolute top-0'}`}>
                <CheckSquare size={24} />
             </div>
             {/* Laws Icon */}
             <div className={`transition-all duration-300 transform ${tasksViewMode === 'codex' ? 'scale-100 opacity-100' : 'scale-0 opacity-0 absolute top-0'}`}>
                <Scale size={24} />
             </div>
        </div>
        <span className="text-[10px] mt-1 font-bold uppercase tracking-wider">
            {tasksViewMode === 'codex' ? 'Codex' : 'Missions'}
        </span>
        {isMissionsActive && <div className={`absolute -bottom-1 w-1 h-1 rounded-full ${tasksViewMode === 'codex' ? 'bg-red-500' : 'bg-life-easy'}`} />}
      </button>

      {/* 🔴 ACTION BUTTON (The Injector) */}
      <div className="relative -mt-12 group z-20">
        {/* Reflection/Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-life-crimson/40 blur-[30px] rounded-full pointer-events-none group-hover:bg-life-crimson/60 transition-colors duration-500 animate-pulse-slow" />
        
        <button 
            onClick={handleAddClick}
            className="relative w-16 h-16 bg-gradient-to-br from-life-crimson to-red-700 rounded-full shadow-[0_8px_30px_rgba(220,38,38,0.4)] flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-life-black ring-2 ring-life-crimson/20"
        >
            <Plus size={32} strokeWidth={3} className="group-active:rotate-90 transition-transform duration-300 drop-shadow-md" />
        </button>
      </div>

      {/* 🟢 BUTTON 3: HABITS (List / Calendar) */}
      <button 
        onClick={handleHabitsClick}
        className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-300 relative ${
          isHabitsActive ? 'text-life-normal bg-life-normal/10 scale-105' : 'text-life-muted hover:text-life-silver'
        }`}
      >
        <div className="relative">
            {/* List Icon (Target) */}
            <div className={`transition-all duration-300 transform ${habitsViewMode === 'list' ? 'scale-100 opacity-100' : 'scale-0 opacity-0 absolute top-0'}`}>
                <Target size={24} />
            </div>
            {/* Calendar Icon */}
            <div className={`transition-all duration-300 transform ${habitsViewMode === 'calendar' ? 'scale-100 opacity-100' : 'scale-0 opacity-0 absolute top-0'}`}>
                <Calendar size={24} />
            </div>
        </div>
        <span className="text-[10px] mt-1 font-bold uppercase tracking-wider">
            {habitsViewMode === 'calendar' ? 'Planner' : 'Habits'}
        </span>
        {isHabitsActive && <div className="absolute -bottom-1 w-1 h-1 bg-life-normal rounded-full" />}
      </button>

      {/* 🟢 BUTTON 4: THE SHIFTER (Raids / Campaign / Oracle) */}
      <button 
        onClick={handleRightClick}
        className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-300 relative ${
          isRightActive ? 'text-life-hard bg-life-hard/10 scale-105' : 'text-life-muted hover:text-life-silver'
        }`}
      >
        <div className="relative">
            {/* Raids Icon (Zap) */}
            <div className={`transition-all duration-300 transform ${currentRightIcon === 'raids' ? 'scale-100 opacity-100' : 'scale-0 opacity-0 absolute top-0'}`}>
                <Zap size={24} />
            </div>
            
            {/* Campaign Icon (LayoutList) */}
            {showCampaign && (
                <div className={`transition-all duration-300 transform ${currentRightIcon === 'campaign' ? 'scale-100 opacity-100' : 'scale-0 opacity-0 absolute top-0'}`}>
                    <LayoutList size={24} />
                </div>
            )}
        </div>
        <span className="text-[10px] mt-1 font-bold uppercase tracking-wider">
          {currentRightIcon}
        </span>
        {isRightActive && <div className="absolute -bottom-1 w-1 h-1 bg-life-hard rounded-full" />}
      </button>

      {/* 🔐 LOGIN BUTTON (Only for Guests) */}
      {!currentUser && (
          <button 
            onClick={handleLoginClick}
            className="absolute top-[-40px] right-4 bg-life-black/80 backdrop-blur border border-life-gold/30 text-life-gold p-2 rounded-full shadow-lg animate-bounce"
            title="Secure Link"
          >
              <LogIn size={16} />
          </button>
      )}

    </nav>
  );
};

export default Navigation;
