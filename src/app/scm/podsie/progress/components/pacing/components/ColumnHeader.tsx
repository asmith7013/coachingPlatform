"use client";

import { TrophyIcon } from "@heroicons/react/24/outline";
import { getZoneStyles } from "./zone-styles";
import { StudentCountBadge } from "./shared-ui";
import type { ColumnConfig } from "./types";

export function ColumnHeader({ config }: { config: ColumnConfig }) {
  const styles = getZoneStyles(config.zone);

  const widthStyle = config.isFixedWidth
    ? { width: config.width, flexShrink: 0 }
    : { width: `${config.width}%` };

  const borderClasses = config.isCompleteColumn
    ? `border-l ${styles.border}`
    : !config.isLastColumn
      ? `border-r ${styles.border}`
      : "";

  return (
    <div
      className={`${styles.headerBg} ${borderClasses} flex items-center justify-between px-3`}
      style={widthStyle}
    >
      {config.isCompleteColumn ? (
        <>
          <TrophyIcon className={`w-4 h-4 ${styles.lessonIcon}`} />
          <StudentCountBadge
            count={config.totalStudents}
            badgeClass={styles.studentBadge}
          />
        </>
      ) : (
        <>
          <div className="flex items-center">
            <span
              className={`w-2.5 h-2.5 rounded-full ${styles.dotColor} mr-2 flex-shrink-0`}
            />
            <span className={`text-sm ${styles.text} truncate`}>
              {config.headerLabel}
            </span>
          </div>
          <StudentCountBadge
            count={config.totalStudents}
            badgeClass={styles.studentBadge}
          />
        </>
      )}
    </div>
  );
}
