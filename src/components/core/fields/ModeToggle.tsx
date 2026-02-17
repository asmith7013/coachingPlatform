"use client";

import { tv, type VariantProps } from "tailwind-variants";
import {
  paddingX,
  paddingY,
  radii,
  textSize,
  weight,
  shadows,
  spaceBetween,
  iconSizes,
} from "@/lib/tokens/tokens";
import { textColors, backgroundColors } from "@/lib/tokens/colors";

const modeToggle = tv({
  slots: {
    container: [
      "flex items-center",
      spaceBetween.x.xs,
      backgroundColors.light.muted,
      radii.lg,
      paddingX.xs,
    ],
    button: [
      "flex items-center",
      spaceBetween.x.sm,
      paddingX.lg,
      paddingY.sm,
      textSize.sm,
      weight.medium,
      radii.md,
      "transition-colors",
    ],
  },
  variants: {
    active: {
      true: {
        button: [textColors.primary, backgroundColors.white, shadows.sm],
      },
      false: {
        button: [
          textColors.muted,
          `hover:${textColors.default}`,
          `hover:${backgroundColors.light.muted}`,
        ],
      },
    },
  },
});

export interface ModeOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface ModeToggleProps<T extends string = string>
  extends VariantProps<typeof modeToggle> {
  /** Available mode options */
  options: ModeOption<T>[];
  /** Currently selected mode */
  value: T;
  /** Handle mode change */
  onChange: (mode: T) => void;
  /** Optional class name */
  className?: string;
}

export function ModeToggle<T extends string = string>({
  options,
  value,
  onChange,
  className,
}: ModeToggleProps<T>) {
  const styles = modeToggle();

  return (
    <div className={`${styles.container()} ${className || ""}`}>
      {options.map((option) => {
        const isActive = value === option.value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={styles.button({ active: isActive })}
            aria-pressed={isActive}
          >
            {Icon && <Icon className={iconSizes.sm} />}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default ModeToggle;
