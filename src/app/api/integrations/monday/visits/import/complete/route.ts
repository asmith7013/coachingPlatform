import { NextResponse } from 'next/server';
import { importSelectedVisits } from '@/lib/integrations/monday/services/import-service';
import { handleServerError } from '@error/handlers/server';
import { handleValidationError } from '@error/handlers/validation';
import { VisitInputZodSchema } from '@zod-schema/visits/visit';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request body using the VisitInputZodSchema
    const validation = VisitInputZodSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: handleValidationError(validation.error) },
        { status: 400 }
      );
    }
    
    const validatedData = validation.data;
    
    // Import the visit with the completed data
    const result = await importSelectedVisits([{
      id: validatedData.mondayItemId as string,
      completeData: validatedData
    }]);
    
    // Revalidate paths
    revalidatePath("/dashboard/visits");
    
    // Return the result
    return NextResponse.json({
      success: result.success,
      data: result
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 }
    );
  }
} 