interface ProgressBarSegment {
  percentage: number;
  color: "green" | "purple" | "blue";
  widthPercent: number; // Percentage of total width this segment takes (e.g., 35 for 35%)
}

interface SmartboardProgressBarProps {
  label: string;
  sublabel?: string;
  percentage?: number; // For single bar mode
  color?: "green" | "purple" | "blue"; // For single bar mode
  segments?: ProgressBarSegment[]; // For multi-bar mode
  size?: "normal" | "small" | "mini" | "split";
  showLabel?: boolean;
}

export function SmartboardProgressBar({
  label,
  sublabel,
  percentage,
  color = "green",
  segments,
  size = "normal",
  showLabel = true,
}: SmartboardProgressBarProps) {
  const getColorClasses = (barColor: string) => {
    const bgColor = barColor === "purple" ? "bg-purple-600" : barColor === "blue" ? "bg-blue-600" : "bg-emerald-500";
    const trackColor = barColor === "purple" ? "bg-purple-200" : barColor === "blue" ? "bg-blue-200" : "bg-white";
    return { bgColor, trackColor };
  };

  const { bgColor, trackColor } = getColorClasses(color);
  const isSmall = size === "small";
  const isMini = size === "mini";
  const isSplit = size === "split";

  // Split bar mode - multiple segments with configurable widths
  if (isSplit && segments && segments.length > 0) {
    return (
      <div className="space-y-2">
        {/* Title */}
        {showLabel && (
          <div className="text-white font-semibold text-sm leading-tight">
            {label}
          </div>
        )}
        {/* Split Progress Bars */}
        <div className="flex items-center gap-6">
          {segments.map((segment, index) => {
            const { bgColor: segmentBgColor, trackColor: segmentTrackColor } = getColorClasses(segment.color);
            return (
              <div key={index} style={{ width: `${segment.widthPercent}%` }} className="flex items-center gap-2">
                <div className={`${segmentTrackColor} rounded-full relative overflow-hidden h-8 flex-1`}>
                  <div
                    className={`${segmentBgColor} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(segment.percentage, 5)}%` }}
                  />
                </div>
                <span className="text-white font-bold text-xs whitespace-nowrap">
                  {segment.percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (isMini) {
    // Extra small layout for mini bars (like Zearn)
    const safePercentage = percentage ?? 0;
    return (
      <div className="space-y-1">
        {/* Title */}
        {showLabel && (
          <div className="text-white font-medium text-xs leading-tight">
            {label}
          </div>
        )}
        {/* Progress bar */}
        <div className="flex items-center gap-1">
          <div className={`flex-1 ${trackColor} rounded-full relative overflow-hidden h-4`}>
            <div
              className={`${bgColor} h-full rounded-full transition-all duration-500`}
              style={{ width: `${Math.max(safePercentage, 5)}%` }}
            />
          </div>
          <span className="text-white font-semibold text-xs ml-1">{safePercentage}%</span>
        </div>
      </div>
    );
  }

  if (isSmall) {
    // Stacked layout for small bars
    const safePercentage = percentage ?? 0;
    return (
      <div className="space-y-2">
        {/* Title */}
        {showLabel && (
          <div className="text-white font-semibold text-sm leading-tight">
            {label}
          </div>
        )}
        {/* Progress bar */}
        <div className="flex items-center gap-1">
          <div className={`flex-1 ${trackColor} rounded-full relative overflow-hidden h-8`}>
            <div
              className={`${bgColor} h-full rounded-full transition-all duration-500`}
              style={{ width: `${Math.max(safePercentage, 5)}%` }}
            />
          </div>
          <span className="text-white font-bold text-sm ml-1">{safePercentage}%</span>
        </div>
      </div>
    );
  }

  // Horizontal layout for normal bars
  const safePercentage = percentage ?? 0;
  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <div className="w-32 text-white">
          <div className="font-bold text-lg">{label}</div>
          {sublabel && (
            <div className="text-indigo-300 truncate text-xs">{sublabel}</div>
          )}
        </div>
      )}
      <div className={`flex-1 ${trackColor} rounded-full relative overflow-hidden h-10`}>
        <div
          className={`${bgColor} h-full rounded-full transition-all duration-500`}
          style={{ width: `${Math.max(safePercentage, 5)}%` }}
        />
      </div>
      <span className="text-white font-bold text-xl ml-1">{safePercentage}%</span>
    </div>
  );
}
