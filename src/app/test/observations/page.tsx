'use client';

import React, { useState } from 'react';
import { Button } from '@/components/core/Button';
import { Card } from '@/components/composed/cards';
import { Input } from '@/components/core/fields/Input';
import { Textarea } from '@/components/core/fields/Textarea';
import { Text } from '@/components/core/typography/Text';
import { Heading } from '@/components/core/typography/Heading';
import { 
  createClassroomObservationDefaults,
  useClassroomObservationDefaultsSimple
} from '@/lib/schema/zod-schema/observations/classroom-observation';

export default function ObservationsTestPage() {
  // Test both factory function and hook
  const hookDefaults = useClassroomObservationDefaultsSimple({
    cycle: 'Hook Test Cycle',
    session: 'Hook Test Session'
  });
  
  const [factoryDefaults] = useState(() => 
    createClassroomObservationDefaults({
      schoolId: 'test-school-123',
      userId: 'test-user-456',
      cycle: 'Factory Cycle',
      session: 'Factory Session',
    })
  );
  
  const [selectedDefaults, setSelectedDefaults] = useState<'hook' | 'factory'>('hook');
  const currentDefaults = selectedDefaults === 'hook' ? hookDefaults : factoryDefaults;
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="space-y-6">
        
        {/* Header */}
        <div>
          <Heading level="h1" className="mb-2">Classroom Observation Defaults Test</Heading>
          <Text color="muted">
            Testing schema-driven defaults for classroom observations with factory functions and hooks
          </Text>
        </div>

        {/* Controls */}
        <Card>
          <Card.Header>
            <Heading level="h3">Test Controls</Heading>
          </Card.Header>
          <Card.Body>
            <div className="flex gap-4">
              <Button
                appearance={selectedDefaults === 'hook' ? 'solid' : 'outline'}
                onClick={() => setSelectedDefaults('hook')}
              >
                Hook Defaults (useClassroomObservationDefaultsSimple)
              </Button>
              <Button
                appearance={selectedDefaults === 'factory' ? 'solid' : 'outline'}
                onClick={() => setSelectedDefaults('factory')}
              >
                Factory Defaults (createClassroomObservationDefaults)
              </Button>
            </div>
            <Text textSize="sm" color="muted" className="mt-2">
              Current source: {selectedDefaults === 'hook' ? 'useClassroomObservationDefaultsSimple()' : 'createClassroomObservationDefaults()'}
            </Text>
          </Card.Body>
        </Card>

        {/* Schema Validation Test */}
        <Card>
          <Card.Header>
            <Heading level="h3">Schema Defaults Validation</Heading>
            <Text textSize="sm" color="muted">
              Validating that all fields have appropriate defaults from the schema
            </Text>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Basic Fields */}
              <div>
                <Text textSize="sm" weight="medium" className="mb-2">Basic Fields</Text>
                <div className="space-y-2 text-sm">
                  <div>Cycle: <code className="bg-gray-100 px-1 rounded">{currentDefaults.cycle || '(empty)'}</code></div>
                  <div>Session: <code className="bg-gray-100 px-1 rounded">{currentDefaults.session || '(empty)'}</code></div>
                  <div>Date: <code className="bg-gray-100 px-1 rounded">{currentDefaults.date ? (typeof currentDefaults.date === 'string' ? currentDefaults.date.split('T')[0] : currentDefaults.date.toISOString().split('T')[0]) : '(empty)'}</code></div>
                  <div>Teacher ID: <code className="bg-gray-100 px-1 rounded">{currentDefaults.teacherId || '(empty)'}</code></div>
                  <div>Coach ID: <code className="bg-gray-100 px-1 rounded">{currentDefaults.coachId || '(empty)'}</code></div>
                  <div>School ID: <code className="bg-gray-100 px-1 rounded">{currentDefaults.schoolId || '(empty)'}</code></div>
                  <div>Owner IDs: <code className="bg-gray-100 px-1 rounded">[{currentDefaults.ownerIds.join(', ') || 'empty'}]</code></div>
                </div>
              </div>

              {/* Lesson Structure */}
              <div>
                <Text textSize="sm" weight="medium" className="mb-2">Lesson Structure</Text>
                <div className="space-y-2 text-sm">
                  <div>Title: <code className="bg-gray-100 px-1 rounded">{currentDefaults.lesson.title || '(empty)'}</code></div>
                  <div>Course: <code className="bg-gray-100 px-1 rounded">{currentDefaults.lesson.course || '(empty)'}</code></div>
                  <div>Unit: <code className="bg-gray-100 px-1 rounded">{currentDefaults.lesson.unit || '(empty)'}</code></div>
                  <div>Lesson #: <code className="bg-gray-100 px-1 rounded">{currentDefaults.lesson.lessonNumber || '(empty)'}</code></div>
                  <div>Other Context: <code className="bg-gray-100 px-1 rounded">{currentDefaults.otherContext || '(empty)'}</code></div>
                  <div>Learning Targets: <code className="bg-gray-100 px-1 rounded">{currentDefaults.learningTargets.length} items</code></div>
                  <div>Cool Down: <code className="bg-gray-100 px-1 rounded">{currentDefaults.coolDown || '(empty)'}</code></div>
                </div>
              </div>

              {/* Activity Sections */}
              <div>
                <Text textSize="sm" weight="medium" className="mb-2">Activity Sections</Text>
                <div className="space-y-2 text-sm">
                                     <div>Warm Up: <code className="bg-gray-100 px-1 rounded">
                     {Object.values(currentDefaults.lessonFlow.warmUp || {}).filter(v => v && typeof v === 'string' && v.length > 0).length}/3 fields
                   </code></div>
                   <div>Activity 1: <code className="bg-gray-100 px-1 rounded">
                     {Object.values(currentDefaults.lessonFlow.activity1 || {}).filter(v => v && typeof v === 'string' && v.length > 0).length}/3 fields
                   </code></div>
                   <div>Activity 2: <code className="bg-gray-100 px-1 rounded">
                     {currentDefaults.lessonFlow.activity2 ? Object.values(currentDefaults.lessonFlow.activity2).filter(v => v && typeof v === 'string' && v.length > 0).length : 0}/3 fields
                   </code></div>
                   <div>Lesson Synthesis: <code className="bg-gray-100 px-1 rounded">
                     {Object.values(currentDefaults.lessonFlow.lessonSynthesis || {}).filter(v => v && typeof v === 'string' && v.length > 0).length}/3 fields
                   </code></div>
                                     <div>Progress Monitoring: <code className="bg-gray-100 px-1 rounded">
                     {/* @ts-expect-error: Type checking for criterion filtering */}
                     {currentDefaults.progressMonitoring.observedCriteria.filter(c => c.observed).length}/{currentDefaults.progressMonitoring.observedCriteria.length} criteria observed
                   </code></div>
                </div>
              </div>

              {/* Feedback Structure */}
              <div>
                <Text textSize="sm" weight="medium" className="mb-2">Feedback Structure</Text>
                <div className="space-y-2 text-sm">
                  <div>Glow: <code className="bg-gray-100 px-1 rounded">{currentDefaults.feedback.glow.length} items</code></div>
                  <div>Wonder: <code className="bg-gray-100 px-1 rounded">{currentDefaults.feedback.wonder.length} items</code></div>
                  <div>Grow: <code className="bg-gray-100 px-1 rounded">{currentDefaults.feedback.grow.length} items</code></div>
                  <div>Next Steps: <code className="bg-gray-100 px-1 rounded">{currentDefaults.feedback.nextSteps.length} items</code></div>
                </div>
              </div>

              {/* Time & Transcripts */}
              <div>
                <Text textSize="sm" weight="medium" className="mb-2">Time & Transcripts</Text>
                <div className="space-y-2 text-sm">
                  <div>Stopwatch: <code className="bg-gray-100 px-1 rounded">{currentDefaults.timeTracking.stopwatchTime}</code></div>
                  <div>Start Time: <code className="bg-gray-100 px-1 rounded">{currentDefaults.timeTracking.classStartTime || '(empty)'}</code></div>
                  <div>End Time: <code className="bg-gray-100 px-1 rounded">{currentDefaults.timeTracking.classEndTime || '(empty)'}</code></div>
                                     <div>Transcripts: <code className="bg-gray-100 px-1 rounded">
                     {Object.values(currentDefaults.transcripts || {}).filter(v => v && typeof v === 'string' && v.length > 0).length}/4 filled
                   </code></div>
                </div>
              </div>

              {/* Status & Meta */}
              <div>
                <Text textSize="sm" weight="medium" className="mb-2">Status & Meta</Text>
                <div className="space-y-2 text-sm">
                  <div>Status: <code className="bg-gray-100 px-1 rounded">{currentDefaults.status}</code></div>
                  <div>Shared: <code className="bg-gray-100 px-1 rounded">{currentDefaults.isSharedWithTeacher.toString()}</code></div>
                  <div>Visit ID: <code className="bg-gray-100 px-1 rounded">{currentDefaults.visitId || '(empty)'}</code></div>
                  <div>Action Plan ID: <code className="bg-gray-100 px-1 rounded">{currentDefaults.coachingActionPlanId || '(empty)'}</code></div>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Interactive Form Test */}
        <Card>
          <Card.Header>
            <Heading level="h3">Interactive Form Test</Heading>
            <Text textSize="sm" color="muted">
              Test form initialization with schema defaults
            </Text>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Cycle</label>
                <Input
                  value={currentDefaults.cycle}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Session</label>
                <Input
                  value={currentDefaults.session}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Date</label>
                <Input
                  type="date"
                  value={currentDefaults.date 
                    ? (currentDefaults.date instanceof Date 
                        ? currentDefaults.date.toISOString().split('T')[0]
                        : currentDefaults.date.toString().split('T')[0]
                      )
                    : ''
                  }
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                <Input
                  value={currentDefaults.status}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Lesson Title</label>
                <Input
                  value={currentDefaults.lesson.title}
                  placeholder="Schema default: empty string"
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Other Context</label>
                <Input
                  value={currentDefaults.otherContext}
                  placeholder="Schema default: empty string"
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Warm Up Launch Notes</label>
              <Textarea
                value={currentDefaults.lessonFlow.warmUp.launch}
                placeholder="Schema default: empty string"
                readOnly
                className="bg-gray-50"
                rows={2}
              />
            </div>
          </Card.Body>
        </Card>

        {/* Tagging System Test */}
        <Card>
          <Card.Header>
            <Heading level="h3">Tagging System Validation</Heading>
            <Text textSize="sm" color="muted">
              Checking tagging system defaults are properly initialized
            </Text>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text textSize="sm" weight="medium" className="mb-2">Tagging Fields</Text>
                <div className="space-y-2 text-sm">
                  <div>Tags: <code className="bg-gray-100 px-1 rounded">{currentDefaults.tagging.tags.length} items</code></div>
                  <div>Auto-tagging: <code className="bg-gray-100 px-1 rounded">{currentDefaults.tagging.autoTaggingEnabled.toString()}</code></div>
                  <div>Searchable Text: <code className="bg-gray-100 px-1 rounded">{currentDefaults.tagging.searchableText || '(empty)'}</code></div>
                  <div>Tag Summary: <code className="bg-gray-100 px-1 rounded">{currentDefaults.tagging.tagSummary || '(empty)'}</code></div>
                </div>
              </div>
              <div>
                <Text textSize="sm" weight="medium" className="mb-2">Context Metadata</Text>
                <div className="space-y-2 text-sm">
                  <div>Source: <code className="bg-gray-100 px-1 rounded">{currentDefaults.tagging.contextMetadata.sourceType}</code></div>
                  <div>Confidence: <code className="bg-gray-100 px-1 rounded">{currentDefaults.tagging.contextMetadata.confidence}</code></div>
                  <div>Participants: <code className="bg-gray-100 px-1 rounded">{currentDefaults.tagging.contextMetadata.participants.length} items</code></div>
                  <div>Location: <code className="bg-gray-100 px-1 rounded">{currentDefaults.tagging.contextMetadata.location || '(empty)'}</code></div>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Full JSON Debug */}
        <Card>
          <Card.Header>
            <Heading level="h3">Full Schema Debug</Heading>
            <Text textSize="sm" color="muted">
              Complete object structure for debugging
            </Text>
          </Card.Header>
          <Card.Body>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(currentDefaults, null, 2)}
            </pre>
          </Card.Body>
        </Card>
        
      </div>
    </div>
  );
} 