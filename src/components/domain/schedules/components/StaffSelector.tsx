import React, { useState } from 'react';
import { cn } from '@ui/utils/formatters';;
import { textColors, radii } from '@/lib/ui/tokens';
import { StaffSelectorProps } from '../data/scheduleTypes';

/**
 * Component for selecting multiple staff members from a dropdown
 */
export const StaffSelector: React.FC<StaffSelectorProps> = ({
  options,
  value,
  onChange,
  placeholder
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  // Handle multiple selection toggle
  const handleSelect = (staffId: string): void => {
    if (value.includes(staffId)) {
      onChange(value.filter(id => id !== staffId));
    } else {
      onChange([...value, staffId]);
    }
  };
  
  // Get display text for selected staff
  const getDisplayText = (): string => {
    if (value.length === 0) return placeholder;
    
    const selectedStaff = value.map(id => 
      options.find(staff => staff._id === id)?.staffName
    ).filter(Boolean);
    
    return selectedStaff.join(", ");
  };
  
  return (
    <div className="relative">
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full p-2 text-left border flex justify-between items-center",
          radii.md
        )}
      >
        <span className="truncate">{getDisplayText()}</span>
        <span className="ml-2">▼</span>
      </button>
      
      {isOpen && (
        <div className={cn(
          "absolute z-10 w-full mt-1 bg-white border shadow-lg max-h-60 overflow-auto",
          radii.md
        )}>
          {options.length > 0 ? (
            options.map(option => (
              <div 
                key={option._id} 
                className={cn(
                  "p-2 cursor-pointer hover:bg-gray-100",
                  value.includes(option._id) && "bg-blue-100"
                )}
                onClick={() => handleSelect(option._id)}
              >
                <input 
                  type="checkbox" 
                  checked={value.includes(option._id)} 
                  onChange={() => {}} 
                  className="mr-2"
                />
                {option.staffName}
              </div>
            ))
          ) : (
            <div className={cn("p-2", textColors.muted)}>No options available</div>
          )}
        </div>
      )}
    </div>
  );
}; 