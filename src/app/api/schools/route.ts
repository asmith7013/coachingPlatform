import { NextResponse } from "next/server";
import { fetchSchools } from "@/app/actions/schools/schools";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? 20);

  const data = await fetchSchools({ 
    limit, 
    filters: { 
      schoolName: search 
    } 
  });

  // Only send what the select needs
  return NextResponse.json({
    items: data.items.map(s => ({ _id: s._id, schoolName: s.schoolName }))
  });
} 