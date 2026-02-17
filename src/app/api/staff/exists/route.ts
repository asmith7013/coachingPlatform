import { NextRequest, NextResponse } from "next/server";
import {
  NYCPSStaffModel,
  TeachingLabStaffModel,
} from "@mongoose-schema/core/staff.model";
import { handleServerError } from "@error/handlers/server";
import { withDbConnection } from "@server/db/ensure-connection";

/**
 * API endpoint to check if a staff member exists by email
 * This safely encapsulates database access on the server side
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, exists: false, error: "Email parameter is required" },
        { status: 400 },
      );
    }

    const result = await withDbConnection(async () => {
      const nycpsStaff = await NYCPSStaffModel.findOne({ email });
      const tlStaff = await TeachingLabStaffModel.findOne({ email });

      return !!nycpsStaff || !!tlStaff;
    });

    return NextResponse.json({
      success: true,
      exists: result,
    });
  } catch (error) {
    console.error("Error in staff existence check API:", error);
    return NextResponse.json(
      { success: false, exists: false, error: handleServerError(error) },
      { status: 500 },
    );
  }
}
