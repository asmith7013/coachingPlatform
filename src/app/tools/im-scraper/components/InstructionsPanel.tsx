"use client";

import React from "react";

export function InstructionsPanel() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 className="text-lg font-medium text-blue-900 mb-3">
        How to Use This Tool
      </h3>
      <div className="text-sm text-blue-800 space-y-2">
        <p>
          <strong>1. Enter Credentials:</strong> Enter your Teaching Lab
          credentials (authentication happens automatically on each lesson
          page).
        </p>
        <p>
          <strong>2. Choose Method:</strong>
        </p>
        <ul className="ml-4 space-y-1">
          <li>
            • <strong>Bulk Generation:</strong> Generate URLs by grade, unit,
            and section ranges
          </li>
          <li>
            • <strong>Custom URLs:</strong> Paste specific lesson URLs (one per
            line)
          </li>
        </ul>
        <p>
          <strong>3. Test First:</strong> Use the &quot;Test Single URL&quot;
          feature to verify scraping works before bulk operations.
        </p>
        <p>
          <strong>4. Configure Delay:</strong> Set delay between requests
          (recommended: 2000ms) to avoid rate limiting.
        </p>
        <p>
          <strong>5. Export Results:</strong> Download results as JSON or CSV
          for further analysis.
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Important Notes:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • This tool extracts &quot;cooldown&quot; sections from IM lesson
            pages
          </li>
          <li>
            • <strong>🔐 Per-page authentication:</strong> Login happens
            automatically on each lesson page (no upfront validation needed)
          </li>
          <li>• Rate limiting is built-in to respect the IM platform</li>
          <li>• Results are not automatically saved to the database</li>
          <li>• Large scraping jobs may take several minutes to complete</li>
          <li>
            • <strong>🔍 Debug mode:</strong> Opens visible browser window and
            saves screenshots for troubleshooting
          </li>
        </ul>
      </div>
    </div>
  );
}
