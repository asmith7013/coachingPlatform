import { NextRequest, NextResponse } from 'next/server';
import { fetchMondayUserById, fetchMondayUserByEmail } from '@/lib/api/integrations/monday/client';
import { handleServerError } from "@/lib/error";

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
        { success: false, error: 'Either userId or email parameter is required' }, 
        { status: 400 }
      );
    }
    
    let user;
    if (userId) {
      // Clean user ID (ensure it's just numbers)
      const cleanUserId = userId.replace(/\D/g, "");
      user = await fetchMondayUserById(cleanUserId);
    } else if (email) {
      user = await fetchMondayUserByEmail(email);
    }
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' }, 
        { status: 404 }
      );
    }
    
    // Return simplified user object to avoid type issues
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        title: user.title || null,
        photo_thumb: user.photo_thumb || null,
        // Only include teams if they exist and are properly formatted
        ...(user.teams && Array.isArray(user.teams) && user.teams.every(t => t && typeof t === 'object' && 'id' in t && 'name' in t) 
          ? { teams: user.teams.map(t => ({ id: t.id, name: t.name })) } 
          : {})
      }
    });
  } catch (error) {
    console.error('Error in Monday.com user API:', error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) }, 
      { status: 500 }
    );
  }
} 