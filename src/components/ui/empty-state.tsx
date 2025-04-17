import { cn } from '@/lib/utils';
import { tv, type VariantProps } from 'tailwind-variants';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  className?: string;
  textSize?: 'sm' | 'base' | 'lg';
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'muted' | 'primary';
  align?: 'left' | 'center' | 'right';
}

// 🎨 EmptyState style variants
export const emptyState = tv({
  slots: {
    root: [
      'flex flex-col items-center justify-center',
    ],
    icon: [
      'text-text-muted',
    ],
    title: [
      'mt-2 font-medium text-text',
    ],
    description: [
      'mt-1 text-text-muted',
    ],
    action: [
      'mt-6',
    ],
  },
  variants: {
    textSize: {
      sm: {
        icon: 'h-8 w-8',
        title: 'text-sm',
        description: 'text-xs',
      },
      base: {
        icon: 'h-12 w-12',
        title: 'text-base',
        description: 'text-sm',
      },
      lg: {
        icon: 'h-16 w-16',
        title: 'text-lg',
        description: 'text-base',
      },
    },
    padding: {
      sm: { root: 'p-4' },
      md: { root: 'p-6' },
      lg: { root: 'p-8' },
    },
    variant: {
      default: {},
      muted: {
        root: 'bg-gray-50',
        icon: 'text-gray-400',
        title: 'text-gray-900',
        description: 'text-gray-500',
      },
      primary: {
        root: 'bg-indigo-50',
        icon: 'text-indigo-400',
        title: 'text-indigo-900',
        description: 'text-indigo-500',
      },
    },
    align: {
      left: {
        root: 'items-start text-left',
      },
      center: {
        root: 'items-center text-center',
      },
      right: {
        root: 'items-end text-right',
      },
    },
  },
  defaultVariants: {
    textSize: 'base',
    padding: 'md',
    variant: 'default',
    align: 'center',
  },
});

// ✅ Export for atomic style use elsewhere
export const emptyStateStyles = emptyState;

// ✅ Export type for variant props
export type EmptyStateVariants = VariantProps<typeof emptyState>;

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  className,
  textSize = 'base',
  padding = 'md',
  variant = 'default',
  align = 'center',
}: EmptyStateProps) {
  const styles = emptyState({ textSize, padding, variant, align });

  return (
    <div className={cn(styles.root(), className)}>
      {Icon && (
        <Icon className={styles.icon()} aria-hidden="true" />
      )}
      <h3 className={styles.title()}>{title}</h3>
      {description && (
        <p className={styles.description()}>{description}</p>
      )}
      {action && (
        <div className={styles.action()}>{action}</div>
      )}
    </div>
  );
}
