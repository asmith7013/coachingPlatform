interface AccordionItem {
  label: string;
  details?: string;
}

interface AccordionListProps {
  title: string;
  items: AccordionItem[];
  colorScheme: "red" | "green" | "blue" | "purple";
  accordionId: string;
  isExpanded: boolean;
  onToggle: () => void;
  completedCount?: number;
  renderItem?: (item: AccordionItem, index: number) => React.ReactNode;
}

export function AccordionList({
  title,
  items,
  colorScheme,
  isExpanded,
  onToggle,
  completedCount = 0,
  renderItem,
}: AccordionListProps) {
  const colorClasses = {
    red: {
      headerBg: "bg-red-100",
      headerText: "text-red-800",
      headerBorder: "border-red-200",
      icon: "text-red-600",
      itemBg: "bg-red-50",
      itemBorder: "border-red-100",
      itemText: "text-red-900",
      badgeBg: "bg-white text-red-700 border border-red-200",
    },
    green: {
      headerBg: "bg-green-100",
      headerText: "text-green-800",
      headerBorder: "border-green-200",
      icon: "text-green-600",
      itemBg: "bg-green-50",
      itemBorder: "border-green-100",
      itemText: "text-green-900",
      badgeBg: "bg-white text-green-700 border border-green-200",
    },
    blue: {
      headerBg: "bg-blue-100",
      headerText: "text-blue-800",
      headerBorder: "border-blue-200",
      icon: "text-blue-600",
      itemBg: "bg-blue-50",
      itemBorder: "border-blue-100",
      itemText: "text-blue-900",
      badgeBg: "bg-white text-blue-700 border border-blue-200",
    },
    purple: {
      headerBg: "bg-purple-100",
      headerText: "text-purple-800",
      headerBorder: "border-purple-200",
      icon: "text-purple-600",
      itemBg: "bg-purple-50",
      itemBorder: "border-purple-100",
      itemText: "text-purple-900",
      badgeBg: "bg-white text-purple-700 border border-purple-200",
    },
  }[colorScheme];

  const incompleteCount = items.length - completedCount;

  return (
    <div
      className={`border ${colorClasses.headerBorder} rounded-lg overflow-hidden`}
    >
      <button
        onClick={onToggle}
        className={`w-full ${colorClasses.headerBg} ${colorClasses.headerText} p-3 text-left flex items-center justify-between hover:opacity-80 transition-opacity`}
      >
        <div className="flex items-center gap-3">
          <h4 className="font-semibold text-sm">{title}</h4>
          <div className="flex items-center gap-1">
            {/* Complete Items Badge */}
            {completedCount > 0 && (
              <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <span>✓</span>
                <span>{completedCount}</span>
              </span>
            )}

            {/* Incomplete Items Badge */}
            {incompleteCount > 0 && (
              <span
                className={`${colorClasses.badgeBg} px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1`}
              >
                <span>○</span>
                <span>{incompleteCount}</span>
              </span>
            )}
          </div>
        </div>
        <span
          className={`${colorClasses.icon} transition-transform ${isExpanded ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="p-3 space-y-2 bg-white">
          {items.length > 0 ? (
            items.map((item, index) =>
              renderItem ? (
                renderItem(item, index)
              ) : (
                <div
                  key={index}
                  className={`${colorClasses.itemBg} ${colorClasses.itemBorder} border rounded-lg p-3`}
                >
                  <h5
                    className={`font-medium ${colorClasses.itemText} text-sm`}
                  >
                    {item.label}
                  </h5>
                  {item.details && (
                    <p className={`${colorClasses.itemText} text-xs mt-1`}>
                      {item.details}
                    </p>
                  )}
                </div>
              ),
            )
          ) : (
            <p className="text-gray-500 text-sm italic">
              No {title.toLowerCase()} found
            </p>
          )}
        </div>
      )}
    </div>
  );
}
