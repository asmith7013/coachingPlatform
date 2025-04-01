import { ElementType } from 'react';
import { typography } from '@/lib/ui/tokens';
import { cn } from '@/lib/utils';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
}

const headingElements = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
} as const;

export function Heading({ level, children, className, ...props }: HeadingProps) {
  const Component = headingElements[level] as ElementType;
  const headingClass = typography.heading[`h${level}`];

  return (
    <Component className={cn(headingClass, className)} {...props}>
      {children}
    </Component>
  );
}
