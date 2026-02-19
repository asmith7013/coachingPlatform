import type { SkillStatus } from "./skill-status.types";

export const SKILL_STATUS_CONFIG: Record<
  SkillStatus,
  {
    label: string;
    badgeColor: string;
    dotColor: string;
    cardBorder: string;
    iconBg: string;
    iconBorder: string;
    iconColor: string;
  }
> = {
  not_started: {
    label: "Not Started",
    badgeColor: "gray",
    dotColor: "var(--mantine-color-gray-4)",
    cardBorder: "var(--mantine-color-gray-3)",
    iconBg: "var(--mantine-color-gray-1)",
    iconBorder: "transparent",
    iconColor: "var(--mantine-color-gray-6)",
  },
  active: {
    label: "Active",
    badgeColor: "blue",
    dotColor: "var(--mantine-color-blue-5)",
    cardBorder: "var(--mantine-color-blue-5)",
    iconBg: "var(--mantine-color-blue-1)",
    iconBorder: "var(--mantine-color-blue-5)",
    iconColor: "var(--mantine-color-blue-7)",
  },
  developing: {
    label: "Developing",
    badgeColor: "yellow",
    dotColor: "var(--mantine-color-yellow-5)",
    cardBorder: "var(--mantine-color-yellow-5)",
    iconBg: "var(--mantine-color-yellow-1)",
    iconBorder: "var(--mantine-color-yellow-5)",
    iconColor: "var(--mantine-color-yellow-7)",
  },
  proficient: {
    label: "Proficient",
    badgeColor: "green",
    dotColor: "var(--mantine-color-green-6)",
    cardBorder: "var(--mantine-color-green-6)",
    iconBg: "var(--mantine-color-green-1)",
    iconBorder: "var(--mantine-color-green-6)",
    iconColor: "var(--mantine-color-green-7)",
  },
};

/** @deprecated Use SKILL_STATUS_CONFIG instead */
export const SKILL_STATUS_COLORS = SKILL_STATUS_CONFIG;

/** Status options for SegmentedControl / Select dropdowns */
export const SKILL_STATUS_OPTIONS = (
  Object.entries(SKILL_STATUS_CONFIG) as [
    SkillStatus,
    (typeof SKILL_STATUS_CONFIG)[SkillStatus],
  ][]
).map(([value, config]) => ({
  label: config.label,
  value,
}));

/** Status entries for legend displays */
export const SKILL_STATUS_LABELS = (
  Object.entries(SKILL_STATUS_CONFIG) as [
    SkillStatus,
    (typeof SKILL_STATUS_CONFIG)[SkillStatus],
  ][]
).map(([status, config]) => ({
  status: status as SkillStatus,
  label: config.label,
}));
