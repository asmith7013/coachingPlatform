'use client';

import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/typography/Text';
import { cn } from '@/lib/utils';
import { spacing } from '@/lib/ui/tokens';

type Props = {
  lessonNumber: string;
};

export function NoRoutineCard({ lessonNumber }: Props) {
  return (
    <Card
      className={cn(
        'text-muted',
        'transition-all duration-150 bg-white'
      )}
      contentClassName={cn(spacing.sm)}
    >
      <Text size="lg" variant="muted" className="font-semibold">
        Lesson {lessonNumber}
      </Text>
      <Text size="sm" variant="muted" className="italic">
        No routines for this lesson.
      </Text>
    </Card>
  );
}