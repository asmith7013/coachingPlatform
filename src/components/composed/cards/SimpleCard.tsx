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
} from "@ui-tokens";
import {
  textColors,
  backgroundColors,
  borderColors,
  ringColors,
} from "@ui-tokens";

/**
 * SimpleCard component styles using Tailwind Variants
 * Recreates the Tailwind UI card pattern with colored left section,
 * content area, and optional action menu
 */
const simpleCard = tv({
  slots: {
    container: [
      "col-span-1 flex",
      radii.md, // rounded-md → radii.md
      shadows.sm, // shadow-sm → shadows.sm
    ],
    colorSection: [
      "flex w-16 shrink-0 items-center justify-center rounded-l-md",
      textSize.sm, // text-sm → textSize.sm
      weight.medium, // font-medium → weight.medium
      textColors.white, // text-white → textColors.white
    ],
    contentContainer: [
      "flex flex-1 items-center justify-between truncate rounded-r-md",
      "border-t border-r border-b",
      borderColors.muted, // border-gray-200 → borderColors.muted
      backgroundColors.white, // bg-white → backgroundColors.white
    ],
    contentText: [
      "flex-1 truncate",
      paddingX.md, // px-4 → paddingX.md
      paddingY.sm, // py-2 → paddingY.sm
      textSize.sm, // text-sm → textSize.sm
    ],
    title: [
      weight.medium, // font-medium → weight.medium
      textColors.default, // text-gray-900 → textColors.default
      `hover:${textColors.muted}`, // hover:text-gray-600 → hover:textColors.muted
    ],
    subtitle: [
      textColors.muted, // text-gray-500 → textColors.muted
    ],
    actionContainer: [
      "shrink-0",
      paddingX.sm, // pr-2 → paddingX.sm
    ],
    actionButton: [
      "inline-flex size-8 items-center justify-center",
      radii.full, // rounded-full → radii.full
      "bg-transparent",
      backgroundColors.white, // bg-white → backgroundColors.white
      textColors.muted, // text-gray-400 → textColors.muted
      `hover:${textColors.default}`, // hover:text-gray-500 → hover:textColors.default
      "focus:ring-2",
      ringColors.primary, // focus:ring-indigo-500 → ringColors.primary
      "focus:ring-offset-2 focus:outline-hidden",
    ],
  },
  variants: {
    colorVariant: {
      // Map some to semantic colors
      pink: { colorSection: "bg-pink-600" },
      purple: { colorSection: "bg-purple-600" },
      yellow: { colorSection: "bg-yellow-500" },
      green: { colorSection: backgroundColors.success }, // bg-green-500 → backgroundColors.success
      blue: { colorSection: backgroundColors.primary }, // bg-blue-600 → backgroundColors.primary
      red: { colorSection: backgroundColors.danger }, // bg-red-600 → backgroundColors.danger
      indigo: { colorSection: "bg-indigo-600" },
      gray: { colorSection: backgroundColors.secondary }, // bg-gray-600 → backgroundColors.secondary
    },
    clickable: {
      true: {
        container:
          "cursor-pointer hover:shadow-md transition-shadow duration-200",
        title: `hover:${textColors.muted}`, // hover:text-gray-600 → hover:textColors.muted
      },
      false: {},
    },
    size: {
      sm: {
        colorSection: [`w-12`, textSize.xs], // w-12 text-xs → w-12 textSize.xs
        contentText: [paddingX.lg, "py-1.5", textSize.xs], // px-3 py-1.5 text-xs → paddingX.lg py-1.5 textSize.xs
      },
      md: {
        colorSection: [`w-16`, textSize.sm], // w-16 text-sm → w-16 textSize.sm
        contentText: [paddingX.md, paddingY.sm, textSize.sm], // px-4 py-2 text-sm → paddingX.md paddingY.sm textSize.sm
      },
      lg: {
        colorSection: [`w-20`, textSize.base], // w-20 text-base → w-20 textSize.base
        contentText: [paddingX.lg, paddingY.lg, textSize.base], // px-5 py-3 text-base → paddingX.lg paddingY.lg textSize.base
      },
    },
  },
  defaultVariants: {
    colorVariant: "blue",
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
  colorVariant = "blue",
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
