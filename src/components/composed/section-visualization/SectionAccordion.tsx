"use client";

import React, { useState } from "react";
import { ToggleSwitch } from "@/components/core/fields/ToggleSwitch";
import { cn } from "@ui/utils/formatters";
import { AccordionItem } from "./AccordionItem";

/**
 * Individual accordion item configuration
 */
export interface AccordionItemConfig {
  /** Unique key for the accordion item */
  key: string;
  /** Display title (string or ReactNode for custom rendering) */
  title: string | React.ReactNode;
  /** Icon to show next to title */
  icon: React.ReactNode;
  /** Content to render when expanded */
  content: React.ReactNode;
  /** Optional legend to show below content */
  legend?: React.ReactNode;
}

/**
 * Props for the SectionAccordion component
 */
interface SectionAccordionProps {
  /** Custom header content (most flexible - accepts any ReactNode) */
  header?: React.ReactNode;
  /** Section display name (for velocity pattern) */
  sectionName?: string;
  /** School name (for velocity pattern) */
  school?: string;
  /** Simple title (alternative to sectionName/school) */
  title?: string;
  /** Optional subtitle/badge text */
  subtitle?: string;
  /** Section color (used for header background) */
  color?: string;
  /** Whether this section is currently loading data */
  isLoading?: boolean;
  /** Array of accordion items to display (optional if using children) */
  items?: AccordionItemConfig[];
  /** Direct content to display (alternative to items - no accordion, just content) */
  children?: React.ReactNode;
  /** Keys of items that should be open by default */
  defaultOpenItems?: string[];
  /** Additional class names */
  className?: string;
  /** Hide the expand all toggle */
  hideExpandAll?: boolean;
}

/**
 * Generic accordion component for displaying section details.
 * Each section gets a colored header and configurable accordion items.
 *
 * Following composed component pattern from component-system.md
 */
export function SectionAccordion({
  header,
  sectionName,
  school,
  title,
  subtitle,
  color = "#4F46E5",
  isLoading = false,
  items,
  children,
  defaultOpenItems = [],
  className,
  hideExpandAll = false,
}: SectionAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(
    () => new Set(defaultOpenItems),
  );

  const allOpen = items ? openItems.size === items.length : false;

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
    if (items) {
      if (open) {
        setOpenItems(new Set(items.map((item) => item.key)));
      } else {
        setOpenItems(new Set());
      }
    }
  };

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow mb-6 overflow-hidden",
        className,
      )}
    >
      {/* Section Header */}
      <div
        className="px-4 py-3 border-b border-gray-200"
        style={{ backgroundColor: color }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Priority: header (custom ReactNode) > sectionName/school > title/subtitle */}
            {header ? (
              header
            ) : sectionName ? (
              <>
                <h2 className="text-lg font-bold text-white">{sectionName}</h2>
                {school && (
                  <span className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full">
                    {school}
                  </span>
                )}
              </>
            ) : title ? (
              <>
                <h2 className="text-lg font-bold text-white">{title}</h2>
                {subtitle && (
                  <span className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full">
                    {subtitle}
                  </span>
                )}
              </>
            ) : null}
            {isLoading && (
              <span className="text-sm text-white/80 ml-2">Loading...</span>
            )}
          </div>
          {!hideExpandAll && items && items.length > 0 && (
            <ToggleSwitch
              checked={allOpen}
              onChange={toggleAll}
              label="Expand All"
            />
          )}
        </div>
      </div>

      {/* Content: either accordion items or direct children */}
      {items && items.length > 0 ? (
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
      ) : children ? (
        <div className="px-4 py-4">{children}</div>
      ) : null}
    </div>
  );
}
