import React from 'react';
// import { Heading } from '@components/core/typography/Heading';
// import { Text } from '@components/core/typography/Text';
// import { cn } from '@ui/utils/formatters';
import { HydrationBoundary } from '@components/core/query/HydrationBoundary';

interface DashboardPageProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  dehydratedState?: unknown; // Add this prop for hydration
}

export function DashboardPage({
  // title,
  // description,
  children,
  dehydratedState // New prop for hydration state
}: DashboardPageProps) {
  // Wrap children with HydrationBoundary if dehydratedState is provided
  const content = dehydratedState ? (
    <HydrationBoundary state={dehydratedState}>
      {children}
    </HydrationBoundary>
  ) : children;

  return (
    <div className="container">
      {/* {title && (
        <Heading 
          level="h2"
          color="default"
          className={cn("text-primary font-bold mb-4")}
        >
          {title}
        </Heading>
      )}
      {description && (
        <Text
          textSize="base"
          color="default"
          className="mb-8"
        >
          {description}
        </Text>
      )} */}
      {content}
    </div>
  );
}