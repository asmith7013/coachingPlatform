import { Heading } from '@/components/ui/typography/Heading';
import { Text } from '@/components/ui/typography/Text';
import { spacingY } from '@/lib/ui/tokens';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = 'Nothing here yet',
  description = "Once items are added, they'll show up here.",
  icon,
}: EmptyStateProps) {
  return (
    <div className={`text-center ${spacingY.lg}`}>
      {icon}
      <Heading level={3}>{title}</Heading>
      <Text variant="secondary" className={spacingY.sm}>{description}</Text>
    </div>
  );
}
