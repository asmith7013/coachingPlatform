"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { handleServerError } from "@error/handlers/server";
import { serialize, serializeMany } from "../../core/repository";
import { SkillsHubObservation } from "./observation.model";
import {
  ObservationInputSchema,
  type ObservationInput,
  type ObservationDocument,
} from "./observation.types";

export async function createObservation(input: ObservationInput): Promise<{
  success: boolean;
  data?: ObservationDocument;
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const authResult = await getAuthenticatedUser();
      if (!authResult.success) {
        return { success: false, error: "Unauthorized" };
      }

      const validated = ObservationInputSchema.parse(input);

      // Filter out empty ratings
      const filteredRatings = validated.ratings.filter(
        (r) => r.rating !== "not_observed",
      );

      const doc = await SkillsHubObservation.create({
        ...validated,
        ratings: filteredRatings,
        observerId: authResult.data.metadata.staffId,
      });

      const data = serialize<ObservationDocument>(doc.toObject());
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "createObservation"),
      };
    }
  });
}

export async function getObservations(teacherStaffId: string): Promise<{
  success: boolean;
  data?: ObservationDocument[];
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const docs = await SkillsHubObservation.find({ teacherStaffId })
        .sort({ date: -1 })
        .limit(50)
        .lean();
      const data = serializeMany<ObservationDocument>(docs);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "getObservations"),
      };
    }
  });
}

export async function getObservation(observationId: string): Promise<{
  success: boolean;
  data?: ObservationDocument;
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const doc = await SkillsHubObservation.findById(observationId).lean();
      if (!doc) {
        return { success: false, error: "Observation not found" };
      }
      const data = serialize<ObservationDocument>(doc);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "getObservation"),
      };
    }
  });
}
