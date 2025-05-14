import React from 'react';
import { Button } from '@/components/core/Button';
import { Input } from '@/components/core/fields/Input';
import { Textarea } from '@/components/core/fields/Textarea';
import { Select } from '@/components/core/fields/Select';
import { Trash2 } from 'lucide-react';
import type { ImplementationRecordType, MetricType, CoachingMoveType } from './types';

interface ImplementationRecordCardProps {
  record: ImplementationRecordType;
  index: number;
  metrics: MetricType[];
  coachingMoves: CoachingMoveType[];
  onUpdate: (index: number, record: ImplementationRecordType) => void;
  onDelete: (index: number) => void;
}

export function ImplementationRecordCard({
  record,
  index,
  metrics,
  coachingMoves,
  onUpdate,
  onDelete
}: ImplementationRecordCardProps) {
  const updateField = (field: keyof ImplementationRecordType, value: any) => {
    onUpdate(index, { ...record, [field]: value });
  };

  const updateMetric = (metricName: string, value: number) => {
    const updatedMetrics = { ...record.metrics, [metricName]: value };
    onUpdate(index, { ...record, metrics: updatedMetrics });
  };

  const updateProposedArc = (value: string[]) => {
    onUpdate(index, { ...record, proposedArc: value });
  };

  const updateMovesSelected = (value: string[]) => {
    onUpdate(index, { ...record, movesSelected: value });
  };

  return (
    <div className="border rounded-lg p-4 space-y-4 mb-4">
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-lg">Session {index + 1}</h4>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Date"
          type="date"
          value={record.date}
          onChange={(e) => updateField('date', e.target.value)}
        />

        <Select
          label="Proposed Arc"
          value={record.proposedArc}
          onChange={updateProposedArc}
          options={[
            { value: 'Pre-Brief', label: 'Pre-Brief' },
            { value: 'Observation', label: 'Observation' },
            { value: 'Debrief', label: 'Debrief' }
          ]}
          multiple
        />

        <Select
          label="Moves Selected"
          value={record.movesSelected}
          onChange={updateMovesSelected}
          options={coachingMoves.map(move => ({
            value: move.specificMove,
            label: `${move.category}: ${move.specificMove}`
          }))}
          multiple
        />

        <Input
          label="Evidence Link"
          value={record.evidenceLink}
          onChange={(e) => updateField('evidenceLink', e.target.value)}
          placeholder="Drive Link"
        />
      </div>

      <div className="space-y-4">
        <h5 className="font-medium">Metrics</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map(metric => (
            <Select
              key={metric.name}
              label={metric.name}
              value={record.metrics[metric.name]?.toString() || ''}
              onChange={(value) => updateMetric(metric.name, Number(value))}
              options={metric.ratings.map(rating => ({
                value: rating.score.toString(),
                label: `${rating.score}: ${rating.description}`
              }))}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Textarea
          label="Teacher Notes"
          value={record.teacherNotes}
          onChange={(e) => updateField('teacherNotes', e.target.value)}
          rows={3}
        />

        <Textarea
          label="Student Notes"
          value={record.studentNotes}
          onChange={(e) => updateField('studentNotes', e.target.value)}
          rows={3}
        />

        <div className="space-y-2">
          <Input
            label="Next Step"
            value={record.nextStep}
            onChange={(e) => updateField('nextStep', e.target.value)}
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={record.nextStepDone}
              onChange={(e) => updateField('nextStepDone', e.target.checked)}
            />
            <span>Next Step Done</span>
          </label>
        </div>

        <Textarea
          label="Between Session Support"
          value={record.betweenSessionSupport}
          onChange={(e) => updateField('betweenSessionSupport', e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
} 