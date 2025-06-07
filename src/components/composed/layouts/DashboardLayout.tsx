import React from 'react';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { cn } from '@ui/utils/formatters';;

interface DashboardPageProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function DashboardLayout({
  title,
  description,
  children
}: DashboardPageProps) {
  return (
    <div className="space-y-6">
      {(title || description) && (
        <div className="space-y-4">
          {title && (
            <Heading 
              level="h2" 
              color="default"
              className={cn("text-primary font-bold")}
            >
              {title}
            </Heading>
          )}
          {description && (
            <Text
              textSize="base"
              color="muted"
            >
              {description}
            </Text>
          )}
        </div>
      )}
      {children}
    </div>
  );
} 