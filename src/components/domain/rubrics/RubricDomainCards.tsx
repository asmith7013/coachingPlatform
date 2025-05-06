import React from 'react';
import { domainOptions } from './RubricFilterPanel';

export default function RubricDomainCards({ selectedDomain, onSelect }: { selectedDomain: string, onSelect: (domain: string) => void }) {
  // Define domain color properties with consistent color naming
  const getDomainStyles = (domainValue: string) => {
    const colorMap = {
      'C1': 'blue',
      'C2': 'purple',
      'C3': 'emerald'
    } as const;
    
    const colorBase = colorMap[domainValue as keyof typeof colorMap] || 'gray';
    
    return {
      normal: {
        bg: `bg-white`,
        text: `text-${colorBase}-500`,
        border: `border-${colorBase}-500`,
        hoverBg: `hover:bg-${colorBase}-50`,
        ring: ``
      },
      selected: {
        bg: `bg-${colorBase}-500`,
        text: 'text-white',
        border: 'border-transparent',
        ring: `ring-2 ring-offset-2 ring-${colorBase}-300`,
        hoverBg: ``
      }
    };
  };

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-4">
        {domainOptions.map((domain) => {
          const styles = getDomainStyles(domain.value);
          const isSelected = selectedDomain === domain.value;
          const currentStyles = isSelected ? styles.selected : styles.normal;
          
          return (
            <button
              key={domain.value}
              onClick={() => onSelect(domain.value)}
              className={`
                rounded-lg p-4 shadow-md transition-all flex-1 text-left border-2 cursor-pointer
                ${currentStyles.bg} ${currentStyles.text} ${currentStyles.border} ${currentStyles.hoverBg || ''} 
                ${isSelected ? currentStyles.ring : ''}
              `}
            >
              <div className="font-medium text-lg">{domain.value}</div>
              <div className={`text-sm mt-1 ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                {domain.label.split(':')[1].trim()}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}