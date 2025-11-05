"use client";

import React from "react";
import { ActivityTypeConfig } from "@zod-schema/313/activity-type-config";

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
}

interface StudentGridProps {
  students: Student[];
  activityTypes: ActivityTypeConfig[];
  checkedState: {
    [studentId: string]: {
      [activityTypeId: string]: boolean;
    };
  };
  onCheckboxChange: (studentId: string, activityTypeId: string, checked: boolean) => void;
}

/**
 * Grid displaying students (rows) x activity types (columns) with checkboxes
 */
export function StudentGrid({
  students,
  activityTypes,
  checkedState,
  onCheckboxChange,
}: StudentGridProps) {
  if (students.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No students found for this section
      </div>
    );
  }

  if (activityTypes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No activity types configured. Use &ldquo;Manage Columns&rdquo; to add activity types.
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto border border-gray-200 rounded-lg shadow-sm">
      <table className="w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {/* Student Name Column */}
            <th
              scope="col"
              className="sticky left-0 z-20 bg-gray-50 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200"
              style={{ width: "140px", minWidth: "140px", maxWidth: "140px" }}
            >
              Student Name
            </th>

            {/* Activity Type Columns */}
            {activityTypes.map((type) => (
              <th
                key={type.typeId || type.id}
                scope="col"
                className="px-2 py-3 text-center text-xs font-medium uppercase tracking-tight"
                style={{
                  backgroundColor: `${type.color}10`,
                  color: type.color,
                  width: "80px",
                  maxWidth: "80px",
                  minWidth: "80px",
                }}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xl">{type.icon}</span>
                  <span className="text-[10px] leading-tight break-words hyphens-auto" style={{ wordBreak: "break-word" }}>
                    {type.label}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((student, studentIndex) => (
            <tr
              key={student._id}
              className={studentIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              {/* Student Name Cell */}
              <td
                className="sticky left-0 z-10 bg-inherit px-3 py-3 text-xs font-medium text-gray-900 border-r border-gray-200 overflow-hidden text-ellipsis"
                style={{ width: "140px", minWidth: "140px", maxWidth: "140px" }}
              >
                <div className="truncate" title={`${student.lastName}, ${student.firstName}`}>
                  {student.lastName}, {student.firstName}
                </div>
              </td>

              {/* Checkbox Cells */}
              {activityTypes.map((type) => (
                <td
                  key={`${student._id}-${type.typeId || type.id}`}
                  className="px-2 py-3 text-center"
                  style={{ width: "80px", maxWidth: "80px" }}
                >
                  <input
                    type="checkbox"
                    checked={
                      type.typeId ? (checkedState[student._id]?.[type.typeId] || false) : false
                    }
                    onChange={(e) =>
                      onCheckboxChange(
                        student._id,
                        type.typeId ?? "",
                        e.target.checked
                      )
                    }
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    aria-label={`${student.firstName} ${student.lastName} - ${type.label}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
