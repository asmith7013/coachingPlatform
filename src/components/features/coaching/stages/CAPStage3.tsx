"use client";

import React from 'react';
import { ActionPlanStage } from '../ActionPlanStage';
import { Button } from '@/components/core/Button';
import { Plus } from 'lucide-react';
import { ImplementationRecordCard } from '@/components/domain/coaching/ImplementationRecordCard';
import { getTodayString } from '@/lib/data-processing/transformers/utils/date-utils';
import { useStageEditor } from '@/hooks/coaching/useStageEditor';
import { useSectionToggle } from '@/hooks/ui/useSectionToggle';
import { CollapsedStageView } from '../components/CollapsedStageView';
import { SectionHeader } from '../components/SectionHeader';
import { stageValidators } from '@/lib/validation/coaching-stages';
import type { CapImplementationRecord, CoachingCycleNumber, VisitNumber, CoachingActionPlan, CapWeeklyPlan } from '@zod-schema/cap';

interface CoachingActionPlanStage3Props {
  data: CapImplementationRecord[];
  onChange: (records: CapImplementationRecord[]) => void;
  goal?: CoachingActionPlan;
  planId?: string;
  className?: string;
}

export function CoachingActionPlanStage3({
  data,
  onChange,
  goal,
  planId: _planId,
  className
}: CoachingActionPlanStage3Props) {
  const { isEditing, isComplete, handleEdit } = useStageEditor({
    data,
    onChange,
    isCompleteCheck: stageValidators.implementation as (data: CapImplementationRecord[]) => boolean
  });

  const { sections, toggle, expandAll } = useSectionToggle({
    records: true
  });

  const addImplementationRecord = () => {
    // Determine next cycle and visit numbers based on existing records
    const nextCycleNumber: CoachingCycleNumber = data.length < 3 ? "1" : 
                                               data.length < 6 ? "2" : "3";
    const nextVisitNumber: VisitNumber = data.length % 3 === 0 ? "1" :
                                        data.length % 3 === 1 ? "2" : "3";

    const newRecord: CapImplementationRecord = {
      _id: '',
      ownerIds: [],
      date: getTodayString(),
      visitId: '',
      cycleNumber: nextCycleNumber,
      visitNumber: nextVisitNumber,
      lookForImplemented: '',
      glows: [],
      grows: [],
      successMetrics: [],
      nextSteps: [],
      teacherReflection: '',
      coachNotes: ''
    };
    
    onChange([...data, newRecord]);
  };

  const updateImplementationRecord = (index: number, record: CapImplementationRecord) => {
    const updated = [...data];
    updated[index] = record;
    onChange(updated);
  };

  const deleteImplementationRecord = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const handleEditWithExpand = () => {
    handleEdit();
    expandAll();
  };

  if (isComplete && !isEditing) {
    return (
      <ActionPlanStage
        number={3}
        title="Implementation + Support"
        className={className}
      >
        <CollapsedStageView
          title="Implementation Records Complete"
          summary={
            <>
              <p className="mb-2">
                <strong>Sessions Logged:</strong> {data.length}
              </p>
              <p>
                <strong>Cycles:</strong> {Math.max(...data.map(r => parseInt(r.cycleNumber)))} completed
              </p>
            </>
          }
          onEdit={handleEditWithExpand}
        />
      </ActionPlanStage>
    );
  }

  return (
    <ActionPlanStage
      number={3}
      title="Implementation + Support"
      className={className}
    >
      <div className="space-y-6">
        <div>
          <SectionHeader
            title="Implementation Records - Decision Log & Progress Monitoring"
            isExpanded={sections.records}
            onToggle={() => toggle('records')}
          />
          
          {sections.records && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Track what actually happened during coaching visits with structured observations
                </p>
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
              
              {data.map((record, index) => (
                <ImplementationRecordCard
                  key={index}
                  record={record as CapImplementationRecord}
                  index={index}
                  goal={goal as unknown as CapWeeklyPlan}
                  onUpdate={updateImplementationRecord}
                  onDelete={deleteImplementationRecord}
                />
              ))}

              {data.length === 0 && (
                <div className="text-center py-8 text-gray-500 border rounded-lg">
                  No implementation records yet. Click &quot;Add Session&quot; to begin tracking progress.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ActionPlanStage>
  );
} 