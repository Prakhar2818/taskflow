// pages/SettingsPage.jsx - WITH THEME CONTEXT INTEGRATION
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useTheme } from "../context/themeContext"; // Import theme context
import EnhancedHeader from "../components/EnhancedHeader";

const SettingCard = ({ title, description, children, theme }) => (
  <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border ${
    theme === "dark" ? "bg-white/10 border-white/10" : "bg-white/60 border-white/40"
  }`}>
    <div className="mb-4">
      <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
        {title}
      </h3>
      <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
        {description}
      </p>
    </div>
    {children}
  </div>
);

const ToggleSwitch = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
      enabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
    }`}
  >
    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
      enabled ? 'transform translate-x-7' : 'transform translate-x-1'
    }`} />
  </button>
);

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme(); // Get theme from context

  const [settings, setSettings] = useState({
    darkMode: theme === 'dark',
    notifications: true,
    autoSave: true,
    emailUpdates: false,
    soundEffects: true
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));

    // Handle theme change - now uses shared context
    if (key === 'darkMode') {
      toggleTheme();
    }
  };

  const handleExportData = () => {
    // Mock export functionality
    const data = {
      user: user,
      exportDate: new Date().toISOString(),
      tasks: [], // This would come from your task context
      sessions: []
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.clear();
      alert('All data has been cleared.');
    }
  };

  return (
    <>
      <EnhancedHeader />
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      }`}>
        <div className="max-w-4xl mx-auto py-10 px-6">
          <button
            onClick={() => navigate("/dashboard")}
            className={`flex items-center gap-2 font-medium mb-6 transition-colors ${
              theme === "dark" ? "text-indigo-400 hover:text-indigo-200" : "text-indigo-600 hover:text-indigo-700"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>

          <div className={`rounded-3xl shadow-xl border p-8 
            ${theme === "dark" ? "bg-white/10 backdrop-blur-xl border-white/10" : "bg-white/80 backdrop-blur-xl border-white/20"}`}>
            <div className="mb-8">
              <h1 className={`text-3xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                ⚙️ Settings
              </h1>
              <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                Customize your TaskFlow experience
              </p>
            </div>

            <div className="space-y-6">
              {/* Account Settings */}
              <SettingCard
                title="Account Information"
                description="Manage your account details and preferences"
                theme={theme}
              >
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}>
                      Name
                    </label>
                    <input
                      type="text"
                      value={user?.name || ''}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      readOnly
                    />
                  </div>
                </div>
              </SettingCard>

              {/* Appearance */}
              <SettingCard
                title="Appearance"
                description="Customize the look and feel of TaskFlow"
                theme={theme}
              >
                <div className="flex items-center justify-between">
                  <span className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    Dark Mode
                  </span>
                  <ToggleSwitch
                    enabled={theme === 'dark'}
                    onChange={() => updateSetting('darkMode', theme === 'light')}
                  />
                </div>
              </SettingCard>

              {/* Notifications */}
              <SettingCard
                title="Notifications"
                description="Control how you receive updates and alerts"
                theme={theme}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      Push Notifications
                    </span>
                    <ToggleSwitch
                      enabled={settings.notifications}
                      onChange={(value) => updateSetting('notifications', value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      Email Updates
                    </span>
                    <ToggleSwitch
                      enabled={settings.emailUpdates}
                      onChange={(value) => updateSetting('emailUpdates', value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      Sound Effects
                    </span>
                    <ToggleSwitch
                      enabled={settings.soundEffects}
                      onChange={(value) => updateSetting('soundEffects', value)}
                    />
                  </div>
                </div>
              </SettingCard>

              {/* Productivity */}
              <SettingCard
                title="Productivity"
                description="Configure productivity and workflow settings"
                theme={theme}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      Auto Save
                    </span>
                    <ToggleSwitch
                      enabled={settings.autoSave}
                      onChange={(value) => updateSetting('autoSave', value)}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}>
                      Default Session Duration
                    </label>
                    <select className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}>
                      <option value="25">25 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">1 hour</option>
                    </select>
                  </div>
                </div>
              </SettingCard>

              {/* Data Management */}
              <SettingCard
                title="Data Management"
                description="Export, import, or clear your data"
                theme={theme}
              >
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleExportData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Data
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Import Data
                  </button>
                  <button
                    onClick={handleClearData}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear All Data
                  </button>
                </div>
              </SettingCard>

              {/* Account Actions */}
              <SettingCard
                title="Account Actions"
                description="Account-related actions and security"
                theme={theme}
              >
                <div className="flex flex-wrap gap-3">
                  <button className={`px-4 py-2 border rounded-lg transition-colors ${
                    theme === "dark"
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}>
                    Change Password
                  </button>
                  <button
                    onClick={logout}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              </SettingCard>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
