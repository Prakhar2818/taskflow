// components/GeneratePDF.jsx - FIXED SUMMARY CALCULATION
import React, { useState } from "react";
import { useTaskContext } from "../context/taskContext";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

const GeneratePDF = () => {
  const { 
    tasks = [], 
    sessions = [], 
    taskCompletionReports = [], 
    sessionCompletionReports = [] 
  } = useTaskContext();
  
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (tasks.length === 0 && sessions.length === 0) {
      alert("No tasks or sessions to export! Add some tasks or create a session first.");
      return;
    }

    setIsGenerating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const doc = new jsPDF();

      // Header
      doc.setFontSize(24);
      doc.setTextColor(79, 70, 229);
      doc.text("TaskFlow Comprehensive Report", 14, 25);

      doc.setFontSize(12);
      doc.setTextColor(107, 114, 128);
      doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 35);

      let currentY = 50;

      // **FIXED: Executive Summary - Corrected Completion Logic**
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text("EXECUTIVE SUMMARY", 14, currentY);
      currentY += 15;

      const totalReports = taskCompletionReports.length;
      
      // **FIXED: Use the actual isCompleted field from reports**
      const fullyCompletedReports = taskCompletionReports.filter(r => r.isCompleted === true).length;
      const partiallyCompletedReports = taskCompletionReports.filter(r => r.isCompleted === false && (r.completionPercentage || 0) > 0).length;
      const notStartedReports = taskCompletionReports.filter(r => (r.completionPercentage || 0) === 0).length;
      
      const delayedReports = taskCompletionReports.filter(r => r.wasDelayed).length;
      const avgQuality = totalReports > 0 ? 
        (taskCompletionReports.reduce((sum, r) => sum + (r.qualityRating || 0), 0) / totalReports).toFixed(1) : 0;

      // **FIXED: Calculate average completion percentage**
      const avgCompletionRate = totalReports > 0 ?
        (taskCompletionReports.reduce((sum, r) => sum + (r.completionPercentage || 0), 0) / totalReports).toFixed(1) : 0;

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

      // **FIXED: Detailed Task Completion Reports Section**
      if (taskCompletionReports.length > 0) {
        doc.setFontSize(18);
        doc.setTextColor(34, 197, 94); // Green
        doc.text("DETAILED TASK COMPLETION REPORTS", 14, currentY);
        currentY += 15;

        // Sort reports by completion date
        const sortedReports = [...taskCompletionReports].sort((a, b) => 
          new Date(a.completedAt || 0) - new Date(b.completedAt || 0)
        );

        sortedReports.forEach((report, index) => {
          // Check if we need a new page
          if (currentY > 240) {
            doc.addPage();
            currentY = 20;
          }

          // **Task Report Header**
          doc.setFontSize(14);
          doc.setTextColor(79, 70, 229); // Indigo
          doc.text(`${index + 1}. ${report.taskName || 'Unnamed Task'}`, 14, currentY);
          currentY += 10;

          // **FIXED: Task Status Badge - More Accurate Status**
          doc.setFontSize(10);
          let statusText, statusColor;
          
          if (report.isCompleted === true) {
            statusText = 'FULLY COMPLETED';
            statusColor = [34, 197, 94]; // Green
          } else if ((report.completionPercentage || 0) > 0) {
            statusText = `PARTIALLY COMPLETED (${report.completionPercentage}%)`;
            statusColor = [249, 115, 22]; // Orange
          } else {
            statusText = 'NOT COMPLETED';
            statusColor = [239, 68, 68]; // Red
          }
          
          doc.setTextColor(...statusColor);
          doc.text(`Status: ${statusText}`, 14, currentY);
          
          if (report.sessionName) {
            doc.setTextColor(147, 51, 234); // Purple
            doc.text(`Session: ${report.sessionName}`, 120, currentY);
          }
          currentY += 8;

          // **Performance Metrics**
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          
          // **FIXED: Create metrics table with accurate completion status**
          const metricsData = [
            ['Metric', 'Planned', 'Actual', 'Status'],
            [
              'Duration',
              `${report.plannedDuration || 0} min`,
              `${report.actualDurationMinutes || 0} min`,
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

          // **Task Details Section**
          doc.setFontSize(9);
          doc.setTextColor(55, 65, 81); // Gray-700

          // Difficulty Assessment
          if (report.difficultyLevel) {
            const difficultyText = {
              'easier': 'Easier than expected',
              'as-expected': 'As expected', 
              'harder': 'Harder than expected'
            };
            doc.text(`Difficulty: ${difficultyText[report.difficultyLevel] || report.difficultyLevel}`, 14, currentY);
            currentY += 6;
          }

          // Completion Date
          if (report.completedAt) {
            const completedDate = new Date(report.completedAt);
            doc.text(`Completed: ${completedDate.toLocaleDateString()} at ${completedDate.toLocaleTimeString()}`, 14, currentY);
            currentY += 6;
          }

          // **FIXED: Issues Section - Show for all incomplete tasks**
          if (report.wasDelayed || !report.isCompleted || (report.completionPercentage || 0) < 100) {
            doc.setFontSize(10);
            doc.setTextColor(239, 68, 68); // Red
            doc.text("ISSUES ENCOUNTERED:", 14, currentY);
            currentY += 7;

            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);

            if (report.wasDelayed) {
              doc.text(`- Task was delayed by ${report.delayAmount || 0} minutes`, 20, currentY);
              currentY += 6;
            }

            if (report.isCompleted === false) {
              doc.text(`- Task was only ${report.completionPercentage || 0}% completed`, 20, currentY);
              currentY += 6;
            }

            // Reason for delay/incompletion
            const reason = report.finalReason || report.reason;
            if (reason) {
              doc.text(`- Primary Reason: ${reason}`, 20, currentY);
              currentY += 6;

              if (report.customDelayReason) {
                doc.text(`- Additional Details: ${report.customDelayReason}`, 20, currentY);
                currentY += 6;
              }
            }
          }

          // **Success Indicators for Completed Tasks**
          if (report.isCompleted === true) {
            doc.setFontSize(10);
            doc.setTextColor(34, 197, 94); // Green
            doc.text("TASK COMPLETED SUCCESSFULLY:", 14, currentY);
            currentY += 7;

            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            doc.text(`- Task finished with ${report.completionPercentage || 100}% completion`, 20, currentY);
            currentY += 6;
            
            if (!report.wasDelayed) {
              doc.text(`- Completed within planned timeframe`, 20, currentY);
              currentY += 6;
            }
          }

          // **Notes and Feedback**
          if (report.notes && report.notes.trim()) {
            doc.setFontSize(10);
            doc.setTextColor(59, 130, 246); // Blue
            doc.text("NOTES & INSIGHTS:", 14, currentY);
            currentY += 7;

            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            
            // Split long notes into multiple lines
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

          // **Next Steps**
          if (report.nextSteps && report.nextSteps.trim()) {
            doc.setFontSize(10);
            doc.setTextColor(16, 185, 129); // Emerald
            doc.text("NEXT STEPS:", 14, currentY);
            currentY += 7;

            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            
            const nextStepsLines = doc.splitTextToSize(report.nextSteps, 170);
            nextStepsLines.forEach(line => {
              if (currentY > 280) {
                doc.addPage();
                currentY = 20;
              }
              doc.text(line, 20, currentY);
              currentY += 5;
            });
            currentY += 3;
          }

          // **Performance Summary Box**
          if (report.qualityRating || report.difficultyLevel) {
            const boxY = currentY;
            const boxHeight = 20;
            
            // Draw background box
            doc.setFillColor(248, 250, 252); // Light gray
            doc.rect(14, boxY, 182, boxHeight, 'F');
            
            doc.setFontSize(8);
            doc.setTextColor(55, 65, 81);
            doc.text("PERFORMANCE SUMMARY:", 18, boxY + 6);
            
            let summaryText = "";
            if (report.qualityRating) {
              summaryText += `Quality: ${report.qualityRating}/5 stars`;
            }
            if (report.difficultyLevel) {
              summaryText += summaryText ? ` | Difficulty: ${report.difficultyLevel}` : `Difficulty: ${report.difficultyLevel}`;
            }
            if (report.efficiency) {
              summaryText += summaryText ? ` | Efficiency: ${report.efficiency}%` : `Efficiency: ${report.efficiency}%`;
            }
            
            // **FIXED: Add completion summary**
            const completionSummary = report.isCompleted ? 'FULLY COMPLETED' : `${report.completionPercentage || 0}% COMPLETED`;
            summaryText += summaryText ? ` | Status: ${completionSummary}` : `Status: ${completionSummary}`;
            
            doc.text(summaryText, 18, boxY + 11);
            
            // Add recommendation if task was incomplete
            if (!report.isCompleted) {
              doc.setTextColor(239, 68, 68); // Red
              doc.text("RECOMMENDATION: Task requires follow-up to complete remaining work.", 18, boxY + 16);
            }
            
            currentY += boxHeight + 5;
          }

          // Add separator line between tasks
          if (index < sortedReports.length - 1) {
            doc.setDrawColor(229, 231, 235); // Light gray
            doc.line(14, currentY, 196, currentY);
            currentY += 10;
          }
        });

        currentY += 15;
      }

      // **FIXED: Summary Tables Section with Accurate Status**
      if (taskCompletionReports.length > 0) {
        // Check if we need a new page
        if (currentY > 200) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("TASK PERFORMANCE SUMMARY TABLE", 14, currentY);
        currentY += 15;

        const summaryRows = taskCompletionReports.map((report, index) => [
          index + 1,
          report.taskName || 'Unknown Task',
          // **FIXED: Accurate status display**
          report.isCompleted === true ? 'Completed' : 
          (report.completionPercentage || 0) > 0 ? 'Partial' : 'Incomplete',
          `${report.completionPercentage || 0}%`,
          `${report.plannedDuration || 0}min`,
          `${report.actualDurationMinutes || 0}min`,
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

      // Rest of the existing code for sessions and individual tasks...
      // (SESSION REPORTS and INDIVIDUAL TASKS sections remain the same)

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
        doc.text("Generated by TaskFlow", 14, doc.internal.pageSize.height - 10);
      }

      doc.save(`taskflow-detailed-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Rest of the component remains the same...
  const getOverallStats = () => {
    const safeTasks = tasks || [];
    const safeSessions = sessions || [];
    const safeTaskReports = taskCompletionReports || [];

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
      taskReports: safeTaskReports.length
    };
  };

  const stats = getOverallStats();

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      {(tasks.length > 0 || sessions.length > 0) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border border-blue-200">
          <div className="text-sm text-blue-700 font-medium">
            Progress: {stats.completed}/{stats.total} ({stats.percentage}%)
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {stats.taskReports} detailed reports | {stats.individualTasks} tasks | {stats.sessions} sessions
          </div>
        </div>
      )}

      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 ${
          isGenerating
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
        }`}
      >
        <span className="text-xl">
          {isGenerating ? "⏳" : "📄"}
        </span>
        {isGenerating ? "Generating..." : "Export Detailed Report"}
      </button>
    </div>
  );
};

export default GeneratePDF;
