// src/components/workspace/WorkspaceSelection.jsx - USE YOUR EXISTING API
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function WorkspaceSelection() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // ✅ USE YOUR EXISTING API
  const fetchWorkspaces = async () => {
    try {
      const token = localStorage.getItem('taskflow-token');

      // ✅ CALL YOUR EXISTING getAllUserWorkspaces API
      const response = await axios.get(`${API_BASE_URL}/workspaces/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        console.log('✅ API Response:', response.data);
        setWorkspaces(response.data.data.workspaces || []);
      }
    } catch (error) {
      console.error('❌ Error fetching workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkspaceSelect =  (workspaceData) => {
    // Switch workspace logic here
    const { userRole } = workspaceData;
    console.log('🔄 Switching to workspace:', workspaceData.workspace.name, 'as', userRole);
    if (userRole === 'manager') {
      navigate('/manager-dashboard');
    } if(userRole === 'member') {
      navigate('/member-dashboard');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Your Workspaces</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspaceData, index) => { // ✅ ADD INDEX PARAMETER
            const { workspace, userRole, isCurrentWorkspace } = workspaceData;

            return (
              <div
                key={`${workspace._id}-${index}`} // ✅ UNIQUE KEY: ID + INDEX
                className={`bg-white rounded-lg shadow-sm border-2 p-6 cursor-pointer hover:shadow-md transition-all ${isCurrentWorkspace ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                  }`}
                onClick={() => handleWorkspaceSelect(workspaceData)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {workspace.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${userRole === 'manager'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-green-100 text-green-800'
                    }`}>
                    {userRole}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {workspace.description || 'No description available'}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>👥 {workspace.members?.length || 0} members</span>
                  <span>👤 {userRole}</span>
                </div>

                {isCurrentWorkspace && (
                  <div className="mt-4 text-blue-600 text-sm">
                    ✓ Current Workspace
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
