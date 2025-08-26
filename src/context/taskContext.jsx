// context/taskContext.js - FIXED WITH EXTENSIVE DEBUGGING
import React, { createContext, useState, useContext, useCallback, useEffect } from "react";
import axios from "axios";

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  // ✅ Core State (no localStorage)
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [taskCompletionReports, setTaskCompletionReports] = useState([]);
  const [sessionCompletionReports, setSessionCompletionReports] = useState([]);

  // ✅ UI State
  const [showModal, setShowModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showTaskCompletionModal, setShowTaskCompletionModal] = useState(false);
  const [showTaskReportModal, setShowTaskReportModal] = useState(false);
  const [currentTaskForCompletion, setCurrentTaskForCompletion] = useState(null);
  const [currentTaskForReport, setCurrentTaskForReport] = useState(null);

  // ✅ Active Items
  const [activeTask, setActiveTask] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [currentSessionTaskIndex, setCurrentSessionTaskIndex] = useState(0);

  // ✅ Timer State (kept in context)
  const [timerState, setTimerState] = useState({
    isRunning: false,
    remainingTime: 0,
    totalTime: 0
  });
  const [sessionTimerState, setSessionTimerState] = useState({
    isRunning: false,
    elapsedTime: 0,
    totalSessionTime: 0,
    sessionStartTime: null
  });

  // ✅ API State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ API Configuration
  const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api';

  // ✅ Auth Helper
  const getAuthHeader = () => {
    const token = localStorage.getItem("taskflow-token");
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // ✅ FETCH ALL SESSIONS FROM API
  const fetchSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('taskflow-token');
      if (!token) return;

      console.log('📡 Fetching all sessions from API...');

      const response = await axios.get(`${API_BASE_URL}/sessions`, {
        headers: getAuthHeader()
      });

      if (response.data.success) {
        setSessions(response.data.data.sessions);
        console.log('✅ Sessions fetched:', response.data.data.sessions.length);
        setError(null);
      }
    } catch (err) {
      console.error('❌ Error fetching sessions:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]);

  // ✅ FETCH SINGLE SESSION BY ID AND SET AS ACTIVE - FIXED WITH DEBUGGING
  const fetchAndSetActiveSession = useCallback(async (sessionId) => {
    console.log('🔍 fetchAndSetActiveSession called with ID:', sessionId);
    console.log('🔍 Current activeSession before fetch:', activeSession);
    
    if (!sessionId || sessionId === 'undefined') {
      console.warn('⚠️ Invalid session ID provided:', sessionId);
      return null;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('taskflow-token');
      if (!token) {
        console.error('❌ No token found');
        return null;
      }

      console.log(`📡 Making API call to: ${API_BASE_URL}/sessions/${sessionId}`);

      const response = await axios.get(`${API_BASE_URL}/sessions/${sessionId}`, {
        headers: getAuthHeader()
      });

      console.log('📡 API Response:', response.data);

      if (response.data.success) {
        const sessionData = response.data.data.session;
        
        console.log('🔄 About to set activeSession with data:', sessionData);
        console.log('🔍 Session ID from response:', sessionData._id);
        console.log('🔍 Session name:', sessionData.name);
        
        // ✅ Set the active session
        setActiveSession(sessionData);
        
        console.log('✅ setActiveSession called - React should re-render now');
        
        setError(null);
        return sessionData;
      } else {
        console.error('❌ API response not successful:', response.data);
      }
    } catch (err) {
      console.error('❌ Error fetching session:', err);
      console.error('❌ Error details:', err.response?.data);
      setError(err.response?.data?.message || err.message);
      setActiveSession(null);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [API_BASE_URL]);

  // ✅ CREATE SESSION VIA API
  const createSession = useCallback(async (sessionData) => {
    try {
      setIsLoading(true);
      console.log('📡 Creating session via API...');

      const response = await axios.post(`${API_BASE_URL}/sessions`, sessionData, {
        headers: getAuthHeader()
      });

      if (response.data.success) {
        const newSession = response.data.data.session;
        setSessions(prev => [...prev, newSession]);
        console.log('✅ Session created via API:', newSession._id);
        setError(null);
        return newSession;
      }
    } catch (err) {
      console.error('❌ Error creating session:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [API_BASE_URL]);

  // ✅ CLEAR ACTIVE SESSION
  const clearActiveSession = useCallback(() => {
    console.log('🧹 Clearing active session...');
    setActiveSession(null);
    setCurrentSessionTaskIndex(0);
    setActiveTask(null);
    setTimerState({
      isRunning: false,
      remainingTime: 0,
      totalTime: 0
    });
    setSessionTimerState({
      isRunning: false,
      elapsedTime: 0,
      totalSessionTime: 0,
      sessionStartTime: null
    });
    console.log('🧹 Active session cleared');
  }, []);

  // ✅ DIRECT SET ACTIVE SESSION (for debugging/manual setting)
  const setActiveSessionDirect = useCallback((sessionData) => {
    console.log('🎯 Direct setActiveSession called with:', sessionData);
    setActiveSession(sessionData);
  }, []);

  // ✅ ADD TASK REPORT (Local state)
  const addTaskReport = useCallback((report) => {
    const newReport = {
      ...report,
      id: Date.now(),
      reportedAt: new Date().toISOString()
    };

    setTaskCompletionReports(prev => [...prev, newReport]);
    console.log('✅ Task report added:', newReport);
  }, []);

  // ✅ SESSION TASK COMPLETION
  const completeSessionTask = useCallback(() => {
    if (!activeSession || !activeTask) return;

    const nextIndex = currentSessionTaskIndex + 1;
    
    const updatedSession = {
      ...activeSession,
      completedTasks: (activeSession.completedTasks || 0) + 1
    };
    
    setActiveSession(updatedSession);
    
    if (nextIndex < activeSession.tasks.length) {
      setCurrentSessionTaskIndex(nextIndex);
      
      const nextTask = {
        ...activeSession.tasks[nextIndex],
        id: Date.now() + nextIndex,
        sessionId: activeSession._id,
        sessionIndex: nextIndex,
        timerSeconds: activeSession.tasks[nextIndex].duration * 60
      };
      
      setActiveTask(nextTask);
    } else {
      // Complete entire session
      const completedSession = {
        ...updatedSession,
        status: "completed",
        completedAt: new Date().toISOString(),
        totalTimeSpent: sessionTimerState.elapsedTime
      };
      
      setActiveSession(completedSession);
      clearActiveSession();
      
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Session Complete!', {
          body: `Congratulations! You've completed "${activeSession.name}" in ${Math.floor(completedSession.totalTimeSpent / 60)} minutes`,
          icon: '🎉'
        });
      }
    }
  }, [activeSession, activeTask, currentSessionTaskIndex, sessionTimerState, clearActiveSession]);

  // ✅ TIMER STATE UPDATES
  const updateTimerState = useCallback((newState) => {
    console.log("Context: updateTimerState called with:", newState);
    setTimerState(prev => ({ ...prev, ...newState }));
  }, []);

  const updateSessionTimerState = useCallback((newState) => {
    console.log("Context: updateSessionTimerState called with:", newState);
    setSessionTimerState(prev => ({ ...prev, ...newState }));
  }, []);

  // ✅ SESSION TIMER FUNCTIONS
  const startSessionTimer = useCallback(() => {
    if (activeSession && !sessionTimerState.sessionStartTime) {
      setSessionTimerState(prev => ({
        ...prev,
        isRunning: true,
        sessionStartTime: Date.now()
      }));
    }
  }, [activeSession, sessionTimerState.sessionStartTime]);

  const pauseSessionTimer = useCallback(() => {
    if (sessionTimerState.isRunning && sessionTimerState.sessionStartTime) {
      const elapsedTime = Math.floor((Date.now() - sessionTimerState.sessionStartTime) / 1000);
      setSessionTimerState(prev => ({
        ...prev,
        isRunning: false,
        elapsedTime: prev.elapsedTime + elapsedTime,
        sessionStartTime: null
      }));
    }
  }, [sessionTimerState.isRunning, sessionTimerState.sessionStartTime]);

  // ✅ LEGACY FUNCTIONS (for compatibility)
  const addTask = useCallback((task) => {
    const newTask = {
      ...task,
      status: "pending",
      id: Date.now(),
      timeSpent: 0,
      sessions: [],
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
  }, []);

  const addSession = useCallback((sessionData) => {
    // Use createSession API instead
    return createSession(sessionData);
  }, [createSession]);

  const updateStatus = useCallback((id, status) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, status, updatedAt: new Date().toISOString() } : task))
    );
  }, []);

  const setActiveTaskById = useCallback((taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setActiveTask(task);
      setActiveSession(null);
      setCurrentSessionTaskIndex(0);
    }
  }, [tasks]);

  const clearActiveTask = useCallback(() => {
    clearActiveSession(); // This already clears everything
  }, [clearActiveSession]);

  // ✅ COMPLETION HANDLERS
  const showTaskCompletionModalForTask = useCallback((taskData) => {
    setCurrentTaskForCompletion(taskData);
    setShowTaskCompletionModal(true);
  }, []);

  const addTaskCompletionReport = useCallback((report) => {
    const newReport = {
      ...report,
      id: Date.now(),
      reportedAt: new Date().toISOString()
    };

    setTaskCompletionReports(prev => [...prev, newReport]);

    if (activeSession && report.sessionId) {
      setActiveSession(prev => ({
        ...prev,
        taskReports: [...(prev.taskReports || []), newReport]
      }));
    }
  }, [activeSession]);

  const handleTimerComplete = useCallback((timeSpent) => {
    if (!activeTask) return;

    const completionData = {
      taskId: activeTask.id,
      taskName: activeTask.name,
      sessionId: activeTask.sessionId || null,
      sessionName: activeSession?.name || null,
      sessionTaskIndex: activeTask.sessionIndex || null,
      plannedDuration: Math.floor((activeTask.timerSeconds || 0) / 60),
      actualTimeSpent: timeSpent,
      completedAt: new Date().toISOString(),
      wasSessionTask: !!activeTask.sessionId
    };

    showTaskCompletionModalForTask(completionData);
  }, [activeTask, activeSession, showTaskCompletionModalForTask]);

  // ✅ LOAD DATA ON APP START
  useEffect(() => {
    const token = localStorage.getItem('taskflow-token');
    if (token) {
      console.log('🔄 Loading data from API on app start...');
      fetchSessions().then(() => {
        console.log('✅ Initial data load complete');
      });
    }
  }, [fetchSessions]);

  // ✅ SESSION TIMER INTERVAL
  useEffect(() => {
    let interval;
    if (sessionTimerState.isRunning && sessionTimerState.sessionStartTime) {
      interval = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - sessionTimerState.sessionStartTime) / 1000);
        setSessionTimerState(prev => ({
          ...prev,
          elapsedTime: prev.elapsedTime + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionTimerState.isRunning, sessionTimerState.sessionStartTime]);

  // ✅ CLEAR ERROR AFTER 5 SECONDS
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  // ✅ DEBUG: Track activeSession changes
  useEffect(() => {
    console.log('🎯 activeSession state changed to:', activeSession);
    if (activeSession) {
      console.log('✅ activeSession is now set with ID:', activeSession._id);
      console.log('✅ activeSession name:', activeSession.name);
    } else {
      console.log('❌ activeSession is null/undefined');
    }
  }, [activeSession]);


  // ✅ CONTEXT PROVIDER VALUE
  return (
    <TaskContext.Provider value={{
      // Data State
      tasks,
      sessions,
      taskCompletionReports,
      sessionCompletionReports,

      // Active Items
      activeTask,
      activeSession,
      currentSessionTaskIndex,

      // UI State
      showModal,
      setShowModal,
      showSessionModal,
      setShowSessionModal,
      showTaskCompletionModal,
      setShowTaskCompletionModal,
      showTaskReportModal,
      setShowTaskReportModal,
      currentTaskForCompletion,
      setCurrentTaskForCompletion,
      currentTaskForReport,
      setCurrentTaskForReport,

      // Timer State
      timerState,
      sessionTimerState,
      updateTimerState,
      updateSessionTimerState,

      // API State
      isLoading,
      error,

      // API Functions
      fetchSessions,
      fetchAndSetActiveSession,
      createSession,
      clearActiveSession,

      // Session Functions
      startSessionTimer,
      pauseSessionTimer,
      completeSessionTask,

      // Local Functions
      setActiveTask,
      setActiveSession,
      setActiveSessionDirect,  // ✅ Add direct setter for debugging
      setCurrentSessionTaskIndex,
      addTaskReport,
      addTaskCompletionReport,
      handleTimerComplete,

      // Legacy Functions (for compatibility)
      addTask,
      addSession,
      updateStatus,
      setActiveTaskById,
      clearActiveTask,

      // Helper Functions
      getAuthHeader
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
