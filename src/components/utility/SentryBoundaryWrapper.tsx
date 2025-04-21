"use client"; // This wrapper component is a Client Components

import React from "react";
import { SentryErrorBoundary } from "@/components/utility/ErrorBoundary"; // Update import path

export default function SentryBoundaryWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SentryErrorBoundary>{children}</SentryErrorBoundary>;
}