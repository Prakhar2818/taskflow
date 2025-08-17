// components/GeneratePDF.jsx - FIXED VERSION
import React, { useState } from "react";
import { useTaskContext } from "../context/taskContext";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

const GeneratePDF = () => {
  // **FIXED: Added default empty arrays and null checks**
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

      // **FIXED: Task Completion Reports Section with null checks**
      if (taskCompletionReports && taskCompletionReports.length > 0) {
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.text("Task Completion Reports", 14, currentY);
        currentY += 15;

        const completionReportRows = taskCompletionReports.map((report, index) => [
          index + 1,
          report.taskName || 'Unknown Task',
          report.isCompleted ? 'Completed' : 'Incomplete',
          `${report.completionPercentage || 0}%`,
          `${report.plannedDuration || 0}min`,
          `${report.actualDurationMinutes || 0}min`,
          report.wasDelayed ? `+${report.delayAmount || 0}min` : 'On time',
          `${report.qualityRating || 0}/5`,
          report.difficultyLevel || 'N/A',
          report.finalReason || report.reason || 'N/A'
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [["#", "Task", "Status", "Complete%", "Planned", "Actual", "Delay", "Quality", "Difficulty", "Notes"]],
          body: completionReportRows,
          theme: 'striped',
          headStyles: {
            fillColor: [16, 185, 129], // Emerald
            textColor: [255, 255, 255],
            fontSize: 8,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 7,
            cellPadding: 2
          },
          alternateRowStyles: {
            fillColor: [236, 253, 245] // Light emerald
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
            8: { cellWidth: 18, halign: 'center' },
            9: { cellWidth: 25 }
          }
        });

        currentY = doc.lastAutoTable.finalY + 20;

        // **FIXED: Performance Analytics with null checks**
        const completedReports = taskCompletionReports.filter(r => r.isCompleted) || [];
        const avgCompletionRate = taskCompletionReports.length > 0 
          ? (completedReports.length / taskCompletionReports.length) * 100 
          : 0;
        const avgQuality = taskCompletionReports.length > 0
          ? taskCompletionReports.reduce((sum, r) => sum + (r.qualityRating || 0), 0) / taskCompletionReports.length
          : 0;
        const delayedTasks = taskCompletionReports.filter(r => r.wasDelayed) || [];

        doc.setFontSize(14);
        doc.setTextColor(16, 185, 129);
        doc.text("Task Completion Analytics:", 14, currentY);
        currentY += 10;

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total Task Reports: ${taskCompletionReports.length}`, 14, currentY);
        currentY += 7;
        doc.text(`Completion Rate: ${avgCompletionRate.toFixed(1)}%`, 14, currentY);
        currentY += 7;
        doc.text(`Tasks Delayed: ${delayedTasks.length}/${taskCompletionReports.length} (${taskCompletionReports.length > 0 ? ((delayedTasks.length/taskCompletionReports.length)*100).toFixed(1) : 0}%)`, 14, currentY);
        currentY += 7;
        doc.text(`Average Quality Rating: ${avgQuality.toFixed(1)}/5`, 14, currentY);
        currentY += 20;
      }

      // Individual Tasks Summary
      if (tasks.length > 0) {
        const completedTasks = tasks.filter(task => task.status === "completed").length;
        const skippedTasks = tasks.filter(task => task.status === "skipped").length;
        const pendingTasks = tasks.filter(task => task.status === "pending").length;

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("Individual Tasks Summary:", 14, currentY);
        currentY += 10;

        doc.setFontSize(11);
        doc.text(`Total Individual Tasks: ${tasks.length}`, 14, currentY);
        currentY += 8;
        doc.text(`Completed: ${completedTasks}`, 14, currentY);
        currentY += 8;
        doc.text(`Pending: ${pendingTasks}`, 14, currentY);
        currentY += 8;
        doc.text(`Skipped: ${skippedTasks}`, 14, currentY);
        currentY += 15;

        const taskRows = tasks.map((task, index) => {
          const taskReport = taskCompletionReports.find(r => r.taskId === task.id);
          return [
            index + 1,
            task.name || 'Unnamed Task',
            task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1) : 'Unknown',
            `${Math.floor((task.timerSeconds || 0) / 60)}min`,
            task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium',
            taskReport ? `${taskReport.qualityRating || 0}/5` : 'N/A',
            task.status === "completed" ? "✓" : task.status === "skipped" ? "⏭" : "○"
          ];
        });

        autoTable(doc, {
          startY: currentY,
          head: [["#", "Task Name", "Status", "Duration", "Priority", "Quality", "Icon"]],
          body: taskRows,
          theme: 'striped',
          headStyles: {
            fillColor: [79, 70, 229],
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 9,
            cellPadding: 4
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252]
          },
          columnStyles: {
            0: { cellWidth: 12, halign: 'center' },
            1: { cellWidth: 60 },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 20, halign: 'center' },
            4: { cellWidth: 25, halign: 'center' },
            5: { cellWidth: 20, halign: 'center' },
            6: { cellWidth: 15, halign: 'center' }
          }
        });

        currentY = doc.lastAutoTable.finalY + 20;
      }

      // Sessions Summary
      if (sessions.length > 0) {
        const completedSessions = sessions.filter(session => session.status === "completed").length;
        const pendingSessions = sessions.filter(session => session.status === "pending").length;

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("Sessions Summary:", 14, currentY);
        currentY += 10;

        doc.setFontSize(11);
        doc.text(`Total Sessions: ${sessions.length}`, 14, currentY);
        currentY += 8;
        doc.text(`Completed Sessions: ${completedSessions}`, 14, currentY);
        currentY += 8;
        doc.text(`Pending Sessions: ${pendingSessions}`, 14, currentY);
        currentY += 15;

        const sessionRows = sessions.map((session, index) => [
          index + 1,
          session.name || `Session ${index + 1}`,
          session.status ? session.status.charAt(0).toUpperCase() + session.status.slice(1) : 'Pending',
          session.tasks ? session.tasks.length : 0,
          session.completedTasks || 0,
          `${Math.floor((session.totalTime || 0) / 60)}min`,
          session.status === "completed" ? "✓" : "○"
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [["#", "Session Name", "Status", "Total Tasks", "Completed", "Duration", "Icon"]],
          body: sessionRows,
          theme: 'striped',
          headStyles: {
            fillColor: [147, 51, 234],
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 9,
            cellPadding: 4
          },
          alternateRowStyles: {
            fillColor: [252, 231, 243]
          },
          columnStyles: {
            0: { cellWidth: 12, halign: 'center' },
            1: { cellWidth: 60 },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 20, halign: 'center' },
            4: { cellWidth: 20, halign: 'center' },
            5: { cellWidth: 25, halign: 'center' },
            6: { cellWidth: 15, halign: 'center' }
          }
        });

        currentY = doc.lastAutoTable.finalY + 20;

        // **FIXED: Session Details with null checks**
        sessions.forEach((session, sessionIndex) => {
          if (session.tasks && Array.isArray(session.tasks) && session.tasks.length > 0) {
            if (currentY > 250) {
              doc.addPage();
              currentY = 20;
            }

            doc.setFontSize(14);
            doc.setTextColor(147, 51, 234);
            doc.text(`${session.name || `Session ${sessionIndex + 1}`} - Task Details:`, 14, currentY);
            currentY += 10;

            const sessionTaskRows = session.tasks.map((task, taskIndex) => [
              taskIndex + 1,
              task.name || `Task ${taskIndex + 1}`,
              `${task.duration || 0}min`,
              task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium',
              taskIndex < (session.completedTasks || 0) ? "✓" : "○"
            ]);

            autoTable(doc, {
              startY: currentY,
              head: [["#", "Task Name", "Duration", "Priority", "Status"]],
              body: sessionTaskRows,
              theme: 'plain',
              headStyles: {
                fillColor: [167, 139, 250],
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: 'bold'
              },
              bodyStyles: {
                fontSize: 8,
                cellPadding: 3
              },
              columnStyles: {
                0: { cellWidth: 12, halign: 'center' },
                1: { cellWidth: 80 },
                2: { cellWidth: 25, halign: 'center' },
                3: { cellWidth: 25, halign: 'center' },
                4: { cellWidth: 15, halign: 'center' }
              }
            });

            currentY = doc.lastAutoTable.finalY + 15;
          }
        });
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

      doc.save(`taskflow-comprehensive-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // **FIXED: getOverallStats with proper null checks**
  const getOverallStats = () => {
    const safeTasks = tasks || [];
    const safeSessions = sessions || [];
    const safeTaskReports = taskCompletionReports || [];
    const safeSessionReports = sessionCompletionReports || [];

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
      sessionReports: safeSessionReports.length
    };
  };

  const stats = getOverallStats();

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      {/* **FIXED: Enhanced Stats Display with null checks** */}
      {(tasks.length > 0 || sessions.length > 0) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border border-blue-200">
          <div className="text-sm text-blue-700 font-medium">
            Progress: {stats.completed}/{stats.total} ({stats.percentage}%)
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {stats.taskReports} reports • {stats.individualTasks} tasks • {stats.sessions} sessions
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
        {isGenerating ? "Generating..." : "Export Comprehensive Report"}
      </button>
    </div>
  );
};

export default GeneratePDF;
