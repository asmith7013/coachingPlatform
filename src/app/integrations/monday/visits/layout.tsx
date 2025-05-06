'use client';

import { ReactNode } from 'react';
import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';

/**
 * Layout for Monday.com import pages
 * This layout provides a consistent container for all import-related pages
 */
export default function MondayImportLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Heading level="h1">Monday.com Integration</Heading>
        <Text className="text-gray-600 mt-1">
          Import and sync data between Monday.com and your coaching platform
        </Text>
      </div>
      
      <Card className="shadow-md">
        <Card.Body>
          {children}
        </Card.Body>
      </Card>
    </div>
  );
}