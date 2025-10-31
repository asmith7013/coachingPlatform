import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface AccordionItemProps {
  title: string;
  content?: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export function AccordionItem({ title, content, isExpanded, onToggle }: AccordionItemProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-white text-gray-800 border border-gray-300">
          {title}
        </span>
        {isExpanded ? (
          <ChevronDownIcon className="w-4 h-4 text-gray-600 flex-shrink-0" />
        ) : (
          <ChevronRightIcon className="w-4 h-4 text-gray-600 flex-shrink-0" />
        )}
      </button>
      {isExpanded && content && (
        <div className="px-3 py-2 bg-white border-t border-gray-200">
          <p className="text-sm text-gray-600">{content}</p>
        </div>
      )}
    </div>
  );
}
