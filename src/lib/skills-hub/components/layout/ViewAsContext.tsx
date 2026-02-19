"use client";

import { createContext, useContext, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthenticatedUser } from "@/hooks/auth/useAuthenticatedUser";
import { getMockStaffData, type MockStaffData } from "./view-as-actions";
import {
  type AuthenticatedUser,
  type Permission,
  type UserMetadata,
  ROLE_PERMISSIONS,
} from "@core-types/auth";

export type ViewRole = "teacher" | "coach" | "admin";

interface ViewAsContextValue {
  viewRole: ViewRole;
  setViewRole: (role: ViewRole) => void;
  mockUser: AuthenticatedUser;
  teacherStaffId: string | null;
  isLoading: boolean;
}

const ViewAsContext = createContext<ViewAsContextValue | null>(null);

function buildMockUser(
  role: ViewRole,
  staffData:
    | { coach: MockStaffData | null; teacher: MockStaffData | null }
    | undefined,
): AuthenticatedUser {
  let metadata: UserMetadata;
  let email: string;
  let fullName: string;
  let roles: string[];

  if (role === "teacher" && staffData?.teacher) {
    const t = staffData.teacher;
    roles = ["Teacher"];
    metadata = {
      staffId: t.staffId,
      staffType: "nycps",
      roles,
      permissions: [],
      schoolIds: t.schoolIds,
      managedSchools: [],
      onboardingCompleted: true,
    };
    email = t.email;
    fullName = t.staffName;
  } else if (role === "coach" && staffData?.coach) {
    const c = staffData.coach;
    roles = ["Coach"];
    metadata = {
      staffId: c.staffId,
      staffType: "nycps",
      roles,
      permissions: [],
      schoolIds: c.schoolIds,
      managedSchools: [],
      onboardingCompleted: true,
    };
    email = c.email;
    fullName = c.staffName;
  } else {
    // Admin — use coach data but with director role
    const c = staffData?.coach;
    roles = ["Director"];
    metadata = {
      staffId: c?.staffId || "",
      staffType: "nycps",
      roles,
      permissions: [],
      schoolIds: c?.schoolIds || [],
      managedSchools: [],
      onboardingCompleted: true,
    };
    email = c?.email || "admin@teachinglab.org";
    fullName = c?.staffName || "Admin";
  }

  // Compute permissions from roles
  const permissions = roles.flatMap(
    (r) => ROLE_PERMISSIONS[r as keyof typeof ROLE_PERMISSIONS] || [],
  );
  const uniquePermissions = [...new Set(permissions)] as Permission[];

  return {
    id: "mock-user",
    email,
    fullName,
    firstName: fullName.split(" ")[0] || null,
    lastName: fullName.split(" ").slice(1).join(" ") || null,
    imageUrl: null,
    isLoading: false,
    isSignedIn: true,
    metadata,
    permissions: uniquePermissions,
    hasPermission: (p: Permission) => uniquePermissions.includes(p),
    hasAnyPermission: (ps: Permission[]) =>
      ps.some((p) => uniquePermissions.includes(p)),
    hasAllPermissions: (ps: Permission[]) =>
      ps.every((p) => uniquePermissions.includes(p)),
    hasRole: (r: string) =>
      roles.map((x) => x.toLowerCase()).includes(r.toLowerCase()),
    hasAnyRole: (rs: string[]) =>
      rs.some((r) =>
        roles.map((x) => x.toLowerCase()).includes(r.toLowerCase()),
      ),
    canAccessSchool: () => role === "admin",
    canManageStaff: () => role === "admin",
  };
}

export function ViewAsProvider({ children }: { children: React.ReactNode }) {
  const [viewRole, setViewRole] = useState<ViewRole>("coach");

  const { data: staffData, isLoading } = useQuery({
    queryKey: ["skillshub-mock-staff"],
    queryFn: async () => {
      const result = await getMockStaffData();
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    staleTime: Infinity,
  });

  const mockUser = useMemo(
    () => buildMockUser(viewRole, staffData),
    [viewRole, staffData],
  );

  const teacherStaffId = staffData?.teacher?.staffId ?? null;

  return (
    <ViewAsContext.Provider
      value={{ viewRole, setViewRole, mockUser, teacherStaffId, isLoading }}
    >
      {children}
    </ViewAsContext.Provider>
  );
}

export function useViewAs() {
  const ctx = useContext(ViewAsContext);
  if (!ctx) throw new Error("useViewAs must be used within ViewAsProvider");
  return ctx;
}

/**
 * Drop-in replacement for useAuthenticatedUser within skillsHub pages.
 * Returns the mock user from the ViewAs context.
 */
export function useSkillsHubAuth(): AuthenticatedUser {
  const ctx = useContext(ViewAsContext);
  const realUser = useAuthenticatedUser();

  // If no ViewAsProvider, fall back to real auth
  if (!ctx) return realUser;

  return ctx.mockUser;
}
