import React from 'react';
import { ClickableCards } from '@/components/composed/cards/ClickableCards';
import { backgroundColors, borderColors, semanticColors } from '@/lib/tokens/colors';

interface IPGOption {
  value: string;
  label: string;
  hasSubsections?: boolean;
}

interface IPGFocusCardsProps {
  selectedValue: string | null;
  onSelect: (value: string) => void;
  options: IPGOption[];
}

export const IPGFocusCards: React.FC<IPGFocusCardsProps> = ({
  selectedValue,
  onSelect,
  options,
}) => {
  const getColorScheme = (value: string) => {
    const colorMap: Record<string, { bg: string; border: string; hoverBg: string }> = {
      '1': {
        bg: backgroundColors.primary,
        border: borderColors.primary,
        hoverBg: semanticColors.hoverBg.primary,
      },
      '2': {
        bg: backgroundColors.secondary,
        border: borderColors.secondary,
        hoverBg: semanticColors.hoverBg.secondary,
      },
      '3': {
        bg: backgroundColors.success,
        border: borderColors.success,
        hoverBg: semanticColors.hoverBg.success,
      },
    };

    return colorMap[value] || {
      bg: backgroundColors.surface,
      border: borderColors.muted,
      hoverBg: semanticColors.hoverBg.default,
    };
  };

  return (
    <ClickableCards
      selectedValue={selectedValue}
      onSelect={onSelect}
      layout="horizontal"
      getColorScheme={getColorScheme}
    >
      {options.map((option) => (
        <ClickableCards.Card
          key={option.value}
          value={option.value}
          title={option.label}
          description={option.hasSubsections ? 'Click to view subsections' : undefined}
        />
      ))}
    </ClickableCards>
  );
}; 