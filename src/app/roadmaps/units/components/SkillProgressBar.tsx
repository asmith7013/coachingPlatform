"use client";

interface SkillProgressBarProps {
  skillNumber: string;
  masteredCount: number;
  totalCount: number;
  color: "purple" | "pink" | "cyan" | "support";
  size?: "small" | "large";
}

export function SkillProgressBar({
  skillNumber,
  masteredCount,
  totalCount,
  color,
  size = "small"
}: SkillProgressBarProps) {
  const percentage = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  // Color mappings
  const colorClasses = {
    purple: "bg-purple-600",
    pink: "bg-pink-600",
    cyan: "bg-cyan-600",
    support: "bg-skill-support"
  };

  // Size mappings
  const circleSize = size === "large" ? "w-14 h-14" : "w-8 h-8";
  const textSize = size === "large" ? "text-lg" : "text-xs";

  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`inline-flex items-center justify-center ${circleSize} rounded-full ${colorClasses[color]} text-white ${textSize} font-bold`}>
        {skillNumber}
      </span>
      <div className="w-16 bg-gray-200 rounded-full h-1.5">
        <div
          className={`${colorClasses[color]} h-1.5 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-[9px] font-bold text-gray-500">
        {percentage}%
      </span>
    </div>
  );
}
