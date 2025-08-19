// src/pages/SessionTimerPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SessionTimer from "../components/SessionTimer";
import Timer from "../components/Timer";
import GeneratePdf from "../components/GeneratePdf";
import { TaskProvider } from "../context/taskContext";

const SessionTimerPage = () => {
  const location = useLocation();
  const session = location.state?.session;
  const showReportGeneration = location.state?.showReportGeneration;
  const completedTaskReport = location.state?.completedTaskReport;
  const navigate = useNavigate();
  
  const [showPdfGenerator, setShowPdfGenerator] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Show PDF generator button if we came from task completion
  useEffect(() => {
    if (showReportGeneration) {
      setShowPdfGenerator(true);
    }
  }, [showReportGeneration]);

  const handleStartGeneration = () => {
    setIsGenerating(true);
  };

  const handleReportGenerated = () => {
    setIsGenerating(false);
    setReportGenerated(true);
    // Auto redirect to dashboard after 3 seconds
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  const handleGenerationError = () => {
    setIsGenerating(false);
    // Could show error message here
  };

  return (
    <TaskProvider>
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-8">
        <div className="w-full max-w-4xl flex flex-col gap-6 items-stretch">
          {/* Header */}
          <h1 className="text-4xl font-extrabold text-center mb-2 text-indigo-700 tracking-tight">
            Focus Session
          </h1>
          
          {/* Session Info Card */}
          {session && (
            <div className="bg-white/80 rounded-2xl shadow-lg border border-indigo-100 px-8 py-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">{session.name}</h2>
              <ul className="space-y-3">
                {session.tasks.map((task, idx) => (
                  <li key={idx} className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-indigo-700">{idx + 1}.</span>
                      <span className="ml-2 font-medium text-gray-800">{task.name}</span>
                      <span className="ml-3 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {task.priority}
                      </span>
                    </div>
                    <span className="text-indigo-500 font-semibold">{task.duration} min</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Report Generation Section */}
          {showPdfGenerator && !reportGenerated && !isGenerating && (
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow-lg p-8 text-white text-center">
              <div className="mb-4">
                <span className="text-4xl">🎉</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Task Completed Successfully!</h3>
              <p className="text-emerald-100 mb-6">
                Great job! Your task report has been submitted. Generate a detailed PDF report of your session.
              </p>
              
              {/* GeneratePdf Component */}
              <div className="flex justify-center">
                <GeneratePdf 
                  sessionData={session}
                  taskReport={completedTaskReport}
                  onGenerationStart={handleStartGeneration}
                  onReportGenerated={handleReportGenerated}
                  onGenerationError={handleGenerationError}
                />
              </div>
            </div>
          )}

          {/* Report Generation in Progress */}
          {isGenerating && (
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl shadow-lg p-8 text-white text-center">
              <div className="mb-4">
                <span className="text-4xl">⚙️</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Generating Report...</h3>
              <p className="text-yellow-100 mb-6">
                Please wait while we create your detailed session report.
              </p>
              <div className="flex justify-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          )}

          {/* Report Generated Success */}
          {reportGenerated && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white text-center">
              <div className="mb-4">
                <span className="text-4xl">📄</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Report Generated Successfully!</h3>
              <p className="text-blue-100 mb-4">
                Your session report has been generated and downloaded. Redirecting to dashboard...
              </p>
              <div className="flex justify-center items-center gap-2">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-100">Redirecting in 3 seconds...</span>
              </div>
            </div>
          )}

          {/* Timer and SessionTimer side-by-side - Only show if not in report mode */}
          {!showPdfGenerator && (
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start justify-center w-full">
              <div className="w-full md:w-1/2 flex justify-center">
                <div className="w-full max-w-md">
                  <Timer session={session} />
                </div>
              </div>
              <div className="w-full md:w-1/2 flex justify-center">
                <div className="w-full max-w-md">
                  <SessionTimer session={session} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Back to Dashboard Button - Only show if not generating or completed */}
        {!reportGenerated && !isGenerating && (
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-10 px-6 py-3 rounded-xl font-semibold bg-indigo-600 text-white shadow hover:bg-indigo-700 transition-all duration-200"
          >
            Back to Dashboard
          </button>
        )}
      </div>
    </TaskProvider>
  );
};

export default SessionTimerPage;
