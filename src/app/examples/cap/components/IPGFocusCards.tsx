import React from 'react';
import { ClickableCards, ClickableCardColor } from '@components/composed/cards/ClickableCards';
import { IPGFocusCardsProps } from '@domain-types/coaching-action-plan';



export const IPGFocusCards: React.FC<IPGFocusCardsProps> = ({
  selectedValue,
  onSelect,
  options,
}) => {
  const getColor = (value: string): ClickableCardColor => {
    // Map the value to a valid ClickableCardColor
    const colorMap: Record<string, ClickableCardColor> = {
      '1': 'primary',
      '2': 'secondary', 
      '3': 'success',
    };

    return colorMap[value] || 'muted';
  };

  return (
    <ClickableCards
      selectedValue={selectedValue || null}
      onSelect={onSelect}
      layout="horizontal"
      getColor={getColor}
    >
      {options.map((option) => (
        <ClickableCards.Card
          key={option.value}
          value={option.value}
          title={option.label}
          // description={option.hasSubsections ? 'Click to view subsections' : undefined}
        />
      ))}
    </ClickableCards>
  );
}; 