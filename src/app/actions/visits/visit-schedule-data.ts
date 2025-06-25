"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { VisitModel } from "@mongoose-schema/visits/visit.model";
import { VisitScheduleModel } from "@mongoose-schema/schedules/schedule-documents.model";
import { NYCPSStaffModel } from "@mongoose-schema/core/staff.model";
import { handleServerError } from "@error/handlers/server";
import type { Visit } from "@zod-schema/visits/visit";
import type { VisitSchedule } from "@zod-schema/schedules/schedule-documents";
import type { NYCPSStaff } from "@zod-schema/core/staff";
import type { VisitScheduleBlock } from "@zod-schema/schedules/schedule-events";

export interface VisitScheduleData {
  visit?: Visit;
  visitSchedule?: VisitSchedule;
  staffLookup: Map<string, NYCPSStaff>;
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
          data: { staffLookup: new Map() } as VisitScheduleData 
        };
      }

      console.log('✅ Visit fetched:', { 
        id: visit._id, 
        date: visit.date, 
        visitScheduleId: visit.visitScheduleId 
      });

      let visitSchedule: VisitSchedule | undefined;
      let allStaffIds: string[] = [];

      // 2. Fetch VisitSchedule if visitScheduleId exists
      if (visit.visitScheduleId) {
        const scheduleDoc = await VisitScheduleModel.findById(visit.visitScheduleId);
        
        if (scheduleDoc) {
          visitSchedule = scheduleDoc;
          console.log('✅ VisitSchedule fetched:', { 
            id: scheduleDoc._id, 
            timeBlocksCount: scheduleDoc.timeBlocks?.length || 0 
          });

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

      // 4. Fetch all staff in parallel using MongoDB $in query
      const staffLookup = new Map<string, NYCPSStaff>();
      
      if (allStaffIds.length > 0) {
        try {
          const staffDocs = await NYCPSStaffModel.find({ 
            _id: { $in: allStaffIds } 
          });
          
          staffDocs.forEach(staff => {
            staffLookup.set(staff._id.toString(), staff);
          });

          console.log('✅ Staff lookup created with', staffLookup.size, 'entries');
        } catch (error) {
          console.error('❌ Error fetching staff data:', error);
          // Continue with empty staff lookup rather than failing entirely
        }
      }

      const result: VisitScheduleData = {
        visit,
        visitSchedule,
        staffLookup
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