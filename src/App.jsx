// App.jsx - UPDATED WITH SEPARATE PAGES
import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/authContext";
import { TaskProvider, useTaskContext } from "./context/taskContext";
import Login from "./components/Login";
import Register from "./components/Register";

// Import separate page components
import CreateTaskPage from "./pages/CreateTaskPage";
import CreateSessionPage from "./pages/CreateSessionPage";
import TasksPage from "./pages/TasksPage";
import SessionsPage from "./pages/SessionsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse">
            <span className="text-2xl">📋</span>
          </div>
          <div className="text-xl font-semibold text-gray-700 mb-2">Loading TaskFlow...</div>
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Enhanced Header Component (Updated for Navigation)
const EnhancedHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('taskflow-theme') || 'light';
  });
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const headerRef = useRef(null);

  // Mock stats (replace with real data later)
  const advancedStats = {
    totalTasks: 0,
    completedTasks: 0,
    activeSessions: 0,
    efficiency: 0,
    focusTime: 0
  };

  const completionRate = 0;

  // Time management
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Theme persistence
  useEffect(() => {
    localStorage.setItem('taskflow-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Mouse tracking for interactive elements
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100
        });
      }
    };

    const header = headerRef.current;
    if (header) {
      header.addEventListener('mousemove', handleMouseMove);
      return () => header.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

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
    <div
      ref={headerRef}
      className={`relative ${theme === 'dark' ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-2xl border-b ${theme === 'dark' ? 'border-gray-800/50' : 'border-white/30'} shadow-2xl sticky top-0 z-30 overflow-hidden`}
    >
      {/* Dynamic Gradient Overlay */}
      <div
        className="absolute inset-0 opacity-30 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)`
        }}
      />

      {/* Animated Mesh Background */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="mesh" width="10" height="10" patternUnits="userSpaceOnUse">
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="url(#gradient-mesh)"
                strokeWidth="0.5"
                opacity="0.6"
              />
            </pattern>
            <linearGradient id="gradient-mesh" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme === 'dark' ? '#6366f1' : '#4f46e5'} />
              <stop offset="50%" stopColor={theme === 'dark' ? '#8b5cf6' : '#7c3aed'} />
              <stop offset="100%" stopColor={theme === 'dark' ? '#ec4899' : '#db2777'} />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#mesh)" />
        </svg>
      </div>

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
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${activeTab === tab.id
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
              <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
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

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={`relative p-3 ${theme === 'dark' ? 'text-gray-300 hover:text-white bg-white/5 hover:bg-white/10' : 'text-gray-600 hover:text-indigo-600 bg-white/50 hover:bg-indigo-50'} backdrop-blur-sm rounded-xl border ${theme === 'dark' ? 'border-white/10 hover:border-white/20' : 'border-white/30 hover:border-indigo-200'} transition-all duration-200 shadow-lg hover:shadow-xl group`}
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

        {/* Command Palette Modal */}
        {isCommandOpen && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 z-50 animate-scale-in">
            <div className="p-4">
              <input
                type="text"
                placeholder="Type a command..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-transparent border-b border-gray-200 focus:border-indigo-500 outline-none text-gray-700 placeholder-gray-500"
                autoFocus
              />
              <div className="mt-4 space-y-2">
                {[
                  { command: 'new-task', label: 'Create New Task', icon: '✅', shortcut: 'Ctrl+N' },
                  { command: 'new-session', label: 'Start New Session', icon: '🎯', shortcut: 'Ctrl+S' },
                  { command: 'view-tasks', label: 'View Tasks', icon: '📋', shortcut: '' },
                  { command: 'view-sessions', label: 'View Sessions', icon: '📊', shortcut: '' },
                  { command: 'analytics', label: 'Analytics', icon: '📈', shortcut: '' },
                  { command: 'settings', label: 'Settings', icon: '⚙️', shortcut: '' }
                ].filter(item =>
                  item.label.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((item) => (
                  <button
                    key={item.command}
                    onClick={() => handleCommand(item.command)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <span>{item.icon}</span>
                      <span className="text-gray-700">{item.label}</span>
                    </div>
                    {item.shortcut && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        {item.shortcut}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

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

      {/* Custom Styles */}
      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .rotate-y-12 { transform: rotateY(12deg); }
        .transform-gpu { transform-style: preserve-3d; }
        
        @keyframes scale-in {
          from { opacity: 0; transform: translateX(-50%) scale(0.9); }
          to { opacity: 1; transform: translateX(-50%) scale(1); }
        }
        
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
      `}</style>
    </div>
  );
};

// Main Dashboard Page Component
const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <EnhancedHeader />

      {/* Main Dashboard Content */}
      <div className="relative max-w-6xl mx-auto px-6 py-10">
        <div className="text-center relative">
          {/* Main Title */}
          <div className="relative mb-8">
            <h1 className="text-8xl lg:text-9xl xl:text-[80px] font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 tracking-tight relative leading-none">
              TaskFlow

              <div className="absolute inset-0 text-8xl lg:text-9xl xl:text-[10rem] font-black text-purple-600/5 blur-3xl animate-pulse-slow">
                TaskFlow
              </div>
            </h1>

            <div className="absolute -top-4 -right-8 px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white text-sm font-bold rounded-full shadow-2xl transform rotate-12 hover:rotate-0 transition-all duration-500 cursor-pointer">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                2025 EDITION
              </div>
            </div>
          </div>

          {/* Feature Showcase */}
          <div className="max-w-4xl mx-auto mb-8">
            <p className="text-xl lg:text-2xl font-medium leading-relaxed mb-6 text-gray-600">
              The future of productivity is here. Experience
              <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text font-bold"> intelligent task management</span>
              <br />with advanced analytics and seamless workflow automation.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <button
                onClick={() => navigate('/create-task')}
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-2xl hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-3"
              >
                <span className="text-xl">✅</span>
                Create New Task
              </button>

              <button
                onClick={() => navigate('/create-session')}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-3"
              >
                <span className="text-xl">🎯</span>
                Start New Session
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: '⚡', label: 'Fast', desc: 'Lightning quick' },
                { icon: '📊', label: 'Analytics', desc: 'Deep insights' },
                { icon: '🔄', label: 'Real-time', desc: 'Live updates' },
                { icon: '🔒', label: 'Secure', desc: 'Privacy first' }
              ].map((feature, index) => (
                <div
                  key={feature.label}
                  className="p-4 bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105"
                >
                  <div className="text-3xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <div className="text-sm font-medium text-gray-800">
                    {feature.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {feature.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
        
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-task"
            element={
              <ProtectedRoute>
                <CreateTaskPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-session"
            element={
              <ProtectedRoute>
                <CreateSessionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <SessionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
