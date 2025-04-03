import React from 'react';
import { Heading } from '@/components/ui/typography/Heading';
import { Text } from '@/components/ui/typography/Text';
import { spacing, textColors } from '@/lib/ui/tokens';

export default function DashboardHome() {
  return (
    <div className={spacing.lg}>
      <Heading level="h1" className={textColors.primary}>
        Welcome to the Dashboard
      </Heading>
      <Text variant="secondary" className={spacing.md}>
        This is where your schools and data will be displayed.
      </Text>
    </div>
  );
}