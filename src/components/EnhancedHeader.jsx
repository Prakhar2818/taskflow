// components/EnhancedHeader.jsx - UPDATED WITH BACKGROUND STYLING REMOVED
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useAuth } from "../context/authContext";
import { useTheme } from "../context/themeContext"; // Import shared theme context

// Separate Clock Component to prevent re-renders
const LiveClock = React.memo(({ theme }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <>
      <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
    </>
  );
});

// Command Palette Modal Component
const CommandPaletteModal = ({ isOpen, onClose, theme, onCommand }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isVisible) return null;

  const commands = [
    { command: 'new-task', label: 'Create New Task', icon: '✅', shortcut: 'Ctrl+N' },
    { command: 'new-session', label: 'Start New Session', icon: '🎯', shortcut: 'Ctrl+S' },
    { command: 'view-tasks', label: 'View Tasks', icon: '📋', shortcut: '' },
    { command: 'view-sessions', label: 'View Sessions', icon: '📊', shortcut: '' },
    { command: 'analytics', label: 'Analytics', icon: '📈', shortcut: '' },
    { command: 'settings', label: 'Settings', icon: '⚙️', shortcut: '' }
  ];

  const filteredCommands = commands.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return createPortal(
    <>
      {/* Backdrop - No blur */}
      <div 
        className="fixed inset-0 bg-black/30 z-[99998] transition-opacity duration-150"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-96 z-[99999] transition-all duration-150">
        <div className={`rounded-2xl shadow-2xl border backdrop-blur-xl ${
          theme === 'dark' 
            ? 'bg-gray-800/95 border-gray-700/50' 
            : 'bg-white/95 border-white/30'
        }`}>
          {/* Header */}
          <div className={`px-4 py-3 border-b ${
            theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Quick Commands
              </h3>
              <button
                onClick={onClose}
                className={`p-1 rounded-lg transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <input
              type="text"
              placeholder="Type a command..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                theme === 'dark'
                  ? 'bg-gray-700/50 border-gray-600 focus:border-indigo-400 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50'
                  : 'bg-white/50 border-gray-200 focus:border-indigo-500 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50'
              }`}
              autoFocus
            />
            
            <div className="mt-4 space-y-1 max-h-60 overflow-y-auto">
              {filteredCommands.map((item) => (
                <button
                  key={item.command}
                  onClick={() => {
                    onCommand(item.command);
                    setSearchQuery('');
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-all duration-200 group ${
                    theme === 'dark' ? 'hover:bg-gray-700/50 text-gray-200 hover:text-white' : 'hover:bg-indigo-50 text-gray-700 hover:text-indigo-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.shortcut && (
                    <span className={`text-xs px-2 py-1 rounded font-mono transition-colors duration-200 ${
                      theme === 'dark' ? 'text-gray-400 bg-gray-700 group-hover:bg-gray-600' : 'text-gray-400 bg-gray-100 group-hover:bg-gray-200'
                    }`}>
                      {item.shortcut}
                    </span>
                  )}
                </button>
              ))}
              
              {searchQuery && filteredCommands.length === 0 && (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p className="text-sm">No commands found</p>
                  <p className="text-xs mt-1">Try searching for a different command</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className={`px-4 py-2 border-t text-xs text-center ${
            theme === 'dark' ? 'border-gray-700/50 text-gray-400' : 'border-gray-200/50 text-gray-500'
          }`}>
            Press <kbd className={`px-1 py-0.5 rounded text-xs font-mono ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}>Esc</kbd> to close
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

// Enhanced Header Component (Updated for Navigation) - BACKGROUND STYLING REMOVED
const EnhancedHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme(); // Use shared theme context
  
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState([
    { id: 1, text: `Welcome back, ${user?.name || 'User'}!`, type: "success", time: "Just now" },
    { id: 2, text: "TaskFlow is ready to boost your productivity", type: "info", time: "1 min ago" }
  ]);
  const [weatherData, setWeatherData] = useState({ temp: 22, condition: "sunny" });

  // Mock stats (replace with real data later)
  const advancedStats = {
    totalTasks: 0,
    completedTasks: 0,
    activeSessions: 0,
    efficiency: 0,
    focusTime: 0
  };

  const completionRate = 0;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(!isCommandOpen);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCommandOpen]);

  // Command Palette functionality
  const handleCommand = (command) => {
    switch (command) {
      case 'new-task':
        navigate('/create-task');
        break;
      case 'new-session':
        navigate('/create-session');
        break;
      case 'view-tasks':
        navigate('/tasks');
        break;
      case 'view-sessions':
        navigate('/sessions');
        break;
      case 'analytics':
        navigate('/analytics');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        break;
    }
    setIsCommandOpen(false);
  };

  // Clear notification
  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Tab navigation with routing
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    switch (tabId) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'analytics':
        navigate('/analytics');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        break;
    }
  };

  // Tab navigation
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className={`relative ${theme === 'dark' ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-2xl border-b ${theme === 'dark' ? 'border-gray-800/50' : 'border-white/30'} shadow-2xl sticky top-0 z-30`}>
      <div className="relative max-w-7xl mx-auto px-6 py-4">
        {/* Top Navigation with Advanced Features */}
        <div className="flex items-center justify-between mb-6">
          {/* Enhanced Logo Section */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              {/* 3D Interactive Logo */}
              <div
                className="relative group perspective-1000 cursor-pointer"
                onClick={() => navigate('/dashboard')}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-y-12 transform-gpu">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="text-3xl relative z-10 filter drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500">📋</span>
                  <div className="absolute top-2 left-2 w-1 h-1 bg-white/60 rounded-full animate-ping" />
                  <div className="absolute bottom-3 right-3 w-0.5 h-0.5 bg-white/40 rounded-full animate-pulse delay-200" />
                </div>

                <div className="absolute -bottom-1 -right-1 flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full border-2 border-white shadow-lg flex items-center justify-center bg-blue-500">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Brand Info with Live Stats */}
              <div>
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} tracking-tight`}>
                  TaskFlow
                  <span className="ml-2 px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full">
                    LIVE
                  </span>
                </h2>
                <div className="flex items-center gap-3 text-sm">
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Welcome back, {user?.name || 'User'}!
                  </span>
                  <div className="flex items-center gap-1">
                    <div className={`w-1 h-1 rounded-full ${completionRate > 50 ? 'bg-green-500' : 'bg-orange-500'} animate-pulse`} />
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {completionRate}% Complete
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? theme === 'dark'
                        ? 'text-white bg-white/10 border border-white/20'
                        : 'text-indigo-600 bg-indigo-50 border border-indigo-200'
                      : theme === 'dark'
                        ? 'text-gray-400 hover:text-white hover:bg-white/5'
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Advanced Control Panel */}
          <div className="flex items-center gap-3">
            {/* Weather Widget */}
            <div className={`hidden lg:flex items-center gap-2 px-3 py-2 ${theme === 'dark' ? 'bg-white/5' : 'bg-white/60'} backdrop-blur-sm rounded-xl border ${theme === 'dark' ? 'border-white/10' : 'border-white/30'}`}>
              <span className="text-lg">☀️</span>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                {weatherData.temp}°C
              </span>
            </div>

            {/* Live Clock */}
            <div className={`hidden md:flex flex-col items-end px-3 py-2 ${theme === 'dark' ? 'bg-white/5' : 'bg-white/60'} backdrop-blur-sm rounded-xl border ${theme === 'dark' ? 'border-white/10' : 'border-white/30'}`}>
              <LiveClock theme={theme} />
            </div>

            {/* Command Palette */}
            <button
              onClick={() => setIsCommandOpen(!isCommandOpen)}
              className={`relative p-3 ${theme === 'dark' ? 'text-gray-300 hover:text-white bg-white/5 hover:bg-white/10' : 'text-gray-600 hover:text-indigo-600 bg-white/50 hover:bg-indigo-50'} backdrop-blur-sm rounded-xl border ${theme === 'dark' ? 'border-white/10 hover:border-white/20' : 'border-white/30 hover:border-indigo-200'} transition-all duration-200 shadow-lg hover:shadow-xl`}
              title="Command Palette (Ctrl+K)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="absolute -top-1 -right-1 px-1 text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full">⌘K</span>
            </button>

            {/* Theme Toggle - Now uses shared context */}
            <button
              onClick={toggleTheme} // Use shared theme toggle
              className={`relative p-3 ${theme === 'dark' ? 'text-gray-300 hover:text-white bg-white/5 hover:bg-white/10' : 'text-gray-600 hover:text-indigo-600 bg-white/50 hover:bg-indigo-50'} backdrop-blur-sm rounded-xl border ${theme === 'dark' ? 'border-white/10 hover:border-white/20' : 'border-white/30 hover:border-indigo-200'} transition-all duration-200 shadow-lg hover:shadow-xl group`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <div className="relative w-5 h-5">
                <svg
                  className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <svg
                  className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
            </button>

            {/* User Avatar with Profile */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationOpen(false);
                }}
                className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-105"
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </button>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
            </div>
          </div>
        </div>

        {/* Enhanced Stats Dashboard */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Tasks', value: advancedStats.totalTasks, icon: '📋', color: 'blue', action: () => navigate('/tasks') },
            { label: 'Done', value: advancedStats.completedTasks, icon: '✅', color: 'green', action: () => navigate('/tasks?filter=completed') },
            { label: 'Sessions', value: advancedStats.activeSessions, icon: '🎯', color: 'purple', action: () => navigate('/sessions') },
            { label: 'Efficiency', value: `${advancedStats.efficiency}%`, icon: '⚡', color: 'orange', action: () => navigate('/analytics') },
            { label: 'Focus Time', value: `${advancedStats.focusTime}m`, icon: '⏱️', color: 'pink', action: () => navigate('/analytics') }
          ].map((stat, index) => (
            <div
              key={stat.label}
              onClick={stat.action}
              className={`relative overflow-hidden p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-white/60'} backdrop-blur-sm rounded-2xl border ${theme === 'dark' ? 'border-white/10' : 'border-white/40'} shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{stat.icon}</span>
                  <div className={`w-3 h-3 rounded-full bg-${stat.color}-500 animate-pulse`} />
                </div>
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {stat.value}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {stat.label}
                </div>
              </div>

              <div className={`absolute inset-0 bg-gradient-to-r from-${stat.color}-500/10 to-${stat.color}-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            </div>
          ))}
        </div>
      </div>

      {/* Command Palette Modal */}
      {isCommandOpen && (
        <CommandPaletteModal
          isOpen={isCommandOpen}
          onClose={() => setIsCommandOpen(false)}
          theme={theme}
          onCommand={handleCommand}
        />
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .rotate-y-12 { transform: rotateY(12deg); }
        .transform-gpu { transform-style: preserve-3d; }
      `}</style>
    </div>
  );
};

export default EnhancedHeader;
