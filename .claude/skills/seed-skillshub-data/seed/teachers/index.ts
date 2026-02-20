import type { TeacherSeedConfig } from "./teacher-seed-config.types";
import { JANE_DOE } from "./jane-doe";
import { MARIA_SANTOS } from "./maria-santos";
import { MARCUS_WILLIAMS } from "./marcus-williams";

export type { TeacherSeedConfig } from "./teacher-seed-config.types";

export const TEACHER_CONFIGS: TeacherSeedConfig[] = [
  JANE_DOE,
  MARIA_SANTOS,
  MARCUS_WILLIAMS,
];
