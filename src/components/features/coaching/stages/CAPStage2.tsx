"use client";

import React from 'react';
import { ActionPlanStage } from '../ActionPlanStage';
import { Textarea } from '@components/core/fields/Textarea';
import { OutcomeManager } from '@/components/domain/coaching/field-managers/OutcomeManager';
import { useStageEditor } from '@/hooks/coaching/useStageEditor';
import { useSectionToggle } from '@/hooks/ui/useSectionToggle';
import { CollapsedStageView } from '../components/CollapsedStageView';
import { SectionHeader } from '../components/SectionHeader';
import { stageValidators } from '@/lib/validation/coaching-stages';
import type { Goal, Outcome } from '@zod-schema/core/cap';

interface CoachingActionPlanStage2Props {
  data: Goal;
  onChange: (data: Goal) => void;
  planId?: string;
  className?: string;
}

export function CoachingActionPlanStage2({
  data,
  onChange,
  planId: _planId,
  className
}: CoachingActionPlanStage2Props) {
  const { isEditing, isComplete, handleEdit } = useStageEditor({
    data,
    onChange,
    isCompleteCheck: stageValidators.goal
  });

  const { sections, toggle, expandAll } = useSectionToggle({
    description: true,
    teacherOutcomes: true,
    studentOutcomes: true
  });

  const updateDescription = (description: string) => {
    onChange({ ...data, description });
  };

  const updateTeacherOutcomes = (teacherOutcomes: Outcome[]) => {
    onChange({ ...data, teacherOutcomes });
  };

  const updateStudentOutcomes = (studentOutcomes: Outcome[]) => {
    onChange({ ...data, studentOutcomes });
  };

  const handleEditWithExpand = () => {
    handleEdit();
    expandAll();
  };

  // Collapsed view when complete and not editing
  if (isComplete && !isEditing) {
    return (
      <ActionPlanStage
        number={2}
        title="Set Goals"
        className={className}
      >
        <CollapsedStageView
          title="Goals & Metrics Defined"
          summary={
            <>
              <p className="mb-2">
                <strong>Goal:</strong> {data.description.slice(0, 100)}...
              </p>
              <p>
                <strong>Outcomes:</strong> {data.teacherOutcomes.length} teacher, {data.studentOutcomes.length} student
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
      number={2}
      title="Set Goals"
      className={className}
    >
      <div className="space-y-6">
        {/* Goal Description Section */}
        <div>
          <SectionHeader
            title="SMART Goal Statement"
            isExpanded={sections.description}
            onToggle={() => toggle('description')}
          />
          
          {sections.description && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Write a specific, measurable, achievable, relevant, and time-bound goal for this coaching cycle
              </p>
              <Textarea
                label="Primary Goal Description"
                value={data.description}
                onChange={(e) => updateDescription(e.target.value)}
                placeholder="By the end of the coaching cycle, the teacher will... As a result, students will... This will be evidenced by..."
                rows={4}
                required
              />
            </div>
          )}
        </div>

        {/* Teacher Outcomes Section */}
        <div>
          <SectionHeader
            title="Teacher Outcomes & Metrics"
            isExpanded={sections.teacherOutcomes}
            onToggle={() => toggle('teacherOutcomes')}
          />
          
          {sections.teacherOutcomes && (
            <OutcomeManager
              label="Teacher Outcomes & Metrics"
              outcomes={data.teacherOutcomes}
              onChange={updateTeacherOutcomes}
              outcomeType="teacher"
              className="mt-4"
            />
          )}
        </div>

        {/* Student Outcomes Section */}
        <div>
          <SectionHeader
            title="Student Outcomes & Metrics"
            isExpanded={sections.studentOutcomes}
            onToggle={() => toggle('studentOutcomes')}
          />
          
          {sections.studentOutcomes && (
            <OutcomeManager
              label="Student Outcomes & Metrics"
              outcomes={data.studentOutcomes}
              onChange={updateStudentOutcomes}
              outcomeType="student"
              className="mt-4"
            />
          )}
        </div>
      </div>
    </ActionPlanStage>
  );
} 