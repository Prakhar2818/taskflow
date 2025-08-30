// src/components/onboarding/UserRoleSelection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserRoleSelection() {
  const navigate = useNavigate();
  const choose = (role) => {
    localStorage.setItem('selectedRole', role);
    if (role === 'manager') navigate('/workspace/create');
    else navigate('/workspace/join');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Choose your role</h1>
      <div className="grid sm:grid-cols-3 gap-6">
        <button 
          className="border p-6 rounded-lg hover:shadow transition-all hover:border-blue-500" 
          onClick={() => choose('manager')}
        >
          <div className="text-4xl mb-2">👔</div>
          <h3 className="font-semibold mb-2">Manager</h3>
          <p className="text-sm text-gray-600">Create and manage workspaces, assign tasks to team members</p>
        </button>
        
        <button 
          className="border p-6 rounded-lg hover:shadow transition-all hover:border-green-500" 
          onClick={() => choose('member')}
        >
          <div className="text-4xl mb-2">👥</div>
          <h3 className="font-semibold mb-2">Member</h3>
          <p className="text-sm text-gray-600">Join a workspace using an invite link and collaborate with your team</p>
        </button>
        
        <button 
          className="border p-6 rounded-lg hover:shadow transition-all hover:border-purple-500" 
          onClick={() => choose('user')}
        >
          <div className="text-4xl mb-2">🏠</div>
          <h3 className="font-semibold mb-2">Individual</h3>
          <p className="text-sm text-gray-600">Work on your personal tasks and sessions</p>
        </button>
      </div>
    </div>
  );
}
