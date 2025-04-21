import React from 'react';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';

export default function DashboardHome() {
  return (
    <div className="p-8">
      <Heading 
        level="h1" 
        color="default"
        className="text-primary"
      >
        Welcome to the Dashboard
      </Heading>
      <Text 
        textSize="base"
        color="muted"
        className="mt-4"
      >
        This is where your schools and data will be displayed.
      </Text>
    </div>
  );
}