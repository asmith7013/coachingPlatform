"use client";

import { Tooltip } from "@/components/core/feedback/Tooltip";
import { DOMAIN_COLORS, STANDARD_DESCRIPTIONS } from "../constants";
import type { UnitStandardsData } from "../types";

interface StandardsByUnitTableProps {
  unitStandardsWithCounts: UnitStandardsData[] | null;
}

export function StandardsByUnitTable({
  unitStandardsWithCounts,
}: StandardsByUnitTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Standards by Unit
      </h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-1.5 font-medium text-gray-600">Unit</th>
            <th className="text-left py-1.5 font-medium text-gray-600">
              Standards Assessed
            </th>
          </tr>
        </thead>
        <tbody>
          {unitStandardsWithCounts ? (
            unitStandardsWithCounts.map((unit) => (
              <tr
                key={unit.unitNumber}
                className="border-b border-gray-100 align-top"
              >
                <td className="py-2 text-gray-700 whitespace-nowrap pr-2">
                  <div className="font-medium">Unit {unit.unitNumber}</div>
                </td>
                <td className="py-2">
                  {unit.domainGroups.length > 0 ? (
                    <div className="space-y-2">
                      {unit.domainGroups.map((group) => {
                        const colors =
                          DOMAIN_COLORS[group.domain] || DOMAIN_COLORS.Other;
                        return (
                          <div key={group.domain}>
                            <div
                              className={`text-xs font-medium mb-1 ${colors.text}`}
                            >
                              {group.label}:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {group.standards.map((std) => {
                                const description =
                                  STANDARD_DESCRIPTIONS[std.standard];
                                const tooltipContent = description
                                  ? `${std.standard}: ${description}`
                                  : std.standard;
                                return (
                                  <Tooltip
                                    key={std.standard}
                                    content={tooltipContent}
                                    position="top"
                                  >
                                    <span
                                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-xs cursor-help ${colors.bg} ${colors.border} ${colors.text}`}
                                    >
                                      <span>{std.shortForm}</span>
                                      <span
                                        className={`text-[9px] font-bold text-white px-1 py-0.5 rounded-full min-w-[16px] text-center ${colors.badge}`}
                                      >
                                        {std.count}
                                      </span>
                                    </span>
                                  </Tooltip>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">
                      No assessed standards
                    </span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={2}
                className="py-4 text-center text-gray-400 text-xs"
              >
                Select a grade to view data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
