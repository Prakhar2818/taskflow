// App.jsx - WITH SHARED THEME CONTEXT
import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/authContext";
import { ThemeProvider, useTheme } from "./context/themeContext"; // Add this
import Login from "./components/Login";
import Register from "./components/Register";

// Import separate page components
import CreateTaskPage from "./pages/CreateTaskPage";
import CreateSessionPage from "./pages/CreateSessionPage";
import TasksPage from "./pages/TasksPage";
import SessionsPage from "./pages/SessionsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import EnhancedHeader from "./components/EnhancedHeader";

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

// Main Dashboard Page Component
const DashboardPage = () => {
  const navigate = useNavigate();
  const dashboardRef = useRef(null);
  
  // Use shared theme context instead of local state
  const { theme } = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse tracking for interactive elements
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dashboardRef.current) {
        const rect = dashboardRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100
        });
      }
    };

    const dashboard = dashboardRef.current;
    if (dashboard) {
      dashboard.addEventListener('mousemove', handleMouseMove);
      return () => dashboard.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      
      {/* Shared background mesh overlay */}
      <div className="fixed inset-0 opacity-10 pointer-events-none z-0">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="dashboard-mesh" width="10" height="10" patternUnits="userSpaceOnUse">
              <path 
                d="M 10 0 L 0 0 0 10" 
                fill="none" 
                stroke="url(#dashboard-gradient-mesh)" 
                strokeWidth="0.5"
                opacity="0.6"
              />
            </pattern>
            <linearGradient id="dashboard-gradient-mesh" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme === 'dark' ? '#6366f1' : '#4f46e5'} />
              <stop offset="50%" stopColor={theme === 'dark' ? '#8b5cf6' : '#7c3aed'} />
              <stop offset="100%" stopColor={theme === 'dark' ? '#ec4899' : '#db2777'} />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#dashboard-mesh)" />
        </svg>
      </div>

      <EnhancedHeader />

      {/* Main Dashboard Content with enhanced styling */}
      <div 
        ref={dashboardRef}
        className={`relative ${theme === 'dark' ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-2xl shadow-2xl overflow-hidden`}
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
              <pattern id="content-mesh" width="10" height="10" patternUnits="userSpaceOnUse">
                <path
                  d="M 10 0 L 0 0 0 10"
                  fill="none"
                  stroke="url(#content-gradient-mesh)"
                  strokeWidth="0.5"
                  opacity="0.6"
                />
              </pattern>
              <linearGradient id="content-gradient-mesh" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={theme === 'dark' ? '#6366f1' : '#4f46e5'} />
                <stop offset="50%" stopColor={theme === 'dark' ? '#8b5cf6' : '#7c3aed'} />
                <stop offset="100%" stopColor={theme === 'dark' ? '#ec4899' : '#db2777'} />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#content-mesh)" />
          </svg>
        </div>

        {/* Dashboard Content */}
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

              <div className="absolute -top-4 -right-8 px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white text-sm font-bold rounded-full shadow-2xl transform rotate-12 hover:rotate-0 transition-all duration-500 cursor-pointer z-20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                  2025 EDITION
                </div>
              </div>
            </div>

            {/* Feature Showcase */}
            <div className="max-w-4xl mx-auto mb-8">
              <p className={`text-xl lg:text-2xl font-medium leading-relaxed mb-6 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
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
                    className={`p-4 backdrop-blur-sm border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 ${
                      theme === 'dark' 
                        ? 'bg-white/5 border-white/20' 
                        : 'bg-white/60 border-white/40'
                    }`}
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
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .rotate-y-12 { transform: rotateY(12deg); }
        .transform-gpu { transform-style: preserve-3d; }
        
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
      <ThemeProvider> {/* Wrap with ThemeProvider */}
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
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
