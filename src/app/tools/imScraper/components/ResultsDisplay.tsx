"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/core/Button';
import { Alert } from '@/components/core/feedback/Alert';
import { SimpleCard } from '@/components/core/cards/SimpleCard';
import { IMLesson, IMScrapingResponse, CooldownParser } from '../lib/types';
import { ChevronDownIcon, ChevronUpIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { ScreenshotDisplay } from './ScreenshotDisplay';

interface ResultsDisplayProps {
  results: IMLesson[];
  lastResponse: IMScrapingResponse | null;
  error: string | null;
  isLoading: boolean;
  onClearResults: () => void;
}

export function ResultsDisplay({
  results,
  lastResponse,
  error,
  isLoading,
  onClearResults
}: ResultsDisplayProps) {
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [showSuccessOnly, setShowSuccessOnly] = useState(false);
  const [copiedLessonId, setCopiedLessonId] = useState<string | null>(null);

  const toggleLessonExpansion = (url: string) => {
    setExpandedLessons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(url)) {
        newSet.delete(url);
      } else {
        newSet.add(url);
      }
      return newSet;
    });
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `im-scraping-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  const exportCSV = () => {
    const headers = [
      'URL', 'Grade', 'Unit', 'Section', 'Lesson', 'Success', 'Error',
      'Title', 'Duration', 'Has Content', 'Question Text', 'Acceptance Criteria',
      'Canvas Images', 'Math Content Count', 'Requires Manual Review'
    ];
    
    const rows = results.map(lesson => [
      lesson.url,
      lesson.grade,
      lesson.unit,
      lesson.section,
      lesson.lesson,
      lesson.success,
      lesson.error || '',
      lesson.cooldown?.title || '',
      lesson.cooldown?.duration || '',
      lesson.cooldown ? 'Yes' : 'No',
      lesson.cooldown?.questionText || '',
      lesson.cooldown?.acceptanceCriteria || '',
      lesson.cooldown?.canvas.images.map(img => img.url).join('; ') || '',
      lesson.cooldown?.detectedMath.length || 0,
      lesson.cooldown?.requiresManualReview ? 'Yes' : 'No'
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `im-scraping-results-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredResults = showSuccessOnly 
    ? results.filter(lesson => lesson.success)
    : results;

  const successfulResults = results.filter(lesson => lesson.success);
  const failedResults = results.filter(lesson => !lesson.success);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center p-4 border-b border-gray-200">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-md flex items-center justify-center text-white font-medium text-sm">
            ⏳
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">Scraping in Progress</h3>
            <p className="text-sm text-gray-500">Please wait while we extract content from IM lessons...</p>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert intent="error">
        <Alert.Title>Scraping Error</Alert.Title>
        <Alert.Description>{error}</Alert.Description>
      </Alert>
    );
  }

  if (!results.length) {
    return null;
  }

  // Filter lessons that have Claude export data
  const claudeExportLessons = results.filter(
    lesson => lesson.cooldown?.claudeExport
  );

  return (
    <div className="space-y-6">
      {/* Claude Export Section */}
      {claudeExportLessons.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Claude Export Ready ({claudeExportLessons.length} lessons)
          </h3>
          
          <div className="space-y-6">
            {claudeExportLessons.map((lesson) => {
              const lessonId = `${lesson.grade}-${lesson.unit}-${lesson.section}-${lesson.lesson}`;
              const claudeData = lesson.cooldown?.claudeExport;
              
              return (
                <div key={lesson.url} className="bg-white border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">
                      Grade {lesson.grade} - Unit {lesson.unit} - Section {lesson.section.toUpperCase()} - Lesson {lesson.lesson}
                    </h4>
                    
                    <button
                      onClick={() => claudeData && copyToClipboard(claudeData.formattedForClaude, lessonId)}
                      className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${
                        copiedLessonId === lessonId
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200'
                      }`}
                      disabled={!claudeData}
                    >
                      {copiedLessonId === lessonId ? '✓ Copied!' : 'Copy for Claude'}
                    </button>
                  </div>
                  
                  {claudeData && (
                    <div className="space-y-4">
                      {/* Screenshot section with enhanced display */}
                      {claudeData.screenshotReferences.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-3">
                            Screenshots ({claudeData.screenshotReferences.length})
                          </h5>
                          <ScreenshotDisplay 
                            screenshots={claudeData.screenshotReferences}
                            lessonId={lessonId}
                          />
                        </div>
                      )}
                      
                      {/* Content preview */}
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          Ready for Claude processing • {claudeData.screenshotReferences.length} screenshots included
                        </p>
                        
                        <details className="text-xs">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
                            Preview formatted content...
                          </summary>
                          <pre className="mt-2 bg-gray-50 p-3 rounded text-xs overflow-auto max-h-40 border">
                            {claudeData.formattedForClaude.slice(0, 500)}...
                          </pre>
                        </details>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center p-4 border-b border-gray-200">
          <div className={`flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center text-white font-medium text-sm ${
            failedResults.length === 0 ? 'bg-green-500' : 'bg-yellow-500'
          }`}>
            📊
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">Scraping Results Summary</h3>
            <p className="text-sm text-gray-500">
              {lastResponse ? 
                `Completed in ${lastResponse.duration} - ${lastResponse.totalSuccessful} successful, ${lastResponse.totalFailed} failed` :
                `${results.length} lessons processed`
              }
            </p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{results.length}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{successfulResults.length}</div>
              <div className="text-sm text-gray-500">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{failedResults.length}</div>
              <div className="text-sm text-gray-500">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {successfulResults.filter(lesson => lesson.cooldown).length}
              </div>
              <div className="text-sm text-gray-500">With Content</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              onClick={() => setShowSuccessOnly(!showSuccessOnly)}
              intent={showSuccessOnly ? "primary" : "secondary"}
              appearance="outline"
              padding="sm"
            >
              {showSuccessOnly ? "Show All" : "Success Only"}
            </Button>
            
            <Button
              onClick={exportResults}
              intent="secondary"
              appearance="outline"
              padding="sm"
              icon={<DocumentArrowDownIcon className="w-4 h-4" />}
            >
              Export JSON
            </Button>
            
            <Button
              onClick={exportCSV}
              intent="secondary"
              appearance="outline"
              padding="sm"
              icon={<DocumentArrowDownIcon className="w-4 h-4" />}
            >
              Export CSV
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

      {/* Results List */}
      <div className="space-y-3">
        {filteredResults.map((lesson, index) => (
          <LessonResultCard
            key={lesson.url}
            lesson={lesson}
            index={index}
            isExpanded={expandedLessons.has(lesson.url)}
            onToggleExpansion={() => toggleLessonExpansion(lesson.url)}
          />
        ))}
      </div>
    </div>
  );
}

interface LessonResultCardProps {
  lesson: IMLesson;
  index: number;
  isExpanded: boolean;
  onToggleExpansion: () => void;
}

function LessonResultCard({ lesson, index, isExpanded, onToggleExpansion }: LessonResultCardProps) {
  const formatLessonTitle = (lesson: IMLesson) => {
    return `Grade ${lesson.grade} - Unit ${lesson.unit} - Section ${lesson.section.toUpperCase()} - Lesson ${lesson.lesson}`;
  };

  const colorVariant = lesson.success ? 
    (lesson.cooldown ? "success" : "yellow") : 
    "danger";

  return (
    <div>
      <SimpleCard
        initials={`${index + 1}`}
        title={formatLessonTitle(lesson)}
        subtitle={lesson.success ? 
          (lesson.cooldown ? `Content extracted: ${lesson.cooldown.title}` : "No cooldown content found") :
          `Error: ${lesson.error}`
        }
        colorVariant={colorVariant}
        size="md"
        className="cursor-pointer"
        onClick={onToggleExpansion}
        showAction
        actionIcon={isExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
        onActionClick={(e) => {
          e.stopPropagation();
          onToggleExpansion();
        }}
      />
      {isExpanded && (
        <div className="bg-white border border-gray-200 rounded-b-lg shadow-sm -mt-1 px-6 pb-6 space-y-4">
          <div className="text-sm text-gray-600">
            <strong>URL:</strong> <a href={lesson.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{lesson.url}</a>
          </div>
          
          <div className="text-sm text-gray-600">
            <strong>Scraped:</strong> {new Date(lesson.scrapedAt).toLocaleString()}
          </div>

          {lesson.cooldown && (
            <CooldownContent cooldown={lesson.cooldown} />
          )}

          {!lesson.success && lesson.error && (
            <Alert intent="error">
              <Alert.Title>Error Details</Alert.Title>
              <Alert.Description>{lesson.error}</Alert.Description>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}

interface CooldownContentProps {
  cooldown: CooldownParser;
}

interface ScreenshotGalleryProps {
  screenshots: string[];
}

function ScreenshotGallery({ screenshots }: ScreenshotGalleryProps) {
  if (!screenshots || screenshots.length === 0) return null;

  return (
    <div>
      <span className="font-medium text-orange-700">Visual Content Screenshots ({screenshots.length} items):</span>
      <div className="ml-2 mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {screenshots.map((screenshot, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <Image
              src={`/screenshots/${screenshot}`}
              alt={`Screenshot ${index + 1}`}
              width={200}
              height={200}
              className="w-full h-auto object-contain"
              style={{ maxHeight: '200px' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
              }}
            />
            <div className="p-2 bg-gray-50 text-xs text-gray-600 border-t">
              <div className="truncate" title={screenshot}>{screenshot}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CooldownContent({ cooldown }: CooldownContentProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <h4 className="font-semibold text-gray-900">Cooldown Content (Summer Project Format)</h4>
      
      {cooldown.title && (
        <div>
          <span className="font-medium text-gray-700">Title:</span>
          <span className="ml-2 text-gray-600">{cooldown.title}</span>
        </div>
      )}

      {cooldown.duration && (
        <div>
          <span className="font-medium text-gray-700">Duration:</span>
          <span className="ml-2 text-gray-600">{cooldown.duration}</span>
        </div>
      )}

      {/* Core Output 1: Question Text */}
      {cooldown.questionText && (
        <div>
          <span className="font-medium text-blue-700">Question Text:</span>
          <div className="ml-2 mt-1 text-sm text-gray-600 whitespace-pre-wrap bg-blue-50 p-2 rounded">
            {cooldown.questionText}
          </div>
        </div>
      )}

      {/* Core Output 2: Canvas Images */}
      {cooldown.canvas.images.length > 0 && (
        <div>
          <span className="font-medium text-green-700">Canvas Images:</span>
          <div className="ml-2 mt-1 space-y-2">
            {cooldown.canvas.images.map((image, i) => (
              <div key={i} className="bg-green-50 p-2 rounded text-sm">
                <div><strong>URL:</strong> <a href={image.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{image.url}</a></div>
                <div><strong>Alt Text:</strong> {image.alt}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Core Output 3: Acceptance Criteria */}
      {cooldown.acceptanceCriteria && (
        <div>
          <span className="font-medium text-purple-700">Acceptance Criteria:</span>
          <div className="ml-2 mt-1 text-sm text-gray-600 whitespace-pre-wrap bg-purple-50 p-2 rounded">
            {cooldown.acceptanceCriteria}
          </div>
        </div>
      )}

      {/* Math Content for Manual Review */}
      {cooldown.detectedMath.length > 0 && (
        <div>
          <span className="font-medium text-red-700">Detected Math Content ({cooldown.detectedMath.length} items):</span>
          <div className="ml-2 mt-1 space-y-2">
            {cooldown.detectedMath.map((math, i) => (
              <div key={i} className="bg-red-50 p-2 rounded text-sm">
                <div><strong>Section:</strong> {math.section}</div>
                <div><strong>Placeholder:</strong> {math.placeholder}</div>
                {math.screenreaderText && (
                  <div><strong>Screen Reader:</strong> {math.screenreaderText}</div>
                )}
                <details className="mt-1">
                  <summary className="cursor-pointer font-medium">Raw HTML</summary>
                  <pre className="mt-1 text-xs bg-gray-100 p-1 rounded overflow-auto">
                    {math.rawHtml}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Screenshots for Visual Review */}
      {cooldown.screenshots && cooldown.screenshots.length > 0 && (
        <ScreenshotGallery screenshots={cooldown.screenshots} />
      )}

      {/* Metadata */}
      <div className="border-t pt-2 space-y-1">
        <div className="text-sm text-gray-500">
          <strong>Has Math Content:</strong> {cooldown.hasMathContent ? 'Yes' : 'No'}
        </div>
        <div className="text-sm text-gray-500">
          <strong>Requires Manual Review:</strong> {cooldown.requiresManualReview ? 'Yes' : 'No'}
        </div>
        {cooldown.screenshots && (
          <div className="text-sm text-gray-500">
            <strong>Screenshots Captured:</strong> {cooldown.screenshots.length}
          </div>
        )}
      </div>
    </div>
  );
}
