// src/components/dashboard/ManagerDashboard.jsx - INTEGRATED WITH APIS
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

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const load = async () => {
      if (loading || !currentWorkspace) return;
      
      console.log('🔄 Loading dashboard data for workspace:', currentWorkspace._id);
      
      try {
        const token = localStorage.getItem('taskflow-token');
        
        // ✅ 1. GET WORKSPACE DATA (Members)
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
          
          setMembers(freshWorkspace.members || []);
        }
        
        // ✅ 2. GET WORKSPACE TASKS
        try {
          const tasksResponse = await axios.get(
            `${API_BASE_URL}/tasks/workspace/${currentWorkspace._id}`, 
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          console.log('✅ Tasks API response:', tasksResponse.data);
          
          if (tasksResponse.data.success) {
            setTasks(tasksResponse.data.data.tasks || []);
          }
        } catch (taskError) {
          console.log('⚠️ Tasks API error:', taskError.response?.status || taskError.message);
          setTasks([]); // Set empty array as fallback
        }
        
        // ✅ 3. GET WORKSPACE SESSIONS  
        try {
          const sessionsResponse = await axios.get(
            `${API_BASE_URL}/sessions/workspace/${currentWorkspace._id}`, 
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          console.log('✅ Sessions API response:', sessionsResponse.data);
          
          if (sessionsResponse.data.success) {
            setSessions(sessionsResponse.data.data.sessions || []);
          }
        } catch (sessionError) {
          console.log('⚠️ Sessions API error:', sessionError.response?.status || sessionError.message);
          setSessions([]); // Set empty array as fallback
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

  // ✅ AUTO-REFRESH (Every 60 seconds)
  useEffect(() => {
    if (!currentWorkspace) return;
    
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('taskflow-token');
        
        // Refresh workspace data
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
          console.log('🔄 Auto-refresh: Updated member count:', workspaceResponse.data.data.members?.length);
          setMembers(workspaceResponse.data.data.members || []);
        }
        
        // Refresh tasks
        try {
          const tasksResponse = await axios.get(
            `${API_BASE_URL}/tasks/workspace/${currentWorkspace._id}`, 
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (tasksResponse.data.success) {
            setTasks(tasksResponse.data.data.tasks || []);
          }
        } catch (e) {
          console.log('Auto-refresh tasks failed:', e.message);
        }
        
        // Refresh sessions  
        try {
          const sessionsResponse = await axios.get(
            `${API_BASE_URL}/sessions/workspace/${currentWorkspace._id}`, 
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (sessionsResponse.data.success) {
            setSessions(sessionsResponse.data.data.sessions || []);
          }
        } catch (e) {
          console.log('Auto-refresh sessions failed:', e.message);
        }
        
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      }
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, [currentWorkspace?._id]);

  if (loading || busy) return <div className="p-6">Loading...</div>;
  if (!currentWorkspace) return <div className="p-6">No workspace found.</div>;

  console.log('📊 Current counts:', {
    members: members.length,
    tasks: tasks.length,
    sessions: sessions.length
  });

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

      {/* ✅ UPDATED: Stats Cards with Real Data */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="border rounded p-4 bg-white shadow">
          <div className="text-2xl font-bold text-blue-600">{members.length}</div>
          <div className="text-sm text-gray-600">Total Members</div>
        </div>
        <div className="border rounded p-4 bg-white shadow">
          <div className="text-2xl font-bold text-green-600">{tasks.length}</div>
          <div className="text-sm text-gray-600">Workspace Tasks</div>
        </div>
        <div className="border rounded p-4 bg-white shadow">
          <div className="text-2xl font-bold text-purple-600">{sessions.length}</div>
          <div className="text-sm text-gray-600">Workspace Sessions</div>
        </div>
      </div>

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

      {/* ✅ NEW: Tasks Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Tasks ({tasks.length})</h2>
            <button
              onClick={() => navigate('/tasks')}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              View All
            </button>
          </div>
          
          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task, index) => (
                <div key={task._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{task.title || task.name}</div>
                    <div className="text-sm text-gray-500">
                      Created by: {task.user?.name || 'Unknown'}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    task.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : task.status === 'in-progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status || 'pending'}
                  </span>
                </div>
              ))}
              {tasks.length > 5 && (
                <div className="text-center text-sm text-gray-500 pt-2">
                  and {tasks.length - 5} more tasks...
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📋</div>
              <p>No tasks found</p>
              <p className="text-sm">Create tasks to track progress</p>
            </div>
          )}
        </div>

        {/* ✅ NEW: Sessions Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Sessions ({sessions.length})</h2>
            <button
              onClick={() => navigate('/sessions')}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              View All
            </button>
          </div>
          
          {sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.slice(0, 5).map((session, index) => (
                <div key={session._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{session.title || session.name}</div>
                    <div className="text-sm text-gray-500">
                      By: {session.user?.name || 'Unknown'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      session.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : session.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {session.status || 'pending'}
                    </span>
                    {session.duration && (
                      <div className="text-xs text-gray-500 mt-1">
                        {session.duration}min
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {sessions.length > 5 && (
                <div className="text-center text-sm text-gray-500 pt-2">
                  and {sessions.length - 5} more sessions...
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">⏱️</div>
              <p>No sessions found</p>
              <p className="text-sm">Start tracking time sessions</p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ NEW: Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => navigate('/create-task')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <span>➕</span>
            Create Task
          </button>
          <button
            onClick={() => navigate('/create-session')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <span>▶️</span>
            Start Session
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <span>📊</span>
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
}
