"use client";

import React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@ui/utils/formatters';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';

/**
 * SimpleCard component styles using Tailwind Variants
 * Recreates the Tailwind UI card pattern with colored left section,
 * content area, and optional action menu
 */
const simpleCard = tv({
  slots: {
    container: [
      'col-span-1 flex rounded-md shadow-sm'
    ],
    colorSection: [
      'flex w-16 shrink-0 items-center justify-center rounded-l-md',
      'text-sm font-medium text-white'
    ],
    contentContainer: [
      'flex flex-1 items-center justify-between truncate rounded-r-md',
      'border-t border-r border-b border-gray-200 bg-white'
    ],
    contentText: [
      'flex-1 truncate px-4 py-2 text-sm'
    ],
    title: [
      'font-medium text-gray-900 hover:text-gray-600'
    ],
    subtitle: [
      'text-gray-500'
    ],
    actionContainer: [
      'shrink-0 pr-2'
    ],
    actionButton: [
      'inline-flex size-8 items-center justify-center rounded-full',
      'bg-transparent bg-white text-gray-400 hover:text-gray-500',
      'focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden'
    ]
  },
  variants: {
    colorVariant: {
      pink: { colorSection: 'bg-pink-600' },
      purple: { colorSection: 'bg-purple-600' },
      yellow: { colorSection: 'bg-yellow-500' },
      green: { colorSection: 'bg-green-500' },
      blue: { colorSection: 'bg-blue-600' },
      red: { colorSection: 'bg-red-600' },
      indigo: { colorSection: 'bg-indigo-600' },
      gray: { colorSection: 'bg-gray-600' },
    },
    clickable: {
      true: { 
        container: 'cursor-pointer hover:shadow-md transition-shadow duration-200',
        title: 'hover:text-gray-600'
      },
      false: {}
    },
    size: {
      sm: { 
        colorSection: 'w-12 text-xs',
        contentText: 'px-3 py-1.5 text-xs'
      },
      md: { 
        colorSection: 'w-16 text-sm',
        contentText: 'px-4 py-2 text-sm'
      },
      lg: { 
        colorSection: 'w-20 text-base',
        contentText: 'px-5 py-3 text-base'
      }
    }
  },
  defaultVariants: {
    colorVariant: 'blue',
    clickable: false,
    size: 'md'
  }
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
  colorVariant = 'blue',
  clickable = false,
  size = 'md',
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

  const TitleComponent = href && !onClick ? 'a' : 'span';
  const titleProps = href && !onClick ? { href } : {};

  return (
    <li 
      className={cn(styles.container(), className)}
      onClick={(onClick || href) ? handleCardClick : undefined}
      {...props}
    >
      {/* Colored Left Section */}
      <div className={styles.colorSection()}>
        {initials}
      </div>

      {/* Content Container */}
      <div className={styles.contentContainer()}>
        {/* Main Content */}
        <div className={styles.contentText()}>
          <TitleComponent 
            className={styles.title()}
            {...titleProps}
          >
            {title}
          </TitleComponent>
          {subtitle && (
            <p className={styles.subtitle()}>
              {subtitle}
            </p>
          )}
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
              {actionIcon || <EllipsisVerticalIcon aria-hidden="true" className="size-5" />}
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