"use client";

import React, { useState } from 'react';
import { Button } from '@/components/core/Button';
import { Input } from '@/components/core/fields/Input';
import { Textarea } from '@/components/core/fields/Textarea';
import { Select } from '@/components/core/fields/Select';
import { Alert } from '@/components/core/feedback/Alert';
// // SimpleCard removed - using custom card structure
import { IMCredentials, IMUrlGeneration, IM_CONSTANTS } from '../lib/types';
import { useIMUrlGenerator } from '../hooks/useIMScraper';

interface ScrapingControlsProps {
  credentials: IMCredentials;
  onStartScraping: (urls: string[], delay?: number) => Promise<void>;
  onStartScrapingDebug?: (urls: string[], delay?: number) => Promise<void>;
  onGenerateAndScrape: (params: IMUrlGeneration) => Promise<void>;
  isLoading: boolean;
  credentialsValid: boolean | null;
  onTestUrl: (url: string) => Promise<void>;
  isTesting: boolean;
  testResult: {
    lesson?: { success: boolean; error?: string };
    hasContent?: boolean;
    contentSections?: number;
  } | null;
}

type ScrapingMode = 'bulk' | 'custom';

export function ScrapingControls({
  credentials: _credentials, // Marked as unused since it's passed to actions
  onStartScraping,
  onGenerateAndScrape,
  isLoading,
  credentialsValid,
  onTestUrl,
  isTesting,
  testResult
}: ScrapingControlsProps) {
  const [mode, setMode] = useState<ScrapingMode>('bulk');
  const [customUrls, setCustomUrls] = useState('');
  const [testUrl, setTestUrl] = useState('');
  const [delayBetweenRequests, setDelayBetweenRequests] = useState('2000');
  
  // Bulk generation parameters
  const [bulkParams, setBulkParams] = useState<IMUrlGeneration>({
    grade: 6,
    startUnit: 1,
    endUnit: 2,
    sectionLessons: { 'a': [1, 2, 3], 'b': [1, 2, 3] },
    delayBetweenRequests: 2000
  });

  const { isGenerating, generatedUrls, generateUrls, clearUrls } = useIMUrlGenerator();

  const isDisabled = !credentialsValid || isLoading;

  const handleCustomUrlsScrape = async () => {
    const urls = customUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);
    
    if (urls.length === 0) {
      return;
    }
    
    const delay = parseInt(delayBetweenRequests) || 2000;
    await onStartScraping(urls, delay);
  };

  const handleBulkScrape = async () => {
    const delay = parseInt(delayBetweenRequests) || 2000;
    const params = { ...bulkParams, delayBetweenRequests: delay };
    await onGenerateAndScrape(params);
  };

  const handleGenerateUrls = async () => {
    await generateUrls(bulkParams);
  };

  const handleTestSingleUrl = async () => {
    if (!testUrl.trim()) return;
    await onTestUrl(testUrl.trim());
  };

  const gradeOptions = IM_CONSTANTS.GRADES.map(grade => ({
    value: grade.toString(),
    label: `Grade ${grade}`
  }));

  const sectionOptions = IM_CONSTANTS.SECTIONS.map(section => ({
    value: section,
    label: `Section ${section.toUpperCase()}`
  }));

  const unitOptions = Array.from({ length: IM_CONSTANTS.MAX_UNITS }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Unit ${i + 1}`
  }));

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center p-4 border-b border-gray-200">
          <div className="flex-shrink-0 w-12 h-12 bg-gray-600 rounded-md flex items-center justify-center text-white font-medium text-sm">
            SC
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">Scraping Controls</h3>
            <p className="text-sm text-gray-500">Choose your scraping method and configure parameters</p>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {/* Mode Toggle */}
          <div className="flex space-x-4">
            <Button
              onClick={() => setMode('bulk')}
              intent={mode === 'bulk' ? 'primary' : 'secondary'}
              appearance={mode === 'bulk' ? 'solid' : 'outline'}
            >
              Bulk Generation
            </Button>
            <Button
              onClick={() => setMode('custom')}
              intent={mode === 'custom' ? 'primary' : 'secondary'}
              appearance={mode === 'custom' ? 'solid' : 'outline'}
            >
              Custom URLs
            </Button>
          </div>

          {/* Bulk Generation Mode */}
          {mode === 'bulk' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Grade"
                  options={gradeOptions}
                  value={bulkParams.grade.toString()}
                  onChange={(value) => setBulkParams(prev => ({ ...prev, grade: parseInt(value) }))}
                />
                
                <Select
                  label="Start Unit"
                  options={unitOptions}
                  value={bulkParams.startUnit.toString()}
                  onChange={(value) => setBulkParams(prev => ({ ...prev, startUnit: parseInt(value) }))}
                />
                
                <Select
                  label="End Unit"
                  options={unitOptions}
                  value={bulkParams.endUnit.toString()}
                  onChange={(value) => setBulkParams(prev => ({ ...prev, endUnit: parseInt(value) }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Sections"
                  options={sectionOptions}
                  value={Object.keys(bulkParams.sectionLessons || {})}
                  onChange={(value) => {
                    const newSectionLessons: Record<string, number[]> = {};
                    (value as string[]).forEach(section => {
                      newSectionLessons[section] = [1, 2, 3]; // Default lessons
                    });
                    setBulkParams(prev => ({ ...prev, sectionLessons: newSectionLessons }));
                  }}
                  multiple
                />
                
                <Input
                  label="Default Lessons per Section"
                  type="number"
                  min="1"
                  max="20"
                  value="3"
                  onChange={() => {}} // Disabled for new lesson selection approach
                  disabled
                />
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={handleGenerateUrls}
                  loading={isGenerating}
                  disabled={isGenerating}
                  intent="secondary"
                >
                  Preview URLs ({Math.max(0, (bulkParams.endUnit - bulkParams.startUnit + 1)) * 
                    Object.keys(bulkParams.sectionLessons || {}).length * 3})
                </Button>
                
                <Button
                  onClick={handleBulkScrape}
                  loading={isLoading}
                  disabled={isDisabled}
                  intent="primary"
                >
                  Start Bulk Scraping
                </Button>
              </div>

              {generatedUrls.length > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium">Generated URLs ({generatedUrls.length})</h4>
                    <Button onClick={clearUrls} intent="secondary" appearance="outline" padding="sm">
                      Clear
                    </Button>
                  </div>
                  <div className="max-h-40 overflow-y-auto bg-gray-50 rounded p-3">
                    <pre className="text-xs text-gray-600">
                      {generatedUrls.slice(0, 10).join('\n')}
                      {generatedUrls.length > 10 && `\n... and ${generatedUrls.length - 10} more`}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Custom URLs Mode */}
          {mode === 'custom' && (
            <div className="space-y-4">
              <Textarea
                label="Custom URLs (one per line)"
                value={customUrls}
                onChange={(e) => setCustomUrls(e.target.value)}
                placeholder="https://accessim.org/6-8/grade-6/unit-1/section-a/lesson-1?a=teacher
https://accessim.org/6-8/grade-6/unit-1/section-a/lesson-2?a=teacher
..."
                rows={8}
              />
              
              <Button
                onClick={handleCustomUrlsScrape}
                loading={isLoading}
                disabled={isDisabled || !customUrls.trim()}
                intent="primary"
                fullWidth
              >
                Start Custom Scraping ({customUrls.split('\n').filter(url => url.trim()).length} URLs)
              </Button>
            </div>
          )}

          {/* Common Settings */}
          <div className="border-t pt-4">
            <Input
              label="Delay Between Requests (ms)"
              type="number"
              min="1000"
              max="10000"
              step="500"
              value={delayBetweenRequests}
              onChange={(e) => setDelayBetweenRequests(e.target.value)}
              helpText="Recommended: 2000ms to avoid rate limiting"
            />
          </div>
        </div>
      </div>

      {/* Test Single URL */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center p-4 border-b border-gray-200">
          <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-md flex items-center justify-center text-white font-medium text-sm">
            T
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">Test Single URL</h3>
            <p className="text-sm text-gray-500">Test scraping on a single URL before running bulk operations</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <Input
            label="Test URL"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="https://accessim.org/6-8/grade-6/unit-1/section-a/lesson-1?a=teacher"
          />
          
          <Button
            onClick={handleTestSingleUrl}
            loading={isTesting}
            disabled={!credentialsValid || !testUrl.trim() || isTesting}
            intent="success"
            fullWidth
          >
            Test URL
          </Button>

          {testResult && (
            <div className="mt-4">
              <Alert intent={testResult.lesson?.success ? "success" : "error"}>
                <Alert.Title>
                  {testResult.lesson?.success ? "Test Successful" : "Test Failed"}
                </Alert.Title>
                <Alert.Description>
                  {testResult.lesson?.success ? (
                    <>
                      Content found: {testResult.hasContent ? "Yes" : "No"}
                      {testResult.contentSections && ` (${testResult.contentSections} sections)`}
                    </>
                  ) : (
                    testResult.lesson?.error || "Unknown error"
                  )}
                </Alert.Description>
              </Alert>
            </div>
          )}
        </div>
      </div>

      {/* Status Alert */}
      {!credentialsValid && (
        <Alert intent="warning">
          <Alert.Title>Authentication Required</Alert.Title>
          <Alert.Description>
            Please validate your credentials before starting any scraping operations.
          </Alert.Description>
        </Alert>
      )}
    </div>
  );
}
