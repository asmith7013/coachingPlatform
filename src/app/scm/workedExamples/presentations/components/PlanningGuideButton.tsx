'use client';

interface PlanningGuideButtonProps {
  isActive: boolean;
  onToggle: () => void;
}

export function PlanningGuideButton({ isActive, onToggle }: PlanningGuideButtonProps) {
  return (
    <div className="relative group">
      <button
        onClick={onToggle}
        className={`print-hide w-10 h-10 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
          isActive
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-white'
        }`}
        aria-label={isActive ? 'Hide Planning Guide' : 'Show Planning Guide'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-[18px] h-[18px]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
          />
        </svg>
      </button>
      {/* Tooltip - appears above */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Planning Guide
      </div>
    </div>
  );
}
