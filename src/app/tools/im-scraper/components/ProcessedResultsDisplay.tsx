"use client";

import React, { useState } from 'react';
import { Button } from '@/components/core/Button';
import { Alert } from '@/components/core/feedback/Alert';
import { SimpleCard } from '@/components/core/cards/SimpleCard';
import { ProcessedLesson } from '../lib/types';
import { 
  DocumentArrowDownIcon, 
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon 
} from '@heroicons/react/24/outline';

interface ProcessedResultsDisplayProps {
  processedLessons: ProcessedLesson[];
  onClearResults: () => void;
}

export function ProcessedResultsDisplay({
  processedLessons,
  onClearResults
}: ProcessedResultsDisplayProps) {
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [copiedLessonId, setCopiedLessonId] = useState<string | null>(null);

  const toggleLessonExpansion = (lessonUrl: string) => {
    setExpandedLessons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lessonUrl)) {
        newSet.delete(lessonUrl);
      } else {
        newSet.add(lessonUrl);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (text: string, lessonId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLessonId(lessonId);
      setTimeout(() => setCopiedLessonId(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const downloadMarkdown = (lesson: ProcessedLesson) => {
    const blob = new Blob([lesson.fullMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    // Extract lesson identifier from URL for filename
    const _urlParts = lesson.lessonUrl.split('/');
    const filename = `${lesson.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.md`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAllMarkdown = () => {
    const allMarkdown = processedLessons
      .map(lesson => lesson.fullMarkdown)
      .join('\n\n---\n\n');
    
    const blob = new Blob([allMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `processed-lessons-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const dataStr = JSON.stringify(processedLessons, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `processed-lessons-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (processedLessons.length === 0) {
    return null;
  }

  const lessonsNeedingReview = processedLessons.filter(lesson => lesson.needsReview.length > 0);

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Step 4: Processed Results</h2>
        <p className="text-sm text-gray-600">
          Claude-processed lessons ready for Notion
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center p-4 border-b border-gray-200">
          <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-md flex items-center justify-center text-white font-medium text-sm">
            ✓
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">Processing Complete</h3>
            <p className="text-sm text-gray-500">
              {processedLessons.length} lessons processed
              {lessonsNeedingReview.length > 0 && ` • ${lessonsNeedingReview.length} need manual review`}
            </p>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          {lessonsNeedingReview.length > 0 && (
            <Alert intent="warning">
              <Alert.Title className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                Manual Review Required
              </Alert.Title>
              <Alert.Description>
                {lessonsNeedingReview.length} lesson{lessonsNeedingReview.length !== 1 ? 's' : ''} contain content that needs manual review. 
                Look for [NEEDS MANUAL REVIEW] markers in the processed content.
              </Alert.Description>
            </Alert>
          )}

          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              onClick={downloadAllMarkdown}
              intent="primary"
              appearance="outline"
              padding="sm"
              icon={<DocumentArrowDownIcon className="w-4 h-4" />}
            >
              Download All Markdown
            </Button>
            
            <Button
              onClick={exportJSON}
              intent="secondary"
              appearance="outline"
              padding="sm"
              icon={<DocumentArrowDownIcon className="w-4 h-4" />}
            >
              Export JSON
            </Button>
            
            <Button
              onClick={onClearResults}
              intent="danger"
              appearance="outline"
              padding="sm"
            >
              Clear Results
            </Button>
          </div>
        </div>
      </div>

      {/* Processed Lessons List */}
      <div className="space-y-3">
        {processedLessons.map((lesson, index) => {
          const lessonId = `processed-${index}`;
          const needsReview = lesson.needsReview.length > 0;
          const isExpanded = expandedLessons.has(lesson.lessonUrl);

          return (
            <div key={lesson.lessonUrl}>
              <SimpleCard
                initials={`${index + 1}`}
                title={lesson.title}
                subtitle={
                  needsReview ? `Needs manual review (${lesson.needsReview.length} items)` as string : undefined
                }
                colorVariant={needsReview ? "yellow" : "success"}
                size="md"
                className="cursor-pointer"
                onClick={() => toggleLessonExpansion(lesson.lessonUrl)}
                showAction
                actionIcon={isExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                onActionClick={(e) => {
                  e.stopPropagation();
                  toggleLessonExpansion(lesson.lessonUrl);
                }}
              />
              
              {isExpanded && (
                <div className="bg-white border border-gray-200 rounded-b-lg shadow-sm -mt-1 px-6 pb-6 space-y-4">
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-4">
                    <Button
                      onClick={() => copyToClipboard(lesson.fullMarkdown, lessonId)}
                      intent="primary"
                      appearance="outline"
                      padding="sm"
                      icon={<ClipboardDocumentIcon className="w-4 h-4" />}
                    >
                      {copiedLessonId === lessonId ? '✓ Copied!' : 'Copy Markdown'}
                    </Button>
                    
                    <Button
                      onClick={() => downloadMarkdown(lesson)}
                      intent="secondary"
                      appearance="outline"
                      padding="sm"
                      icon={<DocumentArrowDownIcon className="w-4 h-4" />}
                    >
                      Download .md
                    </Button>
                  </div>

                  {/* Manual Review Items */}
                  {lesson.needsReview.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-semibold text-amber-900 mb-2">
                        Items Requiring Manual Review:
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {lesson.needsReview.map((item, idx) => (
                          <li key={idx} className="text-sm text-amber-800">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Structured Content Preview */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Canvas:</h4>
                      <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 whitespace-pre-wrap">
                        {lesson.canvas || 'No canvas content'}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Question Text:</h4>
                      <div className="bg-blue-50 p-3 rounded text-sm text-gray-600 whitespace-pre-wrap">
                        {lesson.questionText || 'No question text'}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Acceptance Criteria:</h4>
                      <div className="bg-green-50 p-3 rounded text-sm text-gray-600 whitespace-pre-wrap">
                        {lesson.acceptanceCriteria || 'No acceptance criteria'}
                      </div>
                    </div>
                  </div>

                  {/* Full Markdown Preview */}
                  <details className="border-t pt-4">
                    <summary className="cursor-pointer text-gray-700 font-medium hover:text-gray-900">
                      View Full Markdown
                    </summary>
                    <pre className="mt-3 bg-gray-50 p-4 rounded text-xs overflow-auto max-h-96 border">
                      {lesson.fullMarkdown}
                    </pre>
                  </details>

                  {/* Metadata */}
                  <div className="border-t pt-4 text-sm text-gray-500">
                    <strong>Processed:</strong> {new Date(lesson.processedAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
