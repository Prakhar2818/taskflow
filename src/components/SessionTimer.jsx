// components/SessionTimer.jsx - FIXED TO PREVENT MULTIPLE API CALLS
import React, { useState, useEffect, useRef } from 'react';
import { useTaskContext } from '../context/taskContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SessionTimer = () => {
  const {
    activeSession,
    currentSessionTaskIndex = 0,
    sessionTimerState = {},
    timerState = {},
    updateActiveSession
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

  const navigate = useNavigate();

  const [currentSessionTime, setCurrentSessionTime] = useState(0);
  const [isUpdatingSession, setIsUpdatingSession] = useState(false);

  // ✅ ADD REFS TO PREVENT MULTIPLE EXECUTIONS
  const completionHandledRef = useRef(false);
  const autoSaveIntervalRef = useRef(null);
  const updateInProgressRef = useRef(false);
  const sessionIdRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api';

  // ✅ RESET FLAGS WHEN SESSION CHANGES
  useEffect(() => {
    if (activeSession?._id !== sessionIdRef.current) {
      completionHandledRef.current = false;
      updateInProgressRef.current = false;
      sessionIdRef.current = activeSession?._id || null;
      console.log('SessionTimer: New session, resetting flags');
    }
  }, [activeSession?._id]);

  // Calculate total session time from tasks
  const calculateTotalSessionTime = () => {
    if (!activeSession?.tasks) return 0;
    return activeSession.tasks.reduce((total, task) => total + (task.duration * 60 || 0), 0);
  };

  // ✅ IMPROVED: Update Session API with duplicate prevention
  const updateSessionAPI = async (updates, showSuccess = false) => {
    if (!activeSession?._id || isUpdatingSession || updateInProgressRef.current) {
      console.log('SessionTimer: Update already in progress, skipping...');
      return null;
    }

    updateInProgressRef.current = true;
    setIsUpdatingSession(true);

    try {
      const token = localStorage.getItem('taskflow-token');
      console.log(`📡 SessionTimer: Updating session ${activeSession._id}:`, updates);

      const response = await axios.put(`${API_BASE_URL}/sessions/${activeSession._id}`, updates, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        console.log('✅ SessionTimer: Session updated successfully');

        if (showSuccess) {
          console.log('🎉 Session completed via SessionTimer!');
        }

        if (updateActiveSession) {
          updateActiveSession(response.data.data.session);
        }

        return response.data.data.session;
      }
    } catch (error) {
      console.error('❌ SessionTimer: Error updating session:', error);
    } finally {
      setIsUpdatingSession(false);
      updateInProgressRef.current = false;
    }
    return null;
  };

  // ✅ Session Start Handler
  const handleSessionStart = async () => {
    if (activeSession?.status === 'pending') {
      await updateSessionAPI({
        status: 'in-progress',
        startedAt: new Date()
      });
    }
  };

  // ✅ SINGLE Session Completion Handler with prevention
  const handleSessionComplete = async () => {
    if (completionHandledRef.current || !activeSession || activeSession.status === 'completed') {
      console.log('SessionTimer: Session completion already handled or session already completed');
      return;
    }

    console.log('SessionTimer: Handling session completion');
    completionHandledRef.current = true;

    const completionData = {
      status: 'completed',
      actualTime: currentSessionTime,
      completedAt: new Date(),
      completedTasks: activeSession.tasks?.length || 0
    };

    const updatedSession = await updateSessionAPI(completionData, true);

    if (updatedSession) {
      console.log('✅ SessionTimer: Session completed, navigating to dashboard in 2 seconds');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  };

  // ✅ Session Cancellation Handler
  const handleSessionCancel = async () => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this session?');

    if (confirmCancel && activeSession?.status !== 'completed') {
      await updateSessionAPI({
        status: 'cancelled',
        actualTime: currentSessionTime,
        completedAt: new Date()
      });

      navigate('/dashboard');
    }
  };

  // ✅ Better remaining time calculation
  const getSmartRemainingTime = () => {
    if (!activeSession?.tasks) return 0;

    let totalRemainingTime = 0;

    // Add remaining time for current task
    if (currentSessionTaskIndex < activeSession.tasks.length) {
      if (taskIsRunning && remainingTime > 0) {
        totalRemainingTime += remainingTime;
      } else {
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

  // ✅ SIMPLIFIED: Initialize session time
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

  // ✅ SIMPLIFIED AND DEBOUNCED: Single completion detection
  useEffect(() => {
    if (completionHandledRef.current || !activeSession || activeSession.status === 'completed') {
      return;
    }

    // ✅ DEBOUNCE: Only check completion every 3 seconds when timer is running
    if (isRunning || taskIsRunning) {
      const timeoutId = setTimeout(() => {
        const allTasksCompleted = (activeSession.completedTasks || 0) >= (activeSession.tasks?.length || 0);
        const timeExceeded = currentSessionTime >= effectiveTotalSessionTime && effectiveTotalSessionTime > 0;
        const noTimeRemaining = getSmartRemainingTime() <= 0;

        if (allTasksCompleted || timeExceeded || (noTimeRemaining && remainingTime <= 0)) {
          console.log('SessionTimer: Session completion detected via debounced check');
          handleSessionComplete();
        }
      }, 3000); // ✅ Check every 3 seconds instead of every render

      return () => clearTimeout(timeoutId);
    }
  }, [
    currentSessionTime,
    effectiveTotalSessionTime,
    activeSession?.completedTasks,
    activeSession?.tasks?.length,
    activeSession?.status,
    isRunning,
    taskIsRunning,
    remainingTime
  ]);

  // ✅ FIXED: Update current session time with proper cleanup
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

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, taskIsRunning, sessionStartTime, elapsedTime, activeSession?._id]);

  // ✅ IMPROVED: Auto-save with proper cleanup and prevention
  useEffect(() => {
    if (!activeSession || activeSession.status === 'completed') {
      // ✅ CLEANUP existing interval
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
      return;
    }

    // ✅ CLEANUP previous interval before creating new one
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    // ✅ CREATE new auto-save interval
    autoSaveIntervalRef.current = setInterval(async () => {
      if ((isRunning || taskIsRunning) && currentSessionTime > 0 && !updateInProgressRef.current) {
        console.log('💾 Auto-saving session progress...');
        await updateSessionAPI({
          actualTime: currentSessionTime
        });
      }
    }, 5 * 60 * 1000); // ✅ Auto-save every 5 minutes instead of 2

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
    };
  }, [activeSession?._id, activeSession?.status, isRunning, taskIsRunning]);

  // ✅ Start session when timer starts
  useEffect(() => {
    if ((isRunning || taskIsRunning) && activeSession?.status === 'pending') {
      handleSessionStart();
    }
  }, [isRunning, taskIsRunning, activeSession?.status]);

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

  const getRemainingTime = () => {
    return getSmartRemainingTime();
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
          <div className={`w-3 h-3 rounded-full ${(isRunning || taskIsRunning) ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            activeSession.status === 'completed' ? 'bg-green-100 text-green-800' :
            activeSession.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
            'bg-purple-100 text-purple-800'
          }`}>
            {activeSession.status || 'pending'}
          </span>
          {isUpdatingSession && (
            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          )}
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

      {/* Session Control Buttons */}
      <div className="flex justify-center gap-3 mb-6">
        {activeSession.status === 'in-progress' && (
          <>
            <button
              onClick={handleSessionComplete}
              disabled={isUpdatingSession || completionHandledRef.current}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
            >
              <span>✅</span>
              Complete Session
            </button>
            <button
              onClick={handleSessionCancel}
              disabled={isUpdatingSession}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
            >
              <span>❌</span>
              Cancel Session
            </button>
          </>
        )}
      </div>

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

        {/* Remaining Time */}
        <div className="text-center bg-white/50 rounded-xl p-4">
          <p className="text-sm font-medium text-purple-600 mb-2">Time Remaining</p>
          <p className="text-3xl font-bold text-purple-800 font-mono">
            {formatTime(Math.max(0, getRemainingTime()))}
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
            <p className="text-xs text-purple-600">Status</p>
            <p className="text-lg font-bold text-blue-600">
              {activeSession.status || 'Pending'}
            </p>
          </div>
          <div>
            <p className="text-xs text-purple-600">Efficiency</p>
            <p className="text-lg font-bold text-orange-600">
              {effectiveTotalSessionTime > 0
                ? Math.round((effectiveTotalSessionTime / Math.max(displayTime, 1)) * 100)
                : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 text-xs text-gray-500 bg-gray-100 p-2 rounded">
          <div>Debug Info:</div>
          <div>Session ID: {activeSession._id}</div>
          <div>Status: {activeSession.status}</div>
          <div>Current Time: {formatTime(currentSessionTime)}</div>
          <div>Remaining: {formatTime(getRemainingTime())}</div>
          <div>Task Running: {taskIsRunning ? 'Yes' : 'No'}</div>
          <div>Session Running: {isRunning ? 'Yes' : 'No'}</div>
          <div>Updating: {isUpdatingSession ? 'Yes' : 'No'}</div>
          <div>Completion Handled: {completionHandledRef.current ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};

export default SessionTimer;
