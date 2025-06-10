"use client";

import React from 'react';
import { ActionPlanStage } from '../ActionPlanStage';
import { Textarea } from '@/components/core/fields/Textarea';
import { Input } from '@/components/core/fields/Input';
import { cn } from '@/lib/ui/utils/formatters';
import { semanticColors } from '@/lib/tokens/colors';
import { EvidenceManager } from '@components/domain/coaching/field-managers';
import { useStageEditor } from '@/hooks/coaching/useStageEditor';
import { useSectionToggle } from '@/hooks/ui/useSectionToggle';
import { CollapsedStageView } from '../components/CollapsedStageView';
import { SectionHeader } from '../components/SectionHeader';
import { stageValidators } from '@/lib/validation/coaching-stages';
import type { EndOfCycleAnalysis, Evidence, Goal } from '@zod-schema/core/cap';

interface CoachingActionPlanStage4Props {
  data: EndOfCycleAnalysis;
  onChange: (data: EndOfCycleAnalysis) => void;
  goal?: Goal;
  planId?: string;
  className?: string;
}

export function CoachingActionPlanStage4({
  data,
  onChange,
  goal,
  planId: _planId,
  className
}: CoachingActionPlanStage4Props) {
  const { isEditing, isComplete, handleEdit } = useStageEditor({
    data,
    onChange,
    isCompleteCheck: stageValidators.analysis
  });

  const { sections, toggle, expandAll } = useSectionToggle({
    goalMet: true,
    teacherAnalysis: true,
    studentAnalysis: true,
    impact: true,
    evidence: true,
    lessons: true
  });

  const updateField = <K extends keyof EndOfCycleAnalysis>(
    field: K,
    value: EndOfCycleAnalysis[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  // Initialize outcome analysis arrays
  React.useEffect(() => {
    if (goal && data.teacherOutcomeAnalysis.length === 0 && goal.teacherOutcomes.length > 0) {
      const teacherAnalysis = goal.teacherOutcomes.map((outcome, index) => ({
        outcomeId: `teacher-outcome-${index}`,
        achieved: false,
        evidence: [],
        finalMetricValues: outcome.metrics.map((metric, metricIndex) => ({
          metricId: `metric-${index}-${metricIndex}`,
          finalValue: '',
          goalMet: false
        }))
      }));
      updateField('teacherOutcomeAnalysis', teacherAnalysis);
    }

    if (goal && data.studentOutcomeAnalysis.length === 0 && goal.studentOutcomes.length > 0) {
      const studentAnalysis = goal.studentOutcomes.map((outcome, index) => ({
        outcomeId: `student-outcome-${index}`,
        achieved: false,
        evidence: [],
        finalMetricValues: outcome.metrics.map((metric, metricIndex) => ({
          metricId: `metric-${index}-${metricIndex}`,
          finalValue: '',
          goalMet: false
        }))
      }));
      updateField('studentOutcomeAnalysis', studentAnalysis);
    }
  }, [goal, data.teacherOutcomeAnalysis.length, data.studentOutcomeAnalysis.length, updateField]);

  const handleEditWithExpand = () => {
    handleEdit();
    expandAll();
  };

  if (isComplete && !isEditing) {
    return (
      <ActionPlanStage
        number={4}
        title="Analyze + Discuss"
        className={className}
      >
        <CollapsedStageView
          title="Cycle Analysis Complete"
          summary={
            <>
              <p className="mb-2">
                <strong>Goal Met:</strong> {data.goalMet ? 'Yes' : 'No'}
              </p>
              <p>
                <strong>Outcomes Analyzed:</strong> {data.teacherOutcomeAnalysis.length} teacher, {data.studentOutcomeAnalysis.length} student
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
      number={4}
      title="Analyze + Discuss"
      className={className}
    >
      <div className="space-y-6">
        {/* Goal Met Section */}
        <div>
          <SectionHeader
            title="Goal Achievement"
            isExpanded={sections.goalMet}
            onToggle={() => toggle('goalMet')}
          />
          
          {sections.goalMet && (
            <div>
              <label className="block text-sm font-medium mb-2">Was the primary goal achieved?</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="goalMet"
                    checked={data.goalMet === true}
                    onChange={() => updateField('goalMet', true)}
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="goalMet"
                    checked={data.goalMet === false}
                    onChange={() => updateField('goalMet', false)}
                  />
                  <span>No</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Teacher Outcome Analysis */}
        {goal?.teacherOutcomes && goal.teacherOutcomes.length > 0 && (
          <div>
            <SectionHeader
              title="Teacher Outcome Analysis"
              isExpanded={sections.teacherAnalysis}
              onToggle={() => toggle('teacherAnalysis')}
            />
            
            {sections.teacherAnalysis && (
              <div className="space-y-4">
                {goal.teacherOutcomes.map((outcome, outcomeIndex) => (
                  <OutcomeAnalysisSection
                    key={outcomeIndex}
                    outcome={outcome}
                    analysis={data.teacherOutcomeAnalysis[outcomeIndex]}
                    type="teacher"
                    outcomeIndex={outcomeIndex}
                    onAnalysisUpdate={(updates) => {
                      const updated = [...data.teacherOutcomeAnalysis];
                      updated[outcomeIndex] = { ...updated[outcomeIndex], ...updates };
                      updateField('teacherOutcomeAnalysis', updated);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Student Outcome Analysis */}
        {goal?.studentOutcomes && goal.studentOutcomes.length > 0 && (
          <div>
            <SectionHeader
              title="Student Outcome Analysis"
              isExpanded={sections.studentAnalysis}
              onToggle={() => toggle('studentAnalysis')}
            />
            
            {sections.studentAnalysis && (
              <div className="space-y-4">
                {goal.studentOutcomes.map((outcome, outcomeIndex) => (
                  <OutcomeAnalysisSection
                    key={outcomeIndex}
                    outcome={outcome}
                    analysis={data.studentOutcomeAnalysis[outcomeIndex]}
                    type="student"
                    outcomeIndex={outcomeIndex}
                    onAnalysisUpdate={(updates) => {
                      const updated = [...data.studentOutcomeAnalysis];
                      updated[outcomeIndex] = { ...updated[outcomeIndex], ...updates };
                      updateField('studentOutcomeAnalysis', updated);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Impact on Learning */}
        <div>
          <SectionHeader
            title="Impact on Learning"
            isExpanded={sections.impact}
            onToggle={() => toggle('impact')}
          />
          
          {sections.impact && (
            <Textarea
              label="Analysis of impact on student learning and how to build on this"
              value={data.impactOnLearning}
              onChange={(e) => updateField('impactOnLearning', e.target.value)}
              placeholder="Describe the overall impact this coaching cycle had on student learning..."
              rows={4}
              required
            />
          )}
        </div>

        {/* Overall Evidence */}
        <div>
          <SectionHeader
            title="Overall Supporting Evidence"
            isExpanded={sections.evidence}
            onToggle={() => toggle('evidence')}
          />
          
          {sections.evidence && (
            <EvidenceManager
              label="Cycle Evidence"
              evidence={data.overallEvidence}
              onChange={(evidence) => updateField('overallEvidence', evidence)}
              variant="info"
              placeholder="Evidence that supports the entire coaching cycle..."
              helpText="Add evidence that demonstrates the overall impact and effectiveness of this coaching cycle"
              maxItems={8}
            />
          )}
        </div>

        {/* Lessons Learned & Recommendations */}
        <div>
          <SectionHeader
            title="Lessons & Recommendations"
            isExpanded={sections.lessons}
            onToggle={() => toggle('lessons')}
          />
          
          {sections.lessons && (
            <div className="space-y-4">
              <Textarea
                label="Key Lessons Learned"
                value={data.lessonsLearned || ''}
                onChange={(e) => updateField('lessonsLearned', e.target.value || undefined)}
                placeholder="What were the key takeaways from this coaching cycle?"
                rows={3}
              />

              <Textarea
                label="Recommendations for Next Cycle"
                value={data.recommendationsForNext || ''}
                onChange={(e) => updateField('recommendationsForNext', e.target.value || undefined)}
                placeholder="What would you recommend focusing on in the next coaching cycle?"
                rows={3}
              />
            </div>
          )}
        </div>
      </div>
    </ActionPlanStage>
  );
}

interface OutcomeAnalysisSectionProps {
  outcome: { description: string; metrics: { description: string }[] };
  analysis: {
    outcomeId: string;
    achieved: boolean;
    evidence: Evidence[];
    finalMetricValues: {
      metricId: string;
      finalValue: string;
      goalMet: boolean;
    }[];
  };
  type: 'teacher' | 'student';
  outcomeIndex: number;
  onAnalysisUpdate: (updates: Partial<OutcomeAnalysisSectionProps['analysis']>) => void;
}

function OutcomeAnalysisSection({
  outcome,
  analysis,
  type,
  outcomeIndex,
  onAnalysisUpdate
}: OutcomeAnalysisSectionProps) {
  const colorScheme = type === 'teacher' ? {
    border: semanticColors.border.primary,
    bg: semanticColors.bg.primary,
    text: semanticColors.text.primary,
    variant: 'primary' as const
  } : {
    border: semanticColors.border.secondary,
    bg: semanticColors.bg.secondary,
    text: semanticColors.text.secondary,
    variant: 'secondary' as const
  };

  if (!analysis) return null;

  return (
    <div className={cn(
      'border-2 rounded-lg p-4',
      colorScheme.border,
      colorScheme.bg
    )}>
      <h4 className={cn('font-medium mb-3', colorScheme.text)}>
        {type === 'teacher' ? 'Teacher' : 'Student'} Outcome {outcomeIndex + 1}
      </h4>
      
      <p className="text-sm text-gray-700 mb-4 p-3 bg-gray-50 rounded">
        <strong>Original Outcome:</strong> {outcome.description}
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Was this outcome achieved?</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={analysis.achieved === true}
                onChange={() => onAnalysisUpdate({ achieved: true })}
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={analysis.achieved === false}
                onChange={() => onAnalysisUpdate({ achieved: false })}
              />
              <span>No</span>
            </label>
          </div>
        </div>

        {/* Evidence Section using EvidenceManager */}
        <EvidenceManager
          label={`${type === 'teacher' ? 'Teacher' : 'Student'} Outcome Evidence`}
          evidence={analysis.evidence}
          onChange={(evidence) => onAnalysisUpdate({ evidence })}
          variant={colorScheme.variant}
          placeholder={`Add evidence that supports this ${type} outcome...`}
          helpText={`Evidence that demonstrates whether this ${type} outcome was achieved`}
          maxItems={5}
        />

        {/* Metric Values */}
        {outcome.metrics && outcome.metrics.length > 0 && (
          <div>
            <h5 className="font-medium mb-3">Final Metric Values</h5>
            <div className="space-y-3">
              {outcome.metrics.map((metric: { description: string }, metricIndex: number) => {
                const metricAnalysis = analysis.finalMetricValues?.[metricIndex];
                return (
                  <div key={metricIndex} className="border rounded p-3 bg-white">
                    <p className="text-sm font-medium mb-2">{metric.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        label="Final Value"
                        value={metricAnalysis?.finalValue || ''}
                        onChange={(e) => {
                          const updated = [...(analysis.finalMetricValues || [])];
                          updated[metricIndex] = {
                            metricId: `metric-${outcomeIndex}-${metricIndex}`,
                            finalValue: e.target.value,
                            goalMet: updated[metricIndex]?.goalMet || false
                          };
                          onAnalysisUpdate({ finalMetricValues: updated });
                        }}
                        placeholder="Final measured value"
                        textSize="sm"
                      />
                      <div>
                        <label className="block text-sm font-medium mb-2">Goal Met?</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={metricAnalysis?.goalMet === true}
                              onChange={() => {
                                const updated = [...(analysis.finalMetricValues || [])];
                                updated[metricIndex] = {
                                  metricId: `metric-${outcomeIndex}-${metricIndex}`,
                                  finalValue: updated[metricIndex]?.finalValue || '',
                                  goalMet: true
                                };
                                onAnalysisUpdate({ finalMetricValues: updated });
                              }}
                            />
                            <span>Yes</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={metricAnalysis?.goalMet === false}
                              onChange={() => {
                                const updated = [...(analysis.finalMetricValues || [])];
                                updated[metricIndex] = {
                                  metricId: `metric-${outcomeIndex}-${metricIndex}`,
                                  finalValue: updated[metricIndex]?.finalValue || '',
                                  goalMet: false
                                };
                                onAnalysisUpdate({ finalMetricValues: updated });
                              }}
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 