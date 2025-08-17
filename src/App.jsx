// App.jsx - UPDATED WITH AUTHENTICATION INTEGRATION
import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/authContext";
import { TaskProvider, useTaskContext } from "./context/taskContext";
import Login from "./components/Login";
import Register from "./components/Register";
import TaskList from "./components/TaskList";
import AddTaskModal from "./components/AddTaskModal";
import SessionModal from "./components/SessionModal";
import Timer from "./components/Timer";
import SessionTimer from "./components/SessionTimer";
import StorageStatus from "./components/StorageStatus";
import GeneratePDF from "./components/GeneratePDF";
import TaskCompletionModal from "./components/TaskCompletionModal";

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

// Notification Panel Component
const NotificationPanel = ({ isOpen, onClose, notifications, onClearNotification }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-16 right-0 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 z-50 animate-scale-in max-h-96 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
            </svg>
            <p>No notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border-l-4 ${
                  notification.type === 'success' ? 'bg-green-50 border-green-500' :
                  notification.type === 'error' ? 'bg-red-50 border-red-500' :
                  'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{notification.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                  <button
                    onClick={() => onClearNotification(notification.id)}
                    className="text-gray-400 hover:text-gray-600 ml-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// User Profile Panel Component
const UserProfilePanel = ({ isOpen, onClose, theme, onThemeChange }) => {
  const { user, logout } = useAuth();
  
  if (!isOpen) return null;

  const handleSignOut = async () => {
    await logout();
    onClose();
  };

  return (
    <div className="absolute top-16 right-0 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 z-50 animate-scale-in">
      <div className="p-6">
        {/* User Info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{user?.name || 'User'}</h3>
            <p className="text-sm text-gray-500">{user?.email || 'user@taskflow.com'}</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600">Online</span>
            </div>
          </div>
        </div>

        {/* Quick Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Dark Mode</span>
            <button
              onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                theme === 'dark' ? 'transform translate-x-7' : 'transform translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Notifications</span>
            <button className="relative w-12 h-6 bg-indigo-600 rounded-full">
              <div className="absolute top-1 w-4 h-4 bg-white rounded-full transform translate-x-7" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Auto Save</span>
            <button className="relative w-12 h-6 bg-indigo-600 rounded-full">
              <div className="absolute top-1 w-4 h-4 bg-white rounded-full transform translate-x-7" />
            </button>
          </div>
        </div>

        {/* Profile Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            Profile Settings
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            Preferences
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            Help & Support
          </button>
          <button 
            onClick={handleSignOut}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Header Component with Full Functionality
const EnhancedHeader = () => {
  const {
    tasks,
    sessions,
    activeSession,
    taskCompletionReports,
    setShowModal,
    setShowSessionModal,
    clearLocalStorage,
    exportData,
    importData
  } = useTaskContext();

  const { user } = useAuth();

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
  const fileInputRef = useRef(null);

  // All your existing useEffect hooks remain the same...
  // (Time management, theme persistence, mouse tracking, keyboard shortcuts)

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            setIsCommandOpen(!isCommandOpen);
            break;
          case 'n':
            e.preventDefault();
            setShowModal(true);
            break;
          case 's':
            e.preventDefault();
            setShowSessionModal(true);
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandOpen, setShowModal, setShowSessionModal]);

  // Advanced Statistics
  const advancedStats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(task => task.status === 'completed').length,
    activeSessions: sessions.filter(session => session.status === 'pending').length,
    totalReports: taskCompletionReports.length,
    efficiency: taskCompletionReports.length > 0 ? 
      Math.round(taskCompletionReports.reduce((acc, report) => acc + (report.efficiency || 0), 0) / taskCompletionReports.length) : 0,
    streakDays: 7,
    focusTime: Math.round(taskCompletionReports.reduce((acc, report) => acc + (report.actualTimeSpent || 0), 0) / 60)
  };

  const completionRate = advancedStats.totalTasks > 0 ? 
    Math.round((advancedStats.completedTasks / advancedStats.totalTasks) * 100) : 0;

  // All your existing functions remain the same...
  // (handleCommand, handleFileImport, clearNotification, etc.)

  // Command Palette functionality
  const handleCommand = (command) => {
    switch (command) {
      case 'new-task':
        setShowModal(true);
        break;
      case 'new-session':
        setShowSessionModal(true);
        break;
      case 'generate-report':
        window.dispatchEvent(new CustomEvent('generate-pdf'));
        break;
      case 'clear-data':
        if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
          clearLocalStorage();
          setNotifications(prev => [...prev, {
            id: Date.now(),
            text: "All data cleared successfully",
            type: "success",
            time: "Just now"
          }]);
        }
        break;
      case 'export-data':
        try {
          const data = exportData();
          const blob = new Blob([data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
          setNotifications(prev => [...prev, {
            id: Date.now(),
            text: "Data exported successfully",
            type: "success",
            time: "Just now"
          }]);
        } catch (error) {
          setNotifications(prev => [...prev, {
            id: Date.now(),
            text: "Failed to export data",
            type: "error",
            time: "Just now"
          }]);
        }
        break;
      case 'import-data':
        fileInputRef.current?.click();
        break;
      default:
        break;
    }
    setIsCommandOpen(false);
  };

  // Handle file import
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const success = importData(e.target.result);
          setNotifications(prev => [...prev, {
            id: Date.now(),
            text: success ? "Data imported successfully" : "Failed to import data",
            type: success ? "success" : "error",
            time: "Just now"
          }]);
        } catch (error) {
          setNotifications(prev => [...prev, {
            id: Date.now(),
            text: "Invalid file format",
            type: "error",
            time: "Just now"
          }]);
        }
      };
      reader.readAsText(file);
    }
  };

  // Clear notification
  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Tab navigation
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  // Your existing JSX return with updated UserProfilePanel
  return (
    <div
      ref={headerRef}
      className={`relative ${theme === 'dark' ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-2xl border-b ${theme === 'dark' ? 'border-gray-800/50' : 'border-white/30'} shadow-2xl sticky top-0 z-30 overflow-hidden`}
    >
      {/* All your existing header content remains exactly the same */}
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileImport}
        className="hidden"
      />

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
              <div className="relative group perspective-1000">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-y-12 transform-gpu">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="text-3xl relative z-10 filter drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500">📋</span>
                  <div className="absolute top-2 left-2 w-1 h-1 bg-white/60 rounded-full animate-ping" />
                  <div className="absolute bottom-3 right-3 w-0.5 h-0.5 bg-white/40 rounded-full animate-pulse delay-200" />
                  
                  {activeSession && (
                    <div className="absolute -inset-2 rounded-2xl border-2 border-green-400/50 animate-pulse-ring" />
                  )}
                </div>
                
                <div className="absolute -bottom-1 -right-1 flex items-center gap-1">
                  <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
                    activeSession ? 'bg-green-500' : 'bg-blue-500'
                  }`}>
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
                  onClick={() => setActiveTab(tab.id)}
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

            {/* Session Status Badge */}
            {activeSession && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className={theme === 'dark' ? 'text-green-300' : 'text-green-700'}>
                  Session Active
                </span>
              </div>
            )}
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

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  setIsProfileOpen(false);
                }}
                className={`relative p-3 ${theme === 'dark' ? 'text-gray-300 hover:text-white bg-white/5 hover:bg-white/10' : 'text-gray-600 hover:text-indigo-600 bg-white/50 hover:bg-indigo-50'} backdrop-blur-sm rounded-xl border ${theme === 'dark' ? 'border-white/10 hover:border-white/20' : 'border-white/30 hover:border-indigo-200'} transition-all duration-200 shadow-lg hover:shadow-xl`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7V3a2 2 0 012-2h2a2 2 0 012 2v4M5 21a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5z" />
                </svg>
                {notifications.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                    {notifications.length}
                  </div>
                )}
              </button>
              
              <NotificationPanel 
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                notifications={notifications}
                onClearNotification={clearNotification}
              />
            </div>

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
              
              <UserProfilePanel 
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                theme={theme}
                onThemeChange={setTheme}
              />
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
                  { command: 'generate-report', label: 'Generate Report', icon: '📊', shortcut: '' },
                  { command: 'export-data', label: 'Export Data', icon: '💾', shortcut: '' },
                  { command: 'import-data', label: 'Import Data', icon: '📁', shortcut: '' },
                  { command: 'clear-data', label: 'Clear All Data', icon: '🗑️', shortcut: '' }
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
            { label: 'Tasks', value: advancedStats.totalTasks, icon: '📋', color: 'blue' },
            { label: 'Done', value: advancedStats.completedTasks, icon: '✅', color: 'green' },
            { label: 'Sessions', value: advancedStats.activeSessions, icon: '🎯', color: 'purple' },
            { label: 'Efficiency', value: `${advancedStats.efficiency}%`, icon: '⚡', color: 'orange' },
            { label: 'Focus Time', value: `${advancedStats.focusTime}m`, icon: '⏱️', color: 'pink' }
          ].map((stat, index) => (
            <div
              key={stat.label}
              className={`relative overflow-hidden p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-white/60'} backdrop-blur-sm rounded-2xl border ${theme === 'dark' ? 'border-white/10' : 'border-white/40'} shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer`}
              onClick={() => setActiveTab('analytics')}
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

        {/* Tab Content - All your existing tab content remains the same */}
        {activeTab === 'dashboard' && (
          <div className="text-center relative">
            {/* Floating Elements */}
            <div className="absolute top-4 left-1/4 w-3 h-3 bg-indigo-400/40 rounded-full animate-float-1" />
            <div className="absolute top-8 right-1/3 w-2 h-2 bg-purple-400/40 rounded-full animate-float-2" />
            <div className="absolute top-6 right-1/4 w-2.5 h-2.5 bg-pink-400/40 rounded-full animate-float-3" />

            {/* Main Title */}
            <div className="relative mb-8">
              <h1 className={`text-8xl lg:text-9xl xl:text-[10rem] font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 tracking-tight relative leading-none`}>
                TaskFlow
                
                <div className="absolute inset-0 text-8xl lg:text-9xl xl:text-[10rem] font-black text-purple-600/5 blur-3xl animate-pulse-slow">
                  TaskFlow
                </div>
                <div className="absolute inset-0 text-8xl lg:text-9xl xl:text-[10rem] font-black text-indigo-600/3 blur-2xl animate-pulse-slower">
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
              <p className={`text-xl lg:text-2xl font-medium leading-relaxed mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                The future of productivity is here. Experience
                <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text font-bold"> intelligent task management</span>
                <br />with advanced analytics and seamless workflow automation.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: '⚡', label: 'Fast', desc: 'Lightning quick' },
                  { icon: '📊', label: 'Analytics', desc: 'Deep insights' },
                  { icon: '🔄', label: 'Real-time', desc: 'Live updates' },
                  { icon: '🔒', label: 'Secure', desc: 'Privacy first' }
                ].map((feature, index) => (
                  <div
                    key={feature.label}
                    className={`p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-white/60'} backdrop-blur-sm border ${theme === 'dark' ? 'border-white/10' : 'border-white/40'} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105`}
                  >
                    <div className="text-3xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      {feature.label}
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {feature.desc}
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Section */}
              <div className={`p-6 ${theme === 'dark' ? 'bg-white/5' : 'bg-white/60'} backdrop-blur-sm rounded-2xl border ${theme === 'dark' ? 'border-white/10' : 'border-white/40'} shadow-lg`}>
                <blockquote className={`text-lg italic ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                  "The future belongs to those who prepare for it today."
                </blockquote>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      System Status: Optimal
                    </span>
                  </div>
                  <div className="w-px h-4 bg-gray-300" />
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Performance: Excellent
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Your existing analytics and settings tabs */}
        {activeTab === 'analytics' && (
          <div className={`p-6 ${theme === 'dark' ? 'bg-white/5' : 'bg-white/60'} backdrop-blur-sm rounded-2xl border ${theme === 'dark' ? 'border-white/10' : 'border-white/40'} shadow-lg`}>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-6`}>
              📈 Analytics Dashboard
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className={`p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-white/80'} rounded-xl`}>
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-2`}>Completion Rate</h3>
                <div className="text-3xl font-bold text-green-500 mb-2">{completionRate}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
              
              <div className={`p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-white/80'} rounded-xl`}>
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-2`}>Average Efficiency</h3>
                <div className="text-3xl font-bold text-blue-500 mb-2">{advancedStats.efficiency}%</div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Based on {taskCompletionReports.length} reports
                </p>
              </div>
              
              <div className={`p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-white/80'} rounded-xl`}>
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-2`}>Focus Time</h3>
                <div className="text-3xl font-bold text-purple-500 mb-2">{advancedStats.focusTime}m</div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total time spent on tasks
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className={`p-6 ${theme === 'dark' ? 'bg-white/5' : 'bg-white/60'} backdrop-blur-sm rounded-2xl border ${theme === 'dark' ? 'border-white/10' : 'border-white/40'} shadow-lg`}>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-6`}>
              ⚙️ Settings
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Theme</h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Switch between light and dark mode</p>
                </div>
                <button
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className={`relative w-16 h-8 rounded-full transition-colors duration-200 ${
                    theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-200 ${
                    theme === 'dark' ? 'transform translate-x-9' : 'transform translate-x-1'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Data Management</h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Export, import, or clear your data</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCommand('export-data')}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors duration-200"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => handleCommand('import-data')}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors duration-200"
                  >
                    Import
                  </button>
                  <button
                    onClick={() => handleCommand('clear-data')}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors duration-200"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .rotate-y-12 { transform: rotateY(12deg); }
        .transform-gpu { transform-style: preserve-3d; }
        
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }
        
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); opacity: 0.6; }
          50% { transform: translateY(-25px) rotate(90deg) scale(1.2); opacity: 1; }
        }
        
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.8; }
          50% { transform: translateY(-15px) rotate(270deg); opacity: 1; }
        }
        
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
        
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.15; }
        }
        
        @keyframes scale-in {
          from { opacity: 0; transform: translateX(-50%) scale(0.9); }
          to { opacity: 1; transform: translateX(-50%) scale(1); }
        }
        
        .animate-float-1 { animation: float-1 8s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 10s ease-in-out infinite; }
        .animate-float-3 { animation: float-3 6s ease-in-out infinite; }
        .animate-pulse-ring { animation: pulse-ring 2s infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-pulse-slower { animation: pulse-slower 6s ease-in-out infinite; }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
      `}</style>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  return (
    <TaskProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Fully Functional Enhanced Header */}
        <EnhancedHeader />

        {/* Main Content */}
        <div className="relative max-w-6xl mx-auto px-6 py-10 space-y-8">
          <div className="flex flex-col sm:flex-row gap-6 justify-between items-center animate-fade-in">
            <AddTaskModal />
            <GeneratePDF />
          </div>

          <StorageStatus />
          <SessionTimer />

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 animate-slide-up">
            <Timer />
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 animate-slide-up">
            <TaskList />
          </div>
        </div>

        <SessionModal />
        <TaskCompletionModal />

        {/* Enhanced Footer */}
        <div className="relative text-center py-20 text-gray-500 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent" />
          <div className="relative max-w-6xl mx-auto px-6">
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-8">Join the TaskFlow Ecosystem</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-sm">
                {[
                  { icon: '📚', label: 'Documentation', desc: 'Learn & explore' },
                  { icon: '🔧', label: 'API', desc: 'Build & integrate' },
                  { icon: '👥', label: 'Community', desc: 'Connect & share' },
                  { icon: '💬', label: 'Support', desc: 'Get help' },
                  { icon: '🚀', label: 'Updates', desc: 'Stay current' }
                ].map((item) => (
                  <a
                    key={item.label}
                    href="#"
                    className="group p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>
                    <div className="font-medium text-gray-800">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </a>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-sm font-medium">
              <span>Built with ❤️ using React & Tailwind CSS</span>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs rounded-full">
                  Open Source
                </div>
                <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs rounded-full">
                  MIT License
                </div>
                <div className="px-3 py-1 bg-gradient-to-r from-orange-500 to-pink-600 text-white text-xs rounded-full">
                  Community Driven
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TaskProvider>
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
                <Dashboard />
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
