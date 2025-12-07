import React, { useState } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import { StudentGraphLegend, CalendarLegend, TableLegend } from "./VelocityLegend";

interface AccordionItemProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  legend?: React.ReactNode;
  defaultOpen?: boolean;
}

function AccordionItem({ title, icon, children, legend, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-gray-100 hover:bg-indigo-200 cursor-pointer transition-colors"
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

interface SectionAccordionProps {
  sectionName: string;
  school: string;
  color?: string; // Section color from the graph/filter
  isLoading?: boolean;
  studentGraphContent: React.ReactNode;
  calendarContent: React.ReactNode;
  studentTableContent: React.ReactNode;
}

export function SectionAccordion({
  sectionName,
  school,
  color,
  isLoading,
  studentGraphContent,
  calendarContent,
  studentTableContent,
}: SectionAccordionProps) {
  return (
    <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
      {/* Section Header */}
      <div
        className="px-4 py-3 border-b border-gray-200"
        style={{ backgroundColor: color || '#4F46E5' }}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-white">{sectionName}</h2>
          <span className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full">
            {school}
          </span>
          {isLoading && (
            <span className="text-sm text-white/80 ml-2">Loading...</span>
          )}
        </div>
      </div>

      {/* Accordion Items */}
      <div>
        <AccordionItem
          title="Student Velocity Rolling 3-Day Average"
          icon={<ChartBarIcon className="h-5 w-5 text-gray-400" />}
          legend={<StudentGraphLegend />}
        >
          {studentGraphContent}
        </AccordionItem>
        <AccordionItem
          title="Calendar View"
          icon={<CalendarDaysIcon className="h-5 w-5 text-gray-400" />}
          legend={<CalendarLegend />}
        >
          {calendarContent}
        </AccordionItem>
        <AccordionItem
          title="Student Detail Table"
          icon={<TableCellsIcon className="h-5 w-5 text-gray-400" />}
          legend={<TableLegend />}
        >
          {studentTableContent}
        </AccordionItem>
      </div>
    </div>
  );
}
