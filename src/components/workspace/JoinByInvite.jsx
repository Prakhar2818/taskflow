// src/components/workspace/JoinByInvite.jsx - UPDATED WITH REDIRECT LOGIC
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import axios from 'axios';

export default function JoinByInvite() {
  const { inviteToken } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setCurrentWorkspace, setUserRole, loadAllWorkspaces } = useWorkspace();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [workspaceInfo, setWorkspaceInfo] = useState(null);

  const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    console.log('🔍 FRONTEND JOIN DEBUG:');
    console.log('- Invite token from URL:', inviteToken);
    
    if (inviteToken) {
      joinWorkspace();
    }
  }, [inviteToken, user]);

  const joinWorkspace = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('taskflow-token');
      const url = `${baseURL}/workspaces/join/${inviteToken}`;
      
      console.log('📡 Making API call to:', url);
      
      const response = await axios.post(url, {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      console.log('✅ API Response:', response.data);
      
      if (response.data.success) {
        setWorkspaceInfo(response.data.data.workspace);
        
        // ✅ UPDATE: Handle both scenarios - already member or new join
        if (response.data.message === 'You are already a member of this workspace') {
          console.log('👥 User already a member - redirecting to member dashboard');
          
          // Set the workspace as current workspace
          setCurrentWorkspace(response.data.data.workspace);
          setUserRole('member');
          
          // Reload all workspaces to update context
          await loadAllWorkspaces();
          
          // Redirect immediately to member dashboard
          setTimeout(() => {
            navigate('/member-dashboard');
          }, 1000);
          
        } else {
          console.log('🎉 User successfully joined workspace - redirecting to member dashboard');
          
          // Set the new workspace as current workspace
          setCurrentWorkspace(response.data.data.workspace);
          setUserRole('member');
          
          // Reload all workspaces to include new workspace
          await loadAllWorkspaces();
          
          // Redirect to member dashboard after showing success message
          setTimeout(() => {
            navigate('/member-dashboard');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('❌ Join workspace error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      setError(
        error.response?.data?.message || 'Failed to join workspace. The invite link may be invalid or expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          {loading ? (
            <>
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Joining Workspace...
              </h2>
              <p className="text-gray-600">
                Please wait while we add you to the workspace.
              </p>
            </>
          ) : error ? (
            <>
              <div className="text-red-500 text-4xl mb-4">❌</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Unable to Join Workspace
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-400 mb-4 p-2 bg-gray-100 rounded">
                  Debug: Token = {inviteToken}
                </div>
              )}
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/workspace-selection')}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                >
                  Go to Workspace Selection
                </button>
                <button
                  onClick={() => navigate('/workspace/join')}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
                >
                  Try Manual Join
                </button>
              </div>
            </>
          ) : workspaceInfo ? (
            <>
              <div className="text-green-500 text-4xl mb-4">✅</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Welcome to {workspaceInfo.name}!
              </h2>
              <p className="text-gray-600 mb-4">
                You are now a member of <strong>{workspaceInfo.name}</strong>
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                <span>Redirecting to Member Dashboard...</span>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
