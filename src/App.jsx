// App.jsx
import React from "react";
import { TaskProvider } from "./context/taskContext";
import TaskList from "./components/TaskList";
import AddTaskModal from "./components/AddTaskModal";
import SessionModal from "./components/SessionModal";
import Timer from "./components/Timer";
import SessionTimer from "./components/SessionTimer";
import StorageStatus from "./components/StorageStatus";
import GeneratePDF from "./components/GeneratePDF";
import TaskCompletionModal from "./components/TaskCompletionModal"; // NEW

const App = () => {
  return (
    <TaskProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Header Section */}
        <div className="relative bg-white/90 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-10">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-xl">
                <span className="text-3xl">📋</span>
              </div>
              <h1 className="text-6xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 tracking-tight">
                TaskFlow
              </h1>
              <p className="text-gray-600 text-xl font-medium max-w-md mx-auto leading-relaxed">
                Organize your tasks, track your time, achieve your goals
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative max-w-6xl mx-auto px-6 py-10 space-y-8">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-6 justify-between items-center animate-fade-in">
            <AddTaskModal />
            <GeneratePDF />
          </div>

          {/* Storage Status */}
          <div className="animate-slide-up">
            <StorageStatus />
          </div>

          {/* Session Timer */}
          <SessionTimer />

          {/* Timer Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 animate-slide-up">
            <Timer />
          </div>

          {/* Tasks Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 animate-slide-up">
            <TaskList />
          </div>
        </div>

        {/* Modals */}
        <SessionModal />
        <TaskCompletionModal /> {/* NEW: Task completion modal */}

        {/* Footer */}
        <div className="relative text-center py-12 text-gray-500">
          <p className="text-sm font-medium">Built with ❤️ using React & Tailwind CSS</p>
        </div>
      </div>
    </TaskProvider>
  );
};

export default App;
