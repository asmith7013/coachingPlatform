"use client";

import React from 'react';
import { ActionPlanStage } from '../ActionPlanStage';
import { Button } from '@/components/core/Button';
import { Plus } from 'lucide-react';
import { ImplementationRecordCard } from '@/components/domain/coaching/ImplementationRecordCard';
import { getTodayString } from '@transformers/utils/date-utils';

// Types for Stage 3 data
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

interface CoachingActionPlanStage3Props {
  // Implementation records state
  implementationRecords: ImplementationRecordType[];
  onImplementationRecordsChange: (records: ImplementationRecordType[]) => void;
  
  // Data from previous stages
  metrics: MetricType[];
  coachingMoves: CoachingMoveType[];
  
  // Optional props
  planId?: string;
  className?: string;
}

export function CoachingActionPlanStage3({
  implementationRecords,
  onImplementationRecordsChange,
  metrics,
  coachingMoves,
  planId: _planId,
  className
}: CoachingActionPlanStage3Props) {
  
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
    onImplementationRecordsChange([...implementationRecords, newRecord]);
  };

  const updateImplementationRecord = (index: number, record: ImplementationRecordType) => {
    const updated = [...implementationRecords];
    updated[index] = record;
    onImplementationRecordsChange(updated);
  };

  const deleteImplementationRecord = (index: number) => {
    onImplementationRecordsChange(implementationRecords.filter((_, i) => i !== index));
  };

  return (
    <ActionPlanStage
      number={3}
      title="Implementation + Support"
      className={className}
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
  );
} 