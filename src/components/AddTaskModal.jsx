import React, { useState, useEffect } from "react";
import { useTaskContext } from "../context/taskContext";

const AddTaskModal = () => {
  const { addTask, showModal, setShowModal, setShowSessionModal } = useTaskContext();
  const [taskName, setTaskName] = useState("");
  const [priority, setPriority] = useState("medium");
  const [duration, setDuration] = useState(30);
  const [customDuration, setCustomDuration] = useState("");

  const priorityOptions = [
    { value: "low", label: "Low", color: "from-green-400 to-green-500", emoji: "🟢" },
    { value: "medium", label: "Medium", color: "from-yellow-400 to-orange-500", emoji: "🟡" },
    { value: "high", label: "High", color: "from-red-400 to-red-500", emoji: "🔴" },
    { value: "urgent", label: "Urgent", color: "from-purple-500 to-pink-600", emoji: "🚨" }
  ];

  const durationPresets = [15, 30, 45, 60, 90, 120];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskName.trim()) {
      const finalDuration = duration === "custom" ? parseInt(customDuration) : duration;
      addTask({ 
        name: taskName.trim(),
        priority,
        duration: finalDuration,
        timerSeconds: finalDuration * 60,
        completed: false,
        createdAt: new Date().toISOString()
      });
      setTaskName("");
      setPriority("medium");
      setDuration(30);
      setCustomDuration("");
      setShowModal(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      setShowModal(false);
    }
  };

  useEffect(() => {
    if (showModal) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [showModal]);

  const getPriorityColor = (priorityValue) => {
    return priorityOptions.find(p => p.value === priorityValue)?.color || "from-gray-400 to-gray-500";
  };

  const getPriorityEmoji = (priorityValue) => {
    return priorityOptions.find(p => p.value === priorityValue)?.emoji || "⚪";
  };

  return (
    <div>
      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => setShowModal(true)}
          className="group bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-2xl font-bold text-base transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 flex items-center gap-2 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
          <span className="text-xl group-hover:animate-bounce-gentle">✨</span>
          <span className="relative z-10">Add Single Task</span>
        </button>

        <button
          onClick={() => setShowSessionModal(true)}
          className="group bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white px-6 py-3 rounded-2xl font-bold text-base transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 flex items-center gap-2 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
          <span className="text-xl group-hover:animate-bounce-gentle">🎯</span>
          <span className="relative z-10">Create Session</span>
        </button>
      </div>

      {/* Single Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-200 scale-100 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span>✨</span>
                  Create Single Task
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white/80 hover:text-white text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors duration-200"
                >
                  ×
                </button>
              </div>
              <p className="text-indigo-100 mt-2">Plan your individual task</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Task Name */}
              <div>
                <label htmlFor="taskName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Task Name
                </label>
                <input
                  id="taskName"
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="e.g., Complete project proposal, Review documents..."
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 text-gray-800 placeholder-gray-400"
                  autoFocus
                  maxLength={100}
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                  {taskName.length}/100 characters
                </div>
              </div>

              {/* Priority Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Priority Level
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {priorityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPriority(option.value)}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-2 font-medium ${
                        priority === option.value
                          ? `border-transparent bg-gradient-to-r ${option.color} text-white shadow-lg`
                          : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">{option.emoji}</span>
                      {option.label}
                      {priority === option.value && <span className="ml-auto">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Estimated Duration
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {durationPresets.map((minutes) => (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() => setDuration(minutes)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                        duration === minutes
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {minutes}min
                    </button>
                  ))}
                </div>
                
                {/* Custom Duration */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDuration("custom")}
                    className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                      duration === "custom"
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Custom
                  </button>
                  {duration === "custom" && (
                    <input
                      type="number"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      placeholder="Minutes"
                      min="1"
                      max="480"
                      className="flex-1 p-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm"
                    />
                  )}
                </div>
              </div>

              {/* Task Preview */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-700 mb-2">Task Preview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{taskName || "Task name..."}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Priority:</span>
                    <span className="flex items-center gap-1">
                      {getPriorityEmoji(priority)}
                      <span className={`font-medium bg-gradient-to-r ${getPriorityColor(priority)} bg-clip-text text-transparent`}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">
                      ⏱️ {duration === "custom" ? customDuration || "0" : duration} minutes
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!taskName.trim() || (duration === "custom" && (!customDuration || customDuration < 1))}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:transform-none transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <span>✓</span>
                  Create Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTaskModal;
