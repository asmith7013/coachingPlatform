"use server";

import { z, ZodType } from "zod";
import { revalidatePath } from "next/cache";
import { NYCPSStaffModel } from "@mongoose-schema/core/staff.model";
import { TeacherScheduleModel, BellScheduleModel } from "@mongoose-schema/schedule/schedule.model";
import { 
  TeacherScheduleZodSchema, 
  TeacherScheduleInputZodSchema,
  BellScheduleZodSchema, 
  BellScheduleInputZodSchema
} from "@zod-schema/schedule/schedule";
import { createCrudActions } from "@server/crud";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";
import { type QueryParams } from "@core-types/query";

// Types
export type TeacherSchedule = z.infer<typeof TeacherScheduleZodSchema>;
export type TeacherScheduleInput = z.infer<typeof TeacherScheduleInputZodSchema>;
export type BellSchedule = z.infer<typeof BellScheduleZodSchema>;
export type BellScheduleInput = z.infer<typeof BellScheduleInputZodSchema>;

// ===== BELL SCHEDULE ACTIONS =====

// Create standard CRUD actions for Bell Schedules
const bellScheduleActions = createCrudActions({
  model: BellScheduleModel,
  schema: BellScheduleZodSchema as ZodType<BellSchedule>,
  inputSchema: BellScheduleInputZodSchema as ZodType<BellScheduleInput>,
  name: "Bell Schedule",
  revalidationPaths: ["/dashboard/schedule"],
  sortFields: ['school', 'bellScheduleType', 'createdAt', 'updatedAt'],
  defaultSortField: 'createdAt',
  defaultSortOrder: 'desc'
});

// Export the generated bell schedule actions with connection handling
export async function fetchBellSchedules(params: QueryParams) {
  return withDbConnection(() => bellScheduleActions.fetch(params));
}

export async function createBellSchedule(data: BellScheduleInput) {
  return withDbConnection(() => bellScheduleActions.create(data));
}

export async function updateBellSchedule(id: string, data: Partial<BellScheduleInput>) {
  return withDbConnection(() => bellScheduleActions.update(id, data));
}

export async function deleteBellSchedule(id: string) {
  return withDbConnection(() => bellScheduleActions.delete(id));
}

export async function fetchBellScheduleById(id: string) {
  return withDbConnection(() => bellScheduleActions.fetchById(id));
}

// Add specialized bell schedule actions
export async function fetchBellSchedulesBySchool(schoolId: string) {
  return withDbConnection(async () => {
    try {
      const results = await BellScheduleModel.find({ school: schoolId })
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      
      return {
        success: true,
        items: results.map(item => BellScheduleZodSchema.parse(item)),
        total: results.length
      };
    } catch (error) {
      return {
        success: false,
        items: [],
        total: 0,
        error: handleServerError(error)
      };
    }
  });
}

export async function fetchBellSchedulesByType(bellScheduleType: string) {
  return withDbConnection(async () => {
    try {
      const results = await BellScheduleModel.find({ bellScheduleType })
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      
      return {
        success: true,
        items: results.map(item => BellScheduleZodSchema.parse(item)),
        total: results.length
      };
    } catch (error) {
      return {
        success: false,
        items: [],
        total: 0,
        error: handleServerError(error)
      };
    }
  });
}

export async function getActiveCycleDayForDate(schoolId: string, date: string) {
  return withDbConnection(async () => {
    try {
      // Find bell schedules for the school
      const bellSchedules = await BellScheduleModel.find({ school: schoolId })
        .lean()
        .exec();

      if (!bellSchedules || bellSchedules.length === 0) {
        return {
          success: false,
          error: `No bell schedules found for school ${schoolId}`
        };
      }

      // Find assigned cycle day for the date across all bell schedules
      let cycleDay = null;
      
      for (const schedule of bellSchedules) {
        const assignedDay = schedule.assignedCycleDays?.find((day: { date: string; blockDayType: string }) => 
          day.date === date
        );
        
        if (assignedDay) {
          cycleDay = assignedDay.blockDayType;
          break;
        }
      }

      return {
        success: true,
        data: {
          date,
          schoolId,
          cycleDay
        }
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error)
      };
    }
  });
}

// ===== TEACHER SCHEDULE ACTIONS =====

// Create Teacher Schedule actions
const teacherScheduleActions = createCrudActions({
  model: TeacherScheduleModel,
  schema: TeacherScheduleZodSchema as ZodType<TeacherSchedule>,
  inputSchema: TeacherScheduleInputZodSchema,
  name: "Teacher Schedule",
  revalidationPaths: ["/dashboard/schedule"],
  sortFields: ['teacher', 'school', 'createdAt', 'updatedAt'],
  defaultSortField: 'createdAt',
  defaultSortOrder: 'desc'
});

// Teacher Schedule exports using factory
export async function fetchTeacherSchedules(params: QueryParams) {
  return withDbConnection(() => teacherScheduleActions.fetch(params));
}

export async function createTeacherSchedule(data: TeacherScheduleInput) {
  return withDbConnection(() => teacherScheduleActions.create(data));
}

export async function updateTeacherSchedule(id: string, data: Partial<TeacherScheduleInput>) {
  return withDbConnection(() => teacherScheduleActions.update(id, data));
}

export async function deleteTeacherSchedule(id: string) {
  return withDbConnection(() => teacherScheduleActions.delete(id));
}

export async function fetchTeacherScheduleById(id: string) {
  return withDbConnection(() => teacherScheduleActions.fetchById(id));
}

// Specialized function (can keep as-is but with better error handling)
export async function fetchTeacherSchedulesBySchool(schoolId: string) {
  return withDbConnection(async () => {
    try {
      const schedules = await TeacherScheduleModel.find({ school: schoolId })
        .lean()
        .exec();
      
      return { 
        success: true, 
        items: schedules.map(item => TeacherScheduleZodSchema.parse(item)),
        total: schedules.length 
      };
    } catch (error) {
      return {
        success: false,
        items: [],
        total: 0,
        error: handleServerError(error)
      };
    }
  });
}

// Type for teacher schedule with email info (before staff lookup)
interface TeacherScheduleWithEmail extends Omit<TeacherScheduleInput, 'teacher'> {
  teacherEmail: string;
  teacherName: string;
  teacher?: string; // Optional until resolved
}

// Type for staff member from database
interface StaffMember {
  _id: string;
  staffName: string;
  email: string;
}

/**
 * Enhanced staff lookup with multiple strategies and detailed logging
 */
async function findStaffMemberByEmail(email: string): Promise<StaffMember | null> {
  console.log(`🔍 Starting comprehensive staff lookup for: "${email}"`);
  
  try {
    // Strategy 1: Exact case-insensitive match
    let staffMember = await NYCPSStaffModel.findOne({ 
      email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    }).select('_id staffName email').lean().exec();
    
    if (staffMember) {
      // console.log(`✅ Strategy 1 success: Exact match found for ${email}`);
      return staffMember as unknown as StaffMember;
    }
    
    // Strategy 2: Username match (before @)
    const username = email.split('@')[0];
    // console.log(`🔍 Strategy 2: Trying username match for "${username}"`);
    
    staffMember = await NYCPSStaffModel.findOne({
      email: { $regex: new RegExp(`^${username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}@`, 'i') }
    }).select('_id staffName email').lean().exec();
    
    if (staffMember) {
      // console.log(`✅ Strategy 2 success: Username match found for ${username}`);
      return staffMember as unknown as StaffMember;
    }
    
    // Strategy 3: Database diagnostic
    // console.log(`🔍 Strategy 3: No email match found, running diagnostics`);
    const allStaff = await NYCPSStaffModel.find({}).select('email staffName').lean().exec();
    
    // console.log(`📊 Database contains ${allStaff.length} staff members:`);
    allStaff.slice(0, 10).forEach(staff => {
      console.log(`  - ${staff.staffName}: ${staff.email}`);
    });
    
    if (allStaff.length > 10) {
      console.log(`  ... and ${allStaff.length - 10} more`);
    }
    
    return null;
  } catch (error) {
    console.error(`💥 Error in staff lookup for ${email}:`, error);
    return null;
  }
}

/**
 * Create master schedule by processing multiple teacher schedules with email lookup
 */
export async function createMasterSchedule(
  schedules: TeacherScheduleWithEmail[],
  schoolId: string
) {
  return withDbConnection(async () => {
    console.log(`🚀 Starting master schedule creation for school: ${schoolId}`);
    console.log(`📋 Received ${schedules.length} teacher schedules to create`);
    
    try {
      // Pre-check: Verify database connection and staff count
      const staffCount = await NYCPSStaffModel.countDocuments();
      console.log(`📊 Database connection verified. Total staff in database: ${staffCount}`);
      
      const results = [];
      const errors = [];
      
      for (let i = 0; i < schedules.length; i++) {
        const schedule = schedules[i];
        console.log(`\n👨‍🏫 Processing schedule ${i + 1}/${schedules.length} for ${schedule.teacherName}`);
        console.log(`📧 Looking for email: "${schedule.teacherEmail}"`);
        
        try {
          // Use enhanced staff lookup
          const staffMember = await findStaffMemberByEmail(schedule.teacherEmail);
          
          if (!staffMember) {
            const error = `Staff member not found for email: ${schedule.teacherEmail}`;
            console.log(`❌ ${error}`);
            errors.push(error);
            continue;
          }
          
          console.log(`✅ Found staff member: ${staffMember.staffName} (ID: ${staffMember._id})`);
          console.log(`📧 Matched email: "${staffMember.email}" with input: "${schedule.teacherEmail}"`);
          
          // Create teacher schedule with correct staff ID
          const scheduleData: TeacherScheduleInput = {
            teacher: staffMember._id.toString(),
            school: schoolId,
            scheduleByDay: schedule.scheduleByDay,
            owners: schedule.owners || []
          };
          
          console.log(`📝 Creating schedule data:`, {
            teacher: scheduleData.teacher,
            school: scheduleData.school,
            daysCount: scheduleData.scheduleByDay.length,
            firstDayPeriods: scheduleData.scheduleByDay[0]?.periods?.length || 0
          });
          
          // Validate schedule data
          console.log(`🔍 Validating schedule data against schema...`);
          const validated = TeacherScheduleInputZodSchema.parse(scheduleData);
          console.log(`✅ Schedule validation successful`);
          
          // Create in database
          console.log(`💾 Creating schedule in database...`);
          const createdSchedule = await TeacherScheduleModel.create(validated);
          console.log(`✅ Schedule created with ID: ${createdSchedule._id}`);
          
          results.push({
            teacherEmail: schedule.teacherEmail,
            teacherName: schedule.teacherName,
            scheduleId: createdSchedule._id.toString(),
            success: true
          });
          
        } catch (error) {
          const errorMsg = `Failed to create schedule for ${schedule.teacherName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.log(`❌ ${errorMsg}`);
          if (error instanceof Error) {
            console.error('📜 Full error stack:', error.stack);
          }
          errors.push(errorMsg);
        }
      }
      
      console.log(`\n📊 Master schedule creation complete:`);
      console.log(`✅ Successful: ${results.length}`);
      console.log(`❌ Failed: ${errors.length}`);
      
      if (errors.length > 0) {
        console.log(`🚨 Errors encountered:`, errors);
      }
      
      // Revalidate paths
      revalidatePath("/dashboard/schedule");
      revalidatePath("/dashboard/schools");
      
      return {
        success: true,
        data: {
          created: results,
          errors,
          totalSchedules: schedules.length,
          successfulSchedules: results.length,
          failedSchedules: errors.length
        }
      };
      
    } catch (error) {
      console.error('💥 Master schedule creation failed:', error);
      
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: handleValidationError(error)
        };
      }
      
      return {
        success: false,
        error: handleServerError(error)
      };
    }
  });
}