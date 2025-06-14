'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@components/core/Button';
import { Card } from '@components/composed/cards';
import { useSearchParams } from 'next/navigation';
import { Text } from '@/components/core/typography/Text';
import { Heading } from '@/components/core/typography/Heading';

// Import existing domain hook and types from the established schema
import { useClassroomObservations } from '@domain-hooks/observations/useClassroomObservations';
import { 
  useClassroomObservationDefaultsSimple,
  type ClassroomObservationNoteInput,
  ClassroomObservationNote
} from '@zod-schema/observations/classroom-observation';

// Import tab components
import { BasicInfoTab } from './tabs/BasicInfoTab';
import { FeedbackTab } from './tabs/FeedbackTab';
import { LessonFlowTab } from './tabs/LessonFlowTab';
import { ProgressMonitoringTab } from './tabs/ProgressMonitoringTab';
import { TimeAndTranscriptsTab } from './tabs/TimeAndTranscriptsTab';

type TabKey = 'basic' | 'feedback' | 'lessonFlow' | 'monitoring' | 'timeTranscripts';

const TABS = {
  basic: 'Basic Info',
  feedback: 'Feedback',
  lessonFlow: 'Lesson Flow',
  monitoring: 'Progress Monitoring',
  timeTranscripts: 'Time & Transcripts'
};

const ClassroomNotesExample = () => {
  const searchParams = useSearchParams();
  const teacherId = searchParams.get('teacherId');
  // Tab state
  const [activeTab, setActiveTab] = useState<TabKey>('basic');
  // Schema-driven state
  const { createAsync, isCreating, error: createError } = useClassroomObservations();
  const formDefaults = useClassroomObservationDefaultsSimple({
    cycle: 'Demo Cycle',
    session: 'Demo Session',
  });
  const [formData, setFormData] = useState<ClassroomObservationNoteInput>(formDefaults);
  const [selectedTeacher, setSelectedTeacher] = useState<string>(teacherId || '');

  useEffect(() => {
    if (teacherId) {
      setSelectedTeacher(teacherId);
    }
  }, [teacherId]);

  // Handle input changes (keep existing logic)
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        const [section, field] = parts;
        if (section === 'lesson') {
          setFormData(prev => ({
            ...prev,
            lesson: {
              ...prev.lesson,
              [field]: value
            }
          }));
        } else if (section === 'timeTracking') {
          setFormData(prev => ({
            ...prev,
            timeTracking: {
              ...prev.timeTracking,
              [field]: field === 'startedWhenMinutes' ? (value ? Number(value) : undefined) : value
            }
          }));
        } else if (section === 'transcripts') {
          setFormData(prev => ({
            ...prev,
            transcripts: {
              ...prev.transcripts,
              [field]: value
            }
          }));
        }
      } else if (parts.length === 3) {
        const [section, activityType, field] = parts;
        if (section === 'lessonFlow') {
          setFormData(prev => ({
            ...prev,
            lessonFlow: {
              ...prev.lessonFlow,
              [activityType]: {
                ...prev.lessonFlow[activityType as keyof typeof prev.lessonFlow],
                [field]: value
              }
            }
          }));
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }, []);

  // Handle array fields (feedback sections, learning targets)
  const handleArrayFieldChange = useCallback((fieldPath: string, value: string[]) => {
    const parts = fieldPath.split('.');
    if (parts.length === 2 && parts[0] === 'feedback') {
      const feedbackField = parts[1] as keyof typeof formData.feedback;
      setFormData(prev => ({
        ...prev,
        feedback: {
          ...prev.feedback,
          [feedbackField]: value
        }
      }));
    } else if (fieldPath === 'learningTargets') {
      setFormData(prev => ({
        ...prev,
        learningTargets: value
      }));
    }
  }, [formData, setFormData]);

  // Handle checkbox changes
  const handleCheckboxChange = useCallback((criterionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      progressMonitoring: {
        ...prev.progressMonitoring,
        observedCriteria: prev.progressMonitoring.observedCriteria.map((criterion: typeof prev.progressMonitoring.observedCriteria[number], index: number) =>
          index === criterionIndex 
            ? { ...criterion, observed: !criterion.observed }
            : criterion
        )
      }
    }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (createAsync) {
        const result = await createAsync(formData as ClassroomObservationNote);
        if ((result as { success?: boolean }).success) {
          console.log("Observation saved successfully");
          setFormData(formDefaults);
        }
      }
    } catch (error) {
      console.error("Error saving observation:", error);
    }
  }, [createAsync, formData, formDefaults]);

  // Timer functions (placeholder)
  const startStopwatch = useCallback(() => {
    console.log("Starting stopwatch");
  }, []);
  const pauseStopwatch = useCallback(() => {
    console.log("Pausing stopwatch");
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <BasicInfoTab
            formData={formData}
            selectedTeacher={selectedTeacher}
            onInputChange={handleInputChange}
            onTeacherChange={setSelectedTeacher}
          />
        );
      case 'feedback':
        return (
          <FeedbackTab
            formData={formData}
            onInputChange={handleInputChange}
            onArrayFieldChange={handleArrayFieldChange}
          />
        );
      case 'lessonFlow':
        return (
          <LessonFlowTab
            formData={formData}
            onInputChange={handleInputChange}
          />
        );
      case 'monitoring':
        return (
          <ProgressMonitoringTab
            formData={formData}
            onCheckboxChange={handleCheckboxChange}
          />
        );
      case 'timeTranscripts':
        return (
          <TimeAndTranscriptsTab
            formData={formData}
            onInputChange={handleInputChange}
            // startStopwatch={startStopwatch}
            // pauseStopwatch={pauseStopwatch}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Heading level="h1" className="mb-2">
            Classroom Observation Notes
          </Heading>
          <Text color="muted">
            Comprehensive classroom observation notes with schema-driven functionality
          </Text>
        </div>
        <form onSubmit={handleSubmit}>
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <Heading level="h3">Observation Details</Heading>
                <div className="flex space-x-3">
                  <Button 
                    type="button" 
                    appearance="outline" 
                    onClick={startStopwatch}
                  >
                    Start Timer
                  </Button>
                  <Button 
                    type="button"
                    appearance="outline"
                    onClick={pauseStopwatch}
                  >
                    Pause Timer
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {/* Error Display */}
              {createError && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
                  <Text color="danger">Error saving observation: {createError.message}</Text>
                </div>
              )}
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                  {Object.entries(TABS).map(([key, title]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveTab(key as TabKey)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                        activeTab === key
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {title}
                    </button>
                  ))}
                </nav>
              </div>
              {/* Tab Content */}
              <div className="min-h-[600px]">
                {renderTabContent()}
              </div>
            </Card.Body>
            <Card.Footer>
              <div className="flex justify-end space-x-3">
                <Button appearance="outline" type="button">
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Saving...' : 'Save Observation Notes'}
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default ClassroomNotesExample;