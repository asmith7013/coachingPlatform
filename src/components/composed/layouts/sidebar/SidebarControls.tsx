import { ArrowsPointingInIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';

interface SidebarControlsProps {
  isAtMinWidth: boolean;
  isAtMaxWidth: boolean;
  onReset: () => void;
}

export function SidebarControls({ 
  isAtMinWidth, 
  isAtMaxWidth: _isAtMaxWidth, 
  onReset 
}: SidebarControlsProps) {
  return (
    <div className="flex items-center gap-1 px-2 py-1">
      <button
        onClick={onReset}
        title="Reset sidebar width"
        className="p-1 rounded hover:bg-gray-100 transition-colors"
      >
        {isAtMinWidth ? (
          <ArrowsPointingOutIcon className="h-3 w-3 text-gray-500" />
        ) : (
          <ArrowsPointingInIcon className="h-3 w-3 text-gray-500" />
        )}
      </button>
    </div>
  );
} 