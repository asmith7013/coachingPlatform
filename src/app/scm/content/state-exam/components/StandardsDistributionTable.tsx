"use client";

import React from "react";
import type { StandardsDistribution } from "../types";

interface StandardsDistributionTableProps {
  standardsDistribution: StandardsDistribution | null;
  expandedDomains: Set<string>;
  onToggleDomain: (domain: string) => void;
}

export function StandardsDistributionTable({
  standardsDistribution,
  expandedDomains,
  onToggleDomain,
}: StandardsDistributionTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Standards Distribution
      </h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-1.5 font-medium text-gray-600">
              Standard
            </th>
            <th className="text-center py-1.5 font-medium text-gray-600">MC</th>
            <th className="text-center py-1.5 font-medium text-gray-600">CR</th>
            <th className="text-center py-1.5 font-medium text-gray-400 text-xs">
              %
            </th>
          </tr>
        </thead>
        <tbody>
          {standardsDistribution ? (
            standardsDistribution.domains.map((domain) => {
              const grandTotal =
                standardsDistribution.grandTotalMC +
                standardsDistribution.grandTotalCR;
              const domainPct =
                grandTotal > 0
                  ? Math.round((domain.total / grandTotal) * 100)
                  : 0;
              const isExpanded = expandedDomains.has(domain.domain);
              return (
                <React.Fragment key={domain.domain}>
                  {/* Domain Header Row - Clickable Accordion */}
                  <tr
                    className="bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => onToggleDomain(domain.domain)}
                  >
                    <td className="py-1.5 font-semibold text-gray-900">
                      <span className="inline-flex items-center gap-1">
                        <svg
                          className={`w-3 h-3 text-gray-500 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                        {domain.domain}
                      </span>
                      <span className="font-normal text-xs text-gray-500 ml-1">
                        ({domain.label})
                      </span>
                    </td>
                    <td className="text-center py-1.5 text-xs font-semibold text-gray-700">
                      {domain.totalMC}
                    </td>
                    <td className="text-center py-1.5 text-xs font-semibold text-gray-700">
                      {domain.totalCR}
                    </td>
                    <td className="text-center py-1.5 text-xs font-semibold text-gray-700">
                      {domainPct}%
                    </td>
                  </tr>
                  {/* Individual Standards - Only show when expanded */}
                  {isExpanded &&
                    domain.standards.map((std) => {
                      const stdTotal = std.mc + std.cr;
                      const stdPct =
                        grandTotal > 0
                          ? Math.round((stdTotal / grandTotal) * 100)
                          : 0;
                      const maxStdTotal = Math.max(
                        ...standardsDistribution.domains.flatMap((d) =>
                          d.standards.map((s) => s.mc + s.cr),
                        ),
                      );
                      const getColor = () => {
                        if (stdTotal === 0) return "";
                        if (stdTotal >= maxStdTotal * 0.8)
                          return "bg-green-100 text-green-800";
                        if (stdTotal >= maxStdTotal * 0.5)
                          return "bg-yellow-100 text-yellow-800";
                        return "bg-red-100 text-red-800";
                      };
                      return (
                        <tr
                          key={std.standard}
                          className="border-b border-gray-100"
                        >
                          <td className="py-1 pl-5 text-gray-700 text-xs">
                            {std.standard.replace(/^\d+\./, "")}
                          </td>
                          <td className="text-center py-1 text-gray-900 font-medium text-xs">
                            {std.mc}
                          </td>
                          <td className="text-center py-1 text-gray-900 font-medium text-xs">
                            {std.cr}
                          </td>
                          <td
                            className={`text-center py-1 text-xs rounded ${getColor()}`}
                          >
                            {stdPct}%
                          </td>
                        </tr>
                      );
                    })}
                </React.Fragment>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={4}
                className="py-4 text-center text-gray-400 text-xs"
              >
                Select a grade to view data
              </td>
            </tr>
          )}
        </tbody>
        {standardsDistribution && (
          <tfoot>
            <tr className="border-t border-gray-300 font-semibold">
              <td className="py-1.5 text-gray-700">Total</td>
              <td className="text-center py-1.5 text-gray-900">
                {standardsDistribution.grandTotalMC}
              </td>
              <td className="text-center py-1.5 text-gray-900">
                {standardsDistribution.grandTotalCR}
              </td>
              <td className="text-center py-1.5 text-gray-400"></td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
