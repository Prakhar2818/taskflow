// src/components/dashboard/ManagerDashboard.jsx - FIXED VERSION
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useNavigate } from 'react-router-dom';
import InviteLinkManager from '../workspace/InviteLinkManager';

export default function ManagerDashboard() {
  const { currentWorkspace, userRole, loading } = useWorkspace();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [busy, setBusy] = useState(true);

  // ✅ DEFINE YOUR BACKEND URL
  const API_BASE_URL = 'http://localhost:5000/api'; // Change port if different

  useEffect(() => {
    const load = async () => {
      if (loading || !currentWorkspace) return;
      
      console.log('🔄 Loading dashboard data for workspace:', currentWorkspace._id);
      
      try {
        const token = localStorage.getItem('taskflow-token');
        
        // ✅ FIXED: Use full absolute URL
        const workspaceResponse = await axios.get(
          `${API_BASE_URL}/workspaces/${currentWorkspace._id}`, 
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Accept': 'application/json'
            } 
          }
        );
        
        if (workspaceResponse.data.success) {
          const freshWorkspace = workspaceResponse.data.data;
          console.log('✅ Fresh workspace data:', freshWorkspace);
          console.log('✅ Members count:', freshWorkspace.members?.length || 0);
          console.log('✅ Members array:', freshWorkspace.members);
          
          setMembers(freshWorkspace.members || []);
        }
        
        // ✅ FIXED: Use full URLs for other API calls too
        try {
          const t = await axios.get(`${API_BASE_URL}/tasks/workspace`, { 
            headers: { Authorization: `Bearer ${token}` } 
          });
          if (t.data.success) setTasks(t.data.data.tasks || []);
        } catch (e) {
          console.log('Tasks API not available:', e.message);
        }
        
        try {
          const s = await axios.get(`${API_BASE_URL}/sessions/workspace/${currentWorkspace._id}`, { 
            headers: { Authorization: `Bearer ${token}` } 
          });
          if (s.data.success) setSessions(s.data.data.sessions || []);
        } catch (e) {
          console.log('Sessions API not available:', e.message);
        }
        
      } catch (e) {
        console.error('❌ Error loading dashboard data:', e);
        console.error('❌ Error details:', e.response?.data);
      } finally {
        setBusy(false);
      }
    };
    
    load();
  }, [loading, currentWorkspace?._id]);

  // ✅ FIXED: Auto-refresh with full URL
  useEffect(() => {
    if (!currentWorkspace) return;
    
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('taskflow-token');
        const response = await axios.get(
          `${API_BASE_URL}/workspaces/${currentWorkspace._id}`, 
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Accept': 'application/json'
            } 
          }
        );
        
        if (response.data.success) {
          console.log('🔄 Auto-refresh: Updated member count:', response.data.data.members?.length);
          setMembers(response.data.data.members || []);
        }
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [currentWorkspace?._id]);

  if (loading || busy) return <div className="p-6">Loading...</div>;
  if (!currentWorkspace) return <div className="p-6">No workspace found.</div>;

  console.log('📊 Current members count:', members.length);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{currentWorkspace.name}</h1>
          <p className="text-gray-600">{currentWorkspace.description}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
          >
            🔄 Refresh
          </button>
          <button
            onClick={() => navigate('/workspace-selection')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors text-sm"
          >
            Switch Workspace
          </button>
        </div>
      </div>

      {/* Invite Manager */}
      {currentWorkspace._id && <InviteLinkManager workspaceId={currentWorkspace._id} />}

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="border rounded p-4 bg-white shadow">
          <div className="text-2xl font-bold text-blue-600">{members.length}</div>
          <div className="text-sm text-gray-600">Total Members</div>
        </div>
        <div className="border rounded p-4 bg-white shadow">
          <div className="text-2xl font-bold text-green-600">{tasks.length}</div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </div>
        <div className="border rounded p-4 bg-white shadow">
          <div className="text-2xl font-bold text-purple-600">{sessions.length}</div>
          <div className="text-sm text-gray-600">Total Sessions</div>
        </div>
      </div>

      {/* Rest of your existing JSX remains the same */}
      {/* Members Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Team Members ({members.length})
        </h2>
        
        {members.length > 0 ? (
          <div className="space-y-3">
            {members.map((member, index) => (
              <div key={member._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {member.userId?.name ? member.userId.name[0].toUpperCase() : '?'}
                  </div>
                  <div>
                    <div className="font-medium">
                      {member.userId?.name || 'Unknown User'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {member.userId?.email || 'No email'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    member.role === 'manager' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {member.role}
                  </span>
                  <span className={`w-3 h-3 rounded-full ${
                    member.isActive ? 'bg-green-400' : 'bg-red-400'
                  }`}></span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">👥</div>
            <p>No members found</p>
            <p className="text-sm">Invite team members to get started</p>
          </div>
        )}
      </div>

      {/* Tasks and Sessions sections remain the same */}
    </div>
  );
}
