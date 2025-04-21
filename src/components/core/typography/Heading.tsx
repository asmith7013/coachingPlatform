import { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { tv, type VariantProps } from 'tailwind-variants'
import { heading as headingLevels, textColors } from '@/lib/ui/tokens'
import type { HeadingLevel, TextColor } from '@/lib/ui/tokens'

const heading = tv({
  slots: {
    heading: 'font-heading tracking-tight',
    subheading: 'font-body text-sm mt-1',
  },
  variants: {
    level: {
      h1: { heading: headingLevels.h1 },
      h2: { heading: headingLevels.h2 },
      h3: { heading: headingLevels.h3 },
      h4: { heading: headingLevels.h4 },
      h5: { heading: headingLevels.h5 },
      h6: { heading: headingLevels.h6 },
    },
    color: {
      default: { heading: textColors.default, subheading: textColors.muted },
      muted: { heading: textColors.muted, subheading: textColors.muted },
      accent: { heading: textColors.accent, subheading: textColors.muted },
      danger: { heading: textColors.danger, subheading: textColors.muted },
    },
  },
  defaultVariants: {
    level: 'h3',
    color: 'default',
  },
});

export type HeadingVariants = VariantProps<typeof heading>;

interface HeadingProps extends Omit<React.HTMLAttributes<HTMLHeadingElement>, 'color'> {
  children: ReactNode;
  level?: HeadingLevel;
  color?: TextColor;
  subheading?: ReactNode;
  className?: string;
  subheadingClassName?: string;
}

const headingElements: Record<HeadingLevel, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
};

export function Heading({
  children,
  level = 'h3',
  color = 'default',
  subheading,
  className,
  subheadingClassName,
  ...props
}: HeadingProps) {
  const Component = headingElements[level as HeadingLevel];
  const styles = heading({ level, color });

  return (
    <div>
      <Component
        className={cn(styles.heading(), className)}
        {...props}
      >
        {children}
      </Component>
      {subheading && (
        <p className={cn(styles.subheading(), subheadingClassName)}>
          {subheading}
        </p>
      )}
    </div>
  )
}
