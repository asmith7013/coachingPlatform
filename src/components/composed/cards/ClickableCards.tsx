import React from "react";
import { cn } from "@/lib/ui/utils/formatters";
import { tv, type VariantProps } from "tailwind-variants";
import { radii, shadows, borderWidths } from "@/lib/tokens/tokens";
import {
  backgroundColors,
  borderColors,
  textColors,
  semanticColors,
} from "@/lib/tokens/colors";

const clickableCard = tv({
  slots: {
    container: "flex",
    card: `${radii.lg} p-4 ${shadows.md} transition-all ${borderWidths.md} cursor-pointer`,
    content: "space-y-1",
    title: "font-medium text-lg",
    description: "text-sm mt-1",
  },
  variants: {
    layout: {
      horizontal: { container: "flex-row gap-4", card: "flex-1" },
      vertical: { container: "flex-col gap-4", card: "w-full" },
      wrap: { container: "flex-wrap gap-4", card: "flex-1" },
    },
    color: {
      primary: "",
      secondary: "",
      success: "",
      danger: "",
      muted: "",
    },
    selected: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    // Unselected states using token colors
    {
      color: "primary",
      selected: false,
      class: {
        card: `${backgroundColors.white} ${borderColors.primary} ${semanticColors.hoverBg.primary}`,
        title: textColors.primary,
        description: textColors.muted,
      },
    },
    {
      color: "secondary",
      selected: false,
      class: {
        card: `${backgroundColors.white} ${borderColors.secondary} ${semanticColors.hoverBg.secondary}`,
        title: textColors.secondary,
        description: textColors.muted,
      },
    },
    {
      color: "success",
      selected: false,
      class: {
        card: `${backgroundColors.white} ${borderColors.success} ${semanticColors.hoverBg.success}`,
        title: textColors.success,
        description: textColors.muted,
      },
    },
    {
      color: "danger",
      selected: false,
      class: {
        card: `${backgroundColors.white} ${borderColors.danger} ${semanticColors.hoverBg.danger}`,
        title: textColors.danger,
        description: textColors.muted,
      },
    },
    {
      color: "muted",
      selected: false,
      class: {
        card: `${backgroundColors.white} ${borderColors.muted} ${semanticColors.hoverBg.default}`,
        title: textColors.default,
        description: textColors.muted,
      },
    },
    // Selected states using token colors
    {
      color: "primary",
      selected: true,
      class: {
        card: `${backgroundColors.primary} border-transparent ${semanticColors.hoverBg.primary} ring-2 ring-offset-2 ring-primary-300`,
        title: textColors.white,
        description: textColors.white,
      },
    },
    {
      color: "secondary",
      selected: true,
      class: {
        card: `${backgroundColors.secondary} border-transparent ${semanticColors.hoverBg.secondary} ring-2 ring-offset-2 ring-secondary-300`,
        title: textColors.white,
        description: textColors.white,
      },
    },
    {
      color: "success",
      selected: true,
      class: {
        card: `${backgroundColors.success} border-transparent ${semanticColors.hoverBg.success} ring-2 ring-offset-2 ring-success-300`,
        title: textColors.white,
        description: textColors.white,
      },
    },
    {
      color: "danger",
      selected: true,
      class: {
        card: `${backgroundColors.danger} border-transparent ${semanticColors.hoverBg.danger} ring-2 ring-offset-2 ring-danger-300`,
        title: textColors.white,
        description: textColors.white,
      },
    },
    {
      color: "muted",
      selected: true,
      class: {
        card: `${backgroundColors.muted} border-transparent ${semanticColors.hoverBg.default} ring-2 ring-offset-2 ring-muted-300`,
        title: textColors.white,
        description: textColors.white,
      },
    },
  ],
  defaultVariants: {
    layout: "horizontal",
    color: "muted",
    selected: false,
  },
});

export type ClickableCardVariants = VariantProps<typeof clickableCard>;
export type ClickableCardColor = ClickableCardVariants["color"];

interface ClickableCardsProps {
  selectedValue: string | null;
  onSelect: (value: string) => void;
  layout?: ClickableCardVariants["layout"];
  className?: string;
  children: React.ReactNode;
  getColor?: (value: string) => ClickableCardColor;
}

interface CardProps {
  value: string;
  title: string;
  description?: string;
  color?: ClickableCardColor;
  className?: string;
}

const ClickableCardsContext = React.createContext<{
  selectedValue: string | null;
  onSelect: (value: string) => void;
  getColor?: (value: string) => ClickableCardColor;
} | null>(null);

export const ClickableCards = ({
  selectedValue,
  onSelect,
  layout = "horizontal",
  className,
  children,
  getColor,
}: ClickableCardsProps) => {
  const styles = clickableCard({ layout });

  return (
    <ClickableCardsContext.Provider
      value={{ selectedValue, onSelect, getColor }}
    >
      <div className={cn(styles.container(), className)}>{children}</div>
    </ClickableCardsContext.Provider>
  );
};

const Card = ({ value, title, description, color, className }: CardProps) => {
  const context = React.useContext(ClickableCardsContext);
  if (!context) {
    throw new Error("Card must be used within ClickableCards");
  }

  const { selectedValue, onSelect, getColor } = context;
  const isSelected = selectedValue === value;
  const cardColor = color || (getColor ? getColor(value) : "muted");

  const styles = clickableCard({ color: cardColor, selected: isSelected });

  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(styles.card(), className)}
    >
      <div className={styles.content()}>
        <div className={styles.title()}>{title}</div>
        {description && (
          <div className={styles.description()}>{description}</div>
        )}
      </div>
    </button>
  );
};

ClickableCards.Card = Card;
