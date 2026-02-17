"use server";

import { CoachingLogFormFiller } from "@/lib/integrations/coaching-log/services/playwright-form-filler";
import {
  CoachingLogInput,
  CoachingLogInputZodSchema,
} from "@zod-schema/visits/coaching-log";
import { VisitScheduleBlock } from "@zod-schema/schedules/schedule-events";

interface EventData {
  name: string[];
  role: string;
  activity: string;
  duration: string;
}

interface FormOverrides {
  schoolName?: string;
  districtName?: string;
  coachName?: string;
  visitDate?: string;
  modeDone?: string;
  events?: EventData[]; // ← For form automation (transformed)
  timeBlocks?: VisitScheduleBlock[]; // ← For banner display (raw)
  visitId?: string;
}

export async function automateCoachingLogFillFromSchema(
  coachingLogData: CoachingLogInput,
  formOverrides: FormOverrides = {},
) {
  const filler = new CoachingLogFormFiller();

  try {
    // Validate schema data
    const validatedData = CoachingLogInputZodSchema.parse(coachingLogData);

    console.log(
      "validatedData automateCoachingLogFillFromSchema 🟠",
      validatedData,
    );

    await filler.initialize();

    // Note: Don't close here - monitoring will handle it
    return await filler.fillFormFromSchema(validatedData, formOverrides);
  } catch (error) {
    // Only close on error
    // await filler.close();
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function automateCoachingLogFillFromVisit(
  visitId: string,
  coachingLogData: CoachingLogInput,
  formOverrides: FormOverrides = {},
) {
  const filler = new CoachingLogFormFiller();

  try {
    // Validate schema data
    const validatedData = CoachingLogInputZodSchema.parse(coachingLogData);

    await filler.initialize();

    console.log(
      "validatedData automateCoachingLogFillFromVisit 🟣",
      validatedData,
    );

    // Note: Don't close here - monitoring will handle it
    return await filler.fillFormFromVisit(
      visitId,
      validatedData,
      formOverrides,
    );
  } catch (error) {
    // Only close on error
    // await filler.close();
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
