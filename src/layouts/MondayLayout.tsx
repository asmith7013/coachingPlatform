'use client';

/**
 * Monday.com Integration Layout
 * 
 * Provides all the necessary context providers for Monday.com integration
 * including connection management and import functionality.
 */
import { ReactNode } from 'react';
import { QueryProvider } from '@query/core/provider';
import { MondayIntegrationProvider } from '@hooks/integrations/monday/MondayIntegrationContext';
import { MondayImportProvider } from '@hooks/integrations/monday/MondayImportContext';

interface MondayLayoutProps {
  children: ReactNode;
}

/**
 * Layout component that provides all Monday.com integration contexts
 * 
 * This ensures that all required contexts are available to components
 * that need to interact with Monday.com.
 */
export default function MondayLayout({ children }: MondayLayoutProps) {
  return (
    <QueryProvider>
      <MondayIntegrationProvider>
        <MondayImportProvider>
          {children}
        </MondayImportProvider>
      </MondayIntegrationProvider>
    </QueryProvider>
  );
} 