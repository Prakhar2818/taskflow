// components/SessionModal.jsx - WITH EXTENSIVE DEBUGGING
import React, { useState, useEffect } from "react";
import { useTaskContext } from "../context/taskContext";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const SessionModal = () => {
  const { 
    showSessionModal, 
    setShowSessionModal, 
    fetchAndSetActiveSession,  // ✅ ADD THIS
    setActiveSession          // ✅ ADD DIRECT SETTER AS BACKUP
  } = useTaskContext();
  
  // ✅ ADD DEBUG LOG TO CHECK CONTEXT FUNCTIONS
  console.log('🔍 SessionModal context functions:', {
    fetchAndSetActiveSession: !!fetchAndSetActiveSession,
    setActiveSession: !!setActiveSession,
    showSessionModal
  });
  
  const [sessionName, setSessionName] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState([{ name: "", duration: 25, priority: "medium" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // ✅ Direct env variable usage with fallback
  const API_BASE_URL = import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

  const priorityOptions = [
    { value: "low", label: "Low", color: "from-green-400 to-green-500", emoji: "🟢" },
    { value: "medium", label: "Medium", color: "from-yellow-400 to-orange-500", emoji: "🟡" },
    { value: "high", label: "High", color: "from-red-400 to-red-500", emoji: "🔴" },
    { value: "urgent", label: "Urgent", color: "from-purple-500 to-pink-600", emoji: "🚨" }
  ];

  const addTask = () => {
    setTasks([...tasks, { name: "", duration: 25, priority: "medium" }]);
  };

  const removeTask = (index) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((_, i) => i !== index));
    }
  };

  const updateTask = (index, field, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[index][field] = value;
    setTasks(updatedTasks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🎯 Form submitted - handleSubmit called');
    setError("");

    const validTasks = tasks.filter(task => task.name.trim());
    
    if (!sessionName.trim()) {
      setError("Session name is required");
      return;
    }

    if (validTasks.length === 0) {
      setError("At least one task is required");
      return;
    }

    console.log('✅ Form validation passed, starting API call...');
    setLoading(true);

    try {
      const token = localStorage.getItem('taskflow-token');
      
      console.log('📡 Creating session via SessionModal API...');
      console.log('📡 API URL:', `${API_BASE_URL}/api/sessions`);
      console.log('📡 Session data:', { name: sessionName.trim(), validTasks });
      
      // ✅ Create session via API
      const response = await axios.post(`${API_BASE_URL}/api/sessions`, {
        name: sessionName.trim(),
        description: description.trim(),
        tasks: validTasks.map(task => ({
          name: task.name.trim(),
          duration: task.duration,
          priority: task.priority
        }))
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 API Response:', response.data);

      if (response.data.success) {
        const createdSession = response.data.data.session;
        console.log('✅ Session created successfully:', createdSession._id);
        console.log('✅ Session object:', createdSession);
        
        // ✅ CHECK IF FUNCTION EXISTS BEFORE CALLING
        console.log('🔍 Checking fetchAndSetActiveSession function:', !!fetchAndSetActiveSession);
        
        if (fetchAndSetActiveSession) {
          try {
            console.log('🔄 Calling fetchAndSetActiveSession with ID:', createdSession._id);
            const result = await fetchAndSetActiveSession(createdSession._id);
            console.log('🔄 fetchAndSetActiveSession result:', result);
            
            if (result) {
              console.log('✅ fetchAndSetActiveSession succeeded');
            } else {
              console.warn('⚠️ fetchAndSetActiveSession returned null, using fallback');
              // ✅ FALLBACK: Direct setter
              setActiveSession(createdSession);
            }
          } catch (fetchError) {
            console.error('❌ fetchAndSetActiveSession failed:', fetchError);
            // ✅ FALLBACK: Direct setter
            console.log('🔄 Using fallback setActiveSession...');
            setActiveSession(createdSession);
          }
        } else {
          console.error('❌ fetchAndSetActiveSession not available, using direct setter');
          // ✅ FALLBACK: Direct setter
          setActiveSession(createdSession);
        }
        
        console.log('✅ Session should be set in context now');
        
        // ✅ Close modal and reset form
        setShowSessionModal(false);
        setSessionName("");
        setDescription("");
        setTasks([{ name: "", duration: 25, priority: "medium" }]);
        
        console.log('🔄 Navigating to /session...');
        
        // ✅ Navigate to session timer
        navigate('/session', { 
          state: { 
            sessionId: createdSession._id,
            fromCreation: true
          } 
        });
        
        console.log('✅ Navigation completed');
        
      } else {
        console.error('❌ API response not successful:', response.data);
        setError(response.data.message || 'Failed to create session');
      }
    } catch (error) {
      console.error('❌ Session creation error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      if (error.response) {
        setError(error.response.data.message || 'Server error occurred');
      } else if (error.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      setShowSessionModal(false);
    }
  };

  useEffect(() => {
    if (showSessionModal) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [showSessionModal]);

  const getTotalDuration = () => {
    return tasks.reduce((total, task) => total + (task.duration || 0), 0);
  };

  if (!showSessionModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl transform transition-all duration-200 scale-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span>🎯</span>
              Create Focus Session
            </h2>
            <button
              onClick={() => setShowSessionModal(false)}
              className="text-white/80 hover:text-white text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors duration-200"
            >
              ×
            </button>
          </div>
          <p className="text-purple-100 mt-2">Plan multiple tasks for a focused work session</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ✅ ADD DEBUG BUTTON */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => {
                console.log('=== DEBUG CONTEXT ===');
                console.log('fetchAndSetActiveSession available:', !!fetchAndSetActiveSession);
                console.log('setActiveSession available:', !!setActiveSession);
                console.log('All context functions:', Object.keys(useTaskContext()));
              }}
              className="px-3 py-1 bg-yellow-500 text-white rounded text-xs"
            >
              Debug Context
            </button>
            <button
              type="button"
              onClick={async () => {
                console.log('=== TEST FETCH SESSION ===');
                if (fetchAndSetActiveSession) {
                  const testId = "68a6edd4b3cfee8e637e6795";
                  console.log('Testing with ID:', testId);
                  const result = await fetchAndSetActiveSession(testId);
                  console.log('Test result:', result);
                } else {
                  console.error('fetchAndSetActiveSession not available!');
                }
              }}
              className="px-3 py-1 bg-red-500 text-white rounded text-xs"
            >
              Test Fetch
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex">
                <span className="text-red-500 mr-2">⚠️</span>
                {error}
              </div>
            </div>
          )}

          {/* Rest of your form JSX stays the same... */}
          {/* Session Name */}
          <div>
            <label htmlFor="sessionName" className="block text-sm font-semibold text-gray-700 mb-2">
              Session Name *
            </label>
            <input
              id="sessionName"
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g., Morning Focus Session, Project Sprint..."
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 text-gray-800 placeholder-gray-400"
              autoFocus
              maxLength={200}
              required
            />
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this session..."
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 text-gray-800 placeholder-gray-400 resize-none"
              rows="3"
              maxLength={1000}
            />
          </div>

          {/* Tasks Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-semibold text-gray-700">
                Session Tasks ({tasks.length})
              </label>
              <button
                type="button"
                onClick={addTask}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
              >
                <span>+</span>
                Add Task
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {tasks.map((task, index) => (
                <div key={index} className="p-4 border-2 border-gray-200 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Task {index + 1}</span>
                    {tasks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTask(index)}
                        className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={task.name}
                    onChange={(e) => updateTask(index, 'name', e.target.value)}
                    placeholder="Task name..."
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                    maxLength={100}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Duration (minutes)</label>
                      <input
                        type="number"
                        value={task.duration}
                        onChange={(e) => updateTask(index, 'duration', parseInt(e.target.value) || 0)}
                        min="1"
                        max="480"
                        className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Priority</label>
                      <select
                        value={task.priority}
                        onChange={(e) => updateTask(index, 'priority', e.target.value)}
                        className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                      >
                        {priorityOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.emoji} {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Summary */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-700 mb-3">Session Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Session Name:</span>
                <span className="font-medium">{sessionName || "Session name..."}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Tasks:</span>
                <span className="font-medium">{tasks.filter(t => t.name.trim()).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Duration:</span>
                <span className="font-medium">⏱️ {getTotalDuration()} minutes</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !sessionName.trim() || tasks.filter(t => t.name.trim()).length === 0}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:transform-none transform hover:scale-105 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Create & Start Session
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowSessionModal(false)}
              disabled={loading}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionModal;
