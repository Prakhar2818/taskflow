// pages/SessionsPage.jsx - WITH THEME CONTEXT INTEGRATION
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TaskProvider } from "../context/taskContext";
import { useTheme } from "../context/themeContext"; // Import theme context
import SessionTimer from "../components/SessionTimer";
import SessionModal from "../components/SessionModal";
import EnhancedHeader from "../components/EnhancedHeader";

import { useTaskContext } from "../context/taskContext";

const SessionsPageContent = () => {
  const navigate = useNavigate();
  const { theme } = useTheme(); // Get theme from context
  const [sessionData, setSessionData] = useState([])

  const { sessions, fetchSessions } = useTaskContext()
  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    setSessionData(sessions)
  })

  return (
    <>
      <EnhancedHeader />
      <div className={`min-h-screen transition-colors duration-300 ${theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
        }`}>
        <div className="max-w-6xl mx-auto py-10 px-6">
          <button
            onClick={() => navigate("/dashboard")}
            className={`flex items-center gap-2 font-medium mb-6 transition-colors ${theme === "dark" ? "text-indigo-400 hover:text-indigo-200" : "text-indigo-600 hover:text-indigo-700"
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>

          <div className="space-y-8">
            {/* Sessions Overview */}
            <div className={`rounded-3xl shadow-xl border p-8 
              ${theme === "dark" ? "bg-white/10 backdrop-blur-xl border-white/10" : "bg-white/80 backdrop-blur-xl border-white/20"}`}>
              <div className="mb-8">
                <h1 className={`text-3xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                  🎯 Work Sessions
                </h1>
                <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  Manage your focused work sessions and track productivity
                </p>
              </div>

              {/* Quick Actions */}
              <div className="mb-6 flex gap-4">
                <button
                  onClick={() => navigate("/create-session")}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Session
                </button>
              </div>
            </div>

            {/* Active Session Timer */}
            <div className={`rounded-3xl shadow-xl border p-8 
              ${theme === "dark" ? "bg-white/10 backdrop-blur-xl border-white/10" : "bg-white/80 backdrop-blur-xl border-white/20"}`}>
              <h2 className={`text-2xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                User's Session
              </h2>
              <div>
                {
                  sessionData.map((item) => (
                    <p key={item} className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                      {item.name}
                    </p>
                  ))
                }
              </div>
            </div>

            {/* Session Stats */}
            <div className={`rounded-3xl shadow-xl border p-8 
              ${theme === "dark" ? "bg-white/10 backdrop-blur-xl border-white/10" : "bg-white/80 backdrop-blur-xl border-white/20"}`}>
              <h2 className={`text-2xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                Today's Progress
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`rounded-xl p-4 border ${theme === "dark" ? "bg-white/5 border-white/10" : "bg-white/60 border-white/40"
                  }`}>
                  <div className="text-2xl mb-2">⏱️</div>
                  <h3 className={`font-semibold mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                    Total Time
                  </h3>
                  <p className={`text-2xl font-bold ${theme === "dark" ? "text-indigo-400" : "text-indigo-600"}`}>
                    2h 45m
                  </p>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    Focused work today
                  </p>
                </div>

                <div className={`rounded-xl p-4 border ${theme === "dark" ? "bg-white/5 border-white/10" : "bg-white/60 border-white/40"
                  }`}>
                  <div className="text-2xl mb-2">📊</div>
                  <h3 className={`font-semibold mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                    Sessions
                  </h3>
                  <p className={`text-2xl font-bold ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
                    3
                  </p>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    Completed sessions
                  </p>
                </div>

                <div className={`rounded-xl p-4 border ${theme === "dark" ? "bg-white/5 border-white/10" : "bg-white/60 border-white/40"
                  }`}>
                  <div className="text-2xl mb-2">🎯</div>
                  <h3 className={`font-semibold mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                    Efficiency
                  </h3>
                  <p className={`text-2xl font-bold ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`}>
                    87%
                  </p>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    Focus rate
                  </p>
                </div>
              </div>
            </div>
          </div>

          <SessionModal />
        </div>
      </div>
    </>
  );
};

const SessionsPage = () => {
  return (
    <TaskProvider>
      <SessionsPageContent />
    </TaskProvider>
  );
};

export default SessionsPage;
