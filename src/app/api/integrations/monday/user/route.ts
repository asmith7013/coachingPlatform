import { NextRequest, NextResponse } from 'next/server';
import { fetchMondayUserById, fetchMondayUserByEmail } from '@/lib/integrations/monday/client/client';
// import { handleServerError } from "@/lib/error";

/**
 * GET handler for Monday.com user fetching
 * Fetches a user by ID or email
 * 
 * @param req The Next.js request object
 * @returns JSON response with user data or error
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    
    if (!userId && !email) {
      return NextResponse.json(
        { success: false, items: [], error: 'Either userId or email parameter is required' }, 
        { status: 400 }
      );
    }
    
    let user;
    try {
      if (userId) {
        // Clean user ID (ensure it's just numbers)
        const cleanUserId = userId.replace(/\D/g, "");
        user = await fetchMondayUserById(cleanUserId);
      } else if (email) {
        user = await fetchMondayUserByEmail(email);
      }
    } catch (apiError) {
      console.error('Monday API error:', apiError);
      return NextResponse.json({ 
        success: false, 
        items: [],
        error: 'Error communicating with Monday.com API' 
      }, { status: 502 });
    }
    
    if (!user) {
      return NextResponse.json(
        { success: false, items: [], error: 'User not found' }, 
        { status: 404 }
      );
    }
    
    // Return simplified user object in standard response format
    return NextResponse.json({
      success: true,
      items: [{
        id: user.id,
        name: user.name,
        email: user.email,
        title: user.title || null,
        photo_thumb: user.photo_thumb || null,
        // Only include teams if they exist and are properly formatted
        teams: Array.isArray(user.teams) ? 
          user.teams
            .filter(t => t && typeof t === 'object' && 'id' in t && 'name' in t)
            .map(t => ({ id: t.id, name: t.name })) 
          : []
      }]
    });
  } catch (error) {
    console.error('Error in Monday.com user API:', error);
    // Ensure we return a properly formatted error response
    return NextResponse.json(
      { 
        success: false, 
        items: [],
        error: typeof error === 'object' && error !== null ? 
          (error as { message?: string }).message || 'Unknown error' : 
          String(error) 
      }, 
      { status: 500 }
    );
  }
}