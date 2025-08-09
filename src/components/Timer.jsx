import React, { useState, useEffect, useCallback } from "react";
import { useTaskContext } from "../context/taskContext";

const Timer = () => {
  const { 
    activeTask, 
    activeSession,
    currentSessionTaskIndex,
    timerState, 
    updateTimerState, 
    completeTask, 
    addSessionToTask,
    clearActiveTask,
    completeSessionTask // Make sure this is available
  } = useTaskContext();
  
  const [seconds, setSeconds] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // Initialize timer when activeTask changes
  useEffect(() => {
    if (activeTask && activeTask.timerSeconds) {
      setSeconds(activeTask.timerSeconds);
      updateTimerState({
        remainingTime: activeTask.timerSeconds,
        totalTime: activeTask.timerSeconds,
        isRunning: false
      });
    } else {
      setSeconds(0);
    }
  }, [activeTask?.id, activeTask?.timerSeconds]);

  // Memoize the timer complete handler
  const handleTimerComplete = useCallback(() => {
    if (activeTask && sessionStartTime) {
      const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
      
      // Add session data
      if (activeTask.sessionId) {
        addSessionToTask(activeTask.id, {
          startTime: new Date(sessionStartTime).toISOString(),
          endTime: new Date().toISOString(),
          duration: sessionDuration,
          completed: true
        });
      }
      
      // Stop the timer first
      updateTimerState({ isRunning: false });
      setSessionStartTime(null);
      
      // Show completion notification
      if ('Notification' in window && Notification.permission === 'granted') {
        const message = activeSession 
          ? `Task completed! ${activeSession.tasks.length - currentSessionTaskIndex - 1} tasks remaining in session.`
          : `Great job completing "${activeTask?.name}"!`;
        
        new Notification('Task Completed!', {
          body: message,
          icon: '🎉'
        });
      }
      
      // Handle task completion - this should trigger next task
      if (activeTask.sessionId) {
        // This is a session task - call session-specific completion
        setTimeout(() => {
          completeSessionTask();
        }, 1000); // Small delay to show completion state
      } else {
        // This is a regular task
        completeTask(activeTask.id, sessionDuration);
      }
    }
  }, [activeTask, activeSession, currentSessionTaskIndex, sessionStartTime, addSessionToTask, completeTask, completeSessionTask, updateTimerState]);

  // Main timer logic
  useEffect(() => {
    let timer;
    
    if (timerState.isRunning && seconds > 0) {
      if (!sessionStartTime) {
        setSessionStartTime(Date.now());
      }
      
      timer = setInterval(() => {
        setSeconds((prevSeconds) => {
          const newSeconds = prevSeconds - 1;
          updateTimerState({ remainingTime: newSeconds });
          
          if (newSeconds <= 0) {
            setTimeout(() => handleTimerComplete(), 0);
            return 0;
          }
          return newSeconds;
        });
      }, 1000);
    } else if (!timerState.isRunning && sessionStartTime && activeTask) {
      const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
      if (sessionDuration > 5) {
        addSessionToTask(activeTask.id, {
          startTime: new Date(sessionStartTime).toISOString(),
          endTime: new Date().toISOString(),
          duration: sessionDuration,
          completed: false
        });
      }
      setSessionStartTime(null);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timerState.isRunning, seconds > 0, handleTimerComplete]);

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const mins = Math.floor((timeInSeconds % 3600) / 60);
    const secs = timeInSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const resetTimer = () => {
    if (activeTask) {
      setSeconds(activeTask.timerSeconds);
      updateTimerState({ 
        isRunning: false, 
        remainingTime: activeTask.timerSeconds 
      });
      setSessionStartTime(null);
    }
  };

  const handleStartPause = () => {
    if (seconds > 0 && activeTask) {
      updateTimerState({ isRunning: !timerState.isRunning });
    }
  };

  // Add manual skip function for testing/debugging
  const handleSkipTask = () => {
    if (activeSession && activeTask?.sessionId) {
      handleTimerComplete();
    }
  };

  const getProgressPercentage = () => {
    if (!activeTask || activeTask.timerSeconds === 0) return 0;
    return ((activeTask.timerSeconds - seconds) / activeTask.timerSeconds) * 100;
  };

  const getPriorityColor = () => {
    if (!activeTask) return "#f59e0b";
    const colors = {
      low: "#10b981",
      medium: "#f59e0b", 
      high: "#ef4444",
      urgent: "#8b5cf6"
    };
    return colors[activeTask.priority] || colors.medium;
  };

  const getMotivationalMessage = () => {
    if (!activeTask) return "Select a task or start a session! 🎯";
    
    const progress = getProgressPercentage();
    if (seconds === 0 && activeTask.timerSeconds > 0) return "Task completed! Great job! 🎉";
    if (seconds === activeTask.timerSeconds) return "Ready to start your focused session! 🎯";
    if (progress < 25) return "Just getting started! 🌱";
    if (progress < 50) return "Making good progress! 🚀";
    if (progress < 75) return "More than halfway there! 🔥";
    return "Almost finished! 💪";
  };

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (!activeTask) {
    return (
      <div className="text-center bg-white rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-3xl">⏱️</span>
          <h2 className="text-2xl font-bold text-gray-800">Focus Timer</h2>
        </div>
        
        <div className="text-6xl mb-4">🎯</div>
        <p className="text-lg text-gray-600 mb-4">No active task selected</p>
        <p className="text-sm text-gray-500">Create a task or start a session to begin your focused work.</p>
      </div>
    );
  }

  return (
    <div className="text-center bg-white rounded-2xl p-8 shadow-xl">
      {/* Session Info */}
      {activeSession && (
        <div className="mb-4 p-3 bg-purple-50 rounded-xl border border-purple-200">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-purple-600 font-semibold">🎯 {activeSession.name}</span>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm text-purple-600">
            <span>Task {currentSessionTaskIndex + 1} of {activeSession.tasks.length}</span>
            <span>•</span>
            <span>{activeSession.completedTasks} completed</span>
          </div>
          {/* Session Progress Bar */}
          <div className="mt-2 bg-purple-200 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(activeSession.completedTasks / activeSession.tasks.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Task Info Header */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg text-gray-800 flex-1">{activeTask.name}</h3>
          <button
            onClick={clearActiveTask}
            className="text-gray-400 hover:text-gray-600 text-sm font-medium px-2 py-1 rounded hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Priority:</span>
            <span 
              className="px-3 py-1 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: getPriorityColor() }}
            >
              {activeTask.priority.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Duration:</span>
            <span className="text-sm font-semibold text-gray-800">
              {Math.floor(activeTask.timerSeconds / 60)}min
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mb-6">
        <span className="text-3xl">⏱️</span>
        <h2 className="text-2xl font-bold text-gray-800">Focus Timer</h2>
      </div>

      {/* Timer Display */}
      <div className="mb-8">
        <div className={`text-8xl font-mono font-black mb-4 transition-all duration-500 ${
          timerState.isRunning 
            ? 'text-transparent bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text animate-pulse' 
            : seconds === 0 && activeTask.timerSeconds > 0
              ? 'text-transparent bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text'
              : 'text-gray-700'
        }`}>
          {formatTime(seconds)}
        </div>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200 mb-4">
          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
            seconds === 0 && activeTask.timerSeconds > 0 ? 'bg-yellow-500 animate-bounce' :
            timerState.isRunning ? 'bg-green-500 animate-pulse' : 
            seconds === activeTask.timerSeconds ? 'bg-blue-500' : 'bg-gray-400'
          }`}></div>
          <span className="text-sm font-semibold text-gray-600">
            {getMotivationalMessage()}
          </span>
        </div>

        {activeTask.timerSeconds > 0 && (
          <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full inline-block">
            Progress: {Math.round(getProgressPercentage())}% • {formatTime(activeTask.timerSeconds - seconds)} elapsed
          </div>
        )}
      </div>

      {/* Progress Ring */}
      <div className="relative w-32 h-32 mx-auto mb-6">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke={getPriorityColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${getProgressPercentage() * 3.14} 314`}
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">
            {seconds === 0 && activeTask.timerSeconds > 0 ? "🎉" : 
             timerState.isRunning ? "🏃‍♂️" : 
             seconds === activeTask.timerSeconds ? "🎯" : "⏸️"}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={handleStartPause}
          disabled={!activeTask || activeTask.timerSeconds === 0}
          className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            timerState.isRunning
              ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
              : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
          }`}
        >
          <span className="text-xl">
            {timerState.isRunning ? "⏸️" : "▶️"}
          </span>
          {timerState.isRunning ? "Pause" : "Start"}
        </button>

        <button
          onClick={resetTimer}
          disabled={!activeTask || (seconds === activeTask.timerSeconds && !timerState.isRunning)}
          className="px-6 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center gap-2"
        >
          <span className="text-xl">🔄</span>
          Reset
        </button>

        {/* Add Skip button for debugging/testing */}
        {activeSession && activeTask?.sessionId && process.env.NODE_ENV === 'development' && (
          <button
            onClick={handleSkipTask}
            className="px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
          >
            <span className="text-xl">⏭️</span>
            Skip
          </button>
        )}
      </div>

      {/* Next Task Preview for Sessions */}
      {activeSession && currentSessionTaskIndex < activeSession.tasks.length - 1 && (
        <div className="mt-6 p-3 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-600 mb-1">Next up:</p>
          <p className="font-medium text-blue-800">
            {activeSession.tasks[currentSessionTaskIndex + 1].name}
          </p>
          <p className="text-xs text-blue-600">
            {activeSession.tasks[currentSessionTaskIndex + 1].duration} minutes
          </p>
        </div>
      )}

      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 text-xs text-gray-400 bg-gray-100 p-2 rounded">
          Debug: seconds={seconds}, isRunning={timerState.isRunning}, 
          sessionId={activeTask?.sessionId}, sessionIndex={activeTask?.sessionIndex},
          currentIndex={currentSessionTaskIndex}
        </div>
      )}
    </div>
  );
};

export default Timer;
