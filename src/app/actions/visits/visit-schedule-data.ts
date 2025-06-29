"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { VisitModel } from "@mongoose-schema/visits/visit.model";
import { VisitScheduleModel } from "@mongoose-schema/schedules/schedule-documents.model";
import { NYCPSStaffModel } from "@mongoose-schema/core/staff.model";
import { SchoolModel } from "@mongoose-schema/core/school.model";
import { handleServerError } from "@error/handlers/server";
import type { Visit } from "@zod-schema/visits/visit";
import type { VisitSchedule } from "@zod-schema/schedules/schedule-documents";
import type { NYCPSStaff } from "@zod-schema/core/staff";
import type { School } from "@zod-schema/core/school";
import type { VisitScheduleBlock } from "@zod-schema/schedules/schedule-events";

export interface VisitScheduleData {
  visit?: Visit;
  visitSchedule?: VisitSchedule;
  nycpsStaff: NYCPSStaff[];  // CHANGED: Use array instead of Map for consistency with existing utilities
  school?: School;  // ADD: Include school data
  teacherCount: number;  // ADD: Pre-calculated teacher count
}

export async function fetchVisitScheduleData(visitId: string) {
  return withDbConnection(async () => {
    try {
      console.log('🔍 Fetching visit schedule data for visitId:', visitId);

      // 1. Fetch visit by ID
      const visit = await VisitModel.findById(visitId);
      if (!visit) {
        console.log('⚠️ Visit not found, returning empty data structure');
        return { 
          success: true, 
          data: { 
            nycpsStaff: [],
            teacherCount: 1  // ADD: Default teacher count
          } as VisitScheduleData 
        };
      }

      console.log('✅ Visit fetched:', { 
        id: visit._id, 
        date: visit.date, 
        visitScheduleId: visit.visitScheduleId 
      });

      // 2. Fetch school data if visit has schoolId (NEW - but follows existing pattern)
      let school: School | undefined;
      if (visit.schoolId) {
        try {
          const schoolDoc = await SchoolModel.findById(visit.schoolId);
          if (schoolDoc) {
            school = schoolDoc;
          }
        } catch (error) {
          console.warn('⚠️ Could not fetch school data:', error);
        }
      }

      let visitSchedule: VisitSchedule | undefined;
      let allStaffIds: string[] = [];

      // 2. Fetch VisitSchedule if visitScheduleId exists
      if (visit.visitScheduleId) {
        const scheduleDoc = await VisitScheduleModel.findById(visit.visitScheduleId);
        
        if (scheduleDoc) {
          visitSchedule = scheduleDoc;

          if (scheduleDoc.timeBlocks) {
            // 3. Collect unique staffIds from timeBlocks
            const staffIds: string[] = [];
            for (const block of scheduleDoc.timeBlocks) {
              if (block && (block as VisitScheduleBlock).staffIds) {
                staffIds.push(...(block as VisitScheduleBlock).staffIds);
              }
            }
            allStaffIds = [...new Set(staffIds)];
          }
        } else {
          console.warn('⚠️ VisitSchedule not found for ID:', visit.visitScheduleId);
        }
      }

      // Add primary teacher if not already included
      if (visit.teacherId && !allStaffIds.includes(visit.teacherId)) {
        allStaffIds.push(visit.teacherId);
      }

      console.log('📋 Unique staff IDs to fetch:', allStaffIds);

      // 4. Calculate teacher count (NEW - simple calculation)
      const teacherCount = Math.max(allStaffIds.length, 1);
      console.log('📊 Calculated teacher count:', teacherCount);

      // 5. Fetch all staff in parallel using MongoDB $in query
      let nycpsStaff: NYCPSStaff[] = [];
      
      if (allStaffIds.length > 0) {
        try {
          const staffDocs = await NYCPSStaffModel.find({ 
            _id: { $in: allStaffIds } 
          });
          
          nycpsStaff = staffDocs;

          console.log('✅ Staff array created with', nycpsStaff.length, 'entries');
        } catch (error) {
          console.error('❌ Error fetching staff data:', error);
          // Continue with empty staff array rather than failing entirely
        }
      }

      const result: VisitScheduleData = {
        visit,
        visitSchedule,
        nycpsStaff,
        school,  // ADD: Include school data
        teacherCount,  // ADD: Include calculated count
      };

      return { success: true, data: result };

    } catch (error) {
      console.error('❌ Error fetching visit schedule data:', error);
      return { 
        success: false, 
        error: handleServerError(error, "Failed to fetch visit schedule data") 
      };
    }
  });
} 