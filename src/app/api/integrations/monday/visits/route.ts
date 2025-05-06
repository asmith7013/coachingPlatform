// src/app/api/integrations/monday/visits/route.ts

import { NextResponse } from 'next/server';
import { findPotentialVisitsToImport } from '@api-monday/services/import-service';
import { handleValidationError } from '@error/handle-validation-error';
import { handleServerError } from '@error/handle-server-error';
import { z } from 'zod';

export async function GET(request: Request) {
  try {
    // Get boardId from URL query params
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('boardId');
    
    // Validate boardId
    if (!boardId) {
      return NextResponse.json(
        { success: false, error: 'Board ID is required' },
        { status: 400 }
      );
    }
    
    // Find potential visits to import
    const previews = await findPotentialVisitsToImport(boardId);
    
    // Return standardized response
    return NextResponse.json({
      success: true,
      items: previews,
      total: previews.length
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: handleValidationError(error) },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { selectedItems } = body;
    
    // Validate selectedItems
    if (!selectedItems || !Array.isArray(selectedItems) || selectedItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Selected items are required' },
        { status: 400 }
      );
    }
    
    // Import selected visits
    // This should be handled by the server action instead
    // But we keep the endpoint for external access if needed
    return NextResponse.json({
      success: false, 
      error: "Please use the import form to complete this operation"
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 }
    );
  }
}