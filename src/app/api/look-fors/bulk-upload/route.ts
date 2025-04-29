import { NextRequest, NextResponse } from "next/server";
import { LookForModel } from "@mongoose-schema/look-fors";
import { LookForZodSchema } from "@zod-schema/look-fors/look-for";
import { bulkUploadToDB } from "@data-server/crud/bulk-operations";
import { parseCSV } from "@data-server/file-handling/csv-parser";

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