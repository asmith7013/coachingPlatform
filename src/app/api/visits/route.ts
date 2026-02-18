import { fetchVisitsForApi } from "@/lib/server/fetchers/domain/visits";
import {
  createReferenceEndpoint,
  FetchFunction,
} from "@api-handlers/reference-endpoint";
import { Visit } from "@zod-schema/visits/visit";
import { BaseReference } from "@core-types/reference";

interface VisitReference extends BaseReference {
  date?: string;
  schoolId?: string;
  coachId?: string;
  purpose?: string;
}

function mapVisitToReference(visit: Visit): VisitReference {
  const visitDate = visit.date
    ? new Date(visit.date).toLocaleDateString()
    : "No date";
  const label = `${visitDate} - ${visit.schoolId || "Unknown School"}`;

  return {
    _id: visit._id,
    value: visit._id,
    label,
    date: visit.date ? new Date(visit.date).toISOString() : undefined,
    schoolId: visit.schoolId,
    coachId: visit.coachId,
    purpose: visit.allowedPurpose,
  };
}

export const GET = createReferenceEndpoint({
  fetchFunction: fetchVisitsForApi as unknown as FetchFunction<Visit>,
  mapItem: mapVisitToReference,
  defaultSearchField: "date",
  defaultLimit: 20,
  logPrefix: "Visits API",
});
