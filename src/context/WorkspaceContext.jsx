// src/context/WorkspaceContext.jsx - UPDATED FOR MULTIPLE WORKSPACES
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const WorkspaceContext = createContext(null);

export const WorkspaceProvider = ({ children }) => {
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [allWorkspaces, setAllWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // ✅ Load from localStorage on app start
  useEffect(() => {
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
      } finally {
        setInitialized(true);
        setLoading(false);
      }
    };

    loadFromStorage();
  }, []);

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

  const clearWorkspaceStorage = () => {
    localStorage.removeItem('taskflow-current-workspace');
    localStorage.removeItem('taskflow-current-user-role');
    localStorage.removeItem('taskflow-all-workspaces');
  };

  // ✅ Load all user workspaces from API
  const loadAllWorkspaces = async () => {
    try {
      const token = localStorage.getItem('taskflow-token');
      if (!token) return;

      const response = await axios.get('/api/workspaces', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setAllWorkspaces(response.data.data.workspaces);
        
        // If no current workspace set, use the first one
        const currentFromAPI = response.data.data.workspaces.find(w => w.isCurrentWorkspace);
        if (currentFromAPI && !currentWorkspace) {
          setCurrentWorkspace(currentFromAPI.workspace);
          setUserRole(currentFromAPI.userRole);
        }
      }
    } catch (error) {
      console.error('Error loading all workspaces:', error);
    }
  };

  // ✅ Switch to a different workspace
// In your WorkspaceContext.jsx - ADD LOGGING
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
      loading: loading || !initialized,
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

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return context;
};
