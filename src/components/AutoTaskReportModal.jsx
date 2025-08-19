// components/AutoTaskReportModal.jsx
import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../context/taskContext';
import { useNavigate } from 'react-router-dom';

const AutoTaskReportModal = () => {
  const { 
    showTaskReportModal, 
    setShowTaskReportModal, 
    currentTaskForReport, 
    addTaskReport,
    activeSession 
  } = useTaskContext();
  
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!currentTaskForReport) return;

    const finalReport = {
      taskId: currentTaskForReport.id,
      taskName: currentTaskForReport.name,
      sessionId: currentTaskForReport.sessionId || null,
      sessionName: activeSession?.name || null,
      ...reportData,
      actualTimeSpent: currentTaskForReport.actualTimeSpent,
      completedAt: currentTaskForReport.completedAt,
      wasDelayed: reportData.actualDuration > reportData.plannedDuration,
      delayAmount: Math.max(0, reportData.actualDuration - reportData.plannedDuration),
      efficiency: reportData.plannedDuration > 0 ? 
        Math.round((reportData.plannedDuration / reportData.actualDuration) * 100) : 100
    };

    addTaskReport(finalReport);
    setShowTaskReportModal(false);
    
    // Reset form
    setReportData({
      taskStatus: 'completed',
      actualDuration: 0,
      plannedDuration: 0,
      delayReason: '',
      customDelayReason: '',
      difficultyLevel: 'as-expected',
      qualityRating: 5,
      notes: '',
      nextActions: ''
    });

    // Navigate to session timer page with report generation flag
    navigate('/session', { 
      state: { 
        session: activeSession,
        showReportGeneration: true,
        completedTaskReport: finalReport
      } 
    });
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
                  className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1 font-medium ${
                    reportData.taskStatus === status.value
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
                  className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1 font-medium ${
                    reportData.difficultyLevel === level.value
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
                  className={`text-2xl transition-all duration-200 ${
                    rating <= reportData.qualityRating ? 'text-yellow-400' : 'text-gray-300'
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
