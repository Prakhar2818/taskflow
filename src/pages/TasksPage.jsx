// pages/TasksPage.jsx - WITH THEME CONTEXT INTEGRATION
import React from "react";
import { useNavigate } from "react-router-dom";
import { TaskProvider } from "../context/taskContext";
import { useTheme } from "../context/themeContext"; // Import theme context
import TaskList from "../components/TaskList";
import EnhancedHeader from "../components/EnhancedHeader";

const TasksPageContent = () => {
  const navigate = useNavigate();
  const { theme } = useTheme(); // Get theme from context

  return (
    <>
      <EnhancedHeader />
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      }`}>
        <div className="max-w-6xl mx-auto py-10 px-6">
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
                📋 All Tasks
              </h1>
              <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                Manage and track all your tasks in one place
              </p>
            </div>

            {/* Quick Actions */}
            <div className="mb-6 flex gap-4">
              <button
                onClick={() => navigate("/create-task")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Task
              </button>
              <button className={`px-4 py-2 border rounded-lg transition-colors ${
                theme === "dark"
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}>
                Filter Tasks
              </button>
            </div>

            {/* Task Statistics */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className={`rounded-xl p-4 border ${
                theme === "dark" ? "bg-white/5 border-white/10" : "bg-white/60 border-white/40"
              }`}>
                <div className="text-2xl mb-2">📝</div>
                <h3 className={`font-semibold mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                  Total Tasks
                </h3>
                <p className={`text-2xl font-bold ${theme === "dark" ? "text-indigo-400" : "text-indigo-600"}`}>
                  12
                </p>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  All time tasks
                </p>
              </div>

              <div className={`rounded-xl p-4 border ${
                theme === "dark" ? "bg-white/5 border-white/10" : "bg-white/60 border-white/40"
              }`}>
                <div className="text-2xl mb-2">✅</div>
                <h3 className={`font-semibold mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                  Completed
                </h3>
                <p className={`text-2xl font-bold ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
                  8
                </p>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  Successfully done
                </p>
              </div>

              <div className={`rounded-xl p-4 border ${
                theme === "dark" ? "bg-white/5 border-white/10" : "bg-white/60 border-white/40"
              }`}>
                <div className="text-2xl mb-2">⏳</div>
                <h3 className={`font-semibold mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                  In Progress
                </h3>
                <p className={`text-2xl font-bold ${theme === "dark" ? "text-orange-400" : "text-orange-600"}`}>
                  3
                </p>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  Currently working
                </p>
              </div>

              <div className={`rounded-xl p-4 border ${
                theme === "dark" ? "bg-white/5 border-white/10" : "bg-white/60 border-white/40"
              }`}>
                <div className="text-2xl mb-2">📊</div>
                <h3 className={`font-semibold mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                  Completion Rate
                </h3>
                <p className={`text-2xl font-bold ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`}>
                  67%
                </p>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  Success rate
                </p>
              </div>
            </div>

            {/* Task List Container */}
            <div className={`rounded-2xl border p-6 ${
              theme === "dark" ? "bg-white/5 border-white/10" : "bg-white/40 border-white/30"
            }`}>
              <h2 className={`text-xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                Your Tasks
              </h2>
              <TaskList />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const TasksPage = () => {
  return (
    <TaskProvider>
      <TasksPageContent />
    </TaskProvider>
  );
};

export default TasksPage;
