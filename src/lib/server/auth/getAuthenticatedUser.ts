/**
 * Server-side authentication utilities
 *
 * Consolidates the common pattern of:
 *   const { userId } = await auth();
 *   const client = await clerkClient();
 *   const user = await client.users.getUser(userId);
 *
 * Into a single utility function with validated metadata.
 */

import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { UserMetadataZodSchema } from '@zod-schema/core-types/auth';
import type { UserMetadata } from '@core-types/auth';
import type { User } from '@clerk/nextjs/server';

export interface AuthenticatedServerUser {
  userId: string;
  user: User;
  email: string | null;
  fullName: string | null;
  metadata: UserMetadata;
  // Pre-computed role checks
  isSuperAdmin: boolean;
  isCoach: boolean;
  isDirector: boolean;
  isSeniorDirector: boolean;
}

export interface AuthResult {
  success: true;
  data: AuthenticatedServerUser;
}

export interface AuthError {
  success: false;
  error: string;
  code: 'UNAUTHORIZED' | 'USER_NOT_FOUND' | 'FETCH_ERROR';
}

export type GetAuthenticatedUserResult = AuthResult | AuthError;

/**
 * Get the authenticated user with validated metadata on the server
 *
 * @example
 * ```ts
 * export async function myServerAction() {
 *   const authResult = await getAuthenticatedUser();
 *   if (!authResult.success) {
 *     return { success: false, error: authResult.error };
 *   }
 *
 *   const { userId, user, email, metadata, isSuperAdmin } = authResult.data;
 *   // ... use authenticated user data
 * }
 * ```
 */
export async function getAuthenticatedUser(): Promise<GetAuthenticatedUserResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized - please sign in',
        code: 'UNAUTHORIZED',
      };
    }

    const user = await currentUser();

    if (!user) {
      return {
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      };
    }

    // Parse and validate metadata with defaults
    const rawMetadata = user.publicMetadata || {};
    const metadata = UserMetadataZodSchema.parse(rawMetadata);

    // Create case-insensitive role lookup
    const rolesLower = new Set(metadata.roles.map(r => r.toLowerCase()));

    return {
      success: true,
      data: {
        userId,
        user,
        email: user.emailAddresses[0]?.emailAddress || null,
        fullName: user.fullName,
        metadata,
        isSuperAdmin: rolesLower.has('super_admin'),
        isCoach: rolesLower.has('coach'),
        isDirector: rolesLower.has('director'),
        isSeniorDirector: rolesLower.has('senior director'),
      },
    };
  } catch (error) {
    console.error('Error fetching authenticated user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user',
      code: 'FETCH_ERROR',
    };
  }
}

/**
 * Get the Clerk client for admin operations
 * Useful when you need to update user metadata or perform other admin tasks
 */
export async function getClerkAdminClient() {
  return clerkClient();
}

/**
 * Require authentication - throws if not authenticated
 * Use when you want to fail fast rather than handle errors
 *
 * @throws Error if not authenticated
 */
export async function requireAuth(): Promise<AuthenticatedServerUser> {
  const result = await getAuthenticatedUser();
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data;
}
