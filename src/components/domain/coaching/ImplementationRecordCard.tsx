import React from 'react';
import { Button } from '@/components/core/Button';
import { Input } from '@/components/core/fields/Input';
import { Textarea } from '@/components/core/fields/Textarea';
import { Select } from '@/components/core/fields/Select';
import { Trash2 } from 'lucide-react';
import { ArrayFieldManager } from '@/components/domain/coaching/field-managers/ArrayFieldManager';
import { VisitNumberZod, CoachingCycleNumberZod } from '@enums';
import { CapImplementationRecord, VisitNumber, CoachingCycleNumber, CapWeeklyPlan } from '@zod-schema/cap';

interface ImplementationRecordCardProps {
  record: CapImplementationRecord;
  index: number;
  goal?: CapWeeklyPlan; // For context
  onUpdate: (index: number, record: CapImplementationRecord) => void;
  onDelete: (index: number) => void;
}

export function ImplementationRecordCard({
  record,
  index,
  goal,
  onUpdate,
  onDelete
}: ImplementationRecordCardProps) {
  const updateField = <K extends keyof CapImplementationRecord>(
    field: K, 
    value: CapImplementationRecord[K]
  ) => {
    onUpdate(index, { ...record, [field]: value });
  };

  return (
    <div className="border rounded-lg p-4 space-y-4 mb-4 bg-white">
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-lg">
          Cycle {record.cycleNumber}, Visit {record.visitNumber}
        </h4>
        <Button
          intent="danger"
          appearance="alt"
          textSize="sm"
          padding="sm"
          onClick={() => onDelete(index)}
        >
          <Trash2 size={16} />
        </Button>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Date"
          type="date"
          value={record.date || ''}
          onChange={(e) => updateField('date', e.target.value)}
          required
        />

        <Select
          label="Cycle Number"
          value={record.cycleNumber}
          onChange={(value) => updateField('cycleNumber', value as CoachingCycleNumber)}
          options={CoachingCycleNumberZod.options.map(value => ({
            value,
            label: `Cycle ${value}`
          }))}
        />

        <Select
          label="Visit Number"
          value={record.visitNumber}
          onChange={(value) => updateField('visitNumber', value as VisitNumber)}
          options={VisitNumberZod.options.map(value => ({
            value,
            label: `Visit ${value}`
          }))}
        />
      </div>

      {/* Visit ID */}
      <Input
        label="Visit ID (Optional)"
        value={record.visitId || ''}
        onChange={(e) => updateField('visitId', e.target.value || '')}
        placeholder="Reference to actual visit entity"
      />

      {/* Look For Implemented */}
      <Textarea
        label="What Was Actually Observed/Looked For"
        value={record.lookForImplemented}
        onChange={(e) => updateField('lookForImplemented', e.target.value)}
        placeholder="Describe what was actually observed and looked for during this visit..."
        rows={3}
        required
      />

      {/* Array Fields using ArrayFieldManager */}
      <ArrayFieldManager
        label="Glows (Areas of Strength)"
        items={record.glows}
        onChange={(glows) => updateField('glows', glows)}
        variant="success"
        fieldType="input"
        placeholder="What went well during this visit..."
        addButtonLabel="Add Glow"
        emptyMessage="No strengths recorded yet."
        minItems={0}
        maxItems={10}
      />

      <ArrayFieldManager
        label="Grows (Areas for Improvement)"
        items={record.grows}
        onChange={(grows) => updateField('grows', grows)}
        variant="warning"
        fieldType="input"
        placeholder="What could be improved..."
        addButtonLabel="Add Grow"
        emptyMessage="No improvement areas recorded yet."
        minItems={0}
        maxItems={10}
      />

      <ArrayFieldManager
        label="Success Metrics"
        items={record.successMetrics}
        onChange={(successMetrics) => updateField('successMetrics', successMetrics)}
        variant="info"
        fieldType="input"
        placeholder="Measurable indicators of success..."
        addButtonLabel="Add Metric"
        emptyMessage="No success metrics recorded yet."
        minItems={0}
        maxItems={8}
      />

      <ArrayFieldManager
        label="Next Steps"
        items={record.nextSteps}
        onChange={(nextSteps) => updateField('nextSteps', nextSteps)}
        variant="default"
        fieldType="input"
        placeholder="Action items for next visit..."
        addButtonLabel="Add Step"
        emptyMessage="No next steps defined yet."
        minItems={0}
        maxItems={8}
      />

      {/* Reflections Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Textarea
          label="Teacher Reflection"
          value={record.teacherReflection || ''}
          onChange={(e) => updateField('teacherReflection', e.target.value || '')}
          placeholder="Teacher's reflection on the session..."
          rows={4}
        />

        <Textarea
          label="Coach Notes"
          value={record.coachNotes || ''}
          onChange={(e) => updateField('coachNotes', e.target.value || '')}
          placeholder="Additional coach observations..."
          rows={4}
        />
      </div>

      {/* Goal Context (if provided) */}
      {goal && (
        <div className="bg-gray-50 p-3 rounded border-l-4 border-blue-500">
          <h6 className="font-medium text-sm mb-1">Goal Context</h6>
          <p className="text-sm text-gray-700">{goal.focus}</p>
        </div>
      )}
    </div>
  );
} 