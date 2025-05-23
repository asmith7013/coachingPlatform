'use client';

import { Card } from '@/components/composed/cards/Card';
import { Text } from '@/components/core/typography/Text';
import { cn } from '@ui/utils/formatters';;

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
      padding="sm"
    >
      <Text textSize="lg" color="muted" weight="semibold">
        Lesson {lessonNumber}
      </Text>
      <Text textSize="sm" color="muted" className="italic">
        No routines for this lesson.
      </Text>
    </Card>
  );
}