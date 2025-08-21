// components/Timer.jsx - FIXED TO PREVENT MULTIPLE ALERTS
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTaskContext } from "../context/taskContext";
import AutoTaskReportModal from "./AutoTaskReportModal";

const Timer = () => {
  const {
    activeTask,
    activeSession,
    currentSessionTaskIndex,
    updateTimerState,
    handleTimerComplete,
    addSessionToTask,
    clearActiveTask,
    setShowTaskReportModal,
    setCurrentTaskForReport,
    setActiveTask,
    setCurrentSessionTaskIndex
  } = useTaskContext();

  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [totalTime, setTotalTime] = useState(0);

  // ✅ ADD REFS TO PREVENT MULTIPLE EXECUTIONS
  const timerRef = useRef(null);
  const completionHandledRef = useRef(false);
  const taskIdRef = useRef(null);

  // ✅ CLEANUP FUNCTION
  const cleanupTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ✅ FIXED: Initialize timer with cleanup
  useEffect(() => {
    console.log("Timer: Context state changed");
    
    // Reset completion flag when task changes
    if (activeTask?.id !== taskIdRef.current) {
      completionHandledRef.current = false;
      taskIdRef.current = activeTask?.id || null;
      console.log("Timer: New task, resetting completion flag");
    }

    // Initialize from session
    if (activeSession && !activeTask && activeSession.tasks?.length > 0) {
      const currentTask = activeSession.tasks[currentSessionTaskIndex];
      if (currentTask) {
        console.log("Timer: Setting active task from session:", currentTask.name);
        
        const taskWithTimer = {
          ...currentTask,
          id: `session-${activeSession._id}-task-${currentSessionTaskIndex}`, // ✅ Consistent ID
          sessionId: activeSession._id,
          sessionIndex: currentSessionTaskIndex,
          timerSeconds: currentTask.duration * 60
        };
        
        setActiveTask(taskWithTimer);
      }
    }

    // Initialize timer for active task
    if (activeTask && activeTask.id === taskIdRef.current) {
      const taskDuration = activeTask.timerSeconds || (activeTask.duration * 60) || 60;
      console.log("Timer: Initializing for task:", activeTask.name, "Duration:", taskDuration);

      // ✅ CLEANUP PREVIOUS TIMER
      cleanupTimer();
      
      setSeconds(taskDuration);
      setTotalTime(taskDuration);
      setIsRunning(false);
      setSessionStartTime(null);
      completionHandledRef.current = false; // ✅ Reset completion flag
    }

    // ✅ CLEANUP ON UNMOUNT OR TASK CHANGE
    return () => {
      cleanupTimer();
    };
  }, [activeSession, activeTask, currentSessionTaskIndex, setActiveTask, cleanupTimer]);

  // ✅ FIXED: Single timer completion handler with prevention
  const onTimerComplete = useCallback(() => {
    // ✅ PREVENT MULTIPLE EXECUTIONS
    if (completionHandledRef.current) {
      console.log("Timer: Completion already handled, ignoring");
      return;
    }

    console.log("Timer: Handling completion for task:", activeTask?.name);
    completionHandledRef.current = true; // ✅ Mark as handled immediately

    // ✅ CLEANUP TIMER FIRST
    cleanupTimer();
    setIsRunning(false);

    if (activeTask && sessionStartTime) {
      const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);

      // ✅ SINGLE NOTIFICATION
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Timer Completed!', {
          body: `Time's up! Please report on "${activeTask?.name}"`,
          icon: '⏰'
        });
      }

      // Prepare task data for report
      const taskForReport = {
        ...activeTask,
        actualTimeSpent: timeSpent,
        completedAt: new Date().toISOString(),
        sessionId: activeSession?._id || null,
        wasSessionTask: !!activeTask.sessionId
      };

      console.log("Timer: Opening report modal for:", taskForReport.taskName);

      // Show report modal
      setCurrentTaskForReport(taskForReport);
      setShowTaskReportModal(true);

      // Handle session tasks
      if (activeTask.sessionId) {
        addSessionToTask(activeTask.id, {
          startTime: new Date(sessionStartTime).toISOString(),
          endTime: new Date().toISOString(),
          duration: timeSpent,
          completed: true
        });
      }

      setSessionStartTime(null);

      // ✅ SINGLE CALL TO HANDLE TIMER COMPLETE
      if (handleTimerComplete) {
        handleTimerComplete(timeSpent);
      }
    }
  }, [activeTask, sessionStartTime, addSessionToTask, handleTimerComplete, activeSession, setCurrentTaskForReport, setShowTaskReportModal, cleanupTimer]);

  // ✅ FIXED: Single timer effect with proper cleanup
  useEffect(() => {
    // ✅ CLEANUP PREVIOUS TIMER
    cleanupTimer();

    if (isRunning && seconds > 0 && activeTask) {
      console.log("Timer: Starting new interval for", seconds, "seconds");

      if (!sessionStartTime) {
        setSessionStartTime(Date.now());
      }

      timerRef.current = setInterval(() => {
        setSeconds((prevSeconds) => {
          const newSeconds = prevSeconds - 1;
          
          console.log("Timer: Tick -", newSeconds, "seconds remaining");

          // Update context
          if (updateTimerState) {
            updateTimerState({
              remainingTime: newSeconds,
              totalTime: totalTime,
              isRunning: true
            });
          }

          // ✅ HANDLE COMPLETION ONLY ONCE
          if (newSeconds <= 0 && !completionHandledRef.current) {
            console.log("Timer: Reached zero, completing...");
            setTimeout(() => onTimerComplete(), 100);
            return 0;
          }
          
          return newSeconds;
        });
      }, 1000);
    }

    // ✅ CLEANUP ON EFFECT CHANGE
    return () => {
      cleanupTimer();
    };
  }, [isRunning, activeTask?.id, totalTime, updateTimerState, onTimerComplete, cleanupTimer]); // ✅ Include task ID to restart on task change

  // ✅ CLEANUP ON COMPONENT UNMOUNT
  useEffect(() => {
    return () => {
      cleanupTimer();
    };
  }, [cleanupTimer]);

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
    console.log("Timer: Reset clicked");
    cleanupTimer();
    completionHandledRef.current = false; // ✅ Reset completion flag
    
    const taskDuration = activeTask?.timerSeconds || (activeTask?.duration * 60) || 60;
    setSeconds(taskDuration);
    setTotalTime(taskDuration);
    setIsRunning(false);
    setSessionStartTime(null);
  };

  const handleStartPause = () => {
    if (!activeTask) {
      alert("No task selected");
      return;
    }

    if (seconds <= 0) {
      resetTimer();
      return;
    }

    const newState = !isRunning;
    console.log("Timer: Setting isRunning to:", newState);
    setIsRunning(newState);
  };

  // ✅ FIXED: Manual complete with prevention
  const handleManualComplete = () => {
    if (completionHandledRef.current) {
      console.log("Timer: Manual completion already handled");
      return;
    }

    console.log("Timer: Manual completion triggered");
    cleanupTimer();
    setIsRunning(false);

    if (activeTask) {
      const timeSpent = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 0;

      const taskForReport = {
        ...activeTask,
        actualTimeSpent: timeSpent,
        completedAt: new Date().toISOString(),
        sessionId: activeSession?._id || null,
        wasSessionTask: !!activeTask.sessionId
      };

      completionHandledRef.current = true; // ✅ Mark as handled

      setCurrentTaskForReport(taskForReport);
      setShowTaskReportModal(true);

      if (handleTimerComplete) {
        handleTimerComplete(timeSpent);
      }
    }
  };

  // ✅ REST OF YOUR COMPONENT CODE STAYS THE SAME...
  const getProgressPercentage = () => {
    if (totalTime === 0) return 0;
    return ((totalTime - seconds) / totalTime) * 100;
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
    if (seconds === 0) return "Time's up! Please submit your report 📊";
    if (isRunning) return "Focus mode active! Keep going! 🚀";
    if (seconds === totalTime) return "Ready to start your focused session! 🎯";
    return "Paused - ready to continue! ⏸️";
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (!activeTask) {
    return (
      <>
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-3xl">⏱️</span>
            <h2 className="text-2xl font-bold text-gray-800">Focus Timer</h2>
          </div>
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-lg text-gray-600 mb-4">No active task selected</p>
          <p className="text-sm text-gray-500">
            {activeSession 
              ? "Session loaded - timer will start automatically"
              : "Create a task or start a session to begin your focused work."
            }
          </p>
        </div>

        <AutoTaskReportModal />
      </>
    );
  }

  return (
    <>
      <div className="text-center bg-white rounded-2xl p-8 shadow-xl">
        {/* ✅ YOUR EXISTING JSX FOR TIMER DISPLAY */}
        {/* Session Info */}
        {activeSession && (
          <div className="mb-4 p-3 bg-purple-50 rounded-xl border border-purple-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-purple-600 font-semibold">🎯 {activeSession.name}</span>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-purple-600">
              <span>Task {currentSessionTaskIndex + 1} of {activeSession.tasks?.length || 0}</span>
              <span>•</span>
              <span>{activeSession.completedTasks || 0} completed</span>
            </div>
            <div className="mt-2 bg-purple-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${activeSession.tasks?.length > 0 ? ((activeSession.completedTasks || 0) / activeSession.tasks.length) * 100 : 0}%`
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Task Header */}
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
                {activeTask.priority?.toUpperCase() || 'MEDIUM'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Duration:</span>
              <span className="text-sm font-semibold text-gray-800">
                {Math.max(1, Math.floor(totalTime / 60))} min
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
          <div className={`text-5xl font-mono font-black mb-4 transition-all duration-500 ${
            isRunning
              ? 'text-transparent bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text animate-pulse'
              : seconds === 0
                ? 'text-transparent bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text animate-bounce'
                : 'text-gray-700'
          }`}>
            {formatTime(seconds)}
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200 mb-4">
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
              seconds === 0 ? 'bg-orange-500 animate-bounce' :
              isRunning ? 'bg-green-500 animate-pulse' : 'bg-blue-500'
            }`}></div>
            <span className="text-sm font-semibold text-gray-600">
              {getMotivationalMessage()}
            </span>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="50" fill="none"
              stroke={seconds === 0 ? "#f97316" : getPriorityColor()}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${getProgressPercentage() * 3.14} 314`}
              className="transition-all duration-1000 ease-in-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">
              {seconds === 0 ? "📊" : isRunning ? "🏃‍♂️" : "⏸️"}
            </span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={handleStartPause}
            disabled={!activeTask}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isRunning
                ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
                : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            }`}
          >
            <span className="text-xl">{isRunning ? "⏸️" : "▶️"}</span>
            {isRunning ? "Pause" : "Start"}
          </button>

          <button
            onClick={resetTimer}
            disabled={!activeTask}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center gap-2"
          >
            <span className="text-xl">🔄</span>
            Reset
          </button>

          {seconds === 0 && (
            <button
              onClick={handleManualComplete}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
            >
              <span className="text-xl">📊</span>
              Submit Report
            </button>
          )}

          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={handleManualComplete}
              className="px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
            >
              <span className="text-xl">🧪</span>
              Test Complete
            </button>
          )}
        </div>
      </div>

      <AutoTaskReportModal />
    </>
  );
};

export default Timer;
