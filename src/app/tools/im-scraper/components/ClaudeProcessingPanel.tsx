"use client";

import React from 'react';
import { Button } from '@/components/core/Button';
import { Alert } from '@/components/core/feedback/Alert';
import { ProcessedLesson, IMLesson } from '../lib/types';
import { PlayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface ClaudeProcessingPanelProps {
  scrapedLessons: IMLesson[];
  processedLessons: ProcessedLesson[];
  isProcessing: boolean;
  error: string | null;
  processingProgress: {
    current: number;
    total: number;
    currentLessonUrl?: string;
  } | null;
  lastBatchResponse: {
    totalRequested: number;
    totalSuccessful: number;
    totalFailed: number;
    startTime: string;
    endTime: string;
    duration: string;
  } | null;
  onProcessLessons: (lessons: IMLesson[]) => Promise<void>;
  onClearResults: () => void;
}

export function ClaudeProcessingPanel({
  scrapedLessons,
  processedLessons,
  isProcessing,
  error,
  processingProgress,
  lastBatchResponse,
  onProcessLessons,
  onClearResults
}: ClaudeProcessingPanelProps) {
  // Filter lessons that have Claude export content
  const claudeExportLessons = scrapedLessons.filter(lesson => 
    lesson.success && lesson.cooldown?.claudeExport?.studentTaskStatement_rawHtml
  );

  // Don't show panel if no scraped lessons or no Claude export content
  if (scrapedLessons.length === 0 || claudeExportLessons.length === 0) {
    return null;
  }

  const handleProcessAll = async () => {
    await onProcessLessons(claudeExportLessons);
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Step 3: Claude Processing</h2>
        <p className="text-sm text-gray-600">
          Process scraped content with Claude AI to create structured markdown
        </p>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-medium text-blue-900">Processing with Claude...</h3>
              {processingProgress && (
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-blue-700 mb-1">
                    <span>Progress: {processingProgress.current}/{processingProgress.total}</span>
                    <span>{Math.round((processingProgress.current / processingProgress.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${(processingProgress.current / processingProgress.total) * 100}%` }}
                    ></div>
                  </div>
                  {processingProgress.currentLessonUrl && (
                    <p className="text-xs text-blue-600 mt-1 truncate">
                      Current: {processingProgress.currentLessonUrl}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && !isProcessing && (
        <Alert intent="error">
          <Alert.Title>Processing Error</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert>
      )}

      {/* Processing Summary */}
      {lastBatchResponse && !isProcessing && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">
            Processing Complete
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{lastBatchResponse.totalRequested}</div>
              <div className="text-sm text-gray-500">Requested</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{lastBatchResponse.totalSuccessful}</div>
              <div className="text-sm text-gray-500">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{lastBatchResponse.totalFailed}</div>
              <div className="text-sm text-gray-500">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{lastBatchResponse.duration}</div>
              <div className="text-sm text-gray-500">Duration</div>
            </div>
          </div>
        </div>
      )}

      {/* Available Lessons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Available for Processing</h3>
            <p className="text-sm text-gray-500">
              {claudeExportLessons.length} lessons with Claude export content ready
            </p>
          </div>
          
          <div className="flex space-x-3">
            {processedLessons.length > 0 && (
              <Button
                onClick={onClearResults}
                intent="secondary"
                appearance="outline"
                padding="sm"
              >
                Clear Results
              </Button>
            )}
            
            <Button
              onClick={handleProcessAll}
              disabled={isProcessing || claudeExportLessons.length === 0}
              intent="primary"
              padding="sm"
              icon={<PlayIcon className="w-4 h-4" />}
            >
              {isProcessing ? 'Processing...' : `Process All (${claudeExportLessons.length})`}
            </Button>
          </div>
        </div>

        {/* Lessons List */}
        <div className="p-4">
          <div className="space-y-2">
            {claudeExportLessons.map((lesson, _index) => (
              <div
                key={lesson.url}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    Grade {lesson.grade} - Unit {lesson.unit} - Section {lesson.section?.toUpperCase() || 'N/A'} - Lesson {lesson.lesson}
                  </h4>
                  <p className="text-sm text-gray-500 truncate">{lesson.url}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <DocumentTextIcon className="w-3 h-3 mr-1" />
                    Ready
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {claudeExportLessons.length === 0 && (
            <div className="text-center py-8">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No lessons ready for processing</h3>
              <p className="mt-1 text-sm text-gray-500">
                Make sure to enable &quot;Claude Export&quot; when scraping lessons.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
