"use client"; // This wrapper component is a Client Components

import React from "react";
import { ErrorBoundary } from "@components/error/ErrorBoundary"; // Update import path

export default function SentryBoundaryWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
