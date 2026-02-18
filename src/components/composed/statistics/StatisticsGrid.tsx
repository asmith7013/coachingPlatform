"use client";

import { tv, type VariantProps } from "tailwind-variants";
import { StatCard, type StatCardProps } from "./StatCard";

const statisticsGrid = tv({
  base: "grid gap-4 mb-6",
  variants: {
    columns: {
      2: "grid-cols-2",
      3: "grid-cols-2 md:grid-cols-3",
      4: "grid-cols-2 md:grid-cols-4",
      5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
      6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
    },
    spacing: {
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
    },
  },
  defaultVariants: {
    columns: 4,
    spacing: "md",
  },
});

export interface StatisticData {
  id: string;
  icon: StatCardProps["icon"];
  value: string | number;
  label: string;
  color?: StatCardProps["color"];
}

export interface StatisticsGridProps
  extends VariantProps<typeof statisticsGrid> {
  statistics: StatisticData[];
  cardSize?: StatCardProps["size"];
  className?: string;
}

export function StatisticsGrid({
  statistics,
  columns,
  spacing,
  cardSize = "md",
  className,
}: StatisticsGridProps) {
  const gridStyles = statisticsGrid({ columns, spacing });

  return (
    <div className={`${gridStyles} ${className || ""}`}>
      {statistics.map((stat) => (
        <StatCard
          key={stat.id}
          icon={stat.icon}
          value={stat.value}
          label={stat.label}
          color={stat.color || "primary"}
          size={cardSize}
        />
      ))}
    </div>
  );
}
