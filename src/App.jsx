// App.jsx - UPDATED FOR MULTI-WORKSPACE SYSTEM
import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/authContext";
import { ThemeProvider, useTheme } from "./context/themeContext";
import { TaskProvider } from "./context/taskContext";


import { WorkspaceProvider, useWorkspace } from "../src/context/WorkspaceContext";


// Import all your components (same as before)
import Login from "./components/Login";
import Register from "./components/Register";
import CreateTaskPage from "./pages/CreateTaskPage";
import CreateSessionPage from "./pages/CreateSessionPage";
import TasksPage from "./pages/TasksPage";
import SessionsPage from "./pages/SessionsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import SessionTimerPage from "./pages/SessionTimerPage";
import GeneratePDF from "./components/GeneratePdf";
import EnhancedHeader from "./components/EnhancedHeader";
import UserRoleSelection from "./components/onboarding/UserRoleSelection";
import WorkspaceCreate from "./components/workspace/WorkspaceCreate";
import WorkspaceJoin from "./components/workspace/WorkspaceJoin";
import JoinByInvite from "./components/workspace/JoinByInvite";
import ManagerDashboard from "./components/dashboard/ManagerDashboard";
import MemberDashboard from "./components/dashboard/MemberDashboard";


// ✅ NEW: Import WorkspaceSelection component
import WorkspaceSelection from "./components/workspace/WorkspaceSelection";


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


// ✅ UPDATED: WorkspaceGuard for multi-workspace system
const WorkspaceGuard = ({ children }) => {
  const { loading } = useAuth();
  const { currentWorkspace, userRole, loading: wsLoading, initialized } = useWorkspace();
  const location = useLocation();


  // ✅ UPDATED: Allow workspace selection and creation routes
  const openPaths = new Set([
    "/workspace-selection",
    "/workspace/create",
    "/workspace/join",
  ]);


  if (loading || wsLoading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workspace...</p>
        </div>
      </div>
    );
  }


  // If user is on allowed paths, let them through
  if (openPaths.has(location.pathname)) {
    return children;
  }


  // ✅ UPDATED: Redirect to workspace selection if no current workspace
  if (!currentWorkspace || !userRole) {
    return <Navigate to="/workspace-selection" replace />;
  }


  // ✅ Smart dashboard redirects based on current workspace role
  if (location.pathname === '/dashboard') {
    if (userRole === 'manager') {
      return <Navigate to="/manager-dashboard" replace />;
    } else if (userRole === 'member') {
      return <Navigate to="/member-dashboard" replace />;
    }
  }


  return children;
};


// ✅ UPDATED: Smart Dashboard Router
const SmartDashboardRoute = () => {
  const { userRole, currentWorkspace } = useWorkspace();

  if (!currentWorkspace || !userRole) {
    return <Navigate to="/workspace-selection" replace />;
  }


  if (userRole === 'manager') {
    return <Navigate to="/manager-dashboard" replace />;
  } else if (userRole === 'member') {
    return <DashboardPage />
  }

  // Fallback to workspace selection
  return <Navigate to="/workspace-selection" replace />;
};


// Main Dashboard Page Component (updated with workspace awareness)
const DashboardPage = () => {
  const navigate = useNavigate();
  const dashboardRef = useRef(null);
  const { theme } = useTheme();
  const { userRole, currentWorkspace } = useWorkspace(); // ✅ UPDATED
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });


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
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${theme === 'dark'
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
      : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      }`}>
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


      <div
        ref={dashboardRef}
        className={`relative ${theme === 'dark' ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-2xl shadow-2xl overflow-hidden`}
      >
        <div
          className="absolute inset-0 opacity-30 transition-all duration-1000"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)`
          }}
        />
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


        <div className="relative max-w-6xl mx-auto px-6 py-10">
          <div className="text-center relative">
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


            <div className="max-w-4xl mx-auto mb-8">
              {/* ✅ ADD: Current workspace display */}
              {currentWorkspace && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <p className={`text-lg font-medium ${theme === 'dark' ? 'text-blue-800' : 'text-blue-600'}`}>
                    🏢 Current Workspace: <strong>{currentWorkspace.name}</strong>
                    <span className="ml-2 text-sm">({userRole})</span>
                  </p>
                  <button
                    onClick={() => navigate('/workspace-selection')}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Switch Workspace
                  </button>
                </div>
              )}


              <p className={`text-xl lg:text-2xl font-medium leading-relaxed mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                The future of productivity is here. Experience
                <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text font-bold"> intelligent task management</span>
                <br />with advanced analytics and seamless workflow automation.
              </p>


              {/* ✅ UPDATED: Quick access buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
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


              {/* ✅ UPDATED: Role-specific navigation */}
              <div className="mb-8">
                {userRole === 'manager' && (
                  <button
                    onClick={() => navigate('/manager-dashboard')}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
                  >
                    <span className="text-lg">👔</span>
                    Go to Manager Dashboard
                  </button>
                )}
                {userRole === 'member' && (
                  <button
                    onClick={() => navigate('/member-dashboard')}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
                  >
                    <span className="text-lg">👥</span>
                    Go to Member Dashboard
                  </button>
                )}
              </div>


              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: '⚡', label: 'Fast', desc: 'Lightning quick' },
                  { icon: '📊', label: 'Analytics', desc: 'Deep insights' },
                  { icon: '🔄', label: 'Real-time', desc: 'Live updates' },
                  { icon: '🔒', label: 'Secure', desc: 'Privacy first' }
                ].map((feature) => (
                  <div
                    key={feature.label}
                    className={`p-4 backdrop-blur-sm border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 ${theme === 'dark'
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


      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .rotate-y-12 { transform: rotateY(12deg); }
        .transform-gpu { transform-style: preserve-3d; }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.1; } 50% { opacity: 0.3; } }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
};


const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <WorkspaceProvider>
          <TaskProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />


                {/* ✅ Invite join route (requires auth but no workspace) */}
                <Route path="/join/:inviteToken" element={
                  <ProtectedRoute>
                    <JoinByInvite />
                  </ProtectedRoute>
                } />


                {/* ✅ NEW: Workspace Selection (main hub) */}
                <Route
                  path="/workspace-selection"
                  element={
                    <ProtectedRoute>
                      <WorkspaceSelection />
                    </ProtectedRoute>
                  }
                />


                {/* ✅ KEEP: Legacy role selection (for backward compatibility) */}
                <Route
                  path="/user-role-selection"
                  element={
                    <ProtectedRoute>
                      <UserRoleSelection />
                    </ProtectedRoute>
                  }
                />


                {/* Workspace Management */}
                <Route
                  path="/workspace/create"
                  element={
                    <ProtectedRoute>
                      <WorkspaceGuard>
                        <WorkspaceCreate />
                      </WorkspaceGuard>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workspace/join"
                  element={
                    <ProtectedRoute>
                      <WorkspaceGuard>
                        <WorkspaceJoin />
                      </WorkspaceGuard>
                    </ProtectedRoute>
                  }
                />


                {/* Role-specific Dashboards */}
                <Route
                  path="/manager-dashboard"
                  element={
                    <ProtectedRoute>
                      <WorkspaceGuard>
                        <ManagerDashboard />
                      </WorkspaceGuard>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/member-dashboard"
                  element={
                    <ProtectedRoute>
                      <WorkspaceGuard>
                        <MemberDashboard />
                      </WorkspaceGuard>
                    </ProtectedRoute>
                  }
                />


                {/* ✅ UPDATED: Smart dashboard that redirects based on workspace role */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <WorkspaceGuard>
                        <SmartDashboardRoute />
                      </WorkspaceGuard>
                    </ProtectedRoute>
                  }
                />


                {/* All your existing TaskFlow routes */}
                <Route
                  path="/create-task"
                  element={
                    <ProtectedRoute>
                      <WorkspaceGuard>
                        <CreateTaskPage />
                      </WorkspaceGuard>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-session"
                  element={
                    <ProtectedRoute>
                      <WorkspaceGuard>
                        <CreateSessionPage />
                      </WorkspaceGuard>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tasks"
                  element={
                    <ProtectedRoute>
                      <WorkspaceGuard>
                        <TasksPage />
                      </WorkspaceGuard>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sessions"
                  element={
                    <ProtectedRoute>
                      <WorkspaceGuard>
                        <SessionsPage />
                      </WorkspaceGuard>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <WorkspaceGuard>
                        <AnalyticsPage />
                      </WorkspaceGuard>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <WorkspaceGuard>
                        <SettingsPage />
                      </WorkspaceGuard>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/session"
                  element={
                    <ProtectedRoute>
                      <WorkspaceGuard>
                        <SessionTimerPage />
                      </WorkspaceGuard>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/generate-report"
                  element={
                    <ProtectedRoute>
                      <WorkspaceGuard>
                        <GeneratePDF />
                      </WorkspaceGuard>
                    </ProtectedRoute>
                  }
                />


                {/* ✅ UPDATED: Default redirects to workspace selection */}
                <Route path="/" element={<Navigate to="/workspace-selection" replace />} />
                <Route path="*" element={<Navigate to="/workspace-selection" replace />} />
              </Routes>
            </Router>
          </TaskProvider>
        </WorkspaceProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};


export default App;
