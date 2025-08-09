import React, { createContext, useState, useContext, useCallback, useEffect } from "react";

const TaskContext = createContext();

const STORAGE_KEYS = {
  TASKS: 'taskflow_tasks',
  SESSIONS: 'taskflow_sessions',
  ACTIVE_TASK: 'taskflow_active_task',
  ACTIVE_SESSION: 'taskflow_active_session',
  SESSION_INDEX: 'taskflow_session_index',
  TIMER_STATE: 'taskflow_timer_state',
  LAST_SAVE: 'taskflow_last_save'
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [currentSessionTaskIndex, setCurrentSessionTaskIndex] = useState(0);
  const [timerState, setTimerState] = useState({
    isRunning: false,
    remainingTime: 0,
    totalTime: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // Auto-save to localStorage when data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToLocalStorage();
    }, 500); // Debounce by 500ms

    return () => clearTimeout(timeoutId);
  }, [tasks, sessions, activeTask, activeSession, currentSessionTaskIndex]);

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
      // Load tasks
      const savedTasks = getFromStorage(STORAGE_KEYS.TASKS, []);
      if (savedTasks.length > 0) {
        setTasks(savedTasks);
      }

      // Load sessions
      const savedSessions = getFromStorage(STORAGE_KEYS.SESSIONS, []);
      if (savedSessions.length > 0) {
        setSessions(savedSessions);
      }

      // Load active task
      const savedActiveTask = getFromStorage(STORAGE_KEYS.ACTIVE_TASK);
      if (savedActiveTask) {
        setActiveTask(savedActiveTask);
      }

      // Load active session
      const savedActiveSession = getFromStorage(STORAGE_KEYS.ACTIVE_SESSION);
      if (savedActiveSession) {
        setActiveSession(savedActiveSession);
      }

      // Load session index
      const savedSessionIndex = getFromStorage(STORAGE_KEYS.SESSION_INDEX, 0);
      setCurrentSessionTaskIndex(savedSessionIndex);

      // Load timer state (but don't restore running state)
      const savedTimerState = getFromStorage(STORAGE_KEYS.TIMER_STATE);
      if (savedTimerState) {
        setTimerState({
          ...savedTimerState,
          isRunning: false // Never restore running state
        });
      }

      console.log('Data loaded from localStorage successfully');
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToLocalStorage = () => {
    try {
      // Save all data to localStorage
      saveToStorage(STORAGE_KEYS.TASKS, tasks);
      saveToStorage(STORAGE_KEYS.SESSIONS, sessions);
      saveToStorage(STORAGE_KEYS.ACTIVE_TASK, activeTask);
      saveToStorage(STORAGE_KEYS.ACTIVE_SESSION, activeSession);
      saveToStorage(STORAGE_KEYS.SESSION_INDEX, currentSessionTaskIndex);
      saveToStorage(STORAGE_KEYS.TIMER_STATE, {
        ...timerState,
        isRunning: false // Don't save running state
      });
      saveToStorage(STORAGE_KEYS.LAST_SAVE, new Date().toISOString());

      console.log('Data saved to localStorage successfully');
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  };

  // Clear all localStorage data
  const clearLocalStorage = useCallback(() => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Reset state
      setTasks([]);
      setSessions([]);
      setActiveTask(null);
      setActiveSession(null);
      setCurrentSessionTaskIndex(0);
      setTimerState({
        isRunning: false,
        remainingTime: 0,
        totalTime: 0
      });
      
      console.log('localStorage cleared successfully');
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }, []);

  // Export data for backup
  const exportData = useCallback(() => {
    const data = {
      tasks,
      sessions,
      activeTask,
      activeSession,
      currentSessionTaskIndex,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(data, null, 2);
  }, [tasks, sessions, activeTask, activeSession, currentSessionTaskIndex]);

  // Import data from backup
  const importData = useCallback((jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      
      if (data.tasks) setTasks(data.tasks);
      if (data.sessions) setSessions(data.sessions);
      if (data.activeTask) setActiveTask(data.activeTask);
      if (data.activeSession) setActiveSession(data.activeSession);
      if (data.currentSessionTaskIndex !== undefined) {
        setCurrentSessionTaskIndex(data.currentSessionTaskIndex);
      }
      
      // Force save to localStorage
      setTimeout(saveToLocalStorage, 100);
      
      console.log('Data imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }, []);

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
    const newSession = {
      ...sessionData,
      id: Date.now(),
      status: "pending",
      createdAt: new Date().toISOString(),
      completedTasks: 0,
      totalTime: sessionData.tasks.reduce((total, task) => total + (task.duration * 60), 0)
    };
    
    setSessions(prev => [...prev, newSession]);
    setActiveSession(newSession);
    setCurrentSessionTaskIndex(0);
    
    // Set first task as active
    if (newSession.tasks.length > 0) {
      const firstTask = {
        ...newSession.tasks[0],
        id: Date.now(),
        sessionId: newSession.id,
        sessionIndex: 0
      };
      setActiveTask(firstTask);
      setTimerState({
        isRunning: false,
        remainingTime: firstTask.timerSeconds,
        totalTime: firstTask.timerSeconds
      });
    }
  }, []);

  const completeSessionTask = useCallback(() => {
    if (!activeSession || !activeTask) {
      return;
    }

    const nextIndex = currentSessionTaskIndex + 1;
    
    // Update session progress
    const updatedSession = {
      ...activeSession,
      completedTasks: activeSession.completedTasks + 1
    };
    
    setActiveSession(updatedSession);
    
    if (nextIndex < activeSession.tasks.length) {
      // Move to next task in session
      setCurrentSessionTaskIndex(nextIndex);
      
      const nextTask = {
        ...activeSession.tasks[nextIndex],
        id: Date.now() + nextIndex,
        sessionId: activeSession.id,
        sessionIndex: nextIndex
      };
      
      setActiveTask(nextTask);
      setTimerState({
        isRunning: false,
        remainingTime: nextTask.timerSeconds,
        totalTime: nextTask.timerSeconds
      });
    } else {
      // Session completed
      const completedSession = {
        ...updatedSession,
        status: "completed",
        completedTasks: updatedSession.tasks.length,
        completedAt: new Date().toISOString()
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
      
      // Show session completion notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Session Complete!', {
          body: `Congratulations! You've completed all tasks in "${activeSession.name}"`,
          icon: '🎉'
        });
      }
    }
  }, [activeSession, activeTask, currentSessionTaskIndex]);

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
      setTimerState({
        isRunning: false,
        remainingTime: task.timerSeconds,
        totalTime: task.timerSeconds
      });
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
  }, []);

  const updateTimerState = useCallback((newState) => {
    setTimerState(prev => ({ ...prev, ...newState }));
  }, []);

  const completeTask = useCallback((taskId, timeSpent) => {
    setTasks(prev =>
      prev.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: "completed", 
              timeSpent: (task.timeSpent || 0) + timeSpent,
              completedAt: new Date().toISOString()
            }
          : task
      )
    );

    // Check if this is a session task
    if (activeSession && activeTask && activeTask.sessionId) {
      completeSessionTask();
    } else {
      setActiveTask(null);
      setTimerState({
        isRunning: false,
        remainingTime: 0,
        totalTime: 0
      });
    }
  }, [activeSession, activeTask, completeSessionTask]);

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

  return (
    <TaskContext.Provider value={{ 
      tasks, 
      sessions,
      addTask, 
      updateStatus, 
      deleteTask,
      showModal, 
      setShowModal,
      showSessionModal,
      setShowSessionModal,
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
      completeTask,
      addSessionToTask,
      // localStorage utilities
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
