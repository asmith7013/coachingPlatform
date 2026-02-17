"use client";

import React from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

/**
 * Props for the AccordionItem component
 */
export interface AccordionItemProps {
  /** Display title (can be string or ReactNode for custom rendering) */
  title: string | React.ReactNode;
  /** Icon to show next to title */
  icon?: React.ReactNode;
  /** Content to render when expanded */
  children: React.ReactNode;
  /** Optional legend to show below content */
  legend?: React.ReactNode;
  /** Whether the accordion is currently expanded */
  isOpen: boolean;
  /** Callback when accordion header is clicked */
  onToggle: () => void;
}

/**
 * Atomic accordion item component for collapsible content sections.
 * Used by SectionAccordion and can be used standalone.
 */
export function AccordionItem({
  title,
  icon,
  children,
  legend,
  isOpen,
  onToggle,
}: AccordionItemProps) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {icon}
          {typeof title === "string" ? (
            <span className="text-sm font-medium text-gray-700">{title}</span>
          ) : (
            <div className="flex-1 min-w-0">{title}</div>
          )}
        </div>
        {isOpen ? (
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronRightIcon className="h-5 w-5 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pt-4 pb-4">
          {children}
          {legend}
        </div>
      )}
    </div>
  );
}
