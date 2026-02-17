import React from "react";
import { Calendar as CalendarIcon, List, LayoutList } from "lucide-react";

type ViewMode = "calendar" | "table" | "list";

type ViewToggleProps = {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
};

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, setViewMode }) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => setViewMode("calendar")}
        className={`px-4 py-2 rounded-md flex items-center gap-2 ${viewMode === "calendar" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
      >
        <CalendarIcon size={18} />
        <span>Calendar View</span>
      </button>
      <button
        onClick={() => setViewMode("table")}
        className={`px-4 py-2 rounded-md flex items-center gap-2 ${viewMode === "table" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
      >
        <List size={18} />
        <span>Table View</span>
      </button>
      <button
        onClick={() => setViewMode("list")}
        className={`px-4 py-2 rounded-md flex items-center gap-2 ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
      >
        <LayoutList size={18} />
        <span>List View</span>
      </button>
    </div>
  );
};

export default ViewToggle;
