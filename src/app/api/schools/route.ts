import { NextResponse } from "next/server";
import { fetchSchools } from "@/app/actions/schools/schools";
import { handleServerError } from "@/lib/error/handleServerError";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") ?? undefined;
    const limit = Number(searchParams.get("limit") ?? 20);

    console.log(`📥 API /schools request received with search: "${search}", limit: ${limit}`);

    const data = await fetchSchools({ 
      limit, 
      filters: { 
        schoolName: search 
      } 
    });

    console.log(`📤 API /schools response: ${data.items.length} items found`, 
      data.items.map(s => ({ _id: s._id, schoolName: s.schoolName }))
    );

    // Only send what the select needs
    return NextResponse.json({
      items: data.items.map(s => ({ _id: s._id, schoolName: s.schoolName }))
    });
  } catch (error) {
    const errorMessage = handleServerError(error);
    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    );
  }
} 