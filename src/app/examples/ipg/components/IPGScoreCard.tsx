"use client";

import { tv } from "tailwind-variants";

const scoreCardVariants = tv({
  slots: {
    container:
      "flex items-center justify-between p-4 rounded-lg border border-gray-200 min-h-[80px]",
    label: "text-lg font-medium text-gray-900",
    scoreContainer:
      "flex items-center justify-center w-16 h-16 rounded-lg text-white font-bold text-xl",
    yesNoContainer: "px-4 py-2 rounded-lg text-white font-medium",
  },
  variants: {
    score: {
      1: { scoreContainer: "bg-red-600" },
      2: { scoreContainer: "bg-orange-400" },
      3: { scoreContainer: "bg-green-400" },
      4: { scoreContainer: "bg-green-600" },
      null: { scoreContainer: "bg-gray-300 text-gray-600" },
    },
    yesNo: {
      Yes: { yesNoContainer: "bg-green-600" },
      No: { yesNoContainer: "bg-red-600" },
      null: { yesNoContainer: "bg-gray-300 text-gray-600" },
    },
  },
});

interface IPGScoreCardProps {
  label: string;
  score?: number | null;
  yesNo?: string | null;
}

export function IPGScoreCard({ label, score, yesNo }: IPGScoreCardProps) {
  const {
    container,
    label: labelClass,
    scoreContainer,
    yesNoContainer,
  } = scoreCardVariants();

  return (
    <div className={container()}>
      <div className={labelClass()}>{label}</div>

      {score !== undefined ? (
        <div
          className={scoreContainer({
            score: score ? (score as 1 | 2 | 3 | 4) : "null",
          })}
        >
          {score || "N/A"}
        </div>
      ) : (
        <div
          className={yesNoContainer({
            yesNo: yesNo ? (yesNo as "Yes" | "No") : "null",
          })}
        >
          {yesNo || "N/A"}
        </div>
      )}
    </div>
  );
}
