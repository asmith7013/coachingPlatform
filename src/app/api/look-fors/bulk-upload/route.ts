import { NextRequest, NextResponse } from "next/server";
import { LookForModel } from "@/models/look-fors";
import { LookForZodSchema } from "@/lib/zod-schema/look-fors/look-for";
import { bulkUploadToDB } from "@/lib/server-utils/bulkUpload";
import { parseCSV } from "@/lib/server-utils/csv";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Read and parse CSV file
    const text = await file.text();
    const data = parseCSV(text);

    // Upload to database
    const result = await bulkUploadToDB(
      data,
      LookForModel,
      LookForZodSchema,
      ["/look-fors"]
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${result.items?.length || 0} look-fors`,
      uploaded: result.items?.length
    });
  } catch (error) {
    console.error("Error processing file upload:", error);
    return NextResponse.json(
      { error: "Failed to process file upload" },
      { status: 500 }
    );
  }
} 