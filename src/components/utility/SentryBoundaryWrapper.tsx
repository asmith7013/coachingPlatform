"use client"; // This wrapper component is a Client Components

import { SentryErrorBoundary } from "./SentryErrorBoundary"; // Import the existing class component

export default function SentryBoundaryWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SentryErrorBoundary>{children}</SentryErrorBoundary>;
}