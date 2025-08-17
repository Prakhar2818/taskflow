// pages/CreateTaskPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { TaskProvider, useTaskContext } from "../context/taskContext";
import AddTaskModal from "../components/AddTaskModal";

const CreateTaskPageContent = () => {
  const navigate = useNavigate();
  const { setShowModal } = useTaskContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto py-10 px-6">
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
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">✅ Create New Task</h1>
            <p className="text-gray-600">Add a new task to your workflow and boost your productivity</p>
          </div>

          {/* Task Creation Interface */}
          <div className="space-y-6">
            {/* Main Action Button - MOVED FROM AddTaskModal */}
            <div className="text-center">
              <button
                onClick={() => setShowModal(true)}
                className="group bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 flex items-center gap-3 mx-auto relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                <span className="text-2xl group-hover:animate-bounce-gentle">✨</span>
                <span className="relative z-10">Add Single Task</span>
              </button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
                <div className="text-2xl mb-2">📝</div>
                <h3 className="font-semibold text-gray-800 mb-1">Task Details</h3>
                <p className="text-sm text-gray-600">Add name, priority, and duration</p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
                <div className="text-2xl mb-2">⏰</div>
                <h3 className="font-semibold text-gray-800 mb-1">Time Tracking</h3>
                <p className="text-sm text-gray-600">Set estimated completion time</p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="font-semibold text-gray-800 mb-1">Priority Levels</h3>
                <p className="text-sm text-gray-600">Organize by importance</p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <h4 className="font-semibold text-indigo-800 mb-2">💡 How to create a task:</h4>
              <ul className="text-sm text-indigo-700 space-y-1">
                <li>• Click "Add Single Task" to open the form</li>
                <li>• Enter your task name and details</li>
                <li>• Set priority level (Low, Medium, High, Urgent)</li>
                <li>• Choose estimated duration</li>
                <li>• Click "Create Task" to save</li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Task Modal */}
      <AddTaskModal />
    </div>
  );
};

const CreateTaskPage = () => {
  return (
    <TaskProvider>
      <CreateTaskPageContent />
    </TaskProvider>
  );
};

export default CreateTaskPage;
