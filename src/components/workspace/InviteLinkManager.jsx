// src/components/workspace/InviteLinkManager.jsx - NEW COMPONENT
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InviteLinkManager = ({ workspaceId }) => {
  const [inviteInfo, setInviteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (workspaceId) {
      fetchInviteInfo();
    }
  }, [workspaceId]);

  const fetchInviteInfo = async () => {
    try {
      const token = localStorage.getItem('taskflow-token');
      const response = await axios.get(
        `${baseURL}/workspaces/${workspaceId}/invite-info`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setInviteInfo(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch invite info:', error);
    }
  };

  const generateInviteLink = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('taskflow-token');
      const response = await axios.post(
        `${baseURL}/workspaces/${workspaceId}/generate-invite`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setInviteInfo({
          inviteLink: response.data.data.inviteLink,
          expiresAt: response.data.data.expiresAt,
          isActive: true
        });
      }
    } catch (error) {
      console.error('Failed to generate invite link:', error);
      alert('Failed to generate invite link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteInfo.inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = inviteInfo.inviteLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const disableInviteLink = async () => {
    try {
      const token = localStorage.getItem('taskflow-token');
      await axios.put(
        `${baseURL}/workspaces/${workspaceId}/disable-invite`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setInviteInfo({ ...inviteInfo, isActive: false });
      alert('Invite link disabled successfully');
    } catch (error) {
      console.error('Failed to disable invite link:', error);
      alert('Failed to disable invite link');
    }
  };

  const formatExpiryDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        📨 Invite Team Members
      </h3>
      
      {inviteInfo?.isActive ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invite Link (expires: {formatExpiryDate(inviteInfo.expiresAt)})
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inviteInfo.inviteLink}
                readOnly
                className="flex-1 p-3 border border-gray-300 rounded-md bg-gray-50 text-sm"
              />
              <button
                onClick={copyToClipboard}
                className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Share this link with team members to join your workspace
            </p>
            <button
              onClick={disableInviteLink}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Disable Link
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-600 mb-4">
            No active invite link. Generate one to invite team members.
          </p>
          <button
            onClick={generateInviteLink}
            disabled={loading}
            className={`px-6 py-3 rounded-md text-white font-medium transition-colors ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {loading ? 'Generating...' : '🔗 Generate Invite Link'}
          </button>
        </div>
      )}
    </div>
  );
};

export default InviteLinkManager;
