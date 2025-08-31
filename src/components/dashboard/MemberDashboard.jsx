// src/components/dashboard/MemberDashboard.jsx - UPDATED
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useNavigate } from 'react-router-dom';

export default function MemberDashboard() {
  const { currentWorkspace, userRole, allWorkspaces, loading } = useWorkspace(); // Updated
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [busy, setBusy] = useState(true);
  const API_BASE_URL = 'http://localhost:5000/api';


  useEffect(() => {
    const load = async () => {
      if (loading || !currentWorkspace) return; // Updated
      try {
        const token = localStorage.getItem('taskflow-token');
        const t = await axios.get(`${API_BASE_URL}/tasks`, { headers: { Authorization: `Bearer ${token}` } });
        if (t.data.success) setTasks(t.data.data.tasks || []);
        const s = await axios.get(`${API_BASE_URL}/sessions`, { headers: { Authorization: `Bearer ${token}` } });
        if (s.data.success) setSessions(s.data.data.sessions || []);
      } catch (e) {
        console.error('Error loading dashboard data:', e);
      } finally {
        setBusy(false);
      }
    };
    load();
  }, [loading, currentWorkspace]); // Updated

  if (loading || busy) return <div className="p-6">Loading...</div>;
  if (!currentWorkspace) return <div className="p-6">Join a workspace to get started.</div>; // Updated

  const completed = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="p-6">
      {/* ✅ ADD: Workspace switcher */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">My Workspace: {currentWorkspace.name}</h1>
        <button
          onClick={() => navigate('/workspace-selection')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors text-sm"
        >
          Switch Workspace ({allWorkspaces.length})
        </button>
      </div>

      {/* ✅ ADD: Quick Actions */}
      <div className="flex gap-4 my-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          🏠 Go to TaskFlow Dashboard
        </button>
        <button
          onClick={() => navigate('/tasks')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          📋 View All Tasks
        </button>
        <button
          onClick={() => navigate('/sessions')}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          ⏱️ View All Sessions
        </button>
      </div>

      {/* Rest of your existing dashboard content */}
      <div className="grid sm:grid-cols-3 gap-4 my-6">
        <div className="border rounded p-4">My Tasks: <b>{tasks.length}</b></div>
        <div className="border rounded p-4">Completed: <b>{completed}</b></div>
        <div className="border rounded p-4">My Sessions: <b>{sessions.length}</b></div>
      </div>

      {/* Rest of your existing content... */}
    </div>
  );
}
