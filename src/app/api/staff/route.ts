import { NextResponse } from "next/server";
import { fetchNYCPSStaff } from "@/app/actions/staff/nycps";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? 20);

  const data = await fetchNYCPSStaff({ 
    limit, 
    filters: { 
      staffName: search 
    } 
  });

  return NextResponse.json({
    items: data.items.map(p => ({ _id: p._id, staffName: p.staffName }))
  });
} 