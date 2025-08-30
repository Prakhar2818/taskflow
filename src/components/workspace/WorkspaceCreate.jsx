// src/components/workspace/WorkspaceCreate.jsx - FIXED ERROR HANDLING
import React, { useState } from 'react';
import axios from 'axios';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useNavigate } from 'react-router-dom';

export default function WorkspaceCreate() {
  const { setCurrentWorkspace, setUserRole, setAllWorkspaces } = useWorkspace(); // Updated
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    settings: {
      allowSelfAssignment: true,
      requireApproval: false,
      autoReports: true
    }
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api';

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    
    try {
      const token = localStorage.getItem('taskflow-token');
      const res = await axios.post(`${API_BASE_URL}/workspaces`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // ✅ FIX: Check for successful response properly
      console.log('Create workspace response:', res.data); // Debug log
      
      if (res.data.success && res.data.data) {
        // ✅ SUCCESS: Update workspace context for multi-workspace system
        const newWorkspace = res.data.data;
        setCurrentWorkspace(newWorkspace);
        setUserRole('manager');
        
        // Add to allWorkspaces array
        setAllWorkspaces(prev => [...prev, {
          workspace: newWorkspace,
          userRole: 'manager',
          joinedAt: new Date(),
          isCurrentWorkspace: true
        }]);
        
        console.log('✅ Workspace created successfully:', newWorkspace.name);
        navigate('/manager-dashboard');
      } else {
        // ✅ Handle case where success is false
        const errorMsg = res.data.message || 'Unknown error occurred';
        console.error('❌ Workspace creation failed:', errorMsg);
        setErr(errorMsg);
      }
    } catch (error) {
      // ✅ IMPROVED: Better error handling
      console.error('❌ Create workspace error:', error);
      
      let errorMessage = 'Failed to create workspace';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || 
                      `Server error: ${error.response.status}`;
        console.error('Server error response:', error.response.data);
      } else if (error.request) {
        // Request made but no response received
        errorMessage = 'Network error - please check your connection';
        console.error('Network error:', error.request);
      } else {
        // Something else happened
        errorMessage = error.message || errorMessage;
        console.error('Request setup error:', error.message);
      }
      
      setErr(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('settings.')) {
      const key = name.split('.')[1];
      setForm((p) => ({ 
        ...p, 
        settings: { 
          ...p.settings, 
          [key]: type === 'checkbox' ? checked : value 
        } 
      }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  return (
    <form onSubmit={submit} className="max-w-xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Create workspace</h2>
      
      {/* ✅ IMPROVED: Better error display */}
      {err && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <span>{err}</span>
          </div>
        </div>
      )}
      
      <input 
        name="name" 
        value={form.name} 
        onChange={onChange} 
        placeholder="Workspace name" 
        className="border p-3 w-full mb-3 rounded" 
        required 
      />
      
      <textarea 
        name="description" 
        value={form.description} 
        onChange={onChange} 
        placeholder="Description" 
        className="border p-3 w-full mb-3 rounded" 
        rows="3"
      />
      
      <div className="mb-4 space-y-2">
        <label className="flex items-center gap-2">
          <input 
            type="checkbox" 
            name="settings.allowSelfAssignment" 
            checked={form.settings.allowSelfAssignment} 
            onChange={onChange} 
          /> 
          Allow self-assignment
        </label>
        
        <label className="flex items-center gap-2">
          <input 
            type="checkbox" 
            name="settings.requireApproval" 
            checked={form.settings.requireApproval} 
            onChange={onChange} 
          /> 
          Require approval
        </label>
        
        <label className="flex items-center gap-2">
          <input 
            type="checkbox" 
            name="settings.autoReports" 
            checked={form.settings.autoReports} 
            onChange={onChange} 
          /> 
          Auto reports
        </label>
      </div>
      
      <div className="flex gap-3">
        <button 
          type="submit"
          disabled={loading || !form.name.trim()} 
          className={`flex-1 px-4 py-2 rounded text-white font-medium ${
            loading || !form.name.trim()
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Creating...
            </span>
          ) : (
            'Create workspace'
          )}
        </button>
        
        <button 
          type="button"
          onClick={() => navigate('/workspace-selection')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
