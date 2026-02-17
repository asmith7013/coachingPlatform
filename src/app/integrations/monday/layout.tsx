"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MondayImportProvider } from "@hooks/integrations/monday/MondayImportContext";
import { queryClient } from "@/query/core/client";

export default function MondayIntegrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <MondayImportProvider>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </MondayImportProvider>
    </QueryClientProvider>
  );
}
