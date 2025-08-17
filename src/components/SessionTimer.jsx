// components/SessionTimer.jsx
import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../context/taskContext';

const SessionTimer = () => {
  const {
    activeSession,
    currentSessionTaskIndex = 0,
    sessionTimerState = {},
    timerState = {}
  } = useTaskContext();

  const {
    isRunning = false,
    elapsedTime = 0,
    totalSessionTime = 0,
    sessionStartTime = null
  } = sessionTimerState || {};

  const {
    remainingTime = 0,
    totalTime = 0,
    isRunning: taskIsRunning = false
  } = timerState || {};

  const [currentSessionTime, setCurrentSessionTime] = useState(0);

  // Calculate total session time from tasks if not available from state
  const calculateTotalSessionTime = () => {
    if (!activeSession?.tasks) return 0;
    return activeSession.tasks.reduce((total, task) => total + (task.duration * 60 || 0), 0);
  };

  // **NEW: Calculate remaining time for incomplete tasks only**
  const calculateRemainingTimeForIncompleteTasks = () => {
    if (!activeSession?.tasks) return 0;
    
    let remainingTime = 0;
    
    // Add time for current task (if not completed)
    if (currentSessionTaskIndex < activeSession.tasks.length && taskIsRunning) {
      remainingTime += remainingTime; // Current task remaining time
    } else if (currentSessionTaskIndex < activeSession.tasks.length) {
      // If current task hasn't started, add full duration
      remainingTime += (activeSession.tasks[currentSessionTaskIndex]?.duration || 0) * 60;
    }
    
    // Add time for future tasks
    for (let i = currentSessionTaskIndex + 1; i < activeSession.tasks.length; i++) {
      remainingTime += (activeSession.tasks[i]?.duration || 0) * 60;
    }
    
    return remainingTime;
  };

  // **IMPROVED: Better remaining time calculation**
  const getSmartRemainingTime = () => {
    if (!activeSession?.tasks) return 0;
    
    let totalRemainingTime = 0;
    
    // Add remaining time for current task
    if (currentSessionTaskIndex < activeSession.tasks.length) {
      if (taskIsRunning && remainingTime > 0) {
        // If task is running, use actual remaining time
        totalRemainingTime += remainingTime;
      } else {
        // If task hasn't started, use full duration
        totalRemainingTime += (activeSession.tasks[currentSessionTaskIndex]?.duration || 0) * 60;
      }
    }
    
    // Add full duration for all future tasks
    for (let i = currentSessionTaskIndex + 1; i < activeSession.tasks.length; i++) {
      totalRemainingTime += (activeSession.tasks[i]?.duration || 0) * 60;
    }
    
    return totalRemainingTime;
  };

  // Use calculated total if sessionTimerState doesn't have it
  const effectiveTotalSessionTime = totalSessionTime > 0 ? totalSessionTime : calculateTotalSessionTime();

  // Initialize session time when component mounts or session changes
  useEffect(() => {
    if (activeSession) {
      if (!sessionStartTime && !isRunning && elapsedTime === 0) {
        setCurrentSessionTime(0);
      } else {
        const calculatedTime = isRunning && sessionStartTime
          ? elapsedTime + Math.floor((Date.now() - sessionStartTime) / 1000)
          : elapsedTime;
        setCurrentSessionTime(calculatedTime);
      }
    }
  }, [activeSession, sessionStartTime, isRunning, elapsedTime]);

  // Update current session time every second when running
  useEffect(() => {
    let interval;

    if (activeSession && (isRunning || taskIsRunning)) {
      interval = setInterval(() => {
        if (isRunning && sessionStartTime) {
          const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
          setCurrentSessionTime(elapsedTime + elapsed);
        } else if (taskIsRunning && !isRunning) {
          setCurrentSessionTime(prev => prev + 1);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, taskIsRunning, sessionStartTime, elapsedTime, activeSession]);

  // Alternative: Calculate session time based on task progress
  const getAlternativeSessionTime = () => {
    if (!activeSession || !activeSession.tasks) return 0;

    let totalElapsed = 0;

    // Add time for completed tasks
    for (let i = 0; i < currentSessionTaskIndex; i++) {
      if (activeSession.tasks[i]) {
        totalElapsed += activeSession.tasks[i].duration * 60;
      }
    }

    // Add time for current task if running
    if (taskIsRunning && totalTime > 0) {
      totalElapsed += (totalTime - remainingTime);
    }

    return totalElapsed;
  };

  const displayTime = currentSessionTime > 0 ? currentSessionTime : getAlternativeSessionTime();

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const mins = Math.floor((timeInSeconds % 3600) / 60);
    const secs = timeInSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getSessionProgressPercentage = () => {
    if (!activeSession || effectiveTotalSessionTime === 0) return 0;
    return Math.min((displayTime / effectiveTotalSessionTime) * 100, 100);
  };

  // **FIXED: Use smart remaining time calculation**
  const getRemainingTime = () => {
    return getSmartRemainingTime();
  };

  const getTaskProgressInSession = () => {
    if (!activeSession?.tasks) return [];

    return activeSession.tasks.map((task, index) => ({
      ...task,
      isCompleted: index < (activeSession.completedTasks || 0),
      isCurrent: index === currentSessionTaskIndex,
      isUpcoming: index > currentSessionTaskIndex
    }));
  };

  const getOverallStatus = () => {
    const progress = getSessionProgressPercentage();
    const taskProgress = ((activeSession?.completedTasks || 0) / (activeSession?.tasks?.length || 1)) * 100;

    if (progress > taskProgress + 10) {
      return { status: 'behind', message: 'Running behind schedule ⚠️', color: 'text-orange-600' };
    } else if (progress < taskProgress - 10) {
      return { status: 'ahead', message: 'Ahead of schedule 🚀', color: 'text-green-600' };
    } else {
      return { status: 'ontrack', message: 'On track 🎯', color: 'text-blue-600' };
    }
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

  // Early return if no active session
  if (!activeSession) {
    return null;
  }

  // Safety check for activeSession properties
  if (!activeSession.tasks || !Array.isArray(activeSession.tasks)) {
    return null;
  }

  const overallStatus = getOverallStatus();

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-xl border border-purple-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-purple-800 flex items-center gap-2">
          <span>🎯</span>
          Session Timer
        </h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            (isRunning || taskIsRunning) ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          }`}></div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            activeSession.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
          }`}>
            {activeSession.status || 'pending'}
          </span>
        </div>
      </div>

      {/* Session Name */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-purple-700 mb-2">
          {activeSession.name || 'Unnamed Session'}
        </h3>
        <p className={`text-sm font-medium ${overallStatus.color}`}>
          {overallStatus.message}
        </p>
      </div>

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 text-xs text-gray-500 bg-gray-100 p-2 rounded">
          Debug: currentTaskIndex={currentSessionTaskIndex}, completedTasks={activeSession.completedTasks},
          remainingTaskTime={formatTime(getSmartRemainingTime())}, 
          taskRunning={taskIsRunning}, currentTaskRemaining={remainingTime}
        </div>
      )}

      {/* Main Timer Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Elapsed Time */}
        <div className="text-center bg-white/50 rounded-xl p-4">
          <p className="text-sm font-medium text-purple-600 mb-2">Elapsed Time</p>
          <p className="text-3xl font-bold text-purple-800 font-mono">
            {formatTime(displayTime)}
          </p>
          <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(getSessionProgressPercentage(), 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Total Required Time */}
        <div className="text-center bg-white/50 rounded-xl p-4">
          <p className="text-sm font-medium text-purple-600 mb-2">Total Required</p>
          <p className="text-3xl font-bold text-purple-800 font-mono">
            {formatTime(effectiveTotalSessionTime)}
          </p>
          <p className="text-xs text-purple-600 mt-2">
            {activeSession.tasks.length} tasks planned
          </p>
        </div>

        {/* Remaining Time - FIXED */}
        <div className="text-center bg-white/50 rounded-xl p-4">
          <p className="text-sm font-medium text-purple-600 mb-2">Time Remaining</p>
          <p className="text-3xl font-bold text-purple-800 font-mono">
            {formatTime(getRemainingTime())}
          </p>
          <p className="text-xs text-purple-600 mt-2">
            {Math.max(0, activeSession.tasks.length - (activeSession.completedTasks || 0))} tasks left
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm font-medium text-purple-700 mb-2">
          <span>Session Progress</span>
          <span>{Math.round(getSessionProgressPercentage())}%</span>
        </div>
        <div className="bg-purple-200 rounded-full h-4 relative overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500 relative"
            style={{ width: `${getSessionProgressPercentage()}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
          {/* Task completion markers */}
          {activeSession.tasks.map((_, index) => (
            <div
              key={index}
              className="absolute top-0 bottom-0 w-0.5 bg-purple-600 opacity-30"
              style={{
                left: `${((index + 1) / activeSession.tasks.length) * 100}%`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Session Stats */}
      <div className="mt-6 pt-4 border-t border-purple-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-purple-600">Avg Task Time</p>
            <p className="text-lg font-bold text-purple-800">
              {activeSession.tasks.length > 0 
                ? Math.round(effectiveTotalSessionTime / activeSession.tasks.length / 60)
                : 0}min
            </p>
          </div>
          <div>
            <p className="text-xs text-purple-600">Completed</p>
            <p className="text-lg font-bold text-green-600">
              {activeSession.completedTasks || 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-purple-600">In Progress</p>
            <p className="text-lg font-bold text-blue-600">
              {activeSession.status === 'completed' ? 0 : 1}
            </p>
          </div>
          <div>
            <p className="text-xs text-purple-600">Remaining</p>
            <p className="text-lg font-bold text-orange-600">
              {Math.max(0, activeSession.tasks.length - (activeSession.completedTasks || 0) - (activeSession.status === 'completed' ? 0 : 1))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimer;
