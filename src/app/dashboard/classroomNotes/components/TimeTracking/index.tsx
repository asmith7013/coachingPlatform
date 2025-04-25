import React from 'react';
import { tv } from 'tailwind-variants';
import { Input } from '@/components/core/fields/Input';

interface TimeData {
  startTime: string;
  endTime: string;
  stopwatchTime: string;
  startedWhen: string;
}

interface TimeTrackingProps {
  timeData: TimeData;
  setTimeData: React.Dispatch<React.SetStateAction<TimeData>>;
}

const fieldLabel = tv({
  base: "text-sm font-medium text-gray-700 mb-1"
});

const TimeTracking: React.FC<TimeTrackingProps> = ({ timeData, setTimeData }) => {
  return (
    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <label className={fieldLabel()}>Stopwatch</label>
        <Input 
          value={timeData.stopwatchTime} 
          readOnly 
        />
      </div>
      <div>
        <label className={fieldLabel()}>Started When (min into class)</label>
        <Input 
          name="startedWhen"
          value={timeData.startedWhen}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            setTimeData({...timeData, startedWhen: e.target.value})}
        />
      </div>
      <div>
        <label className={fieldLabel()}>Class Start</label>
        <Input 
          type="time"
          name="startTime"
          value={timeData.startTime}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            setTimeData({...timeData, startTime: e.target.value})}
        />
      </div>
      <div>
        <label className={fieldLabel()}>Class End</label>
        <Input 
          type="time"
          name="endTime"
          value={timeData.endTime}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            setTimeData({...timeData, endTime: e.target.value})}
        />
      </div>
    </div>
  );
};

export default TimeTracking; 