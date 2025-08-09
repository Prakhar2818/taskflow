// components/StorageStatus.jsx
import React, { useState } from 'react';
import { useTaskContext } from '../context/taskContext';

const StorageStatus = () => {
  const { 
    isLoading, 
    saveToLocalStorage, 
    clearLocalStorage, 
    exportData, 
    importData 
  } = useTaskContext();
  
  const [showExportData, setShowExportData] = useState(false);
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);

  const handleExport = () => {
    const data = exportData();
    setShowExportData(data);
  };

  const handleImport = () => {
    if (importText.trim()) {
      const success = importData(importText);
      if (success) {
        setImportText('');
        setShowImport(false);
        alert('Data imported successfully!');
      } else {
        alert('Failed to import data. Please check the format.');
      }
    }
  };

  const downloadBackup = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStorageUsage = () => {
    try {
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith('taskflow_')) {
          totalSize += localStorage[key].length;
        }
      }
      return `${(totalSize / 1024).toFixed(2)} KB`;
    } catch (error) {
      return 'Unknown';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span>💾</span>
          Storage Status
        </h3>
        <span className="text-sm text-gray-500">
          Usage: {getStorageUsage()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <button
          onClick={saveToLocalStorage}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-lg transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2"
        >
          <span>💾</span>
          {isLoading ? 'Saving...' : 'Save Now'}
        </button>

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <span>📤</span>
          Export
        </button>

        <button
          onClick={() => setShowImport(!showImport)}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <span>📥</span>
          Import
        </button>

        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
              clearLocalStorage();
            }
          }}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <span>🗑️</span>
          Clear All
        </button>
      </div>

      {/* Export Data Modal */}
      {showExportData && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-700">Exported Data:</span>
            <div className="flex gap-2">
              <button
                onClick={downloadBackup}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium"
              >
                Download
              </button>
              <button
                onClick={() => setShowExportData(false)}
                className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
          <textarea
            value={showExportData}
            readOnly
            className="w-full h-32 p-2 text-xs bg-white border border-gray-300 rounded resize-none"
            onClick={(e) => e.target.select()}
          />
          <p className="text-xs text-gray-500 mt-1">
            Click the text area to select all, then copy (Ctrl+C)
          </p>
        </div>
      )}

      {/* Import Data Modal */}
      {showImport && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-700">Import Data:</span>
            <button
              onClick={() => setShowImport(false)}
              className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs font-medium"
            >
              Close
            </button>
          </div>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste your exported data here..."
            className="w-full h-32 p-2 text-xs border border-gray-300 rounded resize-none"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleImport}
              disabled={!importText.trim()}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded font-medium text-sm"
            >
              Import
            </button>
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setImportText(event.target.result);
                  };
                  reader.readAsText(file);
                }
              }}
              className="hidden"
              id="file-import"
            />
            <label
              htmlFor="file-import"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium text-sm cursor-pointer"
            >
              Load File
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            You can paste JSON data or load a backup file
          </p>
        </div>
      )}

      {/* Auto-save indicator */}
      <div className="text-xs text-gray-500 text-center">
        <span className="inline-flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Auto-saves to localStorage every 500ms
        </span>
      </div>
    </div>
  );
};

export default StorageStatus;
