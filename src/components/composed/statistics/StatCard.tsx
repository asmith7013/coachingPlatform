"use client";

import { tv, type VariantProps } from "tailwind-variants";
import { Text } from "@/components/core/typography";
import type { LucideIcon } from "lucide-react";
import {
  paddingX,
  paddingY,
  radii,
  weight,
  iconSizes,
  center,
} from "@/lib/tokens/tokens";
import { backgroundColors, textColors } from "@/lib/tokens/colors";

const statCard = tv({
  slots: {
    container: [
      "text-center", // Keep structural as-is
      paddingX.lg, // p-3 → paddingX.lg + paddingY.lg (base case)
      paddingY.lg,
      radii.lg, // rounded-lg → radii.lg
    ],
    iconWrapper: center.x, // mx-auto → center.x (semantic centering)
    icon: iconSizes.lg, // w-6 h-6 → iconSizes.lg (semantic icon sizing)
    value: weight.semibold, // font-semibold → weight.semibold
    label: "",
  },
  variants: {
    color: {
      // Map to semantic color variants
      primary: {
        container: backgroundColors.light.primary, // bg-blue-50 → backgroundColors.light.primary
        icon: textColors.primary, // text-blue-600 → textColors.primary
        value: textColors.primary, // text-blue-900 → textColors.primary
      },
      success: {
        container: backgroundColors.light.success, // bg-green-50 → backgroundColors.light.success
        icon: textColors.success, // text-green-600 → textColors.success
        value: textColors.success, // text-green-900 → textColors.success
      },
      danger: {
        container: backgroundColors.light.danger, // bg-red-50 → backgroundColors.light.danger
        icon: textColors.danger, // text-red-600 → textColors.danger
        value: textColors.danger, // text-red-900 → textColors.danger
      },
      muted: {
        container: backgroundColors.light.muted, // bg-gray-50 → backgroundColors.light.muted
        icon: textColors.muted, // text-gray-600 → textColors.muted
        value: textColors.default, // text-gray-900 → textColors.default
      },
      // Keep some color variety with raw Tailwind for flexibility
      purple: {
        container: "bg-purple-50",
        icon: "text-purple-600",
        value: "text-purple-900",
      },
      orange: {
        container: "bg-orange-50",
        icon: "text-orange-600",
        value: "text-orange-900",
      },
    },
    size: {
      sm: {
        container: [paddingX.sm, paddingY.sm], // p-2 → paddingX.sm + paddingY.sm
        icon: iconSizes.md, // w-5 h-5 → iconSizes.md
      },
      md: {
        container: [paddingX.lg, paddingY.lg], // p-3 → paddingX.lg + paddingY.lg
        icon: iconSizes.lg, // w-6 h-6 → iconSizes.lg
      },
      lg: {
        container: [paddingX.md, paddingY.md], // p-4 → paddingX.md + paddingY.md
        icon: iconSizes.xl, // w-8 h-8 → iconSizes.xl
      },
    },
  },
  defaultVariants: {
    color: "primary", // blue → primary (semantic color)
    size: "md",
  },
});

export interface StatCardProps extends VariantProps<typeof statCard> {
  icon: LucideIcon;
  value: string | number;
  label: string;
  className?: string;
}

export function StatCard({
  icon: Icon,
  value,
  label,
  color,
  size,
  className,
}: StatCardProps) {
  const styles = statCard({ color, size });

  return (
    <div className={styles.container({ className })}>
      <div className={styles.iconWrapper()}>
        <Icon className={styles.icon()} />
      </div>
      <Text className={styles.value()}>{value}</Text>
      <Text textSize="xs" color="muted" className={styles.label()}>
        {label}
      </Text>
    </div>
  );
}
