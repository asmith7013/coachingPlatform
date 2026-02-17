import { NextRequest, NextResponse } from "next/server";
import {
  fetchCoachingActionPlanById,
  updateCoachingActionPlan,
  deleteCoachingActionPlan,
} from "@actions/coaching/coaching-action-plans";
import {
  createEntityResponse,
  createMonitoredErrorResponse,
} from "@server/api/responses/action-response-helper";
import { CoachingActionPlanInputZodSchema } from "@zod-schema/cap";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    console.log(
      `📥 API /coaching-action-plans/[id] GET request received, ID: ${id}`,
    );

    const result = await fetchCoachingActionPlanById(id);

    if (!result.success || !result.data) {
      return NextResponse.json(
        createMonitoredErrorResponse(
          new Error("Coaching action plan not found"),
          { component: "CoachingActionPlanAPI", operation: "fetchById" },
        ),
        { status: 404 },
      );
    }

    return NextResponse.json(
      createEntityResponse(
        result.data,
        "Coaching action plan retrieved successfully",
      ),
    );
  } catch (error) {
    console.error("Coaching Action Plan API Error:", error);
    return NextResponse.json(
      createMonitoredErrorResponse(error, {
        component: "CoachingActionPlanAPI",
        operation: "fetchById",
      }),
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    console.log(
      `📥 API /coaching-action-plans/[id] PUT request received, ID: ${id}`,
    );

    const validatedData =
      CoachingActionPlanInputZodSchema.partial().parse(body);
    const result = await updateCoachingActionPlan(id, validatedData);

    if (!result.success) {
      return NextResponse.json(
        createMonitoredErrorResponse(
          new Error(result.error || "Failed to update coaching action plan"),
          { component: "CoachingActionPlanAPI", operation: "update" },
        ),
        { status: 400 },
      );
    }

    return NextResponse.json(
      createEntityResponse(
        result.data,
        "Coaching action plan updated successfully",
      ),
    );
  } catch (error) {
    console.error("Coaching Action Plan API Update Error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        createMonitoredErrorResponse(error, {
          component: "CoachingActionPlanAPI",
          operation: "update",
        }),
        { status: 400 },
      );
    }

    return NextResponse.json(
      createMonitoredErrorResponse(error, {
        component: "CoachingActionPlanAPI",
        operation: "update",
      }),
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    console.log(
      `📥 API /coaching-action-plans/[id] DELETE request received, ID: ${id}`,
    );

    const result = await deleteCoachingActionPlan(id);

    if (!result.success) {
      return NextResponse.json(
        createMonitoredErrorResponse(
          new Error(result.error || "Failed to delete coaching action plan"),
          { component: "CoachingActionPlanAPI", operation: "delete" },
        ),
        { status: 400 },
      );
    }

    return NextResponse.json(
      createEntityResponse(
        { id, deleted: true },
        "Coaching action plan deleted successfully",
      ),
    );
  } catch (error) {
    console.error("Coaching Action Plan API Delete Error:", error);
    return NextResponse.json(
      createMonitoredErrorResponse(error, {
        component: "CoachingActionPlanAPI",
        operation: "delete",
      }),
      { status: 500 },
    );
  }
}
