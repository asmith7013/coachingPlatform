"use client";

import React, { useState } from 'react';
import { ActionPlanStage } from '../components/ActionPlanStage';
import { MetricsBuilder } from '../components/MetricsBuilder';
import { CoachingMovesBuilder } from '../components/CoachingMovesBuilder';
import { ImplementationRecordCard } from '../components/ImplementationRecordCard';
import { IPGFocusCards } from '../components/IPGFocusCards';
import { IPGSubsectionCards } from '../components/IPGSubsectionCards';
import { Textarea } from '@/components/core/fields/Textarea';
import { Input } from '@/components/core/fields/Input';
import { Button } from '@/components/core/Button';
import { Plus, Edit2 } from 'lucide-react';
import ipgData from '@/lib/ui/json/ipg.json';
import { getTodayString } from '@/lib/data-processing/transformers/utils/date-utils';
// import { semanticColors } from '@/lib/tokens/colors';

interface MetricType {
  name: string;
  type: 'IPG' | 'L&R' | 'Project' | 'Other';
  ratings: { score: number; description: string }[];
}

interface CoachingMoveType {
  category: string;
  specificMove: string;
  toolsResources: string;
}

interface ImplementationRecordType {
  date: string;
  proposedArc: string[];
  movesSelected: string[];
  metrics: Record<string, number>;
  evidenceLink: string;
  teacherNotes: string;
  studentNotes: string;
  nextStep: string;
  nextStepDone: boolean;
  betweenSessionSupport: string;
}

export default function Example3Page() {
  // Update Stage 1 state
  const [selectedCoreAction, setSelectedCoreAction] = useState<string | null>(null);
  const [selectedSubsection, setSelectedSubsection] = useState<string | null>(null);
  const [rationale, setRationale] = useState('');
  
  // Stage 2 state
  const [smartGoal, setSmartGoal] = useState('');
  const [metrics, setMetrics] = useState<MetricType[]>([
    { 
      name: 'Teacher Metric (IPG?)', 
      type: 'IPG',
      ratings: [
        { score: 4, description: '' },
        { score: 3, description: '' },
        { score: 2, description: '' },
        { score: 1, description: '' }
      ]
    }
  ]);
  
  // Stage 3 state
  const [coachingMoves, setCoachingMoves] = useState<CoachingMoveType[]>([
    { category: '', specificMove: '', toolsResources: '' }
  ]);
  const [implementationRecords, setImplementationRecords] = useState<ImplementationRecordType[]>([]);
  
  // Stage 4 state
  const [goalMet, setGoalMet] = useState<boolean | null>(null);
  const [impactOnLearning, setImpactOnLearning] = useState('');
  const [buildOnThis, setBuildOnThis] = useState('');
  const [spotlightLink, setSpotlightLink] = useState('');

  // Handle Core Action selection
  const handleCoreActionSelect = (value: string) => {
    setSelectedCoreAction(value);
    setSelectedSubsection(null); // Reset subsection when changing core action
  };

  // Handle Edit/Clear button
  const handleClearSelection = () => {
    setSelectedCoreAction(null);
    setSelectedSubsection(null);
    // Note: We preserve the rationale as requested
  };

  // Get current core action data
  const currentCoreAction = ipgData.find(
    action => `CA${action.coreAction}` === selectedCoreAction
  );

  // Determine if we should show the focus box
  const showFocusBox = selectedCoreAction && selectedSubsection;

  // Helper functions
  const addImplementationRecord = () => {
    const newRecord: ImplementationRecordType = {
      date: getTodayString(),
      proposedArc: [],
      movesSelected: [],
      metrics: {},
      evidenceLink: '',
      teacherNotes: '',
      studentNotes: '',
      nextStep: '',
      nextStepDone: false,
      betweenSessionSupport: ''
    };
    setImplementationRecords([...implementationRecords, newRecord]);
  };

  const updateImplementationRecord = (index: number, record: ImplementationRecordType) => {
    const updated = [...implementationRecords];
    updated[index] = record;
    setImplementationRecords(updated);
  };

  const deleteImplementationRecord = (index: number) => {
    setImplementationRecords(implementationRecords.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Coaching Action Plan</h1>
        <p className="text-center text-gray-600">Transform teaching practice through structured coaching cycles</p>
      </div>

      {/* Stage 1: Identify Needs & Determine Focus */}
      <ActionPlanStage
        number={1}
        title="Identify Needs + Determine Focus"
        className="mb-8"
      >
        <div className="space-y-6">
          {/* Always show the label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area of Focus (IPG Category)
            </label>
            
            {/* Show cards if no complete selection, otherwise show the gray box */}
            {!showFocusBox ? (
              <>
                <IPGFocusCards
                  selectedValue={selectedCoreAction || undefined}
                  onSelect={handleCoreActionSelect}
                  options={[
                    { value: 'CA1', label: 'Focus, Coherence, and Rigor', colorCode: 'primary' },
                    { value: 'CA2', label: 'Instructional Practices', colorCode: 'secondary' },
                    { value: 'CA3', label: 'Mathematical Practices', colorCode: 'success' }
                  ]}
                />

                {/* Show subsections only if a core action is selected */}
                {selectedCoreAction && currentCoreAction && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {selectedCoreAction}: {currentCoreAction.title}
                    </h3>
                    
                    <div className="ml-8 mb-6">
                      <h4 className="text-sm font-medium text-gray-600 mb-3">
                        Select specific focus area:
                      </h4>
                    </div>
                    
                    <IPGSubsectionCards
                      subsections={currentCoreAction.sections}
                      selectedSubsection={selectedSubsection}
                      onSelect={setSelectedSubsection}
                      parentColor={
                        selectedCoreAction === 'CA1' ? 'primary' :
                        selectedCoreAction === 'CA2' ? 'secondary' : 'success'
                      }
                    />
                  </div>
                )}
              </>
            ) : (
              /* Show the gray focus box with Edit button */
              <div className="relative">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">Selected Focus Area:</p>
                  <p className="font-medium">
                    {selectedCoreAction}.{selectedSubsection} - {
                      currentCoreAction?.sections.find(s => s.section === selectedSubsection)?.description
                    }
                  </p>
                </div>
                
                {/* Edit button positioned on the right */}
                <Button
                  intent="secondary"
                  appearance="outline"
                  textSize="sm"
                  padding="sm"
                  onClick={handleClearSelection}
                  className="absolute -top-2 -right-2 bg-white"
                >
                  <Edit2 size={16} className="mr-1" />
                  Edit
                </Button>
              </div>
            )}
          </div>

          {/* Rationale - Always show but conditionally required */}
          <Textarea
            label="Rationale"
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Explain why this area was selected as the focus..."
            rows={4}
            required={!!showFocusBox}
          />
        </div>
      </ActionPlanStage>

      {/* Stage 2: Set Goals */}
      <ActionPlanStage
        number={2}
        title="Set Goals"
        className="mb-8"
      >
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">SMART Goal Set</h3>
            <Textarea
              label="By the end of the coaching cycle..."
              value={smartGoal}
              onChange={(e) => setSmartGoal(e.target.value)}
              placeholder="the teacher will... As a result... This will be evidenced by..."
              rows={4}
              required
            />
          </div>

          <MetricsBuilder
            metrics={metrics}
            onMetricsChange={setMetrics}
          />
        </div>
        <CoachingMovesBuilder
            moves={coachingMoves}
            onMovesChange={setCoachingMoves}
        />
      </ActionPlanStage>

      {/* Stage 3: Implementation & Support */}
      <ActionPlanStage
        number={3}
        title="Implementation + Support"
        className="mb-8"
      >
        <div className="space-y-6">


          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Implementation Record - Decision Log & Progress Monitoring</h3>
              <Button
                intent="primary"
                appearance="outline"
                textSize="sm"
                padding="sm"
                onClick={addImplementationRecord}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Session
              </Button>
            </div>
            
            {implementationRecords.map((record, index) => (
              <ImplementationRecordCard
                key={index}
                record={record}
                index={index}
                metrics={metrics}
                coachingMoves={coachingMoves}
                onUpdate={updateImplementationRecord}
                onDelete={deleteImplementationRecord}
              />
            ))}

            {implementationRecords.length === 0 && (
              <div className="text-center py-8 text-gray-500 border rounded-lg">
                No implementation records yet. Click &quot;Add Session&quot; to begin tracking progress.
              </div>
            )}
          </div>
        </div>
      </ActionPlanStage>

      {/* Stage 4: Analyze & Discuss */}
      <ActionPlanStage
        number={4}
        title="Analyze + Discuss"
        className="mb-8"
      >
        <div className="space-y-4">
          <h3 className="font-semibold text-lg mb-2">Reflection</h3>
          
          <div>
            <label className="block text-sm font-medium mb-2">Was the goal met?</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="goalMet"
                  checked={goalMet === true}
                  onChange={() => setGoalMet(true)}
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="goalMet"
                  checked={goalMet === false}
                  onChange={() => setGoalMet(false)}
                />
                <span>No</span>
              </label>
            </div>
          </div>

          <Textarea
            label="What impact did this goal have on student learning?"
            value={impactOnLearning}
            onChange={(e) => setImpactOnLearning(e.target.value)}
            rows={4}
            required
          />

          <Textarea
            label="How can you build on this?"
            value={buildOnThis}
            onChange={(e) => setBuildOnThis(e.target.value)}
            rows={4}
            required
          />

          <Input
            label="Teacher Spotlight Slides"
            value={spotlightLink}
            onChange={(e) => setSpotlightLink(e.target.value)}
            placeholder="Drive Link"
          />
        </div>
      </ActionPlanStage>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-8">
        <Button
          intent="secondary"
          appearance="outline"
          textSize="base"
          padding="md"
        >
          Save as Draft
        </Button>
        <Button
          intent="primary"
          appearance="solid"
          textSize="base"
          padding="md"
        >
          Complete Action Plan
        </Button>
      </div>
    </div>
  );
}
