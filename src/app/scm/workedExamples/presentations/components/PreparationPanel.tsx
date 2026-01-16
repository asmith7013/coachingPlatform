'use client';

import { PLANNING_STEPS } from '../planningSteps';

interface PreparationPanelProps {
  onClose: () => void;
}

export function PreparationPanel({ onClose }: PreparationPanelProps) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-600 border-b border-blue-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 text-white/80"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
            />
          </svg>
          <h2 className="font-semibold text-sm text-white">Planning Guide</h2>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center hover:bg-blue-700 rounded transition-colors cursor-pointer text-white/80"
          aria-label="Close planning guide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Steps - Blue/White theme matching accordion */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-blue-50">
        {PLANNING_STEPS.map((step) => (
          <div
            key={step.step}
            className="bg-white border border-blue-100 rounded-lg p-3 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex-shrink-0">
                {step.step}
              </span>
              <h3 className="font-semibold text-sm text-gray-900">{step.title}</h3>
            </div>
            <ul className="space-y-1.5 mt-3">
              {step.items.map((item, idx) => (
                <li key={idx} className="flex items-start text-xs text-gray-600">
                  <span className="mr-2 text-blue-400 text-sm">•</span>
                  <span>{item}</span>
                </li>
              ))}
              {step.subItems && (
                <ul className="ml-4 mt-1 space-y-1">
                  {step.subItems.map((subItem, idx) => (
                    <li key={idx} className="flex items-start text-xs text-gray-500">
                      <span className="mr-2 text-gray-300">–</span>
                      <span>{subItem}</span>
                    </li>
                  ))}
                </ul>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
