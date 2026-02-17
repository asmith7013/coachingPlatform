// src/components/domain/rubrics/RubricDomainCards.tsx
import React from "react";
import { domainOptions } from "./RubricFilterPanel";
import {
  ClickableCards,
  type ClickableCardColor,
} from "@/components/composed/cards/ClickableCards";

export default function RubricDomainCards({
  selectedDomain,
  onSelect,
}: {
  selectedDomain: string;
  onSelect: (domain: string) => void;
}) {
  const getDomainColor = (domainValue: string): ClickableCardColor => {
    const colorMap = {
      C1: "primary", // Changed from 'blue' to 'primary'
      C2: "secondary", // Changed from 'purple' to 'secondary'
      C3: "success", // Changed from 'emerald' to 'success'
    } as const;

    return colorMap[domainValue as keyof typeof colorMap] || "muted";
  };

  return (
    <div className="mb-6">
      <ClickableCards
        selectedValue={selectedDomain}
        onSelect={onSelect}
        layout="wrap"
        getColor={getDomainColor}
      >
        {domainOptions.map((domain) => (
          <ClickableCards.Card
            key={domain.value}
            value={domain.value}
            title={domain.value}
            description={domain.label.split(":")[1].trim()}
          />
        ))}
      </ClickableCards>
    </div>
  );
}
