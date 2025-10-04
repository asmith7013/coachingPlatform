"use client";

import React, { useState } from 'react';
import { Button } from '@/components/core/Button';
import { Alert } from '@/components/core/feedback/Alert';
import { SimpleCard } from '@/components/core/cards/SimpleCard';
import { SkillData, RoadmapsScrapingResponse } from '../lib/types';
import { ChevronDownIcon, ChevronUpIcon, DocumentArrowDownIcon, CloudArrowUpIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { createRoadmapsLesson, bulkCreateRoadmapsLessons } from '@actions/313/roadmaps-lessons';

interface ResultsDisplayProps {
  results: SkillData[];
  lastResponse: RoadmapsScrapingResponse | null;
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
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());
  const [showSuccessOnly, setShowSuccessOnly] = useState(false);
  const [savingSkills, setSavingSkills] = useState<Set<string>>(new Set());
  const [savedSkills, setSavedSkills] = useState<Set<string>>(new Set());
  const [saveErrors, setSaveErrors] = useState<Map<string, string>>(new Map());

  const toggleSkillExpansion = (url: string) => {
    setExpandedSkills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(url)) {
        newSet.delete(url);
      } else {
        newSet.add(url);
      }
      return newSet;
    });
  };

  // Extract skill number from URL
  const extractSkillNumber = (url: string): string => {
    const match = url.match(/\/skill\/(\d+)/);
    return match ? match[1] : 'unknown';
  };

  const saveSkillToMongoDB = async (skill: SkillData) => {
    if (!skill.success) return;

    setSavingSkills(prev => new Set(prev).add(skill.url));
    setSaveErrors(prev => {
      const newMap = new Map(prev);
      newMap.delete(skill.url);
      return newMap;
    });

    try {
      // Convert SkillData to RoadmapsLessonInput format
      const lessonData = {
        title: skill.title,
        url: skill.url,
        skillNumber: skill.skillNumber || extractSkillNumber(skill.url),
        description: skill.description,
        skillChallengeCriteria: skill.skillChallengeCriteria,
        essentialQuestion: skill.essentialQuestion,
        launch: skill.launch,
        teacherStudentStrategies: skill.teacherStudentStrategies,
        modelsAndManipulatives: skill.modelsAndManipulatives,
        questionsToHelp: skill.questionsToHelp,
        discussionQuestions: skill.discussionQuestions,
        commonMisconceptions: skill.commonMisconceptions,
        additionalResources: skill.additionalResources,
        standards: skill.standards,
        vocabulary: skill.vocabulary,
        images: skill.images,
        videoUrl: skill.videoUrl,
        scrapedAt: skill.scrapedAt,
        success: skill.success,
        error: skill.error,
        tags: ['roadmaps-scraper'] // Add a tag to identify the source
      };

      const result = await createRoadmapsLesson(lessonData);

      if (result.success) {
        setSavedSkills(prev => new Set(prev).add(skill.url));
        console.log('✅ Skill saved to MongoDB:', skill.title);
      } else {
        setSaveErrors(prev => new Map(prev).set(skill.url, result.error || 'Save failed'));
        console.error('❌ Failed to save skill:', result.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSaveErrors(prev => new Map(prev).set(skill.url, errorMessage));
      console.error('❌ Error saving skill:', error);
    } finally {
      setSavingSkills(prev => {
        const newSet = new Set(prev);
        newSet.delete(skill.url);
        return newSet;
      });
    }
  };

  const saveAllSkillsToMongoDB = async () => {
    const successfulSkills = results.filter(skill => skill.success);
    if (successfulSkills.length === 0) return;

    setSavingSkills(new Set(successfulSkills.map(skill => skill.url)));
    setSaveErrors(new Map());

    try {
      // Convert all successful skills to RoadmapsLessonInput format
      const lessonsData = successfulSkills.map(skill => ({
        title: skill.title,
        url: skill.url,
        skillNumber: skill.skillNumber || extractSkillNumber(skill.url),
        description: skill.description,
        skillChallengeCriteria: skill.skillChallengeCriteria,
        essentialQuestion: skill.essentialQuestion,
        launch: skill.launch,
        teacherStudentStrategies: skill.teacherStudentStrategies,
        modelsAndManipulatives: skill.modelsAndManipulatives,
        questionsToHelp: skill.questionsToHelp,
        discussionQuestions: skill.discussionQuestions,
        commonMisconceptions: skill.commonMisconceptions,
        additionalResources: skill.additionalResources,
        standards: skill.standards,
        vocabulary: skill.vocabulary,
        images: skill.images,
        videoUrl: skill.videoUrl || null,
        scrapedAt: skill.scrapedAt,
        success: skill.success,
        error: skill.error,
        tags: ['roadmaps-scraper'] // Add a tag to identify the source
      }));

      const result = await bulkCreateRoadmapsLessons(lessonsData);

      if (result.success) {
        setSavedSkills(new Set(successfulSkills.map(skill => skill.url)));
        console.log('✅ All skills saved to MongoDB:', result.data);
      } else {
        setSaveErrors(new Map([['bulk', result.error || 'Bulk save failed']]));
        console.error('❌ Failed to save skills:', result.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSaveErrors(new Map([['bulk', errorMessage]]));
      console.error('❌ Error saving skills:', error);
    } finally {
      setSavingSkills(new Set());
    }
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `roadmaps-skills-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredResults = showSuccessOnly 
    ? results.filter(skill => skill.success)
    : results;

  const successfulResults = results.filter(skill => skill.success);
  const failedResults = results.filter(skill => !skill.success);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center p-4 border-b border-gray-200">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-md flex items-center justify-center text-white font-medium text-sm">
            ⏳
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">Scraping in Progress</h3>
            <p className="text-sm text-gray-500">Please wait while we extract skill content from Roadmaps...</p>
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

  return (
    <div className="space-y-6">
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
                `${results.length} skills processed`
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
                {successfulResults.reduce((total, skill) => total + skill.images.length, 0)}
              </div>
              <div className="text-sm text-gray-500">Images Found</div>
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
              onClick={saveAllSkillsToMongoDB}
              intent="primary"
              appearance="solid"
              padding="sm"
              disabled={results.filter(r => r.success).length === 0 || savingSkills.size > 0}
              icon={<CloudArrowUpIcon className="w-4 h-4" />}
            >
              {savingSkills.size > 0 ? 'Saving...' : 'Save All to MongoDB'}
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
        {filteredResults.map((skill, index) => (
          <SkillResultCard
            key={skill.url}
            skill={skill}
            index={index}
            isExpanded={expandedSkills.has(skill.url)}
            onToggleExpansion={() => toggleSkillExpansion(skill.url)}
            onSaveSkill={saveSkillToMongoDB}
            isSaving={savingSkills.has(skill.url)}
            isSaved={savedSkills.has(skill.url)}
            saveError={saveErrors.get(skill.url)}
          />
        ))}
      </div>
    </div>
  );
}

interface SkillResultCardProps {
  skill: SkillData;
  index: number;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onSaveSkill: (skill: SkillData) => void;
  isSaving: boolean;
  isSaved: boolean;
  saveError?: string;
}

function SkillResultCard({ skill, index, isExpanded, onToggleExpansion, onSaveSkill, isSaving, isSaved, saveError }: SkillResultCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const colorVariant = skill.success ? "success" : "danger";

  return (
    <div>
      <div className="relative">
        <SimpleCard
          initials={`${index + 1}`}
          title={skill.title || 'Untitled Skill'}
          subtitle={skill.success ? 
            `Content extracted: ${skill.description.slice(0, 100)}${skill.description.length > 100 ? '...' : ''}` : 
            `Error: ${skill.error}`
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
        
        {/* Dropdown Menu */}
        {skill.success && (
          <div className="absolute top-2 right-12">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="More options"
            >
              <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSaveSkill(skill);
                      setShowDropdown(false);
                    }}
                    disabled={isSaving || isSaved}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <CloudArrowUpIcon className="w-4 h-4" />
                    {isSaving ? 'Saving...' : isSaved ? 'Saved ✓' : 'Save to MongoDB'}
                  </button>
                  
                  {saveError && (
                    <div className="px-4 py-2 text-xs text-red-600 border-t border-gray-100">
                      Error: {saveError}
                    </div>
                  )}
                  
                  {isSaved && (
                    <div className="px-4 py-2 text-xs text-green-600 border-t border-gray-100">
                      Successfully saved to MongoDB
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {isExpanded && (
        <div className="bg-white border border-gray-200 rounded-b-lg shadow-sm -mt-1 px-6 pb-6 space-y-4">
          <div className="text-sm text-gray-600">
            <strong>URL:</strong> <a href={skill.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{skill.url}</a>
          </div>
          
          <div className="text-sm text-gray-600">
            <strong>Scraped:</strong> {new Date(skill.scrapedAt).toLocaleString()}
          </div>

          {skill.success && (
            <SkillContent skill={skill} />
          )}

          {!skill.success && skill.error && (
            <Alert intent="error">
              <Alert.Title>Error Details</Alert.Title>
              <Alert.Description>{skill.error}</Alert.Description>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}

interface SkillContentProps {
  skill: SkillData;
}

function SkillContent({ skill }: SkillContentProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <h4 className="font-semibold text-gray-900">Skill Content</h4>
      
      {skill.description && (
        <div>
          <span className="font-medium text-blue-700">Description:</span>
          <div className="ml-2 mt-1 text-sm text-gray-600 whitespace-pre-wrap bg-blue-50 p-2 rounded">
            {skill.description}
          </div>
        </div>
      )}

      {skill.skillChallengeCriteria && (
        <div>
          <span className="font-medium text-green-700">Skill Challenge Criteria:</span>
          <div className="ml-2 mt-1 text-sm text-gray-600 whitespace-pre-wrap bg-green-50 p-2 rounded">
            {skill.skillChallengeCriteria}
          </div>
        </div>
      )}

      {skill.essentialQuestion && (
        <div>
          <span className="font-medium text-purple-700">Essential Question:</span>
          <div className="ml-2 mt-1 text-sm text-gray-600 whitespace-pre-wrap bg-purple-50 p-2 rounded">
            {skill.essentialQuestion}
          </div>
        </div>
      )}

      {skill.launch && (
        <div>
          <span className="font-medium text-orange-700">Launch:</span>
          <div className="ml-2 mt-1 text-sm text-gray-600 whitespace-pre-wrap bg-orange-50 p-2 rounded">
            {skill.launch}
          </div>
        </div>
      )}

      {skill.teacherStudentStrategies && (
        <div>
          <span className="font-medium text-indigo-700">Teacher/Student Strategies:</span>
          <div className="ml-2 mt-1 text-sm text-gray-600 whitespace-pre-wrap bg-indigo-50 p-2 rounded">
            {skill.teacherStudentStrategies}
          </div>
        </div>
      )}

      {skill.vocabulary.length > 0 && (
        <div>
          <span className="font-medium text-pink-700">Vocabulary ({skill.vocabulary.length} terms):</span>
          <div className="ml-2 mt-1 text-sm text-gray-600 bg-pink-50 p-2 rounded">
            {skill.vocabulary.join(', ')}
          </div>
        </div>
      )}

      {skill.images.length > 0 && (
        <div>
          <span className="font-medium text-teal-700">Images ({skill.images.length} found):</span>
          <div className="ml-2 mt-1 space-y-1">
            {skill.images.map((image: string, i: number) => (
              <div key={i} className="bg-teal-50 p-2 rounded text-sm">
                <a href={image} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                  {image}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {skill.videoUrl && (
        <div>
          <span className="font-medium text-purple-700">Worked Example Video:</span>
          <div className="ml-2 mt-1">
            <div className="bg-purple-50 p-3 rounded">
              <p className="text-sm text-gray-600 mb-2">Video URL:</p>
              <a 
                href={skill.videoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-all"
              >
                {skill.videoUrl}
              </a>
            </div>
          </div>
        </div>
      )}

      {skill.standards && (
        <div>
          <span className="font-medium text-gray-700">Standards:</span>
          <div className="ml-2 mt-1 text-sm text-gray-600 whitespace-pre-wrap bg-gray-100 p-2 rounded">
            {skill.standards}
          </div>
        </div>
      )}

      <div className="border-t pt-2 space-y-1">
        <div className="text-sm text-gray-500">
          <strong>Has Content Sections:</strong> {[
            skill.launch && 'Launch',
            skill.teacherStudentStrategies && 'Strategies', 
            skill.modelsAndManipulatives && 'Models',
            skill.questionsToHelp && 'Questions',
            skill.discussionQuestions && 'Discussion',
            skill.commonMisconceptions && 'Misconceptions',
            skill.additionalResources && 'Resources'
          ].filter(Boolean).join(', ') || 'None'}
        </div>
        <div className="text-sm text-gray-500">
          <strong>Images Found:</strong> {skill.images.length}
        </div>
        <div className="text-sm text-gray-500">
          <strong>Vocabulary Terms:</strong> {skill.vocabulary.length}
        </div>
      </div>
    </div>
  );
}
