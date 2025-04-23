import { cn } from '@/lib/utils'
import { tv } from 'tailwind-variants'
import { textColors, textSize, gap as gapTokens } from '@ui-tokens/tokens'

type FormSectionPadding = 'sm' | 'md' | 'lg';
type FormSectionGap = 'sm' | 'md' | 'lg';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  padding?: FormSectionPadding;
  gap?: FormSectionGap;
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
      'font-semibold',
      textSize.lg,
      textColors.default,
    ],
    description: [
      textSize.sm,
      textColors.muted,
    ],
    content: [
      'mt-sm',
    ],
  },
  variants: {
    padding: {
      sm: { 
        root: 'p-4',
        header: 'p-2',
        content: 'p-2',
      },
      md: { 
        root: 'p-6',
        header: 'p-3',
        content: 'p-3',
      },
      lg: { 
        root: 'p-8',
        header: 'p-4',
        content: 'p-4',
      },
    },
    gap: {
      sm: { 
        root: gapTokens.sm,
        header: gapTokens.sm,
      },
      md: { 
        root: gapTokens.md,
        header: gapTokens.md,
      },
      lg: { 
        root: gapTokens.lg,
        header: gapTokens.lg,
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
