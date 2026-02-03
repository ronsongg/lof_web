import React, { useState } from 'react';
import MonitorView from './components/MonitorView';
import HoldingsView from './components/HoldingsView';
import SettingsView from './components/SettingsView';
import BottomNav from './components/BottomNav';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('monitor');

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark relative font-sans transition-colors duration-300">

      {/* Main Content Area */}
      <div className="w-full">
        {currentView === 'monitor' && <MonitorView />}
        {currentView === 'holdings' && <HoldingsView />}
        {currentView === 'settings' && <SettingsView />}
      </div>

      {/* Navigation */}
      <BottomNav currentView={currentView} onNavigate={setCurrentView} />
    </div>
  );
};

export default App;
