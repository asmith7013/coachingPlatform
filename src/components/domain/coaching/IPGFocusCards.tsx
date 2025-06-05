import React from 'react';
import { ClickableCards, type ClickableCardColor } from '@/components/composed/cards/ClickableCards';

export interface IPGFocusCardsProps {
  selectedValue?: string;
  onSelect: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
    colorCode: 'primary' | 'secondary' | 'success';
  }>;
  className?: string;
}

export const IPGFocusCards: React.FC<IPGFocusCardsProps> = ({
  selectedValue,
  onSelect,
  options,
  className
}) => {
  // Color mapping function for core actions
  const getColor = (value: string): ClickableCardColor => {
    const option = options.find(opt => opt.value === value);
    return option?.colorCode || 'muted';
  };

  return (
    <ClickableCards
      selectedValue={selectedValue || null}
      onSelect={onSelect}
      layout="horizontal"
      getColor={getColor}
      className={className}
    >
      {options.map((option) => (
        <ClickableCards.Card
          key={option.value}
          value={option.value}
          title={option.label}
        />
      ))}
    </ClickableCards>
  );
}; 