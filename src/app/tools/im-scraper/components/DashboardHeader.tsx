"use client";

import React from "react";

interface DashboardHeaderProps {
  onReset: () => void;
}

export function DashboardHeader({ onReset }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900">IM Scraper Tool</h1>
      <p className="mt-2 text-lg text-gray-600">
        Extract cooldown content from Illustrative Mathematics curriculum
        lessons
      </p>

      <div className="mt-4">
        <button
          onClick={onReset}
          className="text-sm text-red-600 hover:text-red-800 underline"
        >
          Reset All Data
        </button>
      </div>
    </div>
  );
}
