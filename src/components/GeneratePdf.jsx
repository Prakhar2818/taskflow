// components/GeneratePDF.jsx - COMPLETE WITH NAVIGATION DATA HANDLING
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTaskContext } from "../context/taskContext";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

const GeneratePDF = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // ✅ GET DATA PASSED FROM NAVIGATION
  const sessionData = location.state?.sessionData;
  const completedSession = location.state?.completedSession;
  const sessionReport = location.state?.sessionReport;
  const passedReports = location.state?.allReports || [];

  // ✅ GET CONTEXT DATA
  const { 
    tasks = [], 
    sessions = [], 
    taskCompletionReports = [], 
    sessionCompletionReports = [] 
  } = useTaskContext();
  
  const [isGenerating, setIsGenerating] = useState(false);

  // ✅ COMBINE PASSED DATA WITH CONTEXT DATA
  const allReports = [...taskCompletionReports, ...passedReports];
  const allSessions = sessionData ? [...sessions, sessionData] : sessions;
  const allSessionReports = sessionReport ? [...sessionCompletionReports, sessionReport] : sessionCompletionReports;

  // ✅ LOG RECEIVED DATA FOR DEBUGGING
  useEffect(() => {
    if (sessionData) {
      console.log('📄 Received session data for PDF:', sessionData);
      console.log('📄 Session report:', sessionReport);
      console.log('📄 All task reports:', allReports);
    }
  }, [sessionData]);

  // ✅ REDIRECT IF NO DATA AVAILABLE
  useEffect(() => {
    const hasAnyData = tasks.length > 0 || sessions.length > 0 || sessionData || allReports.length > 0;
    
    if (!hasAnyData) {
      console.log('⚠️ No data available for PDF generation, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [tasks, sessions, sessionData, allReports, navigate]);

  const handleDownload = async () => {
    const hasData = tasks.length > 0 || allSessions.length > 0 || allReports.length > 0;
    
    if (!hasData) {
      alert("No tasks or sessions to export! Add some tasks or create a session first.");
      return;
    }

    setIsGenerating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const doc = new jsPDF();

      // ✅ DYNAMIC HEADER BASED ON SESSION DATA
      doc.setFontSize(24);
      doc.setTextColor(79, 70, 229);
      if (sessionData) {
        doc.text(`${sessionData.name} - Completion Report`, 14, 25);
      } else {
        doc.text("TaskFlow Comprehensive Report", 14, 25);
      }

      doc.setFontSize(12);
      doc.setTextColor(107, 114, 128);
      doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 35);

      let currentY = 50;

      // ✅ SESSION-SPECIFIC EXECUTIVE SUMMARY
      if (sessionData) {
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.text("SESSION COMPLETION SUMMARY", 14, currentY);
        currentY += 15;

        doc.setFontSize(11);
        doc.text(`Session Name: ${sessionData.name}`, 14, currentY);
        currentY += 7;
        doc.text(`Total Tasks: ${sessionData.tasks?.length || 0}`, 14, currentY);
        currentY += 7;
        doc.text(`Completed Tasks: ${sessionData.completedTasks || sessionData.tasks?.length || 0}`, 14, currentY);
        currentY += 7;
        doc.text(`Status: ${sessionData.status || 'Completed'}`, 14, currentY);
        currentY += 7;
        if (sessionData.startedAt) {
          doc.text(`Started: ${new Date(sessionData.startedAt).toLocaleString()}`, 14, currentY);
          currentY += 7;
        }
        if (sessionData.completedAt) {
          doc.text(`Completed: ${new Date(sessionData.completedAt).toLocaleString()}`, 14, currentY);
          currentY += 7;
        }

        // Calculate session duration
        if (sessionData.startedAt && sessionData.completedAt) {
          const duration = Math.round((new Date(sessionData.completedAt) - new Date(sessionData.startedAt)) / (1000 * 60));
          doc.text(`Total Duration: ${duration} minutes`, 14, currentY);
          currentY += 7;
        }

        currentY += 10;

        // ✅ SESSION TASKS BREAKDOWN
        if (sessionData.tasks && sessionData.tasks.length > 0) {
          doc.setFontSize(16);
          doc.setTextColor(34, 197, 94);
          doc.text("SESSION TASKS BREAKDOWN", 14, currentY);
          currentY += 15;

          const sessionTaskRows = sessionData.tasks.map((task, index) => [
            index + 1,
            task.name || 'Unnamed Task',
            task.completed ? 'Completed' : 'Pending',
            `${task.duration || 0} min`,
            task.completed && task.completedAt ? new Date(task.completedAt).toLocaleTimeString() : 'N/A'
          ]);

          autoTable(doc, {
            startY: currentY,
            head: [["#", "Task Name", "Status", "Duration", "Completed At"]],
            body: sessionTaskRows,
            theme: 'striped',
            headStyles: {
              fillColor: [34, 197, 94],
              textColor: [255, 255, 255],
              fontSize: 10,
              fontStyle: 'bold'
            },
            bodyStyles: {
              fontSize: 9,
              cellPadding: 3
            },
            alternateRowStyles: {
              fillColor: [240, 253, 244]
            },
            columnStyles: {
              0: { cellWidth: 15, halign: 'center' },
              1: { cellWidth: 70 },
              2: { cellWidth: 25, halign: 'center' },
              3: { cellWidth: 25, halign: 'center' },
              4: { cellWidth: 35, halign: 'center' }
            }
          });

          currentY = doc.lastAutoTable.finalY + 20;
        }
      }

      // ✅ EXECUTIVE SUMMARY - Updated for both session and general reports
      if (!sessionData || allReports.length > 0) {
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.text(sessionData ? "DETAILED TASK REPORTS SUMMARY" : "EXECUTIVE SUMMARY", 14, currentY);
        currentY += 15;

        const totalReports = allReports.length;
        const fullyCompletedReports = allReports.filter(r => r.isCompleted === true).length;
        const partiallyCompletedReports = allReports.filter(r => r.isCompleted === false && (r.completionPercentage || 0) > 0).length;
        const notStartedReports = allReports.filter(r => (r.completionPercentage || 0) === 0).length;
        const delayedReports = allReports.filter(r => r.wasDelayed).length;
        const avgQuality = totalReports > 0 ? 
          (allReports.reduce((sum, r) => sum + (r.qualityRating || 0), 0) / totalReports).toFixed(1) : 0;
        const avgCompletionRate = totalReports > 0 ?
          (allReports.reduce((sum, r) => sum + (r.completionPercentage || 0), 0) / totalReports).toFixed(1) : 0;

        doc.setFontSize(11);
        doc.text(`Total Tasks with Reports: ${totalReports}`, 14, currentY);
        currentY += 7;
        doc.text(`Fully Completed Tasks: ${fullyCompletedReports} (${totalReports > 0 ? ((fullyCompletedReports/totalReports)*100).toFixed(1) : 0}%)`, 14, currentY);
        currentY += 7;
        doc.text(`Partially Completed Tasks: ${partiallyCompletedReports} (${totalReports > 0 ? ((partiallyCompletedReports/totalReports)*100).toFixed(1) : 0}%)`, 14, currentY);
        currentY += 7;
        doc.text(`Not Started Tasks: ${notStartedReports} (${totalReports > 0 ? ((notStartedReports/totalReports)*100).toFixed(1) : 0}%)`, 14, currentY);
        currentY += 7;
        doc.text(`Average Completion Rate: ${avgCompletionRate}% per task`, 14, currentY);
        currentY += 7;
        doc.text(`Tasks Delayed: ${delayedReports} (${totalReports > 0 ? ((delayedReports/totalReports)*100).toFixed(1) : 0}%)`, 14, currentY);
        currentY += 7;
        doc.text(`Average Quality Rating: ${avgQuality}/5 stars`, 14, currentY);
        currentY += 20;
      }

      // ✅ DETAILED TASK COMPLETION REPORTS
      if (allReports.length > 0) {
        if (currentY > 240) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(18);
        doc.setTextColor(34, 197, 94);
        doc.text("DETAILED TASK COMPLETION REPORTS", 14, currentY);
        currentY += 15;

        const sortedReports = [...allReports].sort((a, b) => 
          new Date(a.completedAt || 0) - new Date(b.completedAt || 0)
        );

        sortedReports.forEach((report, index) => {
          if (currentY > 240) {
            doc.addPage();
            currentY = 20;
          }

          // Task Report Header
          doc.setFontSize(14);
          doc.setTextColor(79, 70, 229);
          doc.text(`${index + 1}. ${report.taskName || 'Unnamed Task'}`, 14, currentY);
          currentY += 10;

          // Task Status Badge
          doc.setFontSize(10);
          let statusText, statusColor;
          
          if (report.isCompleted === true) {
            statusText = 'FULLY COMPLETED';
            statusColor = [34, 197, 94];
          } else if ((report.completionPercentage || 0) > 0) {
            statusText = `PARTIALLY COMPLETED (${report.completionPercentage}%)`;
            statusColor = [249, 115, 22];
          } else {
            statusText = 'NOT COMPLETED';
            statusColor = [239, 68, 68];
          }
          
          doc.setTextColor(...statusColor);
          doc.text(`Status: ${statusText}`, 14, currentY);
          
          if (report.sessionName) {
            doc.setTextColor(147, 51, 234);
            doc.text(`Session: ${report.sessionName}`, 120, currentY);
          }
          currentY += 8;

          // Performance Metrics
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          
          const metricsData = [
            ['Metric', 'Planned', 'Actual', 'Status'],
            [
              'Duration',
              `${report.plannedDuration || 0} min`,
              `${report.actualDurationMinutes || Math.floor((report.actualTimeSpent || 0) / 60)} min`,
              report.wasDelayed ? 'Delayed' : 'On Time'
            ],
            [
              'Completion',
              '100%',
              `${report.completionPercentage || 0}%`,
              report.isCompleted === true ? 'Full' : 
              (report.completionPercentage || 0) > 0 ? 'Partial' : 'None'
            ],
            [
              'Quality',
              '5/5 stars',
              `${report.qualityRating || 0}/5 stars`,
              report.qualityRating >= 4 ? 'High' : report.qualityRating >= 3 ? 'Medium' : 'Low'
            ]
          ];

          autoTable(doc, {
            startY: currentY,
            head: [metricsData[0]],
            body: metricsData.slice(1),
            theme: 'grid',
            headStyles: {
              fillColor: [79, 70, 229],
              textColor: [255, 255, 255],
              fontSize: 8,
              fontStyle: 'bold'
            },
            bodyStyles: {
              fontSize: 7,
              cellPadding: 2
            },
            columnStyles: {
              0: { cellWidth: 30, fontStyle: 'bold' },
              1: { cellWidth: 25, halign: 'center' },
              2: { cellWidth: 25, halign: 'center' },
              3: { cellWidth: 30, halign: 'center' }
            },
            margin: { left: 14, right: 14 }
          });

          currentY = doc.lastAutoTable.finalY + 8;

          // Task Details
          doc.setFontSize(9);
          doc.setTextColor(55, 65, 81);

          if (report.difficultyLevel) {
            const difficultyText = {
              'easier': 'Easier than expected',
              'as-expected': 'As expected', 
              'harder': 'Harder than expected'
            };
            doc.text(`Difficulty: ${difficultyText[report.difficultyLevel] || report.difficultyLevel}`, 14, currentY);
            currentY += 6;
          }

          if (report.completedAt) {
            const completedDate = new Date(report.completedAt);
            doc.text(`Completed: ${completedDate.toLocaleDateString()} at ${completedDate.toLocaleTimeString()}`, 14, currentY);
            currentY += 6;
          }

          // Notes and Feedback
          if (report.notes && report.notes.trim()) {
            doc.setFontSize(10);
            doc.setTextColor(59, 130, 246);
            doc.text("NOTES & INSIGHTS:", 14, currentY);
            currentY += 7;

            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            
            const noteLines = doc.splitTextToSize(report.notes, 170);
            noteLines.forEach(line => {
              if (currentY > 280) {
                doc.addPage();
                currentY = 20;
              }
              doc.text(line, 20, currentY);
              currentY += 5;
            });
            currentY += 3;
          }

          // Add separator line between reports
          if (index < sortedReports.length - 1) {
            doc.setDrawColor(229, 231, 235);
            doc.line(14, currentY, 196, currentY);
            currentY += 10;
          }
        });

        currentY += 15;
      }

      // ✅ SUMMARY TABLES
      if (allReports.length > 0) {
        if (currentY > 200) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("TASK PERFORMANCE SUMMARY TABLE", 14, currentY);
        currentY += 15;

        const summaryRows = allReports.map((report, index) => [
          index + 1,
          report.taskName || 'Unknown Task',
          report.isCompleted === true ? 'Completed' : 
          (report.completionPercentage || 0) > 0 ? 'Partial' : 'Incomplete',
          `${report.completionPercentage || 0}%`,
          `${report.plannedDuration || 0}min`,
          `${report.actualDurationMinutes || Math.floor((report.actualTimeSpent || 0) / 60)}min`,
          report.wasDelayed ? `+${report.delayAmount || 0}min` : 'On time',
          `${report.qualityRating || 0}/5`,
          report.difficultyLevel || 'N/A'
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [["#", "Task", "Status", "Complete%", "Planned", "Actual", "Delay", "Quality", "Difficulty"]],
          body: summaryRows,
          theme: 'striped',
          headStyles: {
            fillColor: [16, 185, 129],
            textColor: [255, 255, 255],
            fontSize: 8,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 7,
            cellPadding: 2
          },
          alternateRowStyles: {
            fillColor: [236, 253, 245]
          },
          columnStyles: {
            0: { cellWidth: 8, halign: 'center' },
            1: { cellWidth: 35 },
            2: { cellWidth: 18, halign: 'center' },
            3: { cellWidth: 15, halign: 'center' },
            4: { cellWidth: 15, halign: 'center' },
            5: { cellWidth: 15, halign: 'center' },
            6: { cellWidth: 15, halign: 'center' },
            7: { cellWidth: 12, halign: 'center' },
            8: { cellWidth: 20, halign: 'center' }
          }
        });

        currentY = doc.lastAutoTable.finalY + 20;
      }

      // ✅ INDIVIDUAL TASKS (from context)
      if (tasks.length > 0) {
        if (currentY > 200) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(16);
        doc.setTextColor(168, 85, 247);
        doc.text("INDIVIDUAL TASKS", 14, currentY);
        currentY += 15;

        const taskRows = tasks.map((task, index) => [
          index + 1,
          task.name || 'Unnamed Task',
          task.status || 'pending',
          task.priority || 'medium',
          task.duration ? `${task.duration} min` : 'N/A',
          task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [["#", "Task Name", "Status", "Priority", "Duration", "Created"]],
          body: taskRows,
          theme: 'grid',
          headStyles: {
            fillColor: [168, 85, 247],
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 8,
            cellPadding: 2
          }
        });

        currentY = doc.lastAutoTable.finalY + 20;
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
        doc.text("Generated by TaskFlow", 14, doc.internal.pageSize.height - 10);
      }

      // ✅ DYNAMIC FILENAME
      const filename = sessionData 
        ? `taskflow-${sessionData.name.replace(/\s+/g, '-').toLowerCase()}-report-${new Date().toISOString().split('T')[0]}.pdf`
        : `taskflow-detailed-report-${new Date().toISOString().split('T')[0]}.pdf`;

      doc.save(filename);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ✅ ENHANCED STATS CALCULATION
  const getOverallStats = () => {
    const safeTasks = tasks || [];
    const safeSessions = allSessions || [];
    const safeTaskReports = allReports || [];

    const individualCompleted = safeTasks.filter(task => task.status === "completed").length;
    const sessionsCompleted = safeSessions.filter(session => session.status === "completed").length;
    const totalItems = safeTasks.length + safeSessions.length;
    const totalCompleted = individualCompleted + sessionsCompleted;
    
    return { 
      completed: totalCompleted, 
      total: totalItems, 
      percentage: totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0,
      individualTasks: safeTasks.length,
      sessions: safeSessions.length,
      taskReports: safeTaskReports.length,
      sessionReports: allSessionReports.length
    };
  };

  const stats = getOverallStats();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ✅ BACK BUTTON */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* ✅ HEADER */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-3">
            <span>📄</span>
            {sessionData ? `${sessionData.name} - Report Generated!` : 'Generate PDF Report'}
          </h1>

          {/* ✅ SESSION SUCCESS MESSAGE */}
          {sessionData && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <h3 className="text-lg font-semibold text-green-800">
                    Congratulations! Session "{sessionData.name}" Completed Successfully!
                  </h3>
                  <p className="text-green-600 mt-1">
                    You completed {sessionData.completedTasks || sessionData.tasks?.length || 0} out of {sessionData.tasks?.length || 0} tasks.
                    {sessionData.startedAt && sessionData.completedAt && (
                      ` Total session duration: ${Math.round((new Date(sessionData.completedAt) - new Date(sessionData.startedAt)) / (1000 * 60))} minutes.`
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ✅ STATS OVERVIEW */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-700 font-medium">Total Items</div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-green-700 font-medium">Completed</div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">{stats.percentage}%</div>
              <div className="text-sm text-purple-700 font-medium">Success Rate</div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">{stats.taskReports}</div>
              <div className="text-sm text-orange-700 font-medium">Detailed Reports</div>
            </div>
          </div>

          {/* ✅ GENERATE PDF BUTTON */}
          <div className="flex justify-center">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3 text-lg ${
                isGenerating
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
              }`}
            >
              <span className="text-2xl">
                {isGenerating ? "⏳" : "📄"}
              </span>
              {isGenerating ? "Generating PDF..." : sessionData ? "Download Session Report" : "Generate Comprehensive Report"}
            </button>
          </div>

          {/* ✅ ADDITIONAL INFO */}
          {(tasks.length > 0 || allSessions.length > 0 || allReports.length > 0) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center text-sm text-gray-600">
                Report will include: {stats.individualTasks} individual tasks, {stats.sessions} sessions, 
                and {stats.taskReports} detailed completion reports
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneratePDF;
