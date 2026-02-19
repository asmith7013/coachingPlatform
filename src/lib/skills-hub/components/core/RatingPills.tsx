"use client";

import { Group, UnstyledButton, Text } from "@mantine/core";

export interface RatingPillOption {
  value: string;
  label: string;
  color: string;
}

interface RatingPillsProps {
  options: RatingPillOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  size?: "xs" | "sm" | "md";
}

const SIZE_MAP = {
  xs: { px: 10, py: 3, fontSize: "xs" as const },
  sm: { px: 12, py: 4, fontSize: "sm" as const },
  md: { px: 14, py: 5, fontSize: "sm" as const },
};

export function RatingPills({
  options,
  value,
  onChange,
  size = "sm",
}: RatingPillsProps) {
  const { px, py, fontSize } = SIZE_MAP[size];

  return (
    <Group gap={6} wrap="wrap">
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <UnstyledButton
            key={option.value}
            onClick={() => onChange(isSelected ? null : option.value)}
            style={{
              borderRadius: 999,
              paddingInline: px,
              paddingBlock: py,
              backgroundColor: isSelected
                ? option.color === "gray"
                  ? "var(--mantine-color-gray-3)"
                  : `var(--mantine-color-${option.color}-light)`
                : "var(--mantine-color-gray-1)",
              transition: "background-color 150ms ease",
            }}
          >
            <Text
              size={fontSize}
              fw={isSelected ? 600 : 400}
              c={
                isSelected
                  ? option.color === "gray"
                    ? "var(--mantine-color-gray-8)"
                    : `var(--mantine-color-${option.color}-light-color)`
                  : "dark"
              }
              lh={1}
            >
              {option.label}
            </Text>
          </UnstyledButton>
        );
      })}
    </Group>
  );
}
