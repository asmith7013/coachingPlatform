/**
 * useClerkContext - Atomic hook for Clerk authentication context
 *
 * This hook consolidates all Clerk-related data and provides:
 * - Raw Clerk user and organization data
 * - Validated metadata (parsed with Zod)
 * - Pre-computed role checks (isSuperAdmin, isCoach, etc.)
 * - Organization-merged permissions
 *
 * Use this hook as the foundation for auth-related functionality.
 * Higher-level hooks like useAuthenticatedUser can build on top of this.
 */

import { useUser, useOrganization } from "@clerk/nextjs";
import { useMemo } from "react";
import { UserMetadataZodSchema } from "@zod-schema/core-types/auth";
import { UserMetadata } from "@core-types/auth";
import { validateSafe } from "@/lib/data-processing/validation/zod-validation";

export interface ClerkContextValue {
  // Raw Clerk data
  user: ReturnType<typeof useUser>["user"];
  organization: ReturnType<typeof useOrganization>["organization"];

  // Loading states
  isLoaded: boolean;
  isSignedIn: boolean;

  // Validated metadata
  metadata: UserMetadata;

  // Pre-computed role checks (case-insensitive)
  isSuperAdmin: boolean;
  isCoach: boolean;
  isDirector: boolean;
  isSeniorDirector: boolean;
  isTeacher: boolean;
  isPrincipal: boolean;
  isAdministrator: boolean;
  isCPM: boolean;

  // Merged permissions (user + organization)
  allPermissions: string[];

  // Utility: check any role (case-insensitive)
  checkRole: (role: string) => boolean;
}

/**
 * Atomic hook that provides consolidated Clerk context
 *
 * @example
 * ```tsx
 * const { isSuperAdmin, isCoach, metadata, isSignedIn } = useClerkContext();
 *
 * if (isSuperAdmin || isCoach) {
 *   // Show admin features
 * }
 * ```
 */
export function useClerkContext(): ClerkContextValue {
  const { user, isLoaded, isSignedIn } = useUser();
  const { organization } = useOrganization();

  // Parse and validate metadata with Zod (with defaults)
  const metadata = useMemo((): UserMetadata => {
    if (!user?.publicMetadata) {
      return UserMetadataZodSchema.parse({});
    }

    const parsed = validateSafe(UserMetadataZodSchema, user.publicMetadata);
    return parsed || UserMetadataZodSchema.parse({});
  }, [user]);

  // Create case-insensitive role lookup set
  const rolesLowerSet = useMemo(() => {
    return new Set(metadata.roles.map((r) => r.toLowerCase()));
  }, [metadata.roles]);

  // Pre-computed role checks
  const isSuperAdmin = rolesLowerSet.has("super_admin");
  const isCoach = rolesLowerSet.has("coach");
  const isDirector = rolesLowerSet.has("director");
  const isSeniorDirector = rolesLowerSet.has("senior director");
  const isTeacher = rolesLowerSet.has("teacher");
  const isPrincipal = rolesLowerSet.has("principal");
  const isAdministrator = rolesLowerSet.has("administrator");
  const isCPM = rolesLowerSet.has("cpm");

  // Merge organization permissions with user permissions
  const allPermissions = useMemo(() => {
    const orgPermissions =
      (organization?.publicMetadata?.permissions as string[]) || [];
    return Array.from(new Set([...metadata.permissions, ...orgPermissions]));
  }, [metadata.permissions, organization]);

  // Utility function for checking any role (case-insensitive)
  const checkRole = useMemo(() => {
    return (role: string) => rolesLowerSet.has(role.toLowerCase());
  }, [rolesLowerSet]);

  return useMemo(
    () => ({
      // Raw Clerk data
      user,
      organization,

      // Loading states
      isLoaded,
      isSignedIn: isSignedIn || false,

      // Validated metadata
      metadata,

      // Pre-computed role checks
      isSuperAdmin,
      isCoach,
      isDirector,
      isSeniorDirector,
      isTeacher,
      isPrincipal,
      isAdministrator,
      isCPM,

      // Merged permissions
      allPermissions,

      // Utility
      checkRole,
    }),
    [
      user,
      organization,
      isLoaded,
      isSignedIn,
      metadata,
      isSuperAdmin,
      isCoach,
      isDirector,
      isSeniorDirector,
      isTeacher,
      isPrincipal,
      isAdministrator,
      isCPM,
      allPermissions,
      checkRole,
    ],
  );
}
