"use server";

import { revalidatePath } from "next/cache";
import { handleServerError } from "@error/handlers/server";
import { withDbConnection } from "@server/db/ensure-connection";
import { SnorklActivityModel, SnorklScrapingMetadataModel } from "@mongoose-schema/313/storage";
import { type SnorklActivityInput } from "@zod-schema/scm/storage";

export async function saveSnorklActivities(activities: SnorklActivityInput[]) {
  return withDbConnection(async () => {
    try {
      const savedActivities = [];
      
      for (const activity of activities) {
        try {
          // Check if activity already exists
          const existing = await SnorklActivityModel.findOne({ 
            activityId: activity.activityId 
          });
          
          if (existing) {
            // Update existing activity
            const updated = await SnorklActivityModel.findByIdAndUpdate(
              existing._id,
              activity,
              { new: true }
            );
            savedActivities.push(updated);
          } else {
            // Create new activity
            const newActivity = await SnorklActivityModel.create(activity);
            savedActivities.push(newActivity);
          }
        } catch (error) {
          console.error(`Error saving activity ${activity.activityTitle}:`, error);
        }
      }
      
      revalidatePath("/dashboard/integrations/snorkl");
      
      return { 
        success: true, 
        data: savedActivities,
        message: `Saved ${savedActivities.length} activities`
      };
      
    } catch (error) {
      return { 
        success: false, 
        error: handleServerError(error, "Failed to save Snorkl activities") 
      };
    }
  });
}

export async function saveScrapingMetadata(metadata: {
  scrapingDate: string;
  totalClassesScraped: number;
  totalActivitiesFound: number;
  totalErrorsEncountered: number;
  classesProcessed: Array<{
    className: string;
    classId: string;
    activitiesFound: number;
    errors: string[];
  }>;
  globalErrors: string[];
  csvUrlsGenerated: string[];
}) {
  return withDbConnection(async () => {
    try {
      const savedMetadata = await SnorklScrapingMetadataModel.create(metadata);
      
      revalidatePath("/dashboard/integrations/snorkl");
      
      return { 
        success: true, 
        data: savedMetadata 
      };
      
    } catch (error) {
      return { 
        success: false, 
        error: handleServerError(error, "Failed to save scraping metadata") 
      };
    }
  });
}

export async function fetchSnorklActivities() {
  return withDbConnection(async () => {
    try {
      const activities = await SnorklActivityModel.find()
        .sort({ createdAt: -1 })
        .lean();
      
      return { 
        success: true, 
        data: activities 
      };
      
    } catch (error) {
      return { 
        success: false, 
        error: handleServerError(error, "Failed to fetch Snorkl activities") 
      };
    }
  });
}

export async function fetchSnorklActivitiesByDistrict(district: string) {
  return withDbConnection(async () => {
    try {
      const activities = await SnorklActivityModel.find({ district })
        .sort({ createdAt: -1 })
        .lean();
      
      return { 
        success: true, 
        data: activities 
      };
      
    } catch (error) {
      return { 
        success: false, 
        error: handleServerError(error, `Failed to fetch Snorkl activities for district ${district}`) 
      };
    }
  });
}

export async function fetchSnorklActivitiesBySection(section: string) {
  return withDbConnection(async () => {
    try {
      const activities = await SnorklActivityModel.find({ section })
        .sort({ createdAt: -1 })
        .lean();
      
      return { 
        success: true, 
        data: activities 
      };
      
    } catch (error) {
      return { 
        success: false, 
        error: handleServerError(error, `Failed to fetch Snorkl activities for section ${section}`) 
      };
    }
  });
}

export async function fetchScrapingHistory() {
  return withDbConnection(async () => {
    try {
      const history = await SnorklScrapingMetadataModel.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
      
      return { 
        success: true, 
        data: history 
      };
      
    } catch (error) {
      return { 
        success: false, 
        error: handleServerError(error, "Failed to fetch scraping history") 
      };
    }
  });
}

export async function deleteSnorklActivity(activityId: string) {
  return withDbConnection(async () => {
    try {
      const deleted = await SnorklActivityModel.findOneAndDelete({ 
        activityId 
      });
      
      if (!deleted) {
        return {
          success: false,
          error: "Activity not found"
        };
      }
      
      revalidatePath("/dashboard/integrations/snorkl");
      
      return { 
        success: true, 
        data: deleted,
        message: "Activity deleted successfully"
      };
      
    } catch (error) {
      return { 
        success: false, 
        error: handleServerError(error, "Failed to delete Snorkl activity") 
      };
    }
  });
}

export async function getSnorklActivityStats() {
  return withDbConnection(async () => {
    try {
      const stats = await SnorklActivityModel.aggregate([
        {
          $group: {
            _id: null,
            totalActivities: { $sum: 1 },
            totalStudents: { $sum: { $size: "$data" } },
            districts: { $addToSet: "$district" },
            sections: { $addToSet: "$section" },
            teachers: { $addToSet: "$teacher" }
          }
        }
      ]);
      
      const sectionStats = await SnorklActivityModel.aggregate([
        {
          $group: {
            _id: "$section",
            activitiesCount: { $sum: 1 },
            studentsCount: { $sum: { $size: "$data" } },
            district: { $first: "$district" }
          }
        }
      ]);
      
      return { 
        success: true, 
        data: {
          overview: stats[0] || {
            totalActivities: 0,
            totalStudents: 0,
            districts: [],
            sections: [],
            teachers: []
          },
          bySections: sectionStats
        }
      };
      
    } catch (error) {
      return { 
        success: false, 
        error: handleServerError(error, "Failed to get Snorkl activity stats") 
      };
    }
  });
} 