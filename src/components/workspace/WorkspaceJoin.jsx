// src/components/workspace/WorkspaceJoin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function WorkspaceJoin() {
  const navigate = useNavigate();
  const [inviteLink, setInviteLink] = useState('');
  const [error, setError] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    setError('');

    if (!inviteLink.trim()) {
      setError('Please enter an invite link');
      return;
    }

    try {
      // Extract invite token from the URL
      const url = new URL(inviteLink);
      const pathParts = url.pathname.split('/');
      const inviteToken = pathParts[pathParts.length - 1];

      if (!inviteToken || inviteToken === 'join') {
        setError('Invalid invite link format');
        return;
      }

      // Navigate to the join route
      navigate(`/join/${inviteToken}`);
    } catch (error) {
      setError('Invalid invite link format');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Join Workspace</h2>
      <p className="text-gray-600 mb-6">
        Enter the invite link shared by your manager to join a workspace.
      </p>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleJoin}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Invite Link
          </label>
          <input
            type="url"
            value={inviteLink}
            onChange={(e) => setInviteLink(e.target.value)}
            placeholder="https://taskflow.com/join/abc123..."
            className="border p-3 w-full rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 px-4 rounded hover:bg-green-700 transition-colors"
        >
          Join Workspace
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate('/user-role-selection')}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          ← Back to Role Selection
        </button>
      </div>
    </div>
  );
}
