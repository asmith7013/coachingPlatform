"use client";

import { MdPrint, MdClose } from "react-icons/md";

interface PrintSelectionFooterProps {
  selectedCount: number;
  onClear: () => void;
  onPrint: () => void;
  isPrinting?: boolean;
}

export function PrintSelectionFooter({
  selectedCount,
  onClear,
  onPrint,
  isPrinting = false,
}: PrintSelectionFooterProps) {
  // Only show when there are selections
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-blue-300 shadow-lg bg-white">
      <div className="px-6 py-3 bg-blue-50 flex items-center justify-between">
        {/* Left: Selection count and clear button */}
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold text-blue-700">
            {selectedCount} {selectedCount === 1 ? "question" : "questions"} selected
          </span>
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
          >
            <MdClose size={16} />
            Clear selection
          </button>
        </div>

        {/* Right: Print button */}
        <button
          onClick={onPrint}
          disabled={isPrinting}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <MdPrint size={20} />
          {isPrinting ? "Preparing..." : "Print Questions"}
        </button>
      </div>
    </div>
  );
}
