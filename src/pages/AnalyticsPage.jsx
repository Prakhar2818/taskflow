// pages/AnalyticsPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { TaskProvider, useTaskContext } from "../context/taskContext";
import EnhancedHeader from "../components/EnhancedHeader";

const AnalyticsCard = ({ title, value, icon, color, description }) => (
  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/40">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center text-2xl`}>
        {icon}
      </div>
      <div className={`px-3 py-1 bg-${color}-100 text-${color}-600 text-sm font-medium rounded-full`}>
        +12%
      </div>
    </div>
    <h3 className="text-2xl font-bold text-gray-800 mb-2">{value}</h3>
    <p className="text-lg font-semibold text-gray-700 mb-1">{title}</p>
    <p className="text-sm text-gray-500">{description}</p>
  </div>
);

const AnalyticsPageContent = () => {
  const navigate = useNavigate();
  const {
    tasks = [],
    taskCompletionReports = []
  } = useTaskContext() || {};

  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(task => task.status === 'completed').length,
    efficiency: taskCompletionReports.length > 0 ?
      Math.round(taskCompletionReports.reduce((acc, report) => acc + (report.efficiency || 0), 0) / taskCompletionReports.length) : 0,
    focusTime: Math.round(taskCompletionReports.reduce((acc, report) => acc + (report.actualTimeSpent || 0), 0) / 60)
  };

  const completionRate = stats.totalTasks > 0 ?
    Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <>
    <EnhancedHeader/>
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

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">📈 Analytics Dashboard</h1>
              <p className="text-gray-600">Track your productivity metrics and performance insights</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <AnalyticsCard
                title="Total Tasks"
                value={stats.totalTasks}
                icon="📋"
                color="blue"
                description="All time tasks created"
              />
              <AnalyticsCard
                title="Completed"
                value={stats.completedTasks}
                icon="✅"
                color="green"
                description="Successfully finished tasks"
              />
              <AnalyticsCard
                title="Completion Rate"
                value={`${completionRate}%`}
                icon="📊"
                color="purple"
                description="Overall success rate"
              />
              <AnalyticsCard
                title="Focus Time"
                value={`${stats.focusTime}h`}
                icon="⏱️"
                color="orange"
                description="Total productive hours"
              />
            </div>

            {/* Progress Chart */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/40 mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Weekly Progress</h3>
              <div className="space-y-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <div key={day} className="flex items-center gap-4">
                    <span className="w-12 text-sm font-medium text-gray-600">{day}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.random() * 80 + 20}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">{Math.floor(Math.random() * 8 + 2)}h</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/40">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { action: "Completed task", task: "Design review", time: "2 hours ago", status: "success" },
                  { action: "Started session", task: "Development work", time: "4 hours ago", status: "info" },
                  { action: "Task created", task: "Write documentation", time: "1 day ago", status: "default" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-white/40">
                    <div className={`w-2 h-2 rounded-full ${activity.status === 'success' ? 'bg-green-500' :
                        activity.status === 'info' ? 'bg-blue-500' : 'bg-gray-400'
                      }`}></div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">{activity.action}: {activity.task}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const AnalyticsPage = () => {
  return (
    <TaskProvider>
      <AnalyticsPageContent />
    </TaskProvider>
  );
};

export default AnalyticsPage;
