import { cn } from '@/lib/utils/general';
import { tv, type VariantProps } from 'tailwind-variants';
import { textColors } from '@/lib/ui/tokens';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  className?: string;
  textSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'muted' | 'accent';
  align?: 'left' | 'center' | 'right';
}

// 🎨 EmptyState style variants
export const emptyState = tv({
  slots: {
    root: [
      'flex flex-col items-center justify-center',
    ],
    icon: [
      textColors.muted,
    ],
    title: [
      'mt-2 font-medium',
      textColors.default,
    ],
    description: [
      'mt-1',
      textColors.muted,
    ],
    action: [
      'mt-6',
    ],
  },
  variants: {
    textSize: {
      xs: { title: 'text-xs', description: 'text-xs' },
      sm: { title: 'text-sm', description: 'text-xs' },
      base: { title: 'text-base', description: 'text-sm' },
      lg: { title: 'text-lg', description: 'text-base' },
      xl: { title: 'text-xl', description: 'text-lg' },
      '2xl': { title: 'text-2xl', description: 'text-xl' },
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
        icon: textColors.muted,
        title: textColors.default,
        description: textColors.muted,
      },
      accent: {
        root: 'bg-primary-50',
        icon: textColors.accent,
        title: textColors.default,
        description: textColors.accent,
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
        <Icon 
          className={cn(
            styles.icon(),
            textSize === 'sm' ? 'h-8 w-8' : textSize === 'base' ? 'h-12 w-12' : 'h-16 w-16'
          )} 
          aria-hidden="true" 
        />
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
