"use client";

import React, { useState } from 'react';
import { Button } from '@/components/core/Button';
import { Input } from '@/components/core/fields/Input';
import { Textarea } from '@/components/core/fields/Textarea';
import { Select } from '@/components/core/fields/Select';
import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { 
  PlusIcon, 
  TrashIcon, 
  ChevronDownIcon, 
  ChevronRightIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import type { WeeklyVisitPlan, CoachingCycleNumber, VisitNumber } from '@zod-schema/cap';
import { CoachingCycleNumberZod, VisitNumberZod } from '@zod-schema/cap';
import { getTodayString, formatMediumDate } from '@data-processing/transformers/utils/date-utils';

interface WeeklyPlanManagerProps {
  weeklyPlans: WeeklyVisitPlan[];
  onChange: (plans: WeeklyVisitPlan[]) => void;
  className?: string;
}

export function WeeklyPlanManager({
  weeklyPlans,
  onChange,
  className = ''
}: WeeklyPlanManagerProps) {
  const [expandedPlans, setExpandedPlans] = useState<number[]>([]);

  const togglePlan = (index: number) => {
    setExpandedPlans(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const addWeeklyPlan = () => {
    // Determine next cycle and visit numbers based on existing plans
    const nextCycleNumber: CoachingCycleNumber = weeklyPlans.length < 3 ? "1" : 
                                               weeklyPlans.length < 6 ? "2" : "3";
    const nextVisitNumber: VisitNumber = weeklyPlans.length % 3 === 0 ? "1" :
                                        weeklyPlans.length % 3 === 1 ? "2" : "3";

    const newPlan: WeeklyVisitPlan = {
      date: getTodayString(),
      cycleNumber: nextCycleNumber,
      visitNumber: nextVisitNumber,
      focus: '',
      lookFor: '',
      coachAction: '',
      teacherAction: '',
      progressMonitoring: '',
      visitId: '',
      status: 'planned'
    };
    
    onChange([...weeklyPlans, newPlan]);
    // Auto-expand the new plan
    setExpandedPlans(prev => [...prev, weeklyPlans.length]);
  };

  const updatePlan = (index: number, field: keyof WeeklyVisitPlan, value: string | Date | CoachingCycleNumber | VisitNumber) => {
    const updated = [...weeklyPlans];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removePlan = (index: number) => {
    onChange(weeklyPlans.filter((_, i) => i !== index));
    setExpandedPlans(prev => prev.filter(i => i !== index).map(i => i > index ? i - 1 : i));
  };

  const getPlanTitle = (plan: WeeklyVisitPlan, _index: number) => {
    if (plan.focus.trim()) {
      const preview = plan.focus.slice(0, 50);
      return preview.length < plan.focus.length ? `${preview}...` : preview;
    }
    return `Cycle ${plan.cycleNumber}, Visit ${plan.visitNumber}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <Heading level="h4" color="default" className="font-medium">
          Weekly Visit Plans ({weeklyPlans.length})
        </Heading>
        <Button
          intent="primary"
          appearance="outline"
          textSize="sm"
          padding="sm"
          onClick={addWeeklyPlan}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Add Visit Plan
        </Button>
      </div>

      {/* Plans List */}
      {weeklyPlans.length === 0 ? (
        <Card padding="md" className="text-center">
          <Text textSize="sm" color="muted" className="italic">
            No weekly visit plans defined yet. Add a plan to get started.
          </Text>
        </Card>
      ) : (
        <div className="space-y-3">
          {weeklyPlans.map((plan, planIndex) => {
            const isExpanded = expandedPlans.includes(planIndex);
            
            return (
              <Card key={planIndex} padding="md" className="border">
                {/* Plan Header */}
                <div className="flex justify-between items-start mb-3">
                  <button
                    type="button"
                    onClick={() => togglePlan(planIndex)}
                    className="flex items-center gap-2 text-left flex-1 hover:text-blue-600"
                  >
                    {isExpanded ? (
                      <ChevronDownIcon className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4 flex-shrink-0" />
                    )}
                    <CalendarIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <div className="flex-1">
                      <Text textSize="sm" color="default" className="font-medium">
                        {getPlanTitle(plan, planIndex)}
                      </Text>
                      <Text textSize="xs" color="muted">
                        {plan.date ? formatMediumDate(plan.date) : 'No date set'}
                      </Text>
                    </div>
                  </button>
                  
                  <Button
                    intent="danger"
                    appearance="outline"
                    textSize="sm"
                    padding="sm"
                    onClick={() => removePlan(planIndex)}
                    className="flex-shrink-0"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>

                {/* Expanded Plan Details */}
                {isExpanded && (
                  <div className="space-y-4">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Planned Date"
                        type="date"
                        value={plan.date || ''}
                        onChange={(e) => updatePlan(planIndex, 'date', e.target.value)}
                        required
                      />

                      <Select
                        label="Cycle Number"
                        value={plan.cycleNumber}
                        onChange={(value) => updatePlan(planIndex, 'cycleNumber', value as CoachingCycleNumber)}
                        options={CoachingCycleNumberZod.options.map(value => ({
                          value,
                          label: `Cycle ${value}`
                        }))}
                      />

                      <Select
                        label="Visit Number"
                        value={plan.visitNumber}
                        onChange={(value) => updatePlan(planIndex, 'visitNumber', value as VisitNumber)}
                        options={VisitNumberZod.options.map(value => ({
                          value,
                          label: `Visit ${value}`
                        }))}
                      />
                    </div>

                    {/* Visit Focus */}
                    <Textarea
                      label="Visit Focus"
                      value={plan.focus}
                      onChange={(e) => updatePlan(planIndex, 'focus', e.target.value)}
                      placeholder="What is the primary focus for this coaching visit?"
                      rows={2}
                      required
                    />

                    {/* Look For */}
                    <Textarea
                      label="What to Look For"
                      value={plan.lookFor}
                      onChange={(e) => updatePlan(planIndex, 'lookFor', e.target.value)}
                      placeholder="Specific things to observe and look for during the visit..."
                      rows={3}
                      required
                    />

                    {/* Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Textarea
                        label="Coach Actions"
                        value={plan.coachAction}
                        onChange={(e) => updatePlan(planIndex, 'coachAction', e.target.value)}
                        placeholder="What actions will the coach take during this visit?"
                        rows={3}
                        required
                      />

                      <Textarea
                        label="Teacher Actions"
                        value={plan.teacherAction}
                        onChange={(e) => updatePlan(planIndex, 'teacherAction', e.target.value)}
                        placeholder="What actions are expected from the teacher?"
                        rows={3}
                        required
                      />
                    </div>

                    {/* Progress Monitoring */}
                    <Textarea
                      label="Progress Monitoring"
                      value={plan.progressMonitoring}
                      onChange={(e) => updatePlan(planIndex, 'progressMonitoring', e.target.value)}
                      placeholder="How will progress be monitored and measured during this visit?"
                      rows={2}
                      required
                    />

                    {/* Optional Visit ID */}
                    <Input
                      label="Related Visit Record (Optional)"
                      value={plan.visitId || ''}
                      onChange={(e) => updatePlan(planIndex, 'visitId', e.target.value || '')}
                      placeholder="Link to actual visit record when visit is completed"
                    />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {weeklyPlans.length > 0 && (
        <Card padding="sm" className="bg-blue-50 border-blue-200">
          <Text textSize="sm" color="default" className="font-medium">
            Plan Summary: {weeklyPlans.length} visits planned across {Math.max(1, Math.ceil(weeklyPlans.length / 3))} cycles
          </Text>
        </Card>
      )}
    </div>
  );
} 