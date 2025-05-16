import { NextRequest } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { TeachingLabStaffModel } from '@mongoose-schema/core/staff.model';
import { TeachingLabStaffInputZodSchema } from '@zod-schema/core/staff';
import { withDbConnection } from '@data-server/db/ensure-connection';
import { handleServerError } from '@/lib/error';
import { handleValidationError } from '@/lib/error';
import { z } from 'zod';
import { PERMISSIONS, ROLE_PERMISSIONS, TL_ROLES } from '@core-types/auth';

// Request validation schema
const SetupRequestSchema = z.object({
  email: z.string().email(),
  clerkUserId: z.string(),
  fullName: z.string()
});

export async function POST(request: NextRequest) {
  return withDbConnection(async () => {
    try {
      // Validate request
      const body = await request.json();
      const validatedData = SetupRequestSchema.parse(body);
      const { email, clerkUserId, fullName } = validatedData;
      
      // Check if this is a Teaching Lab email
      const isTeachingLab = email.endsWith('@teachinglab.org');
      
      // Determine initial role based on email
      let initialRole = TL_ROLES.Coach;
      let adminLevel = 'Coach';
      
      // Special case for specific users
      if (email === 'alex.smith@teachinglab.org') {
        initialRole = TL_ROLES.Director;
        adminLevel = 'Director';
      }
      
      // Check for existing staff record
      let staff = await TeachingLabStaffModel.findOne({ email });
      
      if (!staff) {
        // Create new staff record
        const staffData: z.infer<typeof TeachingLabStaffInputZodSchema> = {
          staffName: fullName,
          email: email,
          adminLevel: adminLevel,
          rolesTL: [initialRole],
          assignedDistricts: [],
          schools: [],
          owners: []
        };
        
        // Validate against schema
        const validatedStaffData = TeachingLabStaffInputZodSchema.parse(staffData);
        
        // Create staff record
        staff = await TeachingLabStaffModel.create(validatedStaffData);
      } else {
        // Update existing staff record if needed
        if (!staff.rolesTL || staff.rolesTL.length === 0) {
          staff.rolesTL = [initialRole];
          staff.adminLevel = adminLevel;
          await staff.save();
        }
      }
      
      // Get permissions for the role
      const rolePermissions = ROLE_PERMISSIONS[initialRole] || [];
      
      // Always include dashboard access
      const permissions = [
        PERMISSIONS.DASHBOARD_VIEW,
        ...rolePermissions
      ].filter((value, index, array) => array.indexOf(value) === index); // Remove duplicates
      
      // Update Clerk user metadata
      const clerk = await clerkClient();
      await clerk.users.updateUserMetadata(clerkUserId, {
        publicMetadata: {
          staffId: staff._id.toString(),
          staffType: 'teachinglab',
          roles: staff.rolesTL || [initialRole],
          permissions: permissions,
          schoolIds: staff.schools || [],
          managedSchools: [],
          districtId: staff.assignedDistricts?.[0] || null,
          onboardingCompleted: true,
          setupCompletedAt: new Date().toISOString()
        }
      });
      
      return Response.json({ 
        success: true,
        data: {
          staffId: staff._id.toString(),
          role: initialRole,
          permissions: permissions
        }
      });
      
    } catch (error) {
      console.error('Initial user setup failed:', error);
      
      if (error instanceof z.ZodError) {
        return Response.json(
          { success: false, error: handleValidationError(error) },
          { status: 400 }
        );
      }
      
      return Response.json(
        { success: false, error: handleServerError(error) },
        { status: 500 }
      );
    }
  });
} 