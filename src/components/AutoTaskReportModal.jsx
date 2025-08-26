// components/AutoTaskReportModal.jsx
import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../context/taskContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AutoTaskReportModal = () => {
  const {
    showTaskReportModal,
    setShowTaskReportModal,
    currentTaskForReport,
    addTaskReport,
    activeSession,
    currentSessionTaskIndex,
    setActiveTask,
    setActiveSession,
    setCurrentSessionTaskIndex
  } = useTaskContext();

  const [isCompleted, setIsCompleted] = useState(true);
  const [difficultyLevel, setDifficultyLevel] = useState("medium");
  const [completionPercentage, setCompletionPercentage] = useState(100);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api"

  const navigate = useNavigate();

  const [reportData, setReportData] = useState({
    taskStatus: 'completed', // completed, delayed, partially-completed
    actualDuration: 0,
    plannedDuration: 0,
    delayReason: '',
    customDelayReason: '',
    difficultyLevel: 'as-expected', // easier, as-expected, harder
    qualityRating: 5, // 1-5 scale
    notes: '',
    nextActions: ''
  });

  const delayReasons = [
    'Technical difficulties',
    'Underestimated complexity',
    'External dependencies',
    'Resource constraints',
    'Scope changes',
    'Personal interruptions',
    'Tool/software issues',
    'Learning curve steeper than expected',
    'Other priorities intervened',
    'Custom reason'
  ];

  const difficultyLevels = [
    { value: 'easier', label: 'Easier than expected', emoji: '😊', color: 'text-green-600' },
    { value: 'as-expected', label: 'As expected', emoji: '😐', color: 'text-blue-600' },
    { value: 'harder', label: 'Harder than expected', emoji: '😰', color: 'text-orange-600' }
  ];

  const handleCompleteTask = async (taskData) => {

    if (!activeSession || !activeSession._id || currentSessionTaskIndex === undefined) {
      console.log("No session are found");
      return false
    }

    try {
      const token = localStorage.getItem("taskflow-token")

      const response = await axios.post(`${API_BASE_URL}/sessions/${activeSession._id}/tasks/${currentSessionTaskIndex}/complete`, {
        isCompleted: taskData.isCompleted,
        completionPercentage: taskData.completionPercentage,
        reason: taskData.reason,
        notes: taskData.notes
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      })
      if (response.data.success) {
        console.log(response.data);
        return response.data.data.session
      } else {
        throw new Error("Task failed to complete")
      }
    } catch (error) {
      console.error("No session found to start")
    } finally {

    }
  }

  useEffect(() => {
    if (currentTaskForReport) {
      setReportData(prev => ({
        ...prev,
        actualDuration: Math.floor((currentTaskForReport.actualTimeSpent || 0) / 60),
        plannedDuration: Math.floor((currentTaskForReport.timerSeconds || 0) / 60),
        taskStatus: currentTaskForReport.actualTimeSpent > (currentTaskForReport.timerSeconds * 1.2) ? 'delayed' : 'completed'
      }));
    }
  }, [currentTaskForReport]);
  const moveToNextTask = (updatedSession) => {
    const nextTaskIndex = currentSessionTaskIndex + 1;

    console.log(`🔄 Moving to next task: ${nextTaskIndex} of ${updatedSession.tasks.length}`);

    if (nextTaskIndex < updatedSession.tasks.length) {
      // ✅ Set next task
      setCurrentSessionTaskIndex(nextTaskIndex);

      const nextTask = updatedSession.tasks[nextTaskIndex];
      const taskWithTimer = {
        ...nextTask,
        id: `session-${updatedSession._id}-task-${nextTaskIndex}`,
        sessionId: updatedSession._id,
        sessionIndex: nextTaskIndex,
        timerSeconds: nextTask.duration * 60
      };

      console.log('✅ Setting next active task:', taskWithTimer.name);
      setActiveTask(taskWithTimer);

    } else {
      // ✅ All tasks completed
      console.log('🎉 All tasks completed!');
      setActiveTask(null);

      // Mark session as completed locally
      const completedSession = {
        ...updatedSession,
        status: 'completed',
        completedAt: new Date().toISOString()
      };
      setActiveSession(completedSession);

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🎉 Session Complete!', {
          body: `Congratulations! You've completed "${updatedSession.name}"`,
          icon: '🎉'
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentTaskForReport) return;

    setIsSubmitting(true);

    try {
      console.log('📊 Submitting task report...');

      const taskCompletionData = {
        // ✅ QUICK FIX: Only 'partially-completed' should be marked as incomplete
        isCompleted: reportData.taskStatus !== 'partially-completed',
        completionPercentage: reportData.taskStatus === 'completed' ? 100 :
          reportData.taskStatus === 'delayed' ? 90 : 60,
        reason: reportData.delayReason || reportData.customDelayReason || '',
        notes: reportData.notes
      };


      // Create local report
      const report = {
        taskId: currentTaskForReport.id,
        taskName: currentTaskForReport.name,
        sessionId: currentTaskForReport.sessionId,
        sessionName: activeSession?.name,
        ...reportData,
        actualTimeSpent: currentTaskForReport.actualTimeSpent,
        plannedDuration: Math.floor((currentTaskForReport.timerSeconds || 0) / 60),
        completedAt: currentTaskForReport.completedAt,
        wasSessionTask: currentTaskForReport.wasSessionTask
      };

      addTaskReport(report);

      // Handle session task completion
      if (currentTaskForReport.wasSessionTask) {
        const updatedSession = await handleCompleteTask(taskCompletionData);

        if (updatedSession) {
          console.log('✅ Task completed via API');
          setActiveSession(updatedSession);

          // ✅ CHECK IF SESSION IS COMPLETED
          const isSessionCompleted = updatedSession.status === 'completed' ||
            updatedSession.completedTasks >= updatedSession.tasks.length ||
            (currentSessionTaskIndex + 1) >= updatedSession.tasks.length;

          if (isSessionCompleted) {
            console.log('🎉 Session completed - Redirecting to Generate PDF');

            // ✅ REDIRECT TO YOUR GENERATE PDF COMPONENT
            navigate('/generate-report', {
              state: {
                // Data for your existing GeneratePDF component
                sessionData: updatedSession,
                completedSession: updatedSession,
                sessionReport: {
                  sessionId: updatedSession._id,
                  sessionName: updatedSession.name,
                  totalTasks: updatedSession.tasks.length,
                  completedTasks: updatedSession.completedTasks || updatedSession.tasks.length,
                  startedAt: updatedSession.startedAt,
                  completedAt: updatedSession.completedAt || new Date().toISOString(),
                  status: updatedSession.status || 'completed'
                }
              }
            });

            setShowTaskReportModal(false);
            resetForm();
            return; // Exit early
          } else {
            moveToNextTask(updatedSession);
          }

        } else {
          // Fallback progression
          const localUpdatedSession = {
            ...activeSession,
            completedTasks: (activeSession.completedTasks || 0) + 1,
            status: (currentSessionTaskIndex + 1) >= activeSession.tasks.length ? 'completed' : activeSession.status,
            completedAt: (currentSessionTaskIndex + 1) >= activeSession.tasks.length ? new Date().toISOString() : null,
            tasks: activeSession.tasks.map((task, index) =>
              index === currentSessionTaskIndex
                ? { ...task, completed: true, completedAt: new Date() }
                : task
            )
          };

          setActiveSession(localUpdatedSession);

          // Check if locally completed
          if ((currentSessionTaskIndex + 1) >= localUpdatedSession.tasks.length) {
            console.log('🎉 Session completed locally - Redirecting to Generate PDF');

            // ✅ REDIRECT WITH LOCAL DATA
            navigate('/generate-report', {
              state: {
                sessionData: localUpdatedSession,
                completedSession: localUpdatedSession,
                sessionReport: {
                  sessionId: localUpdatedSession._id,
                  sessionName: localUpdatedSession.name,
                  totalTasks: localUpdatedSession.tasks.length,
                  completedTasks: localUpdatedSession.tasks.length,
                  startedAt: localUpdatedSession.startedAt,
                  completedAt: new Date().toISOString(),
                  status: 'completed'
                }
              }
            });

            setShowTaskReportModal(false);
            resetForm();
            return;
          } else {
            moveToNextTask(localUpdatedSession);
          }
        }
      }

      // Close modal and reset
      setShowTaskReportModal(false);
      resetForm();

      console.log('✅ Report submission complete');

    } catch (error) {
      console.error('❌ Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsCompleted(true);
    setDifficultyLevel("medium");
    setCompletionPercentage(100);
    setReason("");
    setNotes("");
  };

  const handleSkip = () => {
    // Add a minimal report if user skips
    if (currentTaskForReport) {
      const minimalReport = {
        taskId: currentTaskForReport.id,
        taskName: currentTaskForReport.name,
        sessionId: currentTaskForReport.sessionId || null,
        actualTimeSpent: currentTaskForReport.actualTimeSpent,
        completedAt: currentTaskForReport.completedAt,
        skipped: true,
        actualDuration: Math.floor((currentTaskForReport.actualTimeSpent || 0) / 60),
        plannedDuration: Math.floor((currentTaskForReport.timerSeconds || 0) / 60)
      };
      addTaskReport(minimalReport);
    }
    setShowTaskReportModal(false);
  };



  if (!showTaskReportModal || !currentTaskForReport) return null;

  const isDelayed = reportData.actualDuration > reportData.plannedDuration;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-200 scale-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span>📝</span>
              Task Completed!
            </h2>
            <button
              onClick={handleSkip}
              className="text-white/80 hover:text-white text-sm font-medium px-3 py-1 rounded hover:bg-white/20 transition-colors duration-200"
            >
              Skip Report
            </button>
          </div>
          <p className="text-green-100 mt-2">Please provide feedback about your task completion</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Task Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Task Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Task:</span>
                <p className="font-medium">{currentTaskForReport.name}</p>
              </div>
              <div>
                <span className="text-gray-600">Planned Duration:</span>
                <p className="font-medium">{reportData.plannedDuration} min</p>
              </div>
              <div>
                <span className="text-gray-600">Actual Duration:</span>
                <p className={`font-medium ${isDelayed ? 'text-orange-600' : 'text-green-600'}`}>
                  {reportData.actualDuration} min
                </p>
              </div>
            </div>
          </div>

          {/* Task Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How did you complete this task?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'completed', label: 'Fully Completed', emoji: '✅', color: 'border-green-500 bg-green-50 text-green-700' },
                { value: 'delayed', label: 'Completed but Delayed', emoji: '⏰', color: 'border-orange-500 bg-orange-50 text-orange-700' },
                { value: 'partially-completed', label: 'Partially Completed', emoji: '⚠️', color: 'border-yellow-500 bg-yellow-50 text-yellow-700' }
              ].map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => setReportData(prev => ({ ...prev, taskStatus: status.value }))}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1 font-medium ${reportData.taskStatus === status.value
                    ? status.color
                    : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <span className="text-xl">{status.emoji}</span>
                  <span className="text-xs text-center">{status.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actual Duration Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Actual Duration (minutes)
            </label>
            <input
              type="number"
              min="0"
              value={reportData.actualDuration}
              onChange={(e) => setReportData(prev => ({
                ...prev,
                actualDuration: parseInt(e.target.value) || 0
              }))}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
            />
          </div>

          {/* Delay Reason (if delayed) */}
          {(reportData.taskStatus === 'delayed' || isDelayed) && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                What caused the delay?
              </label>
              <select
                value={reportData.delayReason}
                onChange={(e) => setReportData(prev => ({ ...prev, delayReason: e.target.value }))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                required
              >
                <option value="">Select a reason...</option>
                {delayReasons.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>

              {reportData.delayReason === 'Custom reason' && (
                <input
                  type="text"
                  placeholder="Please specify the custom reason..."
                  value={reportData.customDelayReason}
                  onChange={(e) => setReportData(prev => ({ ...prev, customDelayReason: e.target.value }))}
                  className="w-full mt-2 p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              )}
            </div>
          )}

          {/* Difficulty Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How difficult was this task?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {difficultyLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setReportData(prev => ({ ...prev, difficultyLevel: level.value }))}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1 font-medium ${reportData.difficultyLevel === level.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <span className="text-xl">{level.emoji}</span>
                  <span className="text-xs text-center">{level.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quality Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Rate the quality of your work (1-5 stars)
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setReportData(prev => ({ ...prev, qualityRating: rating }))}
                  className={`text-2xl transition-all duration-200 ${rating <= reportData.qualityRating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={reportData.notes}
              onChange={(e) => setReportData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any insights, learnings, or observations about this task..."
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 resize-none"
              rows="3"
            />
          </div>

          {/* Next Actions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Next Actions / Follow-up (Optional)
            </label>
            <input
              type="text"
              value={reportData.nextActions}
              onChange={(e) => setReportData(prev => ({ ...prev, nextActions: e.target.value }))}
              placeholder="What needs to be done next related to this task?"
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>📊</span>
              Submit & Generate Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AutoTaskReportModal;
