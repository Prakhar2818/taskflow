// pages/CreateSessionPage.jsx - WITH THEME CONTEXT INTEGRATION
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TaskProvider, useTaskContext } from "../context/taskContext";
import { useTheme } from "../context/themeContext"; // Import theme context
import SessionModal from "../components/SessionModal";
import EnhancedHeader from "../components/EnhancedHeader";

const CreateSessionPageContent = () => {
  const navigate = useNavigate();
  const { theme } = useTheme(); // Get theme from context
  const { setShowSessionModal } = useTaskContext();

  const handleOpenModal = () => {
    setShowSessionModal(true);
  };

  return (
    <>
      <EnhancedHeader/>
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      }`}>
        <div className="max-w-2xl mx-auto py-10 px-6">
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
            <div className="text-center mb-8">
              <h1 className={`text-3xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                🎯 Start New Session
              </h1>
              <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                Create a focused work session to maximize your productivity
              </p>
            </div>

            {/* Session Creation Interface */}
            <div className="space-y-6">
              {/* Main Action Button */}
              <div className="text-center">
                <button
                  onClick={handleOpenModal}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
                >
                  <span className="text-xl">🎯</span>
                  Open Session Creator
                </button>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className={`backdrop-blur-sm rounded-xl p-4 border ${
                  theme === "dark" ? "bg-white/10 border-white/10" : "bg-white/60 border-white/40"
                }`}>
                  <div className="text-2xl mb-2">⏰</div>
                  <h3 className={`font-semibold mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                    Duration Setting
                  </h3>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    Choose work and break durations
                  </p>
                </div>

                <div className={`backdrop-blur-sm rounded-xl p-4 border ${
                  theme === "dark" ? "bg-white/10 border-white/10" : "bg-white/60 border-white/40"
                }`}>
                  <div className="text-2xl mb-2">📝</div>
                  <h3 className={`font-semibold mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                    Session Goals
                  </h3>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    Define what you want to accomplish
                  </p>
                </div>

                <div className={`backdrop-blur-sm rounded-xl p-4 border ${
                  theme === "dark" ? "bg-white/10 border-white/10" : "bg-white/60 border-white/40"
                }`}>
                  <div className="text-2xl mb-2">📊</div>
                  <h3 className={`font-semibold mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                    Progress Tracking
                  </h3>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    Monitor your productivity metrics
                  </p>
                </div>
              </div>

              {/* Session Creation Instructions */}
              <div className={`rounded-xl p-4 border ${
                theme === "dark" 
                  ? "bg-purple-900/20 border-purple-700/30" 
                  : "bg-purple-50 border-purple-200"
              }`}>
                <h4 className={`font-semibold mb-2 ${
                  theme === "dark" ? "text-purple-300" : "text-purple-800"
                }`}>
                  💡 How to create a work session:
                </h4>
                <ul className={`text-sm space-y-1 ${
                  theme === "dark" ? "text-purple-200" : "text-purple-700"
                }`}>
                  <li>• Click "Open Session Creator" to start</li>
                  <li>• Enter a descriptive session title</li>
                  <li>• Set your work duration (15-90 minutes)</li>
                  <li>• Choose break duration (5-20 minutes)</li>
                  <li>• Describe your session goals (optional)</li>
                  <li>• Click "Start Session" to begin</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Session Modal */}
        <SessionModal />
      </div>
    </>
  );
};

const CreateSessionPage = () => {
  return (
    <TaskProvider>
      <CreateSessionPageContent />
    </TaskProvider>
  );
};

export default CreateSessionPage;
