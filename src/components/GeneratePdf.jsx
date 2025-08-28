// components/GeneratePDF.jsx - USING YOUR ACTUAL DATA STRUCTURE
import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTaskContext } from "../context/taskContext";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

const GeneratePDF = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    taskCompletionReports = [],
    sessionCompletionReports = [],
    fetchAllData,
    addSessionReportAPI, // ✅ Using your existing API function
    isLoading
  } = useTaskContext();

  const sessionData = location.state?.sessionData;
  const sessionReport = location.state?.sessionReport;

  const [isGenerating, setIsGenerating] = useState(false);
  const [dataReady, setDataReady] = useState(false);

  // ✅ DEBUG: Log the exact data structure from your console
  useEffect(() => {
    console.log('🔍 GeneratePDF Data Check:', {
      sessionData,
      sessionReport,
      taskReports: taskCompletionReports.length,
      sessionReports: sessionCompletionReports.length
    });

    // Log each task to see the 'reason' field
    taskCompletionReports.forEach((report, index) => {
      console.log(`Task ${index}:`, {
        taskName: report?.taskName,
        reason: report?.reason,
        isCompleted: report?.isCompleted,
        reportedAt: report?.reportedAt
      });
    });

    setDataReady(
      (sessionData || sessionReport || taskCompletionReports.length > 0) && !isLoading
    );
  }, [sessionData, sessionReport, taskCompletionReports, sessionCompletionReports, isLoading]);

  const getSessionSummary = useCallback(() => {
    if (sessionReport) {
      return {
        sessionName: sessionReport.sessionName || 'Unnamed Session',
        totalTasks: sessionReport.totalTasks || 0,
        completedTasks: sessionReport.completedTasks || 0,
        startedAt: sessionReport.startedAt,
        completedAt: sessionReport.completedAt,
        status: sessionReport.status || 'completed',
        duration: sessionReport.completedAt && sessionReport.startedAt 
          ? Math.round((new Date(sessionReport.completedAt) - new Date(sessionReport.startedAt)) / 60000)
          : 0,
        productivity: sessionReport.totalTasks > 0 
          ? Math.round((sessionReport.completedTasks / sessionReport.totalTasks) * 100) 
          : 0
      };
    } else if (sessionData) {
      return {
        sessionName: sessionData.name || 'Backend Session',
        totalTasks: sessionData.completedTasks || 2, // From your debug data
        completedTasks: sessionData.completedTasks || 2,
        startedAt: sessionData.startedAt,
        completedAt: sessionData.completedAt,
        status: sessionData.status || 'completed',
        duration: sessionData.completedAt && sessionData.startedAt 
          ? Math.round((new Date(sessionData.completedAt) - new Date(sessionData.startedAt)) / 60000)
          : 60, // Default from your data
        productivity: sessionData.completionRate || 100
      };
    }
    return null;
  }, [sessionData, sessionReport]);

  const sessionSummary = getSessionSummary();

  // ✅ MAIN DOWNLOAD FUNCTION WITH YOUR DATA STRUCTURE
  const handleDownload = useCallback(async () => {
    console.log('📄 Starting download with your actual data structure...');
    
    const currentTaskReports = taskCompletionReports;
    const currentSessionSummary = getSessionSummary();

    if (!currentSessionSummary && (!currentTaskReports || currentTaskReports.length === 0)) {
      alert("No data available for PDF generation!");
      return;
    }

    setIsGenerating(true);

    try {
      // ✅ STEP 1: CALL addSessionReportAPI WITH YOUR DATA
      console.log('📡 Calling addSessionReportAPI...');
      
      const sessionReportData = {
        sessionName: currentSessionSummary?.sessionName || 'Backend Session',
        actualTime: currentSessionSummary?.duration * 60 || 3600, // Convert to seconds
        productivity: currentSessionSummary?.productivity || 100,
        overallRating: 5,
        notes: `Complete session report generated on ${new Date().toLocaleDateString()}. ${currentTaskReports.length} tasks included.`,
        taskReports: currentTaskReports
      };

      const sessionId = sessionData?.id || sessionReport?.sessionId;
      
      if (sessionId && addSessionReportAPI) {
        try {
          console.log(`🔄 Adding session report for: ${sessionId}`);
          const apiResponse = await addSessionReportAPI(sessionId, sessionReportData);
          console.log('✅ addSessionReportAPI successful:', apiResponse);
        } catch (apiError) {
          console.warn('⚠️ API call failed, continuing with PDF generation:', apiError);
        }
      }

      // ✅ STEP 2: GENERATE PDF WITH YOUR ACTUAL DATA
      await generatePDF(currentTaskReports, currentSessionSummary, sessionData);

    } catch (error) {
      console.error('❌ Error in handleDownload:', error);
      alert(`Error: ${error.message}. Generating PDF with available data...`);
      
      // Fallback: Generate PDF anyway
      await generatePDF(taskCompletionReports, currentSessionSummary, sessionData);
    } finally {
      setIsGenerating(false);
    }
  }, [taskCompletionReports, getSessionSummary, sessionData, sessionReport, addSessionReportAPI]);

  // ✅ PDF GENERATION USING YOUR EXACT DATA STRUCTURE
  const generatePDF = async (taskReports, sessionSummary, sessionData) => {
    try {
      console.log('📄 Generating PDF with your data:', { taskReports: taskReports?.length, sessionSummary, sessionData });
      
      const doc = new jsPDF();
      let currentY = 20;

      // ✅ HEADER
      doc.setFontSize(24);
      doc.setTextColor(59, 130, 246);
      doc.setFont('helvetica', 'bold');
      doc.text('TASK FLOW', 20, currentY);
      currentY += 15;

      doc.setFontSize(18);
      doc.setTextColor(40, 44, 52);
      const title = sessionSummary?.sessionName || sessionData?.name || 'Backend Session Report';
      doc.text(title, 20, currentY);
      currentY += 15;

      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, currentY);
      currentY += 20;

      // ✅ SESSION SUMMARY FROM YOUR DATA
      if (sessionSummary || sessionData) {
        doc.setFontSize(14);
        doc.setTextColor(34, 197, 94);
        doc.setFont('helvetica', 'bold');
        doc.text('SESSION SUMMARY', 20, currentY);
        currentY += 15;

        // Session info box
        doc.setFillColor(248, 250, 252);
        doc.rect(20, currentY - 5, 170, 50, 'F');
        doc.setDrawColor(34, 197, 94);
        doc.setLineWidth(1);
        doc.rect(20, currentY - 5, 170, 50);

        doc.setTextColor(40, 44, 52);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        
        // Use your actual session data
        doc.text(`Session: ${sessionData?.name || 'Backend Session'}`, 25, currentY + 8);
        doc.text(`ID: ${sessionData?.id || 'N/A'}`, 25, currentY + 16);
        doc.text(`Completed Tasks: ${sessionData?.completedTasks || taskReports?.length || 0}`, 25, currentY + 24);
        doc.text(`Efficiency: ${sessionData?.efficiency || 0}`, 25, currentY + 32);
        doc.text(`Completion Rate: ${sessionData?.completionRate || 100}%`, 25, currentY + 40);

        currentY += 60;

        // Timeline from your data
        if (sessionData?.completedAt) {
          doc.setTextColor(107, 114, 128);
          doc.setFontSize(9);
          doc.text(`Completed: ${new Date(sessionData.completedAt).toLocaleString()}`, 20, currentY);
          currentY += 10;
        }
        if (sessionData?.startedAt) {
          doc.text(`Started: ${new Date(sessionData.startedAt).toLocaleString()}`, 20, currentY);
          currentY += 10;
        }

        currentY += 15;
      }

      // ✅ TASK REPORTS USING YOUR EXACT DATA STRUCTURE
      if (taskReports && taskReports.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(59, 130, 246);
        doc.setFont('helvetica', 'bold');
        doc.text(`TASK REPORTS (${taskReports.length} tasks)`, 20, currentY);
        currentY += 15;

        // Process each task using your data structure
        taskReports.forEach((task, index) => {
          if (currentY > 240) {
            doc.addPage();
            currentY = 20;
          }

          // ✅ TASK HEADER
          doc.setFontSize(12);
          doc.setTextColor(34, 197, 94);
          doc.setFont('helvetica', 'bold');
          doc.text(`${index + 1}. Task: ${task?.taskName || 'Unnamed Task'}`, 20, currentY);
          currentY += 12;

          // ✅ TASK DETAILS FROM YOUR DATA
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(40, 44, 52);

          // Status
          const statusText = task?.isCompleted ? 'COMPLETED' : 'INCOMPLETE';
          const statusColor = task?.isCompleted ? [34, 197, 94] : [239, 68, 68];
          doc.setTextColor(...statusColor);
          doc.setFont('helvetica', 'bold');
          doc.text(`Status: ${statusText}`, 25, currentY);
          currentY += 10;

          // ✅ REASON (DELAY REASON) - YOUR KEY FIELD
          if (task?.reason) {
            doc.setFillColor(255, 243, 224);
            doc.rect(23, currentY - 3, 150, 15, 'F');
            doc.setDrawColor(234, 88, 12);
            doc.setLineWidth(1);
            doc.rect(23, currentY - 3, 150, 15);

            doc.setTextColor(234, 88, 12);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.text('REASON/NOTES:', 27, currentY + 4);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(40, 44, 52);
            doc.setFontSize(8);
            // ✅ DISPLAY THE REASON FROM YOUR DATA
            doc.text(`${task.reason}`, 27, currentY + 9);

            currentY += 20;
          }

          // ✅ ADDITIONAL TASK INFO
          doc.setTextColor(40, 44, 52);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);

          if (task?.completionPercentage) {
            doc.text(`Completion: ${task.completionPercentage}%`, 25, currentY);
            currentY += 8;
          }

          if (task?.reportedAt) {
            doc.setTextColor(107, 114, 128);
            doc.setFontSize(8);
            doc.text(`Reported: ${new Date(task.reportedAt).toLocaleString()}`, 25, currentY);
            currentY += 8;
          }

          if (task?.notes) {
            doc.setTextColor(59, 130, 246);
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8);
            doc.text(`Notes: ${task.notes}`, 25, currentY);
            currentY += 8;
          }

          // Task ID
          if (task?.id) {
            doc.setTextColor(107, 114, 128);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.text(`Task ID: ${task.id}`, 25, currentY);
            currentY += 6;
          }

          // Separator
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          doc.line(20, currentY + 3, 190, currentY + 3);
          currentY += 15;
        });
      }

      // ✅ FOOTER
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(20, 280, 190, 280);
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.text(`Page ${i} of ${pageCount}`, 20, 287);
        doc.text('Generated by TaskFlow', 160, 287);
      }

      // ✅ SAVE PDF
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `TaskFlow-${sessionData?.name || 'Session'}-${timestamp}.pdf`;

      doc.save(filename);
      console.log('✅ PDF saved:', filename);

    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      throw error;
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Loading state
  if (isLoading || !dataReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white rounded-full p-3">
              <span className="text-2xl font-bold text-blue-600">TF</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold">TaskFlow</h1>
              <p className="text-blue-100">Backend Session Report Generator</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 mt-6">
            <h2 className="text-2xl font-semibold mb-2">
              {sessionData?.name || 'Backend Session'} - Complete Report
            </h2>
            <p className="text-blue-100">
              Generate PDF using your backend data with reason field
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-8 flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium"
        >
          ← Back to Dashboard
        </button>

        {/* Session Summary */}
        {sessionData && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 mb-8 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="bg-green-500 rounded-full p-3">
                <span className="text-2xl text-white">📊</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">
                  Session "{sessionData.name}" Ready for Export
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white rounded-lg p-3">
                    <span className="text-green-600 font-medium">Completed Tasks</span>
                    <p className="text-2xl font-bold text-green-800">{sessionData.completedTasks}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <span className="text-green-600 font-medium">Efficiency</span>
                    <p className="text-2xl font-bold text-green-800">{sessionData.efficiency}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <span className="text-green-600 font-medium">Completion Rate</span>
                    <p className="text-2xl font-bold text-green-800">{sessionData.completionRate}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Task Data Preview */}
        {taskCompletionReports.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              Task Data Preview ({taskCompletionReports.length} tasks)
            </h3>
            
            <div className="space-y-4">
              {taskCompletionReports.map((task, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{task?.taskName}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${
                      task?.isCompleted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {task?.isCompleted ? 'Completed' : 'Incomplete'}
                    </span>
                  </div>
                  
                  {task?.reason && (
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-3 mb-2">
                      <p className="text-orange-700 text-sm">
                        <strong>Reason:</strong> {task.reason}
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                    <div>Completion: {task?.completionPercentage || 0}%</div>
                    <div>Task ID: {task?.id}</div>
                    <div>Reported: {task?.reportedAt ? new Date(task.reportedAt).toLocaleDateString() : 'N/A'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Download Button */}
        <div className="text-center">
          <button
            onClick={handleDownload}
            disabled={isGenerating || isLoading || !dataReady}
            className={`px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-4 mx-auto ${
              isGenerating || isLoading || !dataReady
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            }`}
          >
            <span className="text-2xl">
              {isGenerating ? "⏳" : isLoading ? "🔄" : "📄"}
            </span>
            <div className="text-left">
              <div>
                {isGenerating ? "Generating Report..." :
                 isLoading ? "Loading Data..." :
                 !dataReady ? "Preparing Data..." :
                 "Generate Complete Report"}
              </div>
              <div className="text-sm opacity-90">
                {isGenerating ? "Processing your backend data..." : "Uses your exact data structure with 'reason' field"}
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Report Generation Process:</strong></p>
            <p>1. ✅ Use your backend session data structure</p>
            <p>2. ✅ Call addSessionReportAPI if available</p>
            <p>3. ✅ Generate PDF with all task 'reason' fields</p>
            <p>4. ✅ Include completion status and timestamps</p>
            <p className="text-xs text-gray-400 mt-4">TaskFlow - Backend Data Integration System</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratePDF;
