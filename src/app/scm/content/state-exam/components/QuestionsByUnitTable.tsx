"use client";

import type { UnitDistributionData } from "../types";

interface QuestionsByUnitTableProps {
  unitDistribution: UnitDistributionData | null;
  selectedUnit: number | null;
}

export function QuestionsByUnitTable({
  unitDistribution,
  selectedUnit,
}: QuestionsByUnitTableProps) {
  const totalUnmatched =
    unitDistribution?.unmatchedQuestions.reduce((sum, q) => sum + q.count, 0) ||
    0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Questions by Unit
      </h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-1.5 font-medium text-gray-600"></th>
            <th className="text-center py-1.5 font-medium text-gray-600">MC</th>
            <th className="text-center py-1.5 font-medium text-gray-600">CR</th>
            <th className="text-center py-1.5 font-medium text-gray-400 text-xs">
              MC %
            </th>
            <th className="text-center py-1.5 font-medium text-gray-400 text-xs">
              CR %
            </th>
            <th className="text-center py-1.5 font-medium text-gray-600 text-xs">
              Total %
            </th>
          </tr>
        </thead>
        <tbody>
          {unitDistribution ? (
            unitDistribution.rows.map((row) => {
              const maxMcPct = Math.max(
                ...unitDistribution.rows.map((r) => r.mcPct),
              );
              const maxCrPct = Math.max(
                ...unitDistribution.rows.map((r) => r.crPct),
              );
              const getMcColor = (pct: number) => {
                if (pct === 0) return "";
                if (pct >= maxMcPct * 0.8) return "bg-green-100 text-green-800";
                if (pct >= maxMcPct * 0.5)
                  return "bg-yellow-100 text-yellow-800";
                return "bg-red-100 text-red-800";
              };
              const getCrColor = (pct: number) => {
                if (pct === 0) return "";
                if (pct >= maxCrPct * 0.8) return "bg-green-100 text-green-800";
                if (pct >= maxCrPct * 0.5)
                  return "bg-yellow-100 text-yellow-800";
                return "bg-red-100 text-red-800";
              };
              const totalQuestions =
                unitDistribution.totalMC + unitDistribution.totalCR;
              const combinedPct =
                totalQuestions > 0
                  ? Math.round(((row.mc + row.cr) / totalQuestions) * 100)
                  : 0;
              const maxCombinedPct = Math.max(
                ...unitDistribution.rows.map((r) =>
                  totalQuestions > 0
                    ? Math.round(((r.mc + r.cr) / totalQuestions) * 100)
                    : 0,
                ),
              );
              const getCombinedColor = (pct: number) => {
                if (pct === 0) return "";
                if (pct >= maxCombinedPct * 0.8)
                  return "bg-green-100 text-green-800";
                if (pct >= maxCombinedPct * 0.5)
                  return "bg-yellow-100 text-yellow-800";
                return "bg-red-100 text-red-800";
              };
              return (
                <tr
                  key={row.unitNumber}
                  className={`border-b border-gray-100 ${
                    selectedUnit === row.unitNumber ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="py-1.5 text-gray-700">
                    Unit {row.unitNumber}
                  </td>
                  <td className="text-center py-1.5 text-gray-900 font-medium">
                    {row.mc}
                  </td>
                  <td className="text-center py-1.5 text-gray-900 font-medium">
                    {row.cr}
                  </td>
                  <td
                    className={`text-center py-1.5 text-xs rounded ${getMcColor(row.mcPct)}`}
                  >
                    {row.mcPct}%
                  </td>
                  <td
                    className={`text-center py-1.5 text-xs rounded ${getCrColor(row.crPct)}`}
                  >
                    {row.crPct}%
                  </td>
                  <td
                    className={`text-center py-1.5 text-xs font-medium rounded ${getCombinedColor(combinedPct)}`}
                  >
                    {combinedPct}%
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={6}
                className="py-4 text-center text-gray-400 text-xs"
              >
                Select a grade to view data
              </td>
            </tr>
          )}
        </tbody>
        {unitDistribution && (
          <tfoot>
            <tr className="border-t border-gray-300 font-semibold">
              <td className="py-1.5 text-gray-700">Total</td>
              <td className="text-center py-1.5 text-gray-900">
                {unitDistribution.totalMC}
              </td>
              <td className="text-center py-1.5 text-gray-900">
                {unitDistribution.totalCR}
              </td>
              <td className="text-center py-1.5 text-gray-400"></td>
              <td className="text-center py-1.5 text-gray-400"></td>
              <td className="text-center py-1.5 text-gray-900 text-xs">100%</td>
            </tr>
          </tfoot>
        )}
      </table>

      {/* Unmatched Questions Section */}
      {unitDistribution && unitDistribution.unmatchedQuestions.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-amber-700">
              Not in curriculum
            </span>
            <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              {totalUnmatched} question{totalUnmatched !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {unitDistribution.unmatchedQuestions.map((uq) => (
              <span
                key={uq.standard}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-amber-50 border border-amber-200 text-amber-800"
                title={`${uq.count} ${uq.questionType} question${uq.count !== 1 ? "s" : ""}`}
              >
                <span>{uq.standard}</span>
                <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-1 py-0.5 rounded-full">
                  {uq.count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
