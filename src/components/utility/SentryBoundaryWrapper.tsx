"use client"; // This wrapper component is a Client Components

import { SentryErrorBoundary } from "@/components/error-boundaries/SentryErrorBoundary"; // Import from correct path

export default function SentryBoundaryWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SentryErrorBoundary>{children}</SentryErrorBoundary>;
}