// components/TaskCompletionModal.jsx
import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../context/taskContext';

const TaskCompletionModal = () => {
  const { 
    showTaskCompletionModal, 
    setShowTaskCompletionModal, 
    currentTaskForCompletion, 
    addTaskCompletionReport,
    processTaskCompletion
  } = useTaskContext();
  
  const [completionData, setCompletionData] = useState({
    isCompleted: true,
    completionPercentage: 100,
    reason: '',
    customReason: '',
    qualityRating: 5,
    difficultyLevel: 'as-expected',
    notes: '',
    nextSteps: ''
  });

  const incompletionReasons = [
    'Ran out of time',
    'More complex than expected',
    'Missing resources/tools',
    'External dependencies',
    'Technical difficulties',
    'Interruptions occurred',
    'Scope was too large',
    'Need additional research',
    'Waiting for feedback/approval',
    'Custom reason'
  ];

  const difficultyLevels = [
    { value: 'easier', label: 'Easier than expected', emoji: '😊' },
    { value: 'as-expected', label: 'As expected', emoji: '😐' },
    { value: 'harder', label: 'Harder than expected', emoji: '😓' }
  ];

  useEffect(() => {
    if (currentTaskForCompletion) {
      // Auto-detect if task might be incomplete based on time
      const wasCompleted = currentTaskForCompletion.actualTimeSpent >= 
        (currentTaskForCompletion.plannedDuration * 60 * 0.8); // 80% of planned time
      
      setCompletionData(prev => ({
        ...prev,
        isCompleted: wasCompleted,
        completionPercentage: wasCompleted ? 100 : 75
      }));
    }
  }, [currentTaskForCompletion]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!currentTaskForCompletion) return;

    const finalReport = {
      ...currentTaskForCompletion,
      ...completionData,
      finalReason: completionData.reason === 'Custom reason' ? 
        completionData.customReason : completionData.reason,
      reportedAt: new Date().toISOString(),
      actualDurationMinutes: Math.floor(currentTaskForCompletion.actualTimeSpent / 60),
      wasDelayed: currentTaskForCompletion.actualTimeSpent > 
        (currentTaskForCompletion.plannedDuration * 60),
      delayAmount: Math.max(0, 
        Math.floor(currentTaskForCompletion.actualTimeSpent / 60) - currentTaskForCompletion.plannedDuration
      )
    };

    // Add to completion reports
    addTaskCompletionReport(finalReport);
    
    // Process the completion (update task status, move to next task, etc.)
    processTaskCompletion(finalReport);
    
    // Close modal and reset
    setShowTaskCompletionModal(false);
    resetForm();
  };

  const resetForm = () => {
    setCompletionData({
      isCompleted: true,
      completionPercentage: 100,
      reason: '',
      customReason: '',
      qualityRating: 5,
      difficultyLevel: 'as-expected',
      notes: '',
      nextSteps: ''
    });
  };

  const handleQuickComplete = () => {
    const quickReport = {
      ...currentTaskForCompletion,
      isCompleted: true,
      completionPercentage: 100,
      qualityRating: 5,
      difficultyLevel: 'as-expected',
      notes: 'Quick completion - no detailed feedback provided',
      reportedAt: new Date().toISOString(),
      actualDurationMinutes: Math.floor(currentTaskForCompletion?.actualTimeSpent / 60),
      wasDelayed: false,
      delayAmount: 0
    };

    addTaskCompletionReport(quickReport);
    processTaskCompletion(quickReport);
    setShowTaskCompletionModal(false);
    resetForm();
  };

  if (!showTaskCompletionModal || !currentTaskForCompletion) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-200 scale-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span>⏰</span>
              Timer Completed!
            </h2>
            <button
              onClick={handleQuickComplete}
              className="text-white/80 hover:text-white text-sm font-medium px-3 py-1 rounded bg-white/20 hover:bg-white/30 transition-colors duration-200"
            >
              Quick Complete
            </button>
          </div>
          <p className="text-blue-100 mt-2">How did you progress with this task?</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Task Summary */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3">📋 Task Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Task:</span>
                <p className="font-medium">{currentTaskForCompletion.taskName}</p>
              </div>
              <div>
                <span className="text-gray-600">Planned:</span>
                <p className="font-medium">{currentTaskForCompletion.plannedDuration} min</p>
              </div>
              <div>
                <span className="text-gray-600">Actual:</span>
                <p className={`font-medium ${
                  currentTaskForCompletion.actualTimeSpent > (currentTaskForCompletion.plannedDuration * 60) 
                    ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {Math.floor(currentTaskForCompletion.actualTimeSpent / 60)} min
                </p>
              </div>
            </div>
            {currentTaskForCompletion.sessionName && (
              <div className="mt-2 text-sm">
                <span className="text-gray-600">Session:</span>
                <span className="ml-2 font-medium text-purple-600">
                  {currentTaskForCompletion.sessionName}
                </span>
              </div>
            )}
          </div>

          {/* Completion Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Did you complete this task?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCompletionData(prev => ({ ...prev, isCompleted: true, completionPercentage: 100 }))}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 font-medium ${
                  completionData.isCompleted
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl">✅</span>
                <span>Yes, Completed</span>
              </button>
              <button
                type="button"
                onClick={() => setCompletionData(prev => ({ ...prev, isCompleted: false, completionPercentage: 50 }))}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 font-medium ${
                  !completionData.isCompleted
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl">⏳</span>
                <span>No, Incomplete</span>
              </button>
            </div>
          </div>

          {/* Completion Percentage (if not completed) */}
          {!completionData.isCompleted && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                How much did you complete? ({completionData.completionPercentage}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={completionData.completionPercentage}
                onChange={(e) => setCompletionData(prev => ({ 
                  ...prev, 
                  completionPercentage: parseInt(e.target.value) 
                }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* Reason for Incompletion */}
          {!completionData.isCompleted && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Why wasn't the task completed?
              </label>
              <select
                value={completionData.reason}
                onChange={(e) => setCompletionData(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                required={!completionData.isCompleted}
              >
                <option value="">Select a reason...</option>
                {incompletionReasons.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
              
              {completionData.reason === 'Custom reason' && (
                <textarea
                  placeholder="Please describe the specific reason..."
                  value={completionData.customReason}
                  onChange={(e) => setCompletionData(prev => ({ ...prev, customReason: e.target.value }))}
                  className="w-full mt-2 p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 resize-none"
                  rows="3"
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
                  onClick={() => setCompletionData(prev => ({ ...prev, difficultyLevel: level.value }))}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1 font-medium ${
                    completionData.difficultyLevel === level.value
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
                  onClick={() => setCompletionData(prev => ({ ...prev, qualityRating: rating }))}
                  className={`text-3xl transition-all duration-200 ${
                    rating <= completionData.qualityRating ? 'text-yellow-400' : 'text-gray-300'
                  } hover:text-yellow-400`}
                >
                  ⭐
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              {completionData.qualityRating}/5 stars
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={completionData.notes}
              onChange={(e) => setCompletionData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any insights, learnings, or observations..."
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
              rows="3"
            />
          </div>

          {/* Next Steps */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Next Steps (Optional)
            </label>
            <input
              type="text"
              value={completionData.nextSteps}
              onChange={(e) => setCompletionData(prev => ({ ...prev, nextSteps: e.target.value }))}
              placeholder="What needs to be done next for this task?"
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>📊</span>
              Submit Report
            </button>
            <button
              type="button"
              onClick={handleQuickComplete}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              Quick Complete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCompletionModal;
