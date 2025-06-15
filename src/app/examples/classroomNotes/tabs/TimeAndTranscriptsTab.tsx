"use client";

import React from 'react';
import { tv } from 'tailwind-variants';
import { Input } from '@components/core/fields/Input';
import { Textarea } from '@components/core/fields/Textarea';
import { ClassroomObservationInput } from '@zod-schema/visits/classroom-observation';

const sectionTitle = tv({
  base: "text-lg font-semibold border-b pb-2 mb-3"
});

const fieldLabel = tv({
  base: "text-sm font-medium text-gray-700 mb-1"
});

interface TimeAndTranscriptsTabProps {
  formData: ClassroomObservationInput;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export function TimeAndTranscriptsTab({ 
  formData, 
  onInputChange
}: TimeAndTranscriptsTabProps) {
  return (
    <div className="space-y-6">
      {/* Time Tracking */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className={fieldLabel()}>Stopwatch</label>
          <Input 
            value={formData.timeTracking.stopwatchTime} 
            readOnly 
          />
        </div>
        <div>
          <label className={fieldLabel()}>Started When (min into class)</label>
          <Input 
            type="number"
            name="timeTracking.startedWhenMinutes"
            value={formData.timeTracking.startedWhenMinutes || ''}
            onChange={onInputChange}
            placeholder="Minutes"
          />
        </div>
        <div>
          <label className={fieldLabel()}>Class Start</label>
          <Input 
            type="time"
            name="timeTracking.classStartTime"
            value={formData.timeTracking.classStartTime}
            onChange={onInputChange}
          />
        </div>
        <div>
          <label className={fieldLabel()}>Class End</label>
          <Input 
            type="time"
            name="timeTracking.classEndTime"
            value={formData.timeTracking.classEndTime}
            onChange={onInputChange}
          />
        </div>
      </div>
      {/* Transcripts Section */}
      <div>
        <h3 className={sectionTitle()}>Transcripts</h3>
        <div className="space-y-4">
          <div>
            <label className={fieldLabel()}>Warm Up Launch Transcript</label>
            <Textarea
              name="transcripts.warmUpLaunch"
              value={formData.transcripts.warmUpLaunch}
              onChange={onInputChange}
              placeholder="What was said during warm up launch..."
              rows={3}
            />
          </div>
          <div>
            <label className={fieldLabel()}>Activity 1 Launch Transcript</label>
            <Textarea
              name="transcripts.activity1Launch"
              value={formData.transcripts.activity1Launch}
              onChange={onInputChange}
              placeholder="What was said during activity 1 launch..."
              rows={3}
            />
          </div>
          <div>
            <label className={fieldLabel()}>Activity 2 Launch Transcript</label>
            <Textarea
              name="transcripts.activity2Launch"
              value={formData.transcripts.activity2Launch}
              onChange={onInputChange}
              placeholder="What was said during activity 2 launch..."
              rows={3}
            />
          </div>
          <div>
            <label className={fieldLabel()}>Synthesis Launch Transcript</label>
            <Textarea
              name="transcripts.synthesisLaunch"
              value={formData.transcripts.synthesisLaunch}
              onChange={onInputChange}
              placeholder="What was said during synthesis launch..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 