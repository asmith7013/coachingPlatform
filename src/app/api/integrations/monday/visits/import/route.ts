// src/app/api/integrations/monday/visits/import/route.ts
import { NextResponse } from 'next/server';
import { importSelectedVisits } from '@/lib/integrations/monday/services/import-service';
import { handleServerError } from '@error/handlers/server';
import { z } from 'zod';
import { handleValidationError } from '@error/handlers/validation';

const ImportRequestSchema = z.object({
  selectedItems: z.array(z.string()),
  boardId: z.string()
});

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request body
    const validation = ImportRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: handleValidationError(validation.error) },
        { status: 400 }
      );
    }
    
    const { selectedItems } = validation.data;
    
    // Use the existing service to import the visits
    const result = await importSelectedVisits(selectedItems);
    
    // Return the result
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 }
    );
  }
}