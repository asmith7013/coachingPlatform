import { NextRequest, NextResponse } from "next/server";
import { fetchStaffByIdForApi } from "@server/fetchers/staff";
import { collectionizeResponse } from "@server/api/responses/formatters";
import { handleServerError } from "@error/handlers/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { searchParams } = new URL(request.url);
    const staffType = searchParams.get("staffType") || "nycps";
    
    console.log(`📥 API /staff/[id] request received, ID: ${id}, type: ${staffType}`);

    const result = await fetchStaffByIdForApi(id, staffType as string);

    if (!result.success) {
      return NextResponse.json(
        collectionizeResponse({
          items: [],
          success: false,
          message: result.error
        }),
        { status: 404 }
      );
    }

    return NextResponse.json(
      collectionizeResponse({
        items: result.items,
        success: true
      })
    );
  } catch (error) {
    const errorMessage = handleServerError(error);
    const statusCode = errorMessage.startsWith("[404]") ? 404 : 
                       errorMessage.startsWith("[400]") ? 400 : 500;
    
    return NextResponse.json(
      collectionizeResponse({
        items: [],
        success: false,
        message: errorMessage
      }),
      { status: statusCode }
    );
  }
}