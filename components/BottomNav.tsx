import React from 'react';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-700 pb-safe">
      <div className="max-w-md mx-auto flex h-16 grid grid-cols-3 items-center">
        <button
            onClick={() => onNavigate('monitor')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${currentView === 'monitor' ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <span className={`material-symbols-outlined text-[26px] ${currentView === 'monitor' ? 'icon-filled' : ''}`}>analytics</span>
          <span className="text-[11px] font-bold">监控</span>
        </button>

        <button
             onClick={() => onNavigate('holdings')}
             className={`flex flex-col items-center justify-center gap-1 transition-colors ${currentView === 'holdings' ? 'text-primary-dark' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <span className={`material-symbols-outlined text-[26px] ${currentView === 'holdings' ? 'icon-filled' : ''}`}>pie_chart</span>
          <span className="text-[11px] font-medium">持仓</span>
        </button>

        <button
             onClick={() => onNavigate('settings')}
             className={`flex flex-col items-center justify-center gap-1 transition-colors ${currentView === 'settings' ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <span className={`material-symbols-outlined text-[26px] ${currentView === 'settings' ? 'icon-filled' : ''}`}>settings</span>
          <span className="text-[11px] font-medium">设置</span>
        </button>
      </div>
      {/* Spacer for bottom safe area visual consistency */}
      <div className="h-[0px] w-full bg-white dark:bg-slate-900"></div>
    </nav>
  );
};

export default BottomNav;
