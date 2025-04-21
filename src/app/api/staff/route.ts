import { NextResponse } from "next/server";
import { fetchNYCPSStaff } from "@/app/actions/staff/nycps";
import { handleServerError } from "@/lib/error/handleServerError";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") ?? undefined;
    const limit = Number(searchParams.get("limit") ?? 20);

    console.log(`📥 API /staff request received with search: "${search}", limit: ${limit}`);

    const data = await fetchNYCPSStaff({ 
      limit, 
      filters: { 
        staffName: search 
      } 
    });

    console.log(`📤 API /staff response: ${data.items.length} items found`, 
      data.items.map(p => ({ _id: p._id, staffName: p.staffName }))
    );

    return NextResponse.json({
      items: data.items.map(p => ({ _id: p._id, staffName: p.staffName }))
    });
  } catch (error) {
    const errorMessage = handleServerError(error);
    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    );
  }
} 