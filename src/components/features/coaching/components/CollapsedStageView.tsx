import React from "react";
import { Button } from "@/components/core/Button";
import { cn } from "@/lib/ui/utils/formatters";

interface CollapsedStageViewProps {
  title: string;
  summary: React.ReactNode;
  onEdit: () => void;
  variant?: "success" | "warning" | "info";
  className?: string;
}

export function CollapsedStageView({
  title,
  summary,
  onEdit,
  variant = "success",
  className,
}: CollapsedStageViewProps) {
  const variantStyles = {
    success: "bg-green-50 border-green-200",
    warning: "bg-orange-50 border-orange-200",
    info: "bg-blue-50 border-blue-200",
  };

  const textStyles = {
    success: "text-green-800",
    warning: "text-orange-800",
    info: "text-blue-800",
  };

  return (
    <div
      className={cn("p-4 border rounded-lg", variantStyles[variant], className)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className={cn("font-medium mb-2", textStyles[variant])}>
            {title}
          </h4>
          <div className={cn("text-sm", textStyles[variant])}>{summary}</div>
        </div>
        <Button
          intent="secondary"
          appearance="outline"
          textSize="sm"
          padding="sm"
          onClick={onEdit}
        >
          Edit
        </Button>
      </div>
    </div>
  );
}
