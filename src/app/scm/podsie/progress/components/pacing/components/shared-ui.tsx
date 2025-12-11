"use client";

import { UserIcon } from "@heroicons/react/24/solid";
import { Tooltip } from "@/components/core/feedback/Tooltip";

// Reusable student count badge with optional tooltip
export function StudentCountBadge({
  count,
  badgeClass,
  tooltipContent,
  showTooltip,
  marginLeft = false,
}: {
  count: number;
  badgeClass: string;
  tooltipContent?: string;
  showTooltip?: boolean;
  marginLeft?: boolean;
}) {
  if (count === 0) return null;

  const badge = (
    <span className={`${marginLeft ? 'ml-1.5 ' : ''}text-[10px] ${badgeClass} px-1.5 py-0.5 rounded-full flex items-center gap-0.5 flex-shrink-0${showTooltip && tooltipContent ? ' cursor-help' : ''}`}>
      <UserIcon className="w-2.5 h-2.5" />
      {count}
    </span>
  );

  if (showTooltip && tooltipContent) {
    return <Tooltip content={tooltipContent}>{badge}</Tooltip>;
  }
  return badge;
}

// Render student icons or count
export function StudentIcons({
  count,
  iconClass,
  maxIcons = 7,
}: {
  count: number;
  iconClass: string;
  maxIcons?: number;
}) {
  if (count === 0) return null;

  if (count <= maxIcons) {
    return (
      <div className={`flex flex-wrap gap-px mt-1 ${iconClass}`}>
        {Array.from({ length: count }).map((_, i) => (
          <UserIcon key={i} className="w-2.5 h-2.5" />
        ))}
      </div>
    );
  }

  return (
    <span className={`text-[8px] ${iconClass} flex items-center gap-0.5 mt-1`}>
      <UserIcon className="w-2.5 h-2.5" />
      {count}
    </span>
  );
}

// Empty placeholder dash
export function EmptyPlaceholder({ textClass }: { textClass: string }) {
  return <span className={`text-[9px] ${textClass} opacity-30`}>—</span>;
}

// Format date as "M/D" (e.g., "12/8")
export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

// Outline version of PresentationChartLineIcon (not in heroicons)
export function PresentationChartLineOutlineIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
    </svg>
  );
}

// Activity row for showing today/yesterday icons
export function ActivityRow({
  todayIcon,
  yesterdayIcon,
  todayCount,
  yesterdayCount,
  iconColor,
}: {
  todayIcon: React.ReactNode;
  yesterdayIcon: React.ReactNode;
  todayCount: number;
  yesterdayCount: number;
  iconColor: string;
}) {
  if (todayCount === 0 && yesterdayCount === 0) {
    return <span className={`${iconColor} opacity-30`}>—</span>;
  }

  return (
    <div className="inline-flex items-center gap-0.5 flex-shrink-0">
      {todayCount > 0 && (
        todayCount <= 3 ? (
          Array.from({ length: todayCount }).map((_, i) => (
            <span key={`t-${i}`} className={`${iconColor} flex-shrink-0`}>{todayIcon}</span>
          ))
        ) : (
          <span className={`inline-flex items-center text-[9px] font-semibold flex-shrink-0 ${iconColor}`}>
            {todayCount}{todayIcon}
          </span>
        )
      )}
      {yesterdayCount > 0 && (
        yesterdayCount <= 3 ? (
          Array.from({ length: yesterdayCount }).map((_, i) => (
            <span key={`y-${i}`} className={`${iconColor} flex-shrink-0`}>{yesterdayIcon}</span>
          ))
        ) : (
          <span className={`inline-flex items-center text-[9px] font-semibold flex-shrink-0 ${iconColor}`}>
            {yesterdayCount}{yesterdayIcon}
          </span>
        )
      )}
    </div>
  );
}
