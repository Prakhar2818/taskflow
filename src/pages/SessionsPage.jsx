// pages/SessionsPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { TaskProvider } from "../context/taskContext";
import SessionTimer from "../components/SessionTimer";
import SessionModal from "../components/SessionModal";

const SessionsPage = () => {
  const navigate = useNavigate();

  return (
    <TaskProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto py-10 px-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          
          <div className="space-y-8">
            {/* Sessions Overview */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">🎯 Work Sessions</h1>
                <p className="text-gray-600">Manage your focused work sessions and track productivity</p>
              </div>
              
              {/* Quick Actions */}
              <div className="mb-6 flex gap-4">
                <button
                  onClick={() => navigate("/create-session")}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Session
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  View History
                </button>
              </div>
            </div>

            {/* Active Session Timer */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Active Session</h2>
              <SessionTimer />
            </div>
          </div>

          <SessionModal />
        </div>
      </div>
    </TaskProvider>
  );
};

export default SessionsPage;
