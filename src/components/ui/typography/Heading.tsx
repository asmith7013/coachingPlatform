import { ElementType } from 'react';
import { cn } from '@/lib/utils';
import { typography, textColors, type TextColor } from '@/lib/ui/tokens';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  variant?: TextColor;
  className?: string;
}

const headingElements = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
} as const;

export function Heading({
  level,
  children,
  variant = 'primary',
  className,
  ...props
}: HeadingProps) {
  const Component = headingElements[level] as ElementType;
  const headingClass = typography.heading[`h${level}` as keyof typeof typography.heading];

  return (
    <Component
      className={cn(headingClass, textColors[variant], className)}
      {...props}
    >
      {children}
    </Component>
  );
}
