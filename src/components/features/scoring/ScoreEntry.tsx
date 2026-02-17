import React, { useState } from "react";
import Slider from "rc-slider";
import { cn } from "@/lib/ui/utils/formatters";
import { Text } from "@/components/core/typography/Text";
// import { Heading } from '@/components/core/typography/Heading';
import { backgroundColors, textColors } from "@/lib/tokens/colors";
import { paddingX, paddingY } from "@/lib/tokens/spacing";
import "rc-slider/assets/index.css";

// Define the rubric gradient
const rubricGradient = `
  linear-gradient(to right,
    #f8b89c 0%, #f8b89c 6%, 
    #f8b89c 6%, #ffe599 25%, 
    #ffe599 25%, #ffe599 35%,
    #ffe599 35%, #b6d7a8 60%, 
    #b6d7a8 60%, #b6d7a8 70%, 
    #b6d7a8 70%, #274e13 94%, 
    #274e13 94%
  )
`;

interface RubricLevel {
  value: number;
  label: string;
  description: string;
}

interface RubricLookFor {
  id: string;
  name: string;
  description: string;
  levels: RubricLevel[];
}

interface ScoreEntryProps {
  teacherId: string;
  cycleId: string;
  lookFor: RubricLookFor;
}

export function ScoreEntry({
  teacherId: _teacherId,
  cycleId: _cycleId,
  lookFor,
}: ScoreEntryProps) {
  const [score, setScore] = useState<number>(2.5);

  const rubricLabels = lookFor.levels.map((level) => ({
    id: level.value,
    title: level.label,
    description: level.description,
    hex:
      level.value === 1
        ? "#f8b89c"
        : level.value === 2
          ? "#ffe599"
          : level.value === 3
            ? "#b6d7a8"
            : "#274e13",
  }));

  return (
    <div
      className={cn(
        "w-full",
        backgroundColors.surface,
        "p-4",
        "rounded-lg",
        "shadow-md",
      )}
    >
      <div className="flex gap-4">
        {/* Look For Index */}
        <div
          className={cn(
            "flex items-center justify-center",
            "min-w-[80px] h-[80px]",
            backgroundColors.danger,
            textColors.white,
            "rounded-lg",
            "border-4 border-red-600",
          )}
        >
          <Text textSize="2xl" weight="bold">
            #{lookFor.id}
          </Text>
        </div>

        {/* Main Content */}
        <div
          className={cn(
            "flex-1",
            backgroundColors.secondary,
            textColors.white,
            "rounded-lg",
            paddingX.lg,
            paddingY.md,
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🍎</span>
            <Text textSize="2xl" weight="bold">
              {lookFor.name}
            </Text>
          </div>
          <div className="mt-2">{lookFor.description}</div>
        </div>
      </div>

      {/* Rubric Section */}
      <div className={cn("mt-4 px-8 pb-8", "flex flex-col items-center")}>
        {/* Rubric Labels */}
        <div className="flex justify-between w-full gap-4 mb-4">
          {rubricLabels.map((label) => {
            const backgroundColor = label.hex;
            const textColor = backgroundColor === "#274e13" ? "white" : "black";

            return (
              <div
                key={label.id}
                className={cn("flex-1", paddingX.md, paddingY.sm, "rounded-md")}
                style={{
                  backgroundColor,
                  color: textColor,
                }}
              >
                <Text textSize="lg" weight="bold" className="mb-2">
                  {label.title}
                </Text>
                <div className="text-sm" style={{ color: textColor }}>
                  {label.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Score Numbers */}
        <div className="grid grid-cols-4 w-3/4 text-center mb-2">
          {["1", "2", "3", "4"].map((num) => (
            <Text key={num} textSize="xl" weight="bold">
              {num}
            </Text>
          ))}
        </div>

        {/* Gradient Bar */}
        <div
          className="w-3/4 h-8 rounded-md mb-[-20px]"
          style={{ background: rubricGradient }}
        />

        {/* Slider */}
        <Slider
          min={1}
          max={4}
          step={0.1}
          value={score}
          onChange={(value: number | number[]) =>
            setScore(Array.isArray(value) ? value[0] : value)
          }
          trackStyle={{ background: "none" }}
          railStyle={{ background: "none" }}
          handleStyle={{
            borderColor: "black",
            height: "20px",
            width: "20px",
            backgroundColor: "white",
          }}
          className="w-3/4"
        />

        <Text textSize="xl" weight="bold" className="mt-6">
          Score: <span className="text-2xl">{score.toFixed(1)}</span>
        </Text>
      </div>
    </div>
  );
}
