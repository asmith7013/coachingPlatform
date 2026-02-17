import { NextRequest, NextResponse } from "next/server";
import {
  fetchNYCPSStaffByIdForApi,
  fetchTeachingLabStaffByIdForApi,
} from "@/lib/server/fetchers/domain/staff";
import {
  createEntityResponse,
  createMonitoredErrorResponse,
} from "@server/api/responses/action-response-helper";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "nycps";

    console.log(
      `📥 API /staff/[id] request received, ID: ${id}, type: ${type}`,
    );

    const result =
      type === "nycps"
        ? await fetchNYCPSStaffByIdForApi(id)
        : await fetchTeachingLabStaffByIdForApi(id);

    if (!result.success || !result.items || result.items.length === 0) {
      return NextResponse.json(
        createMonitoredErrorResponse(
          new Error(result.error || "Staff member not found"),
          { component: "StaffAPI", operation: "fetchById" },
        ),
        { status: 404 },
      );
    }

    const staffMember = result.items[0];

    const response = createEntityResponse(
      staffMember,
      "Staff member retrieved successfully",
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("Staff API Error:", error);
    return NextResponse.json(
      createMonitoredErrorResponse(error, {
        component: "StaffAPI",
        operation: "fetchById",
      }),
      { status: 500 },
    );
  }
}
