import { NextRequest, NextResponse } from "next/server";
import { createCoachingActionPlan } from "@actions/coaching/coaching-action-plans";
import { fetchCoachingActionPlansForApi } from "@/lib/server/fetchers/domain/coachingActionPlan";
import { createReferenceEndpoint, FetchFunction } from "@api-handlers/reference-endpoint";
import { 
  CoachingActionPlan, 
  CoachingActionPlanInputZodSchema, 
  coachingActionPlanToReference 
} from "@zod-schema/core/cap";
import { 
  createEntityResponse, 
  createMonitoredErrorResponse 
} from "@server/api/responses/action-response-helper";

// Use createReferenceEndpoint factory for GET route (following schools pattern)
export const GET = createReferenceEndpoint({
  fetchFunction: fetchCoachingActionPlansForApi as unknown as FetchFunction<CoachingActionPlan>,
  mapItem: coachingActionPlanToReference,
  defaultSearchField: "title",
  defaultLimit: 20,
  logPrefix: "CoachingActionPlans API"
});

// Simplified POST route with proper error handling
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log(`📥 API /coaching-action-plans POST request received`);

    // Validate input data
    const validatedData = CoachingActionPlanInputZodSchema.parse(body);

    const result = await createCoachingActionPlan(validatedData);

    if (!result.success) {
      return NextResponse.json(
        createMonitoredErrorResponse(
          new Error(result.error || "Failed to create coaching action plan"),
          { component: "CoachingActionPlanAPI", operation: "create" }
        ),
        { status: 400 }
      );
    }

    const response = createEntityResponse(
      result.data,
      "Coaching action plan created successfully"
    );

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Coaching Action Plan API Creation Error:", error);
    
    // Handle validation errors
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        createMonitoredErrorResponse(
          error,
          { component: "CoachingActionPlanAPI", operation: "create" }
        ),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createMonitoredErrorResponse(
        error,
        { component: "CoachingActionPlanAPI", operation: "create" }
      ),
      { status: 500 }
    );
  }
} 