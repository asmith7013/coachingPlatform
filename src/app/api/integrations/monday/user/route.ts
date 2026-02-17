import { NextResponse } from "next/server";

/**
 * GET handler for Monday.com user fetching
 * Fetches a user by ID or email
 *
 * @param req The Next.js request object
 * @returns JSON response with user data or error
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Monday user API placeholder",
  });
}
// import { NextRequest, NextResponse } from 'next/server';
// import { fetchMondayUserByEmail } from '@/lib/integrations/monday/client/client';
// import { handleServerError } from '@error/handlers/server';
// import { z } from 'zod';
// import { handleValidationError } from '@error/handlers/validation';

// /**
//  * GET handler for Monday.com user fetching
//  * Fetches a user by ID or email
//  *
//  * @param req The Next.js request object
//  * @returns JSON response with user data or error
//  */
// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const email = searchParams.get('email');

//     // Validate input
//     if (!email) {
//       return NextResponse.json({
//         success: false,
//         error: 'Email is required'
//       }, { status: 400 });
//     }

//     // Validate email format
//     const { email: validEmail } = z.object({
//       email: z.string().email("Valid email is required")
//     }).parse({ email });

//     // Fetch user from Monday.com
//     const result = await fetchMondayUserByEmail(validEmail);

//     // If successful, return the user data
//     if (result && result.success && result.data) {
//       return NextResponse.json({
//         success: true,
//         data: result.data
//       });
//     }

//     // If not found or error, return appropriate response
//     return NextResponse.json({
//       success: false,
//       error: result?.error || `No user found with email ${email}`
//     }, { status: 404 });

//   } catch (error) {
//     // Handle validation errors
//     if (error instanceof z.ZodError) {
//       return NextResponse.json({
//         success: false,
//         error: handleValidationError(error)
//       }, { status: 400 });
//     }

//     // Handle other errors
//     console.error('Error fetching Monday user:', error);
//     return NextResponse.json({
//       success: false,
//       error: handleServerError(error)
//     }, { status: 500 });
//   }
// }
