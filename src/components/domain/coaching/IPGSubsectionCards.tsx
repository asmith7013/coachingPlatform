import React from "react";
import {
  ClickableCards,
  type ClickableCardColor,
} from "@/components/composed/cards/ClickableCards";

export interface IPGSubsectionCardsProps {
  selectedValue?: string;
  onSelect: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
    description: string;
  }>;
  parentColor: "primary" | "secondary" | "success";
  className?: string;
}

export const IPGSubsectionCards: React.FC<IPGSubsectionCardsProps> = ({
  selectedValue,
  onSelect,
  options,
  parentColor,
  className,
}) => {
  // Color inheritance function that maps parentColor to ClickableCardColor
  const getColor = (): ClickableCardColor => {
    switch (parentColor) {
      case "primary":
        return "primary";
      case "secondary":
        return "secondary";
      case "success":
        return "success";
      default:
        return "muted";
    }
  };

  return (
    <ClickableCards
      selectedValue={selectedValue || null}
      onSelect={onSelect}
      layout="vertical"
      getColor={getColor}
      className={className}
    >
      {options.map((option) => (
        <ClickableCards.Card
          key={option.value}
          value={option.value}
          title={option.label}
          description={option.description}
        />
      ))}
    </ClickableCards>
  );
};
