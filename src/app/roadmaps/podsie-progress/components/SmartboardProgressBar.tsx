interface SmartboardProgressBarProps {
  label: string;
  sublabel?: string;
  percentage: number;
  color?: "green" | "purple";
  size?: "normal" | "small";
  showLabel?: boolean;
}

export function SmartboardProgressBar({
  label,
  sublabel,
  percentage,
  color = "green",
  size = "normal",
  showLabel = true,
}: SmartboardProgressBarProps) {
  const bgColor = color === "purple" ? "bg-purple-600" : "bg-emerald-500";
  const trackColor = color === "purple" ? "bg-purple-200" : "bg-white";
  const isSmall = size === "small";

  if (isSmall) {
    // Stacked layout for small bars
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
              style={{ width: `${Math.max(percentage, 5)}%` }}
            />
          </div>
          <span className="text-white font-bold text-sm ml-1">{percentage}%</span>
        </div>
      </div>
    );
  }

  // Horizontal layout for normal bars
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
          style={{ width: `${Math.max(percentage, 5)}%` }}
        />
      </div>
      <span className="text-white font-bold text-xl ml-1">{percentage}%</span>
    </div>
  );
}
