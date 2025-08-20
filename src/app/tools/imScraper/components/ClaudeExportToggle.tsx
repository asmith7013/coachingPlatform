"use client";

import React from 'react';

interface ClaudeExportToggleProps {
  enableClaudeExport: boolean;
  onToggle: (enabled: boolean) => void;
}

export function ClaudeExportToggle({
  enableClaudeExport,
  onToggle
}: ClaudeExportToggleProps) {
  return (
    <div className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <input
        type="checkbox"
        id="claudeExport"
        checked={enableClaudeExport}
        onChange={(e) => onToggle(e.target.checked)}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <div className="flex-1">
        <label htmlFor="claudeExport" className="text-sm font-medium text-blue-900">
          Enable Claude-friendly export mode
        </label>
        <p className="text-xs text-blue-700 mt-1">
          Includes raw HTML content and formatted output ready for Claude processing
        </p>
      </div>
    </div>
  );
}
