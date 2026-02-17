import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  className?: string;
}

export function SectionHeader({
  title,
  isExpanded,
  onToggle,
  className,
}: SectionHeaderProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-2 w-full text-left mb-4 hover:text-blue-600 ${className || ""}`}
    >
      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      <h3 className="font-semibold text-lg">{title}</h3>
    </button>
  );
}
