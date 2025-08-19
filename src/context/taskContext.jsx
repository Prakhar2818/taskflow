// context/taskContext.js - FIXED VERSION WITH REPORT MODAL STATE
import React, { createContext, useState, useContext, useCallback, useEffect } from "react";

const TaskContext = createContext();

const STORAGE_KEYS = {
  TASKS: 'taskflow_tasks',
  SESSIONS: 'taskflow_sessions',
  TASK_COMPLETION_REPORTS: 'taskflow_task_completion_reports',
  SESSION_COMPLETION_REPORTS: 'taskflow_session_completion_reports',
  ACTIVE_TASK: 'taskflow_active_task',
  ACTIVE_SESSION: 'taskflow_active_session',
  SESSION_INDEX: 'taskflow_session_index',
  TIMER_STATE: 'taskflow_timer_state',
  SESSION_TIMER_STATE: 'taskflow_session_timer_state',
  LAST_SAVE: 'taskflow_last_save'
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [taskCompletionReports, setTaskCompletionReports] = useState([]);
  const [sessionCompletionReports, setSessionCompletionReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showTaskCompletionModal, setShowTaskCompletionModal] = useState(false);
  const [currentTaskForCompletion, setCurrentTaskForCompletion] = useState(null);
  
  // ✅ ADD THESE MISSING STATE VARIABLES FOR REPORT MODAL
  const [showTaskReportModal, setShowTaskReportModal] = useState(false);
  const [currentTaskForReport, setCurrentTaskForReport] = useState(null);
  
  const [activeTask, setActiveTask] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [currentSessionTaskIndex, setCurrentSessionTaskIndex] = useState(0);
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
  const [isLoading, setIsLoading] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // **FIXED: Reduced auto-save frequency to prevent conflicts**
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToLocalStorage();
    }, 2000); // Increased from 500ms to 2000ms
    return () => clearTimeout(timeoutId);
  }, [tasks, sessions, activeTask, activeSession, currentSessionTaskIndex, taskCompletionReports, sessionCompletionReports]);
  // **REMOVED: sessionTimerState and timerState from auto-save dependencies**

  // Utility functions for localStorage
  const saveToStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
    }
  };

  const getFromStorage = (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Failed to get ${key} from localStorage:`, error);
      return defaultValue;
    }
  };

  const loadFromLocalStorage = () => {
    setIsLoading(true);
    try {
      const savedTasks = getFromStorage(STORAGE_KEYS.TASKS, []);
      const savedSessions = getFromStorage(STORAGE_KEYS.SESSIONS, []);
      const savedTaskReports = getFromStorage(STORAGE_KEYS.TASK_COMPLETION_REPORTS, []);
      const savedSessionReports = getFromStorage(STORAGE_KEYS.SESSION_COMPLETION_REPORTS, []);
      const savedActiveTask = getFromStorage(STORAGE_KEYS.ACTIVE_TASK);
      const savedActiveSession = getFromStorage(STORAGE_KEYS.ACTIVE_SESSION);
      const savedSessionIndex = getFromStorage(STORAGE_KEYS.SESSION_INDEX, 0);

      if (savedTasks.length > 0) setTasks(savedTasks);
      if (savedSessions.length > 0) setSessions(savedSessions);
      if (savedTaskReports.length > 0) setTaskCompletionReports(savedTaskReports);
      if (savedSessionReports.length > 0) setSessionCompletionReports(savedSessionReports);
      if (savedActiveTask) setActiveTask(savedActiveTask);
      if (savedActiveSession) setActiveSession(savedActiveSession);
      setCurrentSessionTaskIndex(savedSessionIndex);

      // **FIXED: Don't restore timer state from localStorage - let Timer component handle it**
      console.log('Data loaded from localStorage successfully');
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToLocalStorage = () => {
    try {
      saveToStorage(STORAGE_KEYS.TASKS, tasks);
      saveToStorage(STORAGE_KEYS.SESSIONS, sessions);
      saveToStorage(STORAGE_KEYS.TASK_COMPLETION_REPORTS, taskCompletionReports);
      saveToStorage(STORAGE_KEYS.SESSION_COMPLETION_REPORTS, sessionCompletionReports);
      saveToStorage(STORAGE_KEYS.ACTIVE_TASK, activeTask);
      saveToStorage(STORAGE_KEYS.ACTIVE_SESSION, activeSession);
      saveToStorage(STORAGE_KEYS.SESSION_INDEX, currentSessionTaskIndex);
      saveToStorage(STORAGE_KEYS.LAST_SAVE, new Date().toISOString());
      // **REMOVED: Don't save timer states to localStorage**
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  };

  // ✅ ADD TASK REPORT FUNCTION (for AutoTaskReportModal)
  const addTaskReport = useCallback((report) => {
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
      
      setSessions(prev => prev.map(session => 
        session.id === report.sessionId 
          ? { ...session, taskReports: [...(session.taskReports || []), newReport] }
          : session
      ));
    }
    
    console.log('Task report added:', newReport);
  }, [activeSession]);

  // Complete session function
  const completeSession = useCallback(() => {
    if (!activeSession) return;

    const completedSession = {
      ...activeSession,
      status: "completed",
      completedTasks: activeSession.tasks.length,
      completedAt: new Date().toISOString(),
      totalTimeSpent: sessionTimerState.elapsedTime + 
        (sessionTimerState.sessionStartTime ? 
          Math.floor((Date.now() - sessionTimerState.sessionStartTime) / 1000) : 0)
    };
    
    setActiveSession(completedSession);
    setSessions(prev => prev.map(s => 
      s.id === completedSession.id ? completedSession : s
    ));
    
    setActiveTask(null);
    setCurrentSessionTaskIndex(0);
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
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Session Complete!', {
        body: `Congratulations! You've completed "${activeSession.name}" in ${Math.floor(completedSession.totalTimeSpent / 60)} minutes`,
        icon: '🎉'
      });
    }
  }, [activeSession, sessionTimerState]);

  // Complete session task function
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
        sessionId: activeSession.id,
        sessionIndex: nextIndex,
        timerSeconds: activeSession.tasks[nextIndex].duration * 60
      };
      
      setActiveTask(nextTask);
      // **FIXED: Don't reset timer state here - let Timer component handle it**
    } else {
      completeSession();
    }
  }, [activeSession, activeTask, currentSessionTaskIndex, completeSession]);

  // Other functions...
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
      
      setSessions(prev => prev.map(session => 
        session.id === report.sessionId 
          ? { ...session, taskReports: [...(session.taskReports || []), newReport] }
          : session
      ));
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

  const processTaskCompletion = useCallback((completionReport) => {
    if (!completionReport) return;

    const taskStatus = completionReport.isCompleted ? "completed" : "incomplete";
    
    if (completionReport.wasSessionTask) {
      setTasks(prev =>
        prev.map(task => 
          task.id === completionReport.taskId 
            ? { 
                ...task, 
                status: taskStatus,
                timeSpent: (task.timeSpent || 0) + completionReport.actualTimeSpent,
                completedAt: completionReport.completedAt
              }
            : task
        )
      );

      if (completionReport.isCompleted) {
        completeSessionTask();
      } else {
        const nextIndex = currentSessionTaskIndex + 1;
        
        if (nextIndex < activeSession.tasks.length) {
          setCurrentSessionTaskIndex(nextIndex);
          
          const nextTask = {
            ...activeSession.tasks[nextIndex],
            id: Date.now() + nextIndex,
            sessionId: activeSession.id,
            sessionIndex: nextIndex,
            timerSeconds: activeSession.tasks[nextIndex].duration * 60
          };
          
          setActiveTask(nextTask);
        } else {
          completeSession();
        }
      }
    } else {
      setTasks(prev =>
        prev.map(task => 
          task.id === completionReport.taskId 
            ? { 
                ...task, 
                status: taskStatus,
                timeSpent: (task.timeSpent || 0) + completionReport.actualTimeSpent,
                completedAt: completionReport.completedAt
              }
            : task
        )
      );
      
      setActiveTask(null);
    }
  }, [currentSessionTaskIndex, activeSession, completeSessionTask, completeSession]);

  // **FIXED: Simplified updateTimerState - no automatic resets**
  const updateTimerState = useCallback((newState) => {
    console.log("Context: updateTimerState called with:", newState);
    setTimerState(prev => {
      const updated = { ...prev, ...newState };
      console.log("Context: Timer state updated from", prev, "to", updated);
      return updated;
    });
  }, []);

  // Session timer functions
  const startSessionTimer = useCallback(() => {
    if (activeSession && !sessionTimerState.sessionStartTime) {
      setSessionTimerState(prev => ({
        ...prev,
        isRunning: true,
        sessionStartTime: Date.now()
      }));
    }
  }, [activeSession, sessionTimerState.sessionStartTime]);

  const updateSessionTimer = useCallback(() => {
    if (sessionTimerState.isRunning && sessionTimerState.sessionStartTime) {
      const elapsedTime = Math.floor((Date.now() - sessionTimerState.sessionStartTime) / 1000);
      setSessionTimerState(prev => ({
        ...prev,
        elapsedTime: elapsedTime
      }));
    }
  }, [sessionTimerState.isRunning, sessionTimerState.sessionStartTime]);

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

  const addSession = useCallback((sessionData) => {
    const totalSessionTime = sessionData.tasks.reduce((total, task) => total + (task.duration * 60), 0);
    
    const newSession = {
      ...sessionData,
      id: Date.now(),
      status: "pending",
      createdAt: new Date().toISOString(),
      completedTasks: 0,
      totalTime: totalSessionTime,
      taskReports: []
    };
    
    setSessions(prev => [...prev, newSession]);
    setActiveSession(newSession);
    setCurrentSessionTaskIndex(0);
    
    setSessionTimerState({
      isRunning: false,
      elapsedTime: 0,
      totalSessionTime: totalSessionTime,
      sessionStartTime: null
    });
    
    if (newSession.tasks.length > 0) {
      const firstTask = {
        ...newSession.tasks[0],
        id: Date.now(),
        sessionId: newSession.id,
        sessionIndex: 0,
        timerSeconds: newSession.tasks[0].duration * 60 // ✅ FIXED: Use first task duration
      };
      setActiveTask(firstTask);
      // **FIXED: Don't set timer state here - let Timer component handle it**
    }
  }, []);

  // Session timer interval
  useEffect(() => {
    let interval;
    if (sessionTimerState.isRunning) {
      interval = setInterval(updateSessionTimer, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionTimerState.isRunning, updateSessionTimer]);

  // Rest of existing functions...
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
      // **FIXED: Don't reset timer/session states here**
    }
  }, [tasks]);

  const clearActiveTask = useCallback(() => {
    setActiveTask(null);
    setActiveSession(null);
    setCurrentSessionTaskIndex(0);
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
  }, []);

  const addSessionToTask = useCallback((taskId, sessionData) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              sessions: [...(task.sessions || []), sessionData],
              timeSpent: (task.timeSpent || 0) + sessionData.duration,
              updatedAt: new Date().toISOString()
            }
          : task
      )
    );
  }, []);

  const deleteTask = useCallback((taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    if (activeTask && activeTask.id === taskId) {
      clearActiveTask();
    }
  }, [activeTask, clearActiveTask]);

  const clearLocalStorage = useCallback(() => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      
      setTasks([]);
      setSessions([]);
      setTaskCompletionReports([]);
      setSessionCompletionReports([]);
      setActiveTask(null);
      setActiveSession(null);
      setCurrentSessionTaskIndex(0);
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
      
      console.log('localStorage cleared successfully');
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }, []);

  const exportData = useCallback(() => {
    const data = {
      tasks,
      sessions,
      taskCompletionReports,
      sessionCompletionReports,
      activeTask,
      activeSession,
      currentSessionTaskIndex,
      exportedAt: new Date().toISOString(),
      version: '1.2'
    };
    return JSON.stringify(data, null, 2);
  }, [tasks, sessions, taskCompletionReports, sessionCompletionReports, activeTask, activeSession, currentSessionTaskIndex]);

  const importData = useCallback((jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      
      if (data.tasks) setTasks(data.tasks);
      if (data.sessions) setSessions(data.sessions);
      if (data.taskCompletionReports) setTaskCompletionReports(data.taskCompletionReports);
      if (data.sessionCompletionReports) setSessionCompletionReports(data.sessionCompletionReports);
      if (data.activeTask) setActiveTask(data.activeTask);
      if (data.activeSession) setActiveSession(data.activeSession);
      if (data.currentSessionTaskIndex !== undefined) {
        setCurrentSessionTaskIndex(data.currentSessionTaskIndex);
      }
      
      setTimeout(saveToLocalStorage, 100);
      
      console.log('Data imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }, []);

  return (
    <TaskContext.Provider value={{ 
      tasks, 
      sessions,
      taskCompletionReports,
      sessionCompletionReports,
      addTask, 
      updateStatus, 
      deleteTask,
      showModal, 
      setShowModal,
      showSessionModal,
      setShowSessionModal,
      showTaskCompletionModal,
      setShowTaskCompletionModal,
      currentTaskForCompletion,
      
      // ✅ ADD THESE TO THE PROVIDER VALUE
      showTaskReportModal,
      setShowTaskReportModal,
      currentTaskForReport,
      setCurrentTaskForReport,
      addTaskReport, // ✅ Add this function too
      
      activeTask,
      setActiveTask,
      setActiveTaskById,
      clearActiveTask,
      activeSession,
      addSession,
      currentSessionTaskIndex,
      completeSessionTask,
      timerState,
      updateTimerState,
      sessionTimerState,
      startSessionTimer,
      pauseSessionTimer,
      addSessionToTask,
      handleTimerComplete,
      addTaskCompletionReport,
      processTaskCompletion,
      isLoading,
      saveToLocalStorage,
      loadFromLocalStorage,
      clearLocalStorage,
      exportData,
      importData
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => useContext(TaskContext);
