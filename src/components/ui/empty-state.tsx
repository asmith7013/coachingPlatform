import { Heading } from '@/components/ui/typography/Heading';
import { Text } from '@/components/ui/typography/Text';
import { spacingY, textColors } from '@/lib/ui/tokens';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'Nothing here yet',
  description = "Once items are added, they'll show up here.",
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('text-center', spacingY.lg, className)}>
      {icon}
      <Heading level="h3" className={textColors.primary}>{title}</Heading>
      <Text className={cn(spacingY.sm, textColors.secondary)}>{description}</Text>
    </div>
  );
}
