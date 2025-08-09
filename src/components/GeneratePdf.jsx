import React, { useState } from "react";
import { useTaskContext } from "../context/taskContext";
import { jsPDF } from "jspdf"; // Named import
import { autoTable } from "jspdf-autotable"; // Import autoTable function
// Remove the old import: import "jspdf-autotable";

const GeneratePDF = () => {
  const { tasks, sessions, activeSession } = useTaskContext();
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
      doc.text("TaskFlow Report", 14, 25);

      // Subtitle
      doc.setFontSize(12);
      doc.setTextColor(107, 114, 128);
      doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 35);

      let currentY = 50;

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

        // Individual Tasks Table - FIXED: Use autoTable function instead of doc.autoTable
        const taskRows = tasks.map((task, index) => [
          index + 1,
          task.name,
          task.status.charAt(0).toUpperCase() + task.status.slice(1),
          `${Math.floor((task.timerSeconds || 0) / 60)}min`,
          task.priority?.charAt(0).toUpperCase() + (task.priority?.slice(1) || ""),
          task.status === "completed" ? "✓" : task.status === "skipped" ? "⏭" : "○"
        ]);

        autoTable(doc, { // Use autoTable function with doc as first parameter
          startY: currentY,
          head: [["#", "Task Name", "Status", "Duration", "Priority", "Icon"]],
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
            1: { cellWidth: 70 },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 20, halign: 'center' },
            4: { cellWidth: 25, halign: 'center' },
            5: { cellWidth: 15, halign: 'center' }
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

        // Sessions Table - FIXED: Use autoTable function
        const sessionRows = sessions.map((session, index) => [
          index + 1,
          session.name || `Session ${index + 1}`,
          session.status.charAt(0).toUpperCase() + session.status.slice(1),
          session.tasks ? session.tasks.length : 0,
          session.completedTasks || 0,
          `${Math.floor((session.totalTime || 0) / 60)}min`,
          session.status === "completed" ? "✓" : "○"
        ]);

        autoTable(doc, { // Use autoTable function
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

        // Session Details
        sessions.forEach((session, sessionIndex) => {
          if (session.tasks && session.tasks.length > 0) {
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
              task.name,
              `${task.duration}min`,
              task.priority?.charAt(0).toUpperCase() + (task.priority?.slice(1) || ""),
              taskIndex < (session.completedTasks || 0) ? "✓" : "○"
            ]);

            autoTable(doc, { // Use autoTable function
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

      // Active Session Info
      if (activeSession) {
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(16);
        doc.setTextColor(220, 38, 127);
        doc.text("Currently Active Session:", 14, currentY);
        currentY += 10;

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Session: ${activeSession.name || 'Unnamed Session'}`, 14, currentY);
        currentY += 8;
        doc.text(`Status: ${activeSession.status || 'In Progress'}`, 14, currentY);
        currentY += 8;
        doc.text(`Progress: ${activeSession.completedTasks || 0}/${activeSession.tasks?.length || 0} tasks`, 14, currentY);
        currentY += 8;
        doc.text(`Total Duration: ${Math.floor((activeSession.totalTime || 0) / 60)} minutes`, 14, currentY);
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

      doc.save(`taskflow-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getOverallStats = () => {
    const individualCompleted = tasks.filter(task => task.status === "completed").length;
    const sessionsCompleted = sessions.filter(session => session.status === "completed").length;
    const totalItems = tasks.length + sessions.length;
    const totalCompleted = individualCompleted + sessionsCompleted;

    return {
      completed: totalCompleted,
      total: totalItems,
      percentage: totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0,
      individualTasks: tasks.length,
      sessions: sessions.length
    };
  };

  const stats = getOverallStats();

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 ${isGenerating
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
          }`}
      >
        <span className="text-xl">
          {isGenerating ? "⏳" : "📄"}
        </span>
        {isGenerating ? "Generating..." : "Export PDF Report"}
      </button>
    </div>

  );
};

export default GeneratePDF;
