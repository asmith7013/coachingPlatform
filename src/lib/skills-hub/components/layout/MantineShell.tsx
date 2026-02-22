"use client";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { useState } from "react";
import { handleQueryError } from "@error/handlers/query";
import { ErrorBoundary } from "@components/error/ErrorBoundary";
import { skillsHubTheme } from "../../core/mantine-theme";
import { MantineErrorFallback } from "../error/MantineErrorFallback";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";

export function MantineShell({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            const entityType =
              Array.isArray(query.queryKey) &&
              typeof query.queryKey[0] === "string"
                ? query.queryKey[0]
                : undefined;
            handleQueryError(error, "query", entityType, {
              queryKey: JSON.stringify(query.queryKey),
            });
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            const entityType =
              Array.isArray(mutation.options.mutationKey) &&
              typeof mutation.options.mutationKey[0] === "string"
                ? mutation.options.mutationKey[0]
                : undefined;
            handleQueryError(error, "mutation", entityType);
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <MantineProvider theme={skillsHubTheme}>
      <QueryClientProvider client={queryClient}>
        <Notifications position="top-right" />
        <ErrorBoundary fallback={MantineErrorFallback} context="SkillsHub">
          {children}
        </ErrorBoundary>
      </QueryClientProvider>
    </MantineProvider>
  );
}
