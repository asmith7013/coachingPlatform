import type { SkillStatus } from "./skill-status.types";

export const SKILL_STATUS_COLORS: Record<
  SkillStatus,
  {
    cardBorder: string;
    iconBg: string;
    iconBorder: string;
    iconColor: string;
  }
> = {
  not_started: {
    cardBorder: "var(--mantine-color-gray-3)",
    iconBg: "var(--mantine-color-gray-1)",
    iconBorder: "transparent",
    iconColor: "var(--mantine-color-gray-6)",
  },
  active: {
    cardBorder: "var(--mantine-color-blue-5)",
    iconBg: "var(--mantine-color-blue-1)",
    iconBorder: "var(--mantine-color-blue-5)",
    iconColor: "var(--mantine-color-blue-7)",
  },
  developing: {
    cardBorder: "var(--mantine-color-yellow-5)",
    iconBg: "var(--mantine-color-yellow-1)",
    iconBorder: "var(--mantine-color-yellow-5)",
    iconColor: "var(--mantine-color-yellow-7)",
  },
  proficient: {
    cardBorder: "var(--mantine-color-green-6)",
    iconBg: "var(--mantine-color-green-1)",
    iconBorder: "var(--mantine-color-green-6)",
    iconColor: "var(--mantine-color-green-7)",
  },
};
