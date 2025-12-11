"use client";

import React from "react";

interface DetailCardProps {
  title: string;
  icon?: string;
  color?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

/**
 * Generic wrapper for detail cards
 */
export function DetailCard({
  title,
  icon,
  color = "#3b82f6",
  children,
  onClose,
}: DetailCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-2xl">{icon}</span>}
          <h3
            className="text-lg font-semibold"
            style={{ color }}
          >
            {title}
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

interface StudentDetailRowProps {
  studentName: string;
  children: React.ReactNode;
  stacked?: boolean;
}

/**
 * Row for each student in detail card
 */
export function StudentDetailRow({ studentName, children, stacked = false }: StudentDetailRowProps) {
  if (stacked) {
    return (
      <div className="p-3 bg-gray-50 rounded-md space-y-2">
        <div className="font-medium text-gray-700">
          {studentName}
        </div>
        <div>{children}</div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
      <div className="min-w-[150px] font-medium text-gray-700">
        {studentName}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
