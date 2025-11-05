import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { ReactNode } from "react";

interface AccordionItemProps {
  title: string | ReactNode;
  content?: string | ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  showTitleBadge?: boolean;
}

export function AccordionItem({ title, content, isExpanded, onToggle, showTitleBadge = true }: AccordionItemProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        {showTitleBadge ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-white text-gray-800 border border-gray-300">
            {title}
          </span>
        ) : (
          <span className="text-xs font-semibold text-gray-800">
            {title}
          </span>
        )}
        {isExpanded ? (
          <ChevronDownIcon className="w-4 h-4 text-gray-600 flex-shrink-0" />
        ) : (
          <ChevronRightIcon className="w-4 h-4 text-gray-600 flex-shrink-0" />
        )}
      </button>
      {isExpanded && content && (
        <div className="px-3 py-2 bg-white border-t border-gray-200">
          {typeof content === 'string' ? (
            <p className="text-sm text-gray-600">{content}</p>
          ) : (
            content
          )}
        </div>
      )}
    </div>
  );
}
