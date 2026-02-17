"use client";

import React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@ui/utils/formatters";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import {
  paddingX,
  paddingY,
  textSize,
  weight,
  radii,
  shadows,
  flex,
  iconSizes,
} from "@/lib/tokens/tokens";
import {
  backgroundColors,
  borderColors,
  textColors,
  hoverTextColors,
  ringColors,
} from "@/lib/tokens/colors";

/**
 * SimpleCard component styles using Tailwind Variants
 * Recreates the Tailwind UI card pattern with colored left section,
 * content area, and optional action menu
 *
 * ✅ Migration Status: Using token system for all styling
 */
const simpleCard = tv({
  slots: {
    container: [
      // Keep structural classes as-is
      "col-span-1 flex",
      // Replace with tokens
      radii.md, // rounded-md → radii.md
      shadows.sm, // shadow-sm → shadows.sm
    ],
    colorSection: [
      // Keep structural classes as-is - Layout utilities migration
      "flex w-16 items-center justify-center",
      flex.shrink, // shrink-0 → flex.shrink
      // Replace with tokens
      "rounded-l-md", // Keep positioning as-is
      textSize.sm, // text-sm → textSize.sm
      weight.medium, // font-medium → weight.medium
      textColors.white, // text-white → textColors.white
    ],
    contentContainer: [
      // Keep structural classes as-is - Layout utilities migration
      "flex items-center justify-between truncate",
      flex.grow, // flex-1 → flex.grow
      // Replace with tokens
      "rounded-r-md", // Keep positioning as-is
      "border-t border-r border-b", // Keep border positioning as-is
      borderColors.muted, // border-gray-200 → borderColors.muted
      backgroundColors.white, // bg-white → backgroundColors.white
    ],
    contentText: [
      // Keep structural classes as-is - Layout utilities migration
      "truncate",
      flex.grow, // flex-1 → flex.grow
      // Replace with tokens
      paddingX.md, // px-4 → paddingX.md
      paddingY.md, // py-2 → paddingY.md
      textSize.sm, // text-sm → textSize.sm
    ],
    title: [
      // Replace with tokens
      weight.medium, // font-medium → weight.medium
      textColors.default, // text-gray-900 → textColors.default
      hoverTextColors.default, // hover:text-gray-600 → hoverTextColors.default
    ],
    subtitle: [
      // Replace with tokens
      textColors.muted, // text-gray-500 → textColors.muted
    ],
    actionContainer: [
      // Keep structural classes as-is - Layout utilities migration
      flex.shrink, // shrink-0 → flex.shrink
      // Replace with tokens
      "pr-2", // Keep minimal positioning spacing as-is
    ],
    actionButton: [
      // Keep structural classes as-is - Icon sizing migration
      "inline-flex items-center justify-center",
      iconSizes.xl, // size-8 → iconSizes.xl
      // Replace with tokens
      radii.full, // rounded-full → radii.full
      "bg-transparent", // Keep transparent as-is
      backgroundColors.white, // bg-white → backgroundColors.white
      textColors.muted, // text-gray-400 → textColors.muted
      hoverTextColors.default, // hover:text-gray-500 → hoverTextColors.default
      "focus:ring-2 focus:ring-offset-2 focus:outline-hidden", // Keep focus as-is for now
      `focus:${ringColors.primary}`, // focus:ring-indigo-500 → focus:ringColors.primary
    ],
  },
  variants: {
    colorVariant: {
      // Map semantic intent colors
      primary: { colorSection: backgroundColors.primary }, // bg-blue-600 → backgroundColors.primary
      secondary: { colorSection: backgroundColors.secondary }, // bg-gray-600 → backgroundColors.secondary
      success: { colorSection: backgroundColors.success }, // bg-green-500 → backgroundColors.success
      danger: { colorSection: backgroundColors.danger }, // bg-red-600 → backgroundColors.danger
      // Keep additional color options with raw Tailwind for flexibility
      pink: { colorSection: "bg-pink-600" },
      purple: { colorSection: "bg-purple-600" },
      yellow: { colorSection: "bg-yellow-500" },
      indigo: { colorSection: "bg-indigo-600" },
    },
    clickable: {
      true: {
        container:
          "cursor-pointer hover:shadow-md transition-shadow duration-200",
        title: "hover:text-gray-600",
      },
      false: {},
    },
    size: {
      sm: {
        colorSection: ["w-12", textSize.xs], // w-12 text-xs → w-12 textSize.xs
        contentText: [paddingX.sm, "py-1.5", textSize.xs], // px-3 py-1.5 text-xs → paddingX.sm py-1.5 textSize.xs
      },
      md: {
        colorSection: ["w-16", textSize.sm], // w-16 text-sm → w-16 textSize.sm
        contentText: [paddingX.md, paddingY.md, textSize.sm], // px-4 py-2 text-sm → paddingX.md paddingY.md textSize.sm
      },
      lg: {
        colorSection: ["w-20", textSize.base], // w-20 text-base → w-20 textSize.base
        contentText: [paddingX.lg, paddingY.lg, textSize.base], // px-5 py-3 text-base → paddingX.lg paddingY.lg textSize.base
      },
    },
  },
  defaultVariants: {
    colorVariant: "primary", // blue → primary (semantic color)
    clickable: false,
    size: "md",
  },
});

export type SimpleCardVariants = VariantProps<typeof simpleCard>;

interface SimpleCardProps extends SimpleCardVariants {
  /** The initials or short text to display in the colored section */
  initials: string;
  /** The main title/name */
  title: string;
  /** The subtitle/description */
  subtitle?: string;
  /** Optional href for making the title clickable */
  href?: string;
  /** Click handler for the entire card */
  onClick?: () => void;
  /** Click handler for the action button */
  onActionClick?: (e: React.MouseEvent) => void;
  /** Whether to show the action menu button */
  showAction?: boolean;
  /** Custom className for the container */
  className?: string;
  /** Custom icon to replace the default three dots */
  actionIcon?: React.ReactNode;
  /** Screen reader text for the action button */
  actionLabel?: string;
}

/**
 * SimpleCard component that recreates the Tailwind UI card pattern
 * with a colored left section, content area, and optional action menu
 *
 * @example
 * ```tsx
 * <SimpleCard
 *   initials="GA"
 *   title="Graph API"
 *   subtitle="16 Members"
 *   colorVariant="pink"
 *   href="/projects/graph-api"
 *   showAction
 *   onActionClick={(e) => {
 *     e.stopPropagation();
 *     console.log('Action clicked');
 *   }}
 * />
 * ```
 */
export function SimpleCard({
  initials,
  title,
  subtitle,
  href,
  onClick,
  onActionClick,
  showAction = false,
  className,
  actionIcon,
  actionLabel = "Open options",
  colorVariant = "primary",
  clickable = false,
  size = "md",
  ...props
}: SimpleCardProps) {
  const styles = simpleCard({ colorVariant, clickable, size });

  const handleCardClick = (_e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    } else if (href) {
      // If href is provided but no onClick, navigate to href
      window.location.href = href;
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when action is clicked
    if (onActionClick) {
      onActionClick(e);
    }
  };

  const TitleComponent = href && !onClick ? "a" : "span";
  const titleProps = href && !onClick ? { href } : {};

  return (
    <li
      className={cn(styles.container(), className)}
      onClick={onClick || href ? handleCardClick : undefined}
      {...props}
    >
      {/* Colored Left Section */}
      <div className={styles.colorSection()}>{initials}</div>

      {/* Content Container */}
      <div className={styles.contentContainer()}>
        {/* Main Content */}
        <div className={styles.contentText()}>
          <TitleComponent className={styles.title()} {...titleProps}>
            {title}
          </TitleComponent>
          {subtitle && <p className={styles.subtitle()}>{subtitle}</p>}
        </div>

        {/* Action Button */}
        {showAction && (
          <div className={styles.actionContainer()}>
            <button
              type="button"
              className={styles.actionButton()}
              onClick={handleActionClick}
            >
              <span className="sr-only">{actionLabel}</span>
              {actionIcon || (
                <EllipsisVerticalIcon aria-hidden="true" className="size-5" />
              )}
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

/**
 * Export the styles for potential reuse in other components
 */
export const simpleCardStyles = simpleCard;
