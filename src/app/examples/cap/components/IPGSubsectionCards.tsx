import React from 'react';
import { ClickableCards } from '@/components/composed/cards/ClickableCards';
import { backgroundColors, borderColors, semanticColors } from '@/lib/tokens/colors';

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
  const getColorScheme = (value: string) => {
    const colorMap: Record<string, { bg: string; border: string; hoverBg: string }> = {
      primary: {
        bg: backgroundColors.primary,
        border: borderColors.primary,
        hoverBg: semanticColors.hoverBg.primary,
      },
      secondary: {
        bg: backgroundColors.secondary,
        border: borderColors.secondary,
        hoverBg: semanticColors.hoverBg.secondary,
      },
      success: {
        bg: backgroundColors.success,
        border: borderColors.success,
        hoverBg: semanticColors.hoverBg.success,
      },
    };

    return colorMap[parentColor || 'primary'] || {
      bg: backgroundColors.surface,
      border: borderColors.muted,
      hoverBg: semanticColors.hoverBg.default,
    };
  };

  return (
    <ClickableCards
      selectedValue={selectedSubsection}
      onSelect={onSelect}
      layout="vertical"
      getColorScheme={getColorScheme}
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