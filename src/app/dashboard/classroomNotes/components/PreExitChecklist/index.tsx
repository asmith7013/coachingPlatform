import React, { useState } from 'react';
import { tv } from 'tailwind-variants';
import { Checkbox } from '@/components/core/fields/Checkbox';

const sectionTitle = tv({
  base: "text-lg font-semibold border-b pb-2 mb-3"
});

const PreExitChecklist: React.FC = () => {
  const [checklist, setChecklist] = useState({
    cooldowns: false,
    summary: false,
    stopwatch: false
  });

  const handleCheckboxChange = (key: keyof typeof checklist) => {
    setChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="mt-6">
      <h3 className={sectionTitle()}>Before Leaving</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Checkbox 
            id="checklist-cooldowns" 
            checked={checklist.cooldowns}
            onChange={() => handleCheckboxChange('cooldowns')}
          />
          <label htmlFor="checklist-cooldowns" className="text-sm">Ask for Cool Downs</label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox 
            id="checklist-summary" 
            checked={checklist.summary}
            onChange={() => handleCheckboxChange('summary')}
          />
          <label htmlFor="checklist-summary" className="text-sm">Fill out Visit Summary</label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox 
            id="checklist-stopwatch" 
            checked={checklist.stopwatch}
            onChange={() => handleCheckboxChange('stopwatch')}
          />
          <label htmlFor="checklist-stopwatch" className="text-sm">Pause stopwatch</label>
        </div>
      </div>
    </div>
  );
};

export default PreExitChecklist; 