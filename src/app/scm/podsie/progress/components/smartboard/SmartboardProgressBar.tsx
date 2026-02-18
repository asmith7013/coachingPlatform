interface ProgressBarSegment {
  percentage: number;
  todayPercentage?: number; // Progress made today (will show as darker overlay)
  color: "green" | "purple" | "blue" | "teal";
  widthPercent: number; // Percentage of total width this segment takes (e.g., 35 for 35%)
}

interface SmartboardProgressBarProps {
  label: string;
  sublabel?: string;
  percentage?: number; // For single bar mode
  todayPercentage?: number; // For single bar mode - progress made today
  color?: "green" | "purple" | "blue" | "teal"; // For single bar mode
  segments?: ProgressBarSegment[]; // For multi-bar mode
  size?: "normal" | "small" | "mini" | "split";
  showLabel?: boolean;
  textSizeLevel?: number; // -1 = smaller, 0 = normal, 1 = larger
}

export function SmartboardProgressBar({
  label,
  sublabel,
  percentage,
  todayPercentage,
  color = "green",
  segments,
  size = "normal",
  showLabel = true,
  textSizeLevel = 0,
}: SmartboardProgressBarProps) {
  // Text size helper based on textSizeLevel (-1, 0, 1, 2)
  const getTextSize = (
    smaller: string,
    normal: string,
    larger: string,
    extraLarge: string,
  ) => {
    if (textSizeLevel === 2) return extraLarge;
    if (textSizeLevel === 1) return larger;
    if (textSizeLevel === -1) return smaller;
    return normal;
  };
  const getColorClasses = (barColor: string) => {
    const bgColor =
      barColor === "purple"
        ? "bg-purple-600"
        : barColor === "blue"
          ? "bg-blue-600"
          : barColor === "teal"
            ? "bg-teal-500"
            : "bg-emerald-500";
    const bgColorDark =
      barColor === "purple"
        ? "bg-purple-800"
        : barColor === "blue"
          ? "bg-blue-800"
          : barColor === "teal"
            ? "bg-teal-700"
            : "bg-emerald-700";
    const trackColor =
      barColor === "purple"
        ? "bg-purple-200"
        : barColor === "blue"
          ? "bg-blue-200"
          : barColor === "teal"
            ? "bg-teal-100"
            : "bg-emerald-200";
    return { bgColor, bgColorDark, trackColor };
  };

  const { bgColor, bgColorDark, trackColor } = getColorClasses(color);
  const isSmall = size === "small";
  const isMini = size === "mini";
  const isSplit = size === "split";

  // Split bar mode - multiple segments with configurable widths
  if (isSplit && segments && segments.length > 0) {
    return (
      <div className="space-y-2">
        {/* Title */}
        {showLabel && (
          <div
            className={`text-white font-semibold leading-tight ${getTextSize("text-xs", "text-sm", "text-base", "text-lg")}`}
          >
            {label}
          </div>
        )}
        {/* Split Progress Bars */}
        <div className="flex items-center gap-6">
          {segments.map((segment, index) => {
            const {
              bgColor: segmentBgColor,
              bgColorDark: segmentBgColorDark,
              trackColor: segmentTrackColor,
            } = getColorClasses(segment.color);
            const todayProgress = segment.todayPercentage ?? 0;
            const baseProgress = segment.percentage - todayProgress;

            return (
              <div
                key={index}
                style={{ width: `${segment.widthPercent}%` }}
                className="flex items-center gap-2"
              >
                <div
                  className={`${segmentTrackColor} rounded-full relative overflow-hidden ${getTextSize("h-6", "h-8", "h-10", "h-12")} flex-1`}
                >
                  {/* Base progress (lighter color for old progress) */}
                  <div
                    className={`${segmentBgColor} h-full transition-all duration-500 absolute left-0`}
                    style={{
                      width: `${Math.max(baseProgress, 0)}%`,
                      borderRadius:
                        todayProgress > 0 ? "9999px 0 0 9999px" : "9999px",
                    }}
                  />
                  {/* Today's progress (darker color bar) */}
                  {todayProgress > 0 && (
                    <div
                      className={`${segmentBgColorDark} h-full transition-all duration-500 absolute`}
                      style={{
                        left: `${Math.max(baseProgress, 0)}%`,
                        width: `${todayProgress}%`,
                        borderRadius: "0 9999px 9999px 0",
                      }}
                    />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-white font-bold whitespace-nowrap ${getTextSize("text-[10px]", "text-xs", "text-sm", "text-base")}`}
                  >
                    {segment.percentage}%
                  </span>
                  <span
                    className={`bg-white/20 text-white font-bold px-1.5 py-0.5 rounded ${getTextSize("text-[8px]", "text-[10px]", "text-xs", "text-sm")} ${todayProgress === 0 ? "invisible" : ""}`}
                  >
                    +{todayProgress}%
                  </span>
                </div>
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
    const safeTodayPercentage = todayPercentage ?? 0;
    const baseProgress = safePercentage - safeTodayPercentage;

    return (
      <div className="space-y-1">
        {/* Title */}
        {showLabel && (
          <div
            className={`text-white font-medium leading-tight ${getTextSize("text-[10px]", "text-xs", "text-sm", "text-base")}`}
          >
            {label}
          </div>
        )}
        {/* Progress bar */}
        <div className="flex items-center gap-1">
          <div
            className={`flex-1 ${trackColor} rounded-full relative overflow-hidden ${getTextSize("h-3", "h-4", "h-5", "h-6")}`}
          >
            {/* Base progress (lighter color for old progress) */}
            <div
              className={`${bgColor} h-full transition-all duration-500 absolute left-0`}
              style={{
                width: `${Math.max(baseProgress, 0)}%`,
                borderRadius:
                  safeTodayPercentage > 0 ? "9999px 0 0 9999px" : "9999px",
              }}
            />
            {/* Today's progress (darker color bar) */}
            {safeTodayPercentage > 0 && (
              <div
                className={`${bgColorDark} h-full transition-all duration-500 absolute`}
                style={{
                  left: `${Math.max(baseProgress, 0)}%`,
                  width: `${safeTodayPercentage}%`,
                  borderRadius: "0 9999px 9999px 0",
                }}
              />
            )}
          </div>
          <div className="flex items-center gap-1 ml-1">
            <span
              className={`text-white font-semibold ${getTextSize("text-[8px]", "text-[10px]", "text-xs", "text-sm")}`}
            >
              {safePercentage}%
            </span>
            <span
              className={`bg-white/20 text-white font-bold px-1 py-0.5 rounded ${getTextSize("text-[6px]", "text-[8px]", "text-[10px]", "text-xs")} ${safeTodayPercentage === 0 ? "invisible" : ""}`}
            >
              +{safeTodayPercentage}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (isSmall) {
    // Stacked layout for small bars
    const safePercentage = percentage ?? 0;
    const safeTodayPercentage = todayPercentage ?? 0;
    const baseProgress = safePercentage - safeTodayPercentage;

    return (
      <div className="space-y-2">
        {/* Title */}
        {showLabel && (
          <div
            className={`text-white font-semibold leading-tight ${getTextSize("text-xs", "text-sm", "text-base", "text-lg")}`}
          >
            {label}
          </div>
        )}
        {/* Progress bar */}
        <div className="flex items-center gap-1">
          <div
            className={`flex-1 ${trackColor} rounded-full relative overflow-hidden ${getTextSize("h-6", "h-8", "h-10", "h-12")}`}
          >
            {/* Base progress (lighter color for old progress) */}
            <div
              className={`${bgColor} h-full transition-all duration-500 absolute left-0`}
              style={{
                width: `${Math.max(baseProgress, 0)}%`,
                borderRadius:
                  safeTodayPercentage > 0 ? "9999px 0 0 9999px" : "9999px",
              }}
            />
            {/* Today's progress (darker color bar) */}
            {safeTodayPercentage > 0 && (
              <div
                className={`${bgColorDark} h-full transition-all duration-500 absolute`}
                style={{
                  left: `${Math.max(baseProgress, 0)}%`,
                  width: `${safeTodayPercentage}%`,
                  borderRadius: "0 9999px 9999px 0",
                }}
              />
            )}
          </div>
          <div className="flex items-center gap-1 ml-1">
            <span
              className={`text-white font-bold ${getTextSize("text-[10px]", "text-xs", "text-sm", "text-base")}`}
            >
              {safePercentage}%
            </span>
            <span
              className={`bg-white/20 text-white font-bold px-1.5 py-0.5 rounded ${getTextSize("text-[8px]", "text-[10px]", "text-xs", "text-sm")} ${safeTodayPercentage === 0 ? "invisible" : ""}`}
            >
              +{safeTodayPercentage}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Horizontal layout for normal bars
  const safePercentage = percentage ?? 0;
  const safeTodayPercentage = todayPercentage ?? 0;
  const baseProgress = safePercentage - safeTodayPercentage;

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <div className="w-32 text-white">
          <div
            className={`font-bold ${getTextSize("text-base", "text-lg", "text-xl", "text-2xl")}`}
          >
            {label}
          </div>
          {sublabel && (
            <div
              className={`text-indigo-300 truncate ${getTextSize("text-[10px]", "text-xs", "text-sm", "text-base")}`}
            >
              {sublabel}
            </div>
          )}
        </div>
      )}
      <div
        className={`flex-1 ${trackColor} rounded-full relative overflow-hidden ${getTextSize("h-8", "h-10", "h-12", "h-14")}`}
      >
        {/* Base progress (lighter color for old progress) */}
        <div
          className={`${bgColor} h-full transition-all duration-500 absolute left-0`}
          style={{
            width: `${Math.max(baseProgress, 0)}%`,
            borderRadius:
              safeTodayPercentage > 0 ? "9999px 0 0 9999px" : "9999px",
          }}
        />
        {/* Today's progress (darker color bar) */}
        {safeTodayPercentage > 0 && (
          <div
            className={`${bgColorDark} h-full transition-all duration-500 absolute`}
            style={{
              left: `${Math.max(baseProgress, 0)}%`,
              width: `${safeTodayPercentage}%`,
              borderRadius: "0 9999px 9999px 0",
            }}
          />
        )}
      </div>
      <div className="flex items-center gap-1 ml-1">
        <span
          className={`text-white font-bold ${getTextSize("text-base", "text-lg", "text-xl", "text-2xl")}`}
        >
          {safePercentage}%
        </span>
        <span
          className={`bg-white/20 text-white font-bold px-2 py-0.5 rounded ${getTextSize("text-xs", "text-sm", "text-base", "text-lg")} ${safeTodayPercentage === 0 ? "invisible" : ""}`}
        >
          +{safeTodayPercentage}%
        </span>
      </div>
    </div>
  );
}
