import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "./utils";

type NavigationProps = {
  currentDate: Date;
  prevMonth: () => void;
  nextMonth: () => void;
  setCurrentDate: (date: Date) => void;
};

const Navigation: React.FC<NavigationProps> = ({
  currentDate,
  prevMonth,
  nextMonth,
  setCurrentDate,
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-semibold">
        {formatDate(currentDate, "MMMM yyyy")}
      </h2>
      <div className="flex space-x-2">
        <button
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={() => setCurrentDate(new Date())}
          className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
        >
          Today
        </button>
        <button
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default Navigation;
