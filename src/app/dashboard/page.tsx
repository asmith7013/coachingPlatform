import React from 'react';
import { Heading } from '@/components/ui/typography/Heading';
import { Text } from '@/components/ui/typography/Text';
import { spacing } from '@/lib/ui/tokens';
import { cn } from '@/lib/utils';

export default function DashboardHome() {
  return (
    <div className={spacing.lg}>
      <Heading level="h1" className={'text-primary'}>
        Welcome to the Dashboard
      </Heading>
      <Text variant="text" className={cn(spacing.md, 'text-text-muted')}>
        This is where your schools and data will be displayed.
      </Text>
    </div>
  );
}