import { tv } from "tailwind-variants";
import { cn } from "@ui/utils/formatters";

const resizeHandle = tv({
  base: [
    "absolute top-0 right-0 bottom-0 w-1",
    "cursor-col-resize group",
    "hover:bg-gray-300 transition-colors",
    "flex items-center justify-center",
  ],
  variants: {
    isResizing: {
      true: "bg-blue-500",
      false: "bg-transparent hover:bg-gray-300",
    },
  },
});

const resizeIndicator = tv({
  base: [
    "w-0.5 h-8 bg-gray-400 rounded-full",
    "transition-all duration-150 ease-out",
    "group-hover:bg-gray-600 group-hover:h-12",
  ],
  variants: {
    isResizing: {
      true: "bg-blue-600 h-16",
      false: "",
    },
  },
});

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  isResizing: boolean;
  className?: string;
}

export function ResizeHandle({
  onMouseDown,
  isResizing,
  className,
}: ResizeHandleProps) {
  return (
    <div
      className={cn(resizeHandle({ isResizing }), className)}
      onMouseDown={onMouseDown}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar"
      title="Drag to resize sidebar"
    >
      <div className={resizeIndicator({ isResizing })} />
    </div>
  );
}
