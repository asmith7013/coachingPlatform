import { tv, type VariantProps } from 'tailwind-variants';
import { 
  textColors, 
  textSize, 
  weight, 
  iconSizes, 
  spaceBetween
} from '@ui-tokens';
import { cn } from '@/lib/ui/utils/formatters';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const autoSaveIndicator = tv({
  slots: {
    root: [
      'flex items-center transition-opacity duration-200',
      spaceBetween.x.sm
    ],
    dot: [
      'rounded-full flex-shrink-0',
    ],
    text: [
      textSize.sm,
      weight.medium,
      'whitespace-nowrap'
    ]
  },
  variants: {
    status: {
      idle: {
        root: 'opacity-0',
        dot: '',
        text: ''
      },
      saving: {
        root: 'opacity-100',
        dot: [iconSizes.xs, 'bg-blue-500 animate-pulse'],
        text: textColors.muted
      },
      saved: {
        root: 'opacity-75',
        dot: [iconSizes.xs, 'bg-green-500'],
        text: textColors.success
      },
      error: {
        root: 'opacity-100',
        dot: [iconSizes.xs, 'bg-red-500'],
        text: textColors.danger
      }
    },
    size: {
      sm: {
        dot: iconSizes.xs,
        text: textSize.xs
      },
      md: {
        dot: iconSizes.sm,
        text: textSize.sm
      },
      lg: {
        dot: iconSizes.md,
        text: textSize.base
      }
    },
    spacing: {
      tight: {
        root: spaceBetween.x.xs,
      },
      normal: {
        root: spaceBetween.x.sm,
      },
      loose: {
        root: spaceBetween.x.md,
      }
    }
  },
  defaultVariants: {
    status: 'idle',
    size: 'md',
    spacing: 'normal'
  }
});

export interface AutoSaveIndicatorProps extends VariantProps<typeof autoSaveIndicator> {
  /** Current auto-save status */
  status: AutoSaveStatus;
  /** Custom text to display instead of default status messages */
  text?: string;
  /** Additional CSS classes */
  className?: string;
  /** Screen reader accessible label */
  'aria-label'?: string;
}

const STATUS_MESSAGES: Record<AutoSaveStatus, string> = {
  idle: '',
  saving: 'Saving...',
  saved: 'Saved',
  error: 'Save failed'
};

/**
 * AutoSaveIndicator - Displays the current auto-save status with visual and text indicators
 */
export function AutoSaveIndicator({
  status,
  text,
  size,
  spacing,
  className,
  'aria-label': ariaLabel,
  ...props
}: AutoSaveIndicatorProps) {
  const styles = autoSaveIndicator({ status, size, spacing });
  const displayText = text || STATUS_MESSAGES[status];
  
  // Don't render anything for idle status
  if (status === 'idle') {
    return null;
  }
  
  return (
    <div 
      className={cn(styles.root(), className)}
      role="status"
      aria-label={ariaLabel || `Auto-save status: ${displayText}`}
      aria-live="polite"
      {...props}
    >
      <div className={styles.dot()} />
      {displayText && (
        <span className={styles.text()}>
          {displayText}
        </span>
      )}
    </div>
  );
}