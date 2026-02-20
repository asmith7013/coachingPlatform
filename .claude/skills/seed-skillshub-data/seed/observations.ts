import { SkillsHubObservation } from "@lib/skills-hub/coach/observations/observation.model";
import { daysAgo, type StaffIds } from "./config";
import type { ObservationConfig } from "./teachers/teacher-seed-config.types";

export async function seedObservations(
  staff: StaffIds,
  observations: ObservationConfig[],
): Promise<void> {
  console.log("Creating observations...");

  const records = observations.map((obs) => ({
    teacherStaffId: staff.teacherId,
    observerId: staff.coachId,
    date: daysAgo(obs.daysAgo),
    type: obs.type,
    notes: obs.notes,
    duration: obs.duration,
    ratings: obs.ratings,
    domainRatings: obs.domainRatings,
  }));

  await SkillsHubObservation.insertMany(records);

  const types = observations.map((o) => o.type).join(", ");
  console.log(`  ${observations.length} observations created (${types})\n`);
}
