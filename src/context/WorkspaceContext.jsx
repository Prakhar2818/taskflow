// src/context/WorkspaceContext.jsx - COMPLETE VERSION
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const WorkspaceContext = createContext(null);

export const WorkspaceProvider = ({ children }) => {
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [allWorkspaces, setAllWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api';

  // ✅ Clear localStorage function
  const clearWorkspaceStorage = () => {
    localStorage.removeItem('taskflow-current-workspace');
    localStorage.removeItem('taskflow-current-user-role');
    localStorage.removeItem('taskflow-all-workspaces');
  };

  // ✅ Load from localStorage
  const loadFromStorage = () => {
    try {
      const savedCurrentWorkspace = localStorage.getItem('taskflow-current-workspace');
      const savedUserRole = localStorage.getItem('taskflow-current-user-role');
      const savedAllWorkspaces = localStorage.getItem('taskflow-all-workspaces');
      
      console.log('🔍 Loading workspaces from localStorage');

      if (savedCurrentWorkspace && savedUserRole) {
        setCurrentWorkspace(JSON.parse(savedCurrentWorkspace));
        setUserRole(savedUserRole);
      }

      if (savedAllWorkspaces) {
        setAllWorkspaces(JSON.parse(savedAllWorkspaces));
      }
    } catch (error) {
      console.error('Error loading workspace data from localStorage:', error);
      clearWorkspaceStorage();
    }
  };

  // ✅ Initialize workspace context
  useEffect(() => {
    const initializeWorkspace = async () => {
      try {
        const token = localStorage.getItem('taskflow-token');
        
        if (!token) {
          // No token, load from localStorage only
          loadFromStorage();
          return;
        }

        // Try API first
        console.log('🔄 Initializing workspace from API...');
        await loadAllWorkspaces();
        
        // If API didn't set currentWorkspace, try localStorage
        if (!currentWorkspace) {
          console.log('🔄 No current workspace from API, trying localStorage...');
          loadFromStorage();
        }
        
      } catch (error) {
        console.error('❌ Error during workspace initialization:', error);
        // Fallback to localStorage on API error
        loadFromStorage();
      } finally {
        setInitialized(true);
        setLoading(false);
      }
    };

    initializeWorkspace();
  }, []); // Empty dependency array - run once on mount

  // ✅ Save current workspace to localStorage
  useEffect(() => {
    if (initialized) {
      if (currentWorkspace) {
        localStorage.setItem('taskflow-current-workspace', JSON.stringify(currentWorkspace));
      } else {
        localStorage.removeItem('taskflow-current-workspace');
      }
    }
  }, [currentWorkspace, initialized]);

  // ✅ Save user role to localStorage
  useEffect(() => {
    if (initialized) {
      if (userRole) {
        localStorage.setItem('taskflow-current-user-role', userRole);
      } else {
        localStorage.removeItem('taskflow-current-user-role');
      }
    }
  }, [userRole, initialized]);

  // ✅ Save all workspaces to localStorage
  useEffect(() => {
    if (initialized) {
      if (allWorkspaces.length > 0) {
        localStorage.setItem('taskflow-all-workspaces', JSON.stringify(allWorkspaces));
      } else {
        localStorage.removeItem('taskflow-all-workspaces');
      }
    }
  }, [allWorkspaces, initialized]);

  // ✅ Load all user workspaces from API
  const loadAllWorkspaces = async () => {
    try {
      const token = localStorage.getItem('taskflow-token');
      if (!token) {
        console.log('❌ No token available for loadAllWorkspaces');
        return;
      }

      console.log('📡 Fetching workspaces from API...');
      const response = await axios.get(`${API_BASE_URL}/workspaces/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Workspaces API response:', response.data);
      
      if (response.data.success) {
        const workspaces = response.data.data.workspaces || [];
        setAllWorkspaces(workspaces);
        
        // Multiple fallback strategies for currentWorkspace
        let workspaceToSet = null;
        let roleToSet = null;

        // Strategy 1: Find workspace marked as current
        const markedCurrent = workspaces.find(w => w.isCurrentWorkspace);
        if (markedCurrent) {
          workspaceToSet = markedCurrent.workspace;
          roleToSet = markedCurrent.userRole;
          console.log('✅ Found marked current workspace:', markedCurrent.workspace.name);
        }
        
        // Strategy 2: If no current workspace, use the first one
        else if (workspaces.length > 0) {
          workspaceToSet = workspaces[0].workspace;
          roleToSet = workspaces[0].userRole;
          console.log('✅ Using first workspace as current:', workspaces[0].workspace.name);
        }

        if (workspaceToSet) {
          setCurrentWorkspace(workspaceToSet);
          setUserRole(roleToSet);
        } else {
          console.log('❌ No workspace to set as current');
        }
      } else {
        console.error('❌ API returned unsuccessful response:', response.data);
      }
    } catch (error) {
      console.error('❌ Error loading all workspaces:', error);
    }
  };

  // ✅ Switch to a different workspace
  const switchWorkspace = async (workspaceId) => {
    try {
      console.log('🔄 switchWorkspace called with:', workspaceId);
      
      const token = localStorage.getItem('taskflow-token');
      const response = await axios.put(
        `/api/workspaces/${workspaceId}/set-current`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ switchWorkspace API response:', response.data);

      if (response.data.success) {
        setCurrentWorkspace(response.data.data.workspace);
        setUserRole(response.data.data.userRole);
        console.log('✅ Workspace switched successfully');
        return true;
      } else {
        console.error('❌ switchWorkspace API returned false');
        return false;
      }
    } catch (error) {
      console.error('❌ switchWorkspace error:', error);
      return false;
    }
  };

  // ✅ Refresh current workspace data
  const refreshCurrentWorkspace = async () => {
    try {
      const token = localStorage.getItem('taskflow-token');
      if (!token) {
        setCurrentWorkspace(null);
        setUserRole(null);
        return;
      }

      const response = await axios.get('/api/workspaces/current', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success && response.data.data) {
        setCurrentWorkspace(response.data.data);
        setUserRole(response.data.userRole);
      } else {
        setCurrentWorkspace(null);
        setUserRole(null);
      }
    } catch (error) {
      console.error('Error refreshing current workspace:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        setCurrentWorkspace(null);
        setUserRole(null);
        setAllWorkspaces([]);
        clearWorkspaceStorage();
        localStorage.removeItem('taskflow-token');
      }
    }
  };

  return (
    <WorkspaceContext.Provider value={{ 
      currentWorkspace, 
      setCurrentWorkspace,
      userRole, 
      setUserRole,
      allWorkspaces,
      setAllWorkspaces,
      loading,
      initialized,
      loadAllWorkspaces,
      switchWorkspace,
      refreshCurrentWorkspace,
      clearWorkspaceStorage
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

// ✅ EXPORTED useWorkspace hook
export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return context;
};
