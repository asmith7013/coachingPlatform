import React from 'react';
import { ClickableCards, ClickableCardColor } from '@/components/composed/cards/ClickableCards';

interface IPGSubsection {
  section: string;
  description: string;
  studentBehavior?: string;
}

interface IPGSubsectionCardsProps {
  subsections: IPGSubsection[];
  selectedSubsection: string | null;
  onSelect: (value: string) => void;
  parentColor?: string;
}

export const IPGSubsectionCards: React.FC<IPGSubsectionCardsProps> = ({
  subsections,
  selectedSubsection,
  onSelect,
  parentColor,
}) => {
  const getColor = (_value: string): ClickableCardColor => {
    // Map the parentColor to a valid ClickableCardColor
    const colorMap: Record<string, ClickableCardColor> = {
      primary: 'primary',
      secondary: 'secondary',
      success: 'success',
      danger: 'danger',
      muted: 'muted',
    };

    return colorMap[parentColor || 'primary'] || 'muted';
  };

  return (
    <ClickableCards
      selectedValue={selectedSubsection}
      onSelect={onSelect}
      layout="vertical"
      getColor={getColor}
    >
      {subsections.map((subsection) => (
        <ClickableCards.Card
          key={subsection.section}
          value={subsection.section}
          title={subsection.section}
          description={subsection.description}
        />
      ))}
    </ClickableCards>
  );
}; 