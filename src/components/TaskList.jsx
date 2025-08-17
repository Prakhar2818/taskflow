import React from "react";
import { useTaskContext } from "../context/taskContext";

const TaskList = () => {
  const { tasks, setActiveTaskById, activeTask, updateStatus, deleteTask, activeSession } = useTaskContext();

  const getPriorityColor = (priority) => {
    const colors = {
      low: "from-green-400 to-green-500",
      medium: "from-yellow-400 to-orange-500",
      high: "from-red-400 to-red-500",
      urgent: "from-purple-500 to-pink-600"
    };
    return colors[priority] || colors.medium;
  };

  const getPriorityEmoji = (priority) => {
    const emojis = {
      low: "🟢",
      medium: "🟡",
      high: "🔴",
      urgent: "🚨"
    };
    return emojis[priority] || "⚪";
  };

  if (tasks.length === 0 && !activeSession) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks yet</h3>
        <p className="text-gray-500">Create your first task or start a session to get started!</p>
      </div>
    );
  }

  return (
    <div className="">
      {tasks.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Individual Tasks</h2>

          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${activeTask && activeTask.id === task.id && !activeTask.sessionId
                    ? 'border-indigo-500 bg-indigo-50'
                    : task.status === 'completed'
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg mb-2 ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'
                      }`}>
                      {task.name}
                    </h3>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        {getPriorityEmoji(task.priority)}
                        <span className={`font-medium bg-gradient-to-r ${getPriorityColor(task.priority)} bg-clip-text text-transparent`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      </span>

                      <span className="text-gray-600">
                        ⏱️ {Math.floor(task.timerSeconds / 60)}min
                      </span>

                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                        }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {task.status !== 'completed' && (
                      <>
                        <button
                          onClick={() => setActiveTaskById(task.id)}
                          disabled={activeTask && activeTask.id === task.id && !activeTask.sessionId}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${activeTask && activeTask.id === task.id && !activeTask.sessionId
                              ? 'bg-indigo-100 text-indigo-700 cursor-not-allowed'
                              : 'bg-indigo-500 hover:bg-indigo-600 text-white hover:shadow-lg transform hover:scale-105'
                            }`}
                        >
                          {activeTask && activeTask.id === task.id && !activeTask.sessionId ? 'Active' : 'Start Timer'}
                        </button>

                        <button
                          onClick={() => updateStatus(task.id, 'completed')}
                          className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                        >
                          ✓
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
