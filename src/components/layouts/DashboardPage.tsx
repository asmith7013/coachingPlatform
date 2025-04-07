import { Heading } from '@/components/ui/typography/Heading';
import { Text } from '@/components/ui/typography/Text';
import { layout, spacingY, typography } from '@/lib/ui/tokens';
import { cn } from '@/lib/utils';

interface DashboardPageProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function DashboardPage({
  title,
  description,
  children,
}: DashboardPageProps) {
  return (
    <div className={cn(layout.container, spacingY.lg)}>
      <div className={spacingY.md}>
        <Heading level="h1" className={cn(typography.weight.bold, 'text-primary')}>
          {title}
        </Heading>
        {description && (
          <Text 
            variant="text" 
            className={cn(typography.text.base, 'text-text')}
          >
            {description}
          </Text>
        )}
      </div>
      <div className="flex flex-col gap-y-8">
        {children}
      </div>
    </div>
  );
} 