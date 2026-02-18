"use server";

import { fetchTaxonomy } from "@/app/skillsHub/_lib/taxonomy";
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
    console.error("Error fetching taxonomy:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch taxonomy",
    };
  }
}
