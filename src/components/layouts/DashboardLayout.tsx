import React from 'react';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { cn } from '@ui/utils/formatters';;

interface DashboardPageProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function DashboardPage({
  title,
  description,
  children
}: DashboardPageProps) {
  return (
    <div className="container mx-auto p-8">
      {title && (
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
          color="muted"
          className="mb-8"
        >
          {description}
        </Text>
      )}
      {children}
    </div>
  );
} 