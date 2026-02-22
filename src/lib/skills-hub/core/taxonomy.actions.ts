"use server";

import { handleServerError } from "@error/handlers/server";
import { fetchTaxonomy } from "./taxonomy";
import type { TeacherSkillsIndex } from "./taxonomy.types";

export async function fetchTaxonomyAction(): Promise<{
  success: boolean;
  data?: TeacherSkillsIndex;
  error?: string;
}> {
  try {
    const taxonomy = await fetchTaxonomy();
    return { success: true, data: taxonomy };
  } catch (error) {
    return {
      success: false,
      error: handleServerError(error, "fetchTaxonomyAction"),
    };
  }
}
