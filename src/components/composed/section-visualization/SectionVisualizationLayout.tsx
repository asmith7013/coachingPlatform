"use client";

import React from "react";
import { cn } from "@ui/utils/formatters";
import { Spinner } from "@/components/core/feedback/Spinner";
import { MultiSectionSelector } from "@/app/scm/podsie/bulk-sync/components/MultiSectionSelector";

/**
 * Section option type for the selector
 */
export interface SectionOption {
  id: string;
  school: string;
  classSection: string;
  teacher?: string;
  gradeLevel: string;
  displayName: string;
  scopeSequenceTag?: string;
}

/**
 * Props for the SectionVisualizationLayout component
 */
interface SectionVisualizationLayoutProps {
  /** Page title */
  title: string;
  /** Page subtitle/description */
  subtitle?: string;
  /** Available section options */
  sectionOptions: SectionOption[];
  /** Currently selected section IDs */
  selectedSections: string[];
  /** Callback when a section is toggled */
  onSectionToggle: (sectionId: string) => void;
  /** Map of section IDs to colors */
  sectionColors: Map<string, string>;
  /** Whether initial data is loading */
  isLoading?: boolean;
  /** Set of section IDs currently loading data */
  loadingSectionIds?: Set<string>;
  /** Content for the shared visualization area (shown for all selected sections) */
  sharedVisualization?: React.ReactNode;
  /** Render function for individual section content (accordions) */
  renderSectionContent: (sectionId: string, section: SectionOption) => React.ReactNode;
  /** Optional header actions (e.g., export button) */
  headerActions?: React.ReactNode;
  /** Optional actions to display alongside the section selector */
  selectorActions?: React.ReactNode;
  /** Content to render between selector and sections (e.g., modals) */
  afterSelector?: React.ReactNode;
  /** Empty state message */
  emptyStateMessage?: string;
  /** Empty state description */
  emptyStateDescription?: string;
  /** Additional class names */
  className?: string;
}

/**
 * Shared layout component for section-based visualization pages.
 * Provides consistent structure: header, section selector, shared visualization, and per-section accordions.
 *
 * Following composed component pattern from component-system.md
 */
export function SectionVisualizationLayout({
  title,
  subtitle,
  sectionOptions,
  selectedSections,
  onSectionToggle,
  sectionColors,
  isLoading = false,
  loadingSectionIds = new Set(),
  sharedVisualization,
  renderSectionContent,
  headerActions,
  selectorActions,
  afterSelector,
  emptyStateMessage = "No Sections Selected",
  emptyStateDescription = "Select one or more sections above to view data.",
  className,
}: SectionVisualizationLayoutProps) {
  // Sort selected sections by section number
  const sortedSelectedSections = [...selectedSections].sort((a, b) => {
    const numA = parseInt(a.split("-").pop() || "0", 10);
    const numB = parseInt(b.split("-").pop() || "0", 10);
    return numA - numB;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" variant="primary" />
          <p className="text-gray-500">Loading sections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-500">
                {subtitle}
                {loadingSectionIds.size > 0 && (
                  <span className="ml-2 text-blue-600">Loading data...</span>
                )}
              </p>
            )}
          </div>
          {headerActions}
        </div>
      </div>

      {/* Main content */}
      <div className="p-6">
        {/* Section selector */}
        <MultiSectionSelector
          sections={sectionOptions}
          selectedSections={selectedSections}
          onToggle={onSectionToggle}
          sectionColors={sectionColors}
          actions={selectorActions}
        />

        {/* Content rendered after selector (e.g., modals) */}
        {afterSelector}

        {selectedSections.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="max-w-md mx-auto">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {emptyStateMessage}
              </h3>
              <p className="text-gray-500">{emptyStateDescription}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Shared visualization for all sections */}
            {sharedVisualization}

            {/* Individual section content (accordions) */}
            {sortedSelectedSections.map((sectionId) => {
              const section = sectionOptions.find((s) => s.id === sectionId);
              if (!section) return null;
              return (
                <React.Fragment key={sectionId}>
                  {renderSectionContent(sectionId, section)}
                </React.Fragment>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
