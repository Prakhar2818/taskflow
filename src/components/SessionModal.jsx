import React, { useState, useEffect } from "react";
import { useTaskContext } from "../context/taskContext";
import { useNavigate } from "react-router-dom";

const SessionModal = () => {
  const { addSession, showSessionModal, setShowSessionModal } = useTaskContext();
  const [sessionName, setSessionName] = useState("");
  const [tasks, setTasks] = useState([{ name: "", duration: 25, priority: "medium" }]);

  const priorityOptions = [
    { value: "low", label: "Low", color: "from-green-400 to-green-500", emoji: "🟢" },
    { value: "medium", label: "Medium", color: "from-yellow-400 to-orange-500", emoji: "🟡" },
    { value: "high", label: "High", color: "from-red-400 to-red-500", emoji: "🔴" },
    { value: "urgent", label: "Urgent", color: "from-purple-500 to-pink-600", emoji: "🚨" }
  ];

  const addTask = () => {
    setTasks([...tasks, { name: "", duration: 25, priority: "medium" }]);
  };

  const navigate = useNavigate();
  const removeTask = (index) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((_, i) => i !== index));
    }
  };

  const updateTask = (index, field, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[index][field] = value;
    setTasks(updatedTasks);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validTasks = tasks.filter(task => task.name.trim());
    if (sessionName.trim() && validTasks.length > 0) {
      const sessionData = {
        name: sessionName.trim(),
        tasks: validTasks.map(task => ({
          ...task,
          name: task.name.trim(),
          timerSeconds: task.duration * 60
        }))
      };

      addSession(sessionData);
      setSessionName("");
      setTasks([{ name: "", duration: 25, priority: "medium" }]);
      setShowSessionModal(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      setShowSessionModal(false);
    }
  };

  useEffect(() => {
    if (showSessionModal) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [showSessionModal]);

  const getTotalDuration = () => {
    return tasks.reduce((total, task) => total + (task.duration || 0), 0);
  };

  const getPriorityColor = (priority) => {
    return priorityOptions.find(p => p.value === priority)?.color || "from-gray-400 to-gray-500";
  };

  const getPriorityEmoji = (priority) => {
    return priorityOptions.find(p => p.value === priority)?.emoji || "⚪";
  };

  if (!showSessionModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl transform transition-all duration-200 scale-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span>🎯</span>
              Create Focus Session
            </h2>
            <button
              onClick={() => setShowSessionModal(false)}
              className="text-white/80 hover:text-white text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors duration-200"
            >
              ×
            </button>
          </div>
          <p className="text-purple-100 mt-2">Plan multiple tasks for a focused work session</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Session Name */}
          <div>
            <label htmlFor="sessionName" className="block text-sm font-semibold text-gray-700 mb-2">
              Session Name
            </label>
            <input
              id="sessionName"
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g., Morning Focus Session, Project Sprint..."
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 text-gray-800 placeholder-gray-400"
              autoFocus
              maxLength={100}
            />
          </div>

          {/* Tasks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-semibold text-gray-700">
                Session Tasks ({tasks.length})
              </label>
              <button
                type="button"
                onClick={addTask}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
              >
                <span>+</span>
                Add Task
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {tasks.map((task, index) => (
                <div key={index} className="p-4 border-2 border-gray-200 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Task {index + 1}</span>
                    {tasks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTask(index)}
                        className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Task Name */}
                  <input
                    type="text"
                    value={task.name}
                    onChange={(e) => updateTask(index, 'name', e.target.value)}
                    placeholder="Task name..."
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                    maxLength={100}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Duration */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Duration (minutes)</label>
                      <input
                        type="number"
                        value={task.duration}
                        onChange={(e) => updateTask(index, 'duration', parseInt(e.target.value) || 0)}
                        min="1"
                        max="480"
                        className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                      />
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Priority</label>
                      <select
                        value={task.priority}
                        onChange={(e) => updateTask(index, 'priority', e.target.value)}
                        className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                      >
                        {priorityOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.emoji} {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Summary */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-700 mb-3">Session Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Session Name:</span>
                <span className="font-medium">{sessionName || "Session name..."}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Tasks:</span>
                <span className="font-medium">{tasks.filter(t => t.name.trim()).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Duration:</span>
                <span className="font-medium">⏱️ {getTotalDuration()} minutes</span>
              </div>
            </div>

            {/* Task Preview */}
            <div className="mt-4">
              <h5 className="font-medium text-gray-700 mb-2">Task Order:</h5>
              <div className="space-y-1">
                {tasks.filter(t => t.name.trim()).map((task, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="flex-1">{task.name || `Task ${index + 1}`}</span>
                    <span className="text-gray-500">{task.duration}min</span>
                    <span>{getPriorityEmoji(task.priority)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              onClick={() => {
                navigate("/session")
              }}
              disabled={!sessionName.trim() || tasks.filter(t => t.name.trim()).length === 0}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:transform-none transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>🚀</span>
              Start Session
            </button>
            <button
              type="button"
              onClick={() => setShowSessionModal(false)}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionModal;
