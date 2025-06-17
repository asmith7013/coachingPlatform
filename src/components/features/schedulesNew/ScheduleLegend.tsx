/**
 * @fileoverview DEPRECATED - This file is deprecated and will be removed.
 * Migration: Use components from @/components/features/schedulesUpdated/ instead
 * @deprecated
 */

import React from 'react';
import { Eye, MessageCircle } from 'lucide-react';

/**
 * @deprecated Use ScheduleLegend from @/components/features/schedulesUpdated/ instead.
 * This component will be removed in a future version.
 * Migration: Replace with equivalent component from schedulesUpdated feature.
 */
export function ScheduleLegend() {
  if (process.env.NODE_ENV === 'development') {
    console.warn('DEPRECATED: ScheduleLegend from schedulesNew is deprecated. Use schedulesUpdated instead.');
  }
  return (
    <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 mb-3">How to Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span>Hover to see <strong>First Half</strong> option</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span>Hover to see <strong>Second Half</strong> option</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span>Hover to see <strong>Full Period</strong> option</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 rounded-full border border-blue-500 bg-blue-500 flex items-center justify-center">
                <Eye className="w-2 h-2 text-white" />
              </div>
              <Eye className="w-3 h-3 text-gray-600" />
            </div>
            <span><strong>Observation</strong> planned</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 rounded-full border border-purple-500 bg-purple-500 flex items-center justify-center">
                <MessageCircle className="w-2 h-2 text-white" />
              </div>
              <MessageCircle className="w-3 h-3 text-gray-600" />
            </div>
            <span><strong>Meeting</strong> planned</span>
          </div>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>1.</strong> Click on any teacher&apos;s period → <strong>2.</strong> Planned Schedule shows time options → <strong>3.</strong> Click your preferred time zone → <strong>4.</strong> Hover over scheduled items to remove with ×
          </p>
        </div>
      </div>
    </div>
  );
} 