import { cn } from '@/lib/utils'
import { tv } from 'tailwind-variants'
import { textColors } from '@/lib/ui/tokens'
import { paddingVariant } from '@/lib/ui/sharedVariants'

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  gap?: 'sm' | 'md' | 'lg';
}

// 🎨 FormSection style variants
export const formSection = tv({
  slots: {
    root: [
      'flex flex-col',
    ],
    header: [
      'flex flex-col',
    ],
    title: [
      'font-semibold text-lg',
      textColors.default,
    ],
    description: [
      'text-sm',
      textColors.muted,
    ],
    content: [
      'mt-sm',
    ],
  },
  variants: {
    ...paddingVariant.variants,
    gap: {
      sm: { 
        root: 'gap-2',
        header: 'gap-2',
      },
      md: { 
        root: 'gap-4',
        header: 'gap-4',
      },
      lg: { 
        root: 'gap-6',
        header: 'gap-6',
      },
    },
  },
  defaultVariants: {
    padding: 'md',
    gap: 'sm',
  },
});

// ✅ Export for atomic style use elsewhere
export const formSectionStyles = formSection;

// ✅ Export type for variant props
export type FormSectionVariants = Parameters<typeof formSection>[0];

export function FormSection({
  title,
  description,
  children,
  className,
  padding = 'md',
  gap = 'sm',
}: FormSectionProps) {
  const styles = formSection({ padding, gap });

  return (
    <div className={cn(styles.root(), className)}>
      <div className={styles.header()}>
        <h3 className={styles.title()}>{title}</h3>
        {description && (
          <p className={styles.description()}>
            {description}
          </p>
        )}
      </div>
      <div className={styles.content()}>
        {children}
      </div>
    </div>
  );
}
