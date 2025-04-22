import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/core/db";
import { NYCPSStaffModel, StaffMemberModel } from "@/models/core/staff.model";
import { handleServerError } from "@/lib/core/error/handleServerError";
import { z } from "zod";
import { NYCPSStaffZodSchema, StaffMemberZodSchema } from "@/lib/data/schemas/core/staff";
import { standardizeResponse } from "@/lib/utils/general/server/standardizeResponse";

// Define param schema to validate request parameters
const ParamSchema = z.object({
  id: z.string().min(1, { message: "Staff ID is required" }),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    
    // Validate the params
    const validatedParams = ParamSchema.parse(params);
    
    // Get the staff type from query parameters (default to 'nycps')
    const { searchParams } = new URL(req.url);
    const staffType = searchParams.get("staffType") || "nycps";
    
    console.log(`📥 API /staff/[id] request received, ID: ${validatedParams.id}, type: ${staffType}`);

    // Select the appropriate model and schema validator based on staff type
    const modelMap = {
      nycps: NYCPSStaffModel,
      generic: StaffMemberModel,
    };
    
    const schemaMap = {
      nycps: NYCPSStaffZodSchema,
      generic: StaffMemberZodSchema,
    };
    
    const Model = modelMap[staffType as keyof typeof modelMap] || NYCPSStaffModel;
    const Schema = schemaMap[staffType as keyof typeof schemaMap] || NYCPSStaffZodSchema;

    // Find the staff member by ID
    const staffMember = await Model.findById(validatedParams.id);

    // If staff member not found, return 404
    if (!staffMember) {
      console.log(`⚠️ Staff member with ID ${validatedParams.id} not found`);
      return NextResponse.json(
        standardizeResponse({
          items: [],
          success: false,
          message: `[404] Staff member with ID ${validatedParams.id} not found`,
        }),
        { status: 404 }
      );
    }

    // Validate the data against schema (ensures data integrity)
    const staffData = staffMember.toObject();
    const validatedStaff = Schema.parse(staffData);
    
    console.log(`📤 API /staff/[id] response: Found staff member ${validatedStaff.staffName}`);

    // Return standardized response
    return NextResponse.json(
      standardizeResponse({
        items: [validatedStaff],
        success: true
      })
    );
  } catch (error) {
    // Handle and standardize errors
    const errorMessage = handleServerError(error);
    const statusCode = errorMessage.startsWith("[404]") ? 404 : 
                       errorMessage.startsWith("[400]") ? 400 : 500;
    
    return NextResponse.json(
      standardizeResponse({
        items: [],
        success: false,
        message: errorMessage
      }),
      { status: statusCode }
    );
  }
} 