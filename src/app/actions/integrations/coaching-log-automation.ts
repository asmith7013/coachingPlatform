"use server";

import { CoachingLogFormFiller } from '@/lib/integrations/coaching-log/services/playwright-form-filler';
import { CoachingLogInput, CoachingLogInputZodSchema } from '@zod-schema/visits/coaching-log';

interface FormOverrides {
  schoolName?: string;  // Changed from schoolName
  districtName?: string;
  coachName?: string;
}

export async function automateCoachingLogFillFromSchema(
  coachingLogData: CoachingLogInput,
  formOverrides: FormOverrides = {}
) {
  const filler = new CoachingLogFormFiller();
  
  try {
    // Validate schema data
    const validatedData = CoachingLogInputZodSchema.parse(coachingLogData);
    
    await filler.initialize();
    
    // Note: Don't close here - monitoring will handle it
    return await filler.fillFormFromSchema(validatedData, formOverrides);
    
  } catch (error) {
    // Only close on error
    await filler.close();
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export async function automateCoachingLogFillFromVisit(
  visitId: string,
  coachingLogData: CoachingLogInput,
  formOverrides: FormOverrides = {}
) {
  const filler = new CoachingLogFormFiller();
  
  try {
    // Validate schema data
    const validatedData = CoachingLogInputZodSchema.parse(coachingLogData);
    
    await filler.initialize();
    
    // Note: Don't close here - monitoring will handle it
    return await filler.fillFormFromVisit(visitId, validatedData, formOverrides);
    
  } catch (error) {
    // Only close on error
    await filler.close();
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}
