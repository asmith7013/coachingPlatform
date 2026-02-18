import {
  UserJSON,
  OrganizationJSON,
  DeletedObjectJSON,
} from "@clerk/nextjs/server";
import { UserMetadataZodSchema } from "@zod-schema/core-types/auth";
import type { UserMetadata } from "@core-types/auth";
import { StaffModel } from "@mongoose-schema/core/staff.model";
import { withDbConnection } from "@server/db/ensure-connection";
import { validateSafe } from "@/lib/data-processing/validation/zod-validation";
import { captureError, createErrorContext, handleServerError } from "@error";
import { clerkClient } from "@clerk/nextjs/server";

// Type definitions
export type ClerkWebhookEvent = {
  type: string;
  data: UserJSON | OrganizationJSON | DeletedObjectJSON;
};

export type UserWebhookData = UserJSON & {
  public_metadata?: Record<string, unknown>;
  private_metadata?: Record<string, unknown>;
};

export type OrganizationWebhookData = OrganizationJSON & {
  public_metadata?: Record<string, unknown>;
  private_metadata?: Record<string, unknown>;
};

export type DeletedUserData = DeletedObjectJSON;

export type WebhookResult = {
  success: boolean;
  error?: string;
  data?: {
    staffId?: string;
    userId?: string;
    organizationId?: string;
  };
  action?: string;
};

// Define session data type for better type safety
export type SessionCreatedData = {
  user_id: string;
  session_id?: string;
  created_at?: number;
  [key: string]: unknown; // For any additional properties
};

// ✅ NEW: Business logic for user creation with staff linking
export async function handleUserCreation(
  data: UserWebhookData,
): Promise<WebhookResult> {
  const context = createErrorContext("ClerkWebhook", "handleUserCreation", {
    metadata: { userId: data.id },
  });

  return withDbConnection(async () => {
    try {
      const primaryEmail = data.email_addresses?.[0]?.email_address;

      if (!primaryEmail) {
        return {
          success: false,
          error: "No email address provided",
          action: "no_email",
        };
      }

      // Check for existing staff member by email
      const existingStaff = await StaffModel.findOne({ email: primaryEmail });

      if (existingStaff) {
        // Update Clerk metadata with staff connection
        await updateClerkUserMetadata(data.id, {
          staffId: existingStaff._id.toString(),
          staffType: "nycps",
          roles: (existingStaff.roles as string[]) || [],
          schoolIds: extractSchoolIds(existingStaff),
          onboardingCompleted: true,
        });

        console.log(
          `Linked Clerk user ${data.id} to staff ${existingStaff._id}`,
        );

        return {
          success: true,
          data: {
            staffId: existingStaff._id.toString(),
            action: "user_linked_to_existing_staff",
          },
        };
      } else {
        // User not found in staff database - flag for manual review
        await updateClerkUserMetadata(data.id, {
          onboardingCompleted: false,
          roles: [], // No roles until linked
          permissions: [], // No permissions until linked
        });

        console.log(
          `New user ${primaryEmail} not found in staff database - requires manual linking`,
        );

        return {
          success: true,
          action: "user_created_needs_linking",
          data: { userId: data.id },
        };
      }
    } catch (error) {
      console.error("Error during user creation:", error);
      captureError(error, context);
      return {
        success: false,
        error: handleServerError(error),
        action: "creation_error",
      };
    }
  });
}

// Business logic for syncing user metadata
export async function handleUserSync(
  data: UserWebhookData,
): Promise<WebhookResult> {
  const context = createErrorContext("ClerkWebhook", "handleUserSync", {
    metadata: { userId: data.id },
  });

  return withDbConnection(async () => {
    try {
      // Parse and validate metadata
      const metadata = validateSafe(
        UserMetadataZodSchema,
        data.public_metadata || {},
      );

      if (!metadata) {
        const errorMessage = "Invalid user metadata structure";
        console.error(errorMessage, { userId: data.id });
        return {
          success: false,
          error: errorMessage,
          action: "metadata_validation_failed",
        };
      }

      // Skip if no staff connection
      if (!metadata.staffId || !metadata.staffType) {
        console.log(`User ${data.id} has no staff connection`);
        return {
          success: true,
          action: "skipped_no_staff_connection",
        };
      }

      // Prepare update data
      const updateData = {
        email: data.email_addresses?.[0]?.email_address,
        ...(metadata.roles &&
          metadata.roles.length > 0 && {
            roles: metadata.roles,
          }),
      };

      // Update staff record
      const updatedStaff = await StaffModel.findByIdAndUpdate(
        metadata.staffId,
        { $set: updateData },
        { new: true, runValidators: true },
      );

      if (!updatedStaff) {
        const error = new Error(`Staff member ${metadata.staffId} not found`);
        captureError(error, context);
        return {
          success: false,
          error: error.message,
          action: "staff_not_found",
        };
      }

      console.log(
        `Successfully updated staff ${metadata.staffId} for user ${data.id}`,
      );

      // Handle school associations if present
      if (metadata.schoolIds && metadata.schoolIds.length > 0) {
        console.log(
          `User ${data.id} associated with schools:`,
          metadata.schoolIds,
        );
        // TODO: Implement school association updates when needed
      }

      return {
        success: true,
        data: { staffId: metadata.staffId },
        action: "user_synced",
      };
    } catch (error) {
      console.error("Error syncing user metadata:", error);
      captureError(error, context);
      return {
        success: false,
        error: handleServerError(error),
        action: "sync_error",
      };
    }
  });
}

// Business logic for syncing organization data
export async function handleOrganizationSync(
  data: OrganizationWebhookData,
): Promise<WebhookResult> {
  const context = createErrorContext("ClerkWebhook", "handleOrganizationSync", {
    metadata: { organizationId: data.id },
  });

  return withDbConnection(async () => {
    try {
      const orgMetadata = data.public_metadata || {};

      // Extract organization settings
      const orgPermissions = (orgMetadata.permissions as string[]) || [];
      const orgSettings = {
        districtId: orgMetadata.districtId as string,
        primaryContact: orgMetadata.primaryContact as string,
        subscriptionTier: orgMetadata.subscriptionTier as string,
      };

      console.log(`Organization ${data.id} updated:`, {
        name: data.name,
        permissions: orgPermissions,
        settings: orgSettings,
      });

      // TODO: When Organization model is available:
      // const updatedOrg = await OrganizationModel.findOneAndUpdate(
      //   { clerkId: data.id },
      //   {
      //     name: data.name,
      //     permissions: orgPermissions,
      //     ...orgSettings
      //   },
      //   { upsert: true, new: true }
      // );

      return {
        success: true,
        data: { organizationId: data.id },
        action: "organization_logged",
      };
    } catch (error) {
      console.error("Error syncing organization data:", error);
      captureError(error, context);
      return {
        success: false,
        error: handleServerError(error),
        action: "org_sync_error",
      };
    }
  });
}

// Handle user deletion
export async function handleUserDeletion(
  data: UserWebhookData,
): Promise<WebhookResult> {
  const context = createErrorContext("ClerkWebhook", "handleUserDeletion", {
    metadata: { userId: data.id },
  });

  try {
    console.log(`User deletion request for: ${data.id}`);

    // TODO: Implement soft delete when needed
    // For now, just log the deletion

    return {
      success: true,
      data: { userId: data.id },
      action: "user_deletion_logged",
    };
  } catch (error) {
    captureError(error, context);
    return {
      success: false,
      error: handleServerError(error),
      action: "deletion_error",
    };
  }
}

// Fix: Replace `any` with proper type (line 209)
export async function handleSessionCreated(
  data: SessionCreatedData,
): Promise<WebhookResult> {
  try {
    console.log(`Session created for user: ${data.user_id}`);

    // Could implement session tracking, analytics, etc.

    return {
      success: true,
      data: { userId: data.user_id },
      action: "session_logged",
    };
  } catch (error) {
    return {
      success: false,
      error: handleServerError(error),
      action: "session_error",
    };
  }
}

// ✅ NEW: Helper functions for staff-to-user linking

// Helper functions to extract data from staff records
function extractSchoolIds(staff: Record<string, unknown>): string[] {
  const schools = staff.schools as Array<{ toString(): string }> | undefined;
  return schools?.map((school) => school.toString()) || [];
}

// Enhanced metadata update function
async function updateClerkUserMetadata(
  userId: string,
  metadata: Partial<UserMetadata>,
) {
  const client = await clerkClient();

  await client.users.updateUserMetadata(userId, {
    publicMetadata: metadata,
  });
}
