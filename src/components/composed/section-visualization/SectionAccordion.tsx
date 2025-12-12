"use client";

import React, { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { ToggleSwitch } from "@/components/core/fields/ToggleSwitch";
import { cn } from "@ui/utils/formatters";

/**
 * Individual accordion item configuration
 */
export interface AccordionItemConfig {
  /** Unique key for the accordion item */
  key: string;
  /** Display title */
  title: string;
  /** Icon to show next to title */
  icon: React.ReactNode;
  /** Content to render when expanded */
  content: React.ReactNode;
  /** Optional legend to show below content */
  legend?: React.ReactNode;
}

/**
 * Props for individual AccordionItem (internal component)
 */
interface AccordionItemProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  legend?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * Internal accordion item component
 */
function AccordionItem({ title, icon, children, legend, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-gray-700">{title}</span>
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

/**
 * Props for the SectionAccordion component
 */
interface SectionAccordionProps {
  /** Section display name */
  sectionName: string;
  /** School name */
  school: string;
  /** Section color (used for header background) */
  color?: string;
  /** Whether this section is currently loading data */
  isLoading?: boolean;
  /** Array of accordion items to display */
  items: AccordionItemConfig[];
  /** Keys of items that should be open by default */
  defaultOpenItems?: string[];
  /** Additional class names */
  className?: string;
}

/**
 * Generic accordion component for displaying section details.
 * Each section gets a colored header and configurable accordion items.
 *
 * Following composed component pattern from component-system.md
 */
export function SectionAccordion({
  sectionName,
  school,
  color = "#4F46E5",
  isLoading = false,
  items,
  defaultOpenItems = [],
  className,
}: SectionAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(
    () => new Set(defaultOpenItems)
  );

  const allOpen = openItems.size === items.length;

  const toggleItem = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleAll = (open: boolean) => {
    if (open) {
      setOpenItems(new Set(items.map((item) => item.key)));
    } else {
      setOpenItems(new Set());
    }
  };

  return (
    <div className={cn("bg-white rounded-lg shadow mb-6 overflow-hidden", className)}>
      {/* Section Header */}
      <div
        className="px-4 py-3 border-b border-gray-200"
        style={{ backgroundColor: color }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">{sectionName}</h2>
            <span className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full">
              {school}
            </span>
            {isLoading && (
              <span className="text-sm text-white/80 ml-2">Loading...</span>
            )}
          </div>
          <ToggleSwitch
            checked={allOpen}
            onChange={toggleAll}
            label="Expand All"
          />
        </div>
      </div>

      {/* Accordion Items */}
      <div>
        {items.map((item) => (
          <AccordionItem
            key={item.key}
            title={item.title}
            icon={item.icon}
            legend={item.legend}
            isOpen={openItems.has(item.key)}
            onToggle={() => toggleItem(item.key)}
          >
            {item.content}
          </AccordionItem>
        ))}
      </div>
    </div>
  );
}
