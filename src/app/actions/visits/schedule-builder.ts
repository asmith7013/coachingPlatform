// accept conditionally - needs further review later


"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { 
  VisitScheduleBuilderStateZodSchema
} from "@zod-schema/visits/schedule-builder-state";
import type { VisitScheduleBuilderState } from "@zod-schema/visits/schedule-builder-state";
import mongoose from "mongoose";
import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import { BaseMongooseDocument } from "@mongoose-schema/base-document";
import { v4 as uuidv4 } from 'uuid';

// Temporary state storage model for schedule builder sessions
@modelOptions({ 
  schemaOptions: { 
    collection: 'schedulebuilderstate'
  } 
})
class ScheduleBuilderStateDocument extends BaseMongooseDocument {
  @prop({ type: String, required: true, unique: true })
  sessionId!: string;
  
  @prop({ type: String, required: true })
  coach!: string; // Coach ID who owns this state
  
  @prop({ type: String, required: true })
  school!: string; // School ID context
  
  @prop({ type: Date, required: true })
  date!: Date; // Planning date
  
  @prop({ type: mongoose.Schema.Types.Mixed, required: true })
  stateData!: VisitScheduleBuilderState; // Full state object
  
  @prop({ type: Date, default: Date.now, expires: '24h' })
  expiresAt!: Date; // TTL field - expires after 24 hours
  
  @prop({ type: () => [String], required: true })
  owners!: string[]; // Required field from BaseMongooseDocument
}

// Create the model
const ScheduleBuilderStateModel = mongoose.models.ScheduleBuilderStateDocument || 
  getModelForClass(ScheduleBuilderStateDocument);

/**
 * Save schedule builder state to temporary storage
 * Used by useStatePersistence hook
 */
export async function saveScheduleBuilderState(state: VisitScheduleBuilderState) {
  return withDbConnection(async () => {
    try {
      // Validate the incoming state
      const validatedState = VisitScheduleBuilderStateZodSchema.parse(state);
      
      // Generate session ID if not provided
      const sessionId = validatedState.sessionId || uuidv4();
      
      // Set expiration time (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      // Upsert the state document
      const stateDoc = await ScheduleBuilderStateModel.findOneAndUpdate(
        { sessionId },
        {
          sessionId,
          coach: validatedState.coach,
          school: validatedState.school,
          date: validatedState.date,
          stateData: validatedState,
          expiresAt,
          owners: [validatedState.coach], // Set coach as owner
          updatedAt: new Date()
        },
        { 
          new: true, 
          upsert: true,
          runValidators: true 
        }
      );
      
      return {
        success: true,
        sessionId: stateDoc.sessionId,
        message: 'State saved successfully'
      };
    } catch (error) {
      const errorMessage = handleServerError(error, 'saveScheduleBuilderState');
      return {
        success: false,
        error: errorMessage
      };
    }
  });
}

/**
 * Load schedule builder state from temporary storage
 * Used by useStatePersistence hook
 */
export async function loadScheduleBuilderState(sessionId: string) {
  return withDbConnection(async () => {
    try {
      if (!sessionId) {
        return {
          success: false,
          error: 'Session ID is required'
        };
      }
      
      // Find the state document
      const stateDoc = await ScheduleBuilderStateModel.findOne({ sessionId });
      
      if (!stateDoc) {
        return {
          success: false,
          error: 'State not found or expired'
        };
      }
      
      // Validate the stored state data
      const validatedState = VisitScheduleBuilderStateZodSchema.parse(stateDoc.stateData);
      
      return {
        success: true,
        data: validatedState,
        lastSavedAt: stateDoc.updatedAt
      };
    } catch (error) {
      const errorMessage = handleServerError(error, 'loadScheduleBuilderState');
      return {
        success: false,
        error: errorMessage
      };
    }
  });
}

/**
 * Delete schedule builder state (cleanup)
 * Used for manual state cleanup or when state is no longer needed
 */
export async function deleteScheduleBuilderState(sessionId: string) {
  return withDbConnection(async () => {
    try {
      if (!sessionId) {
        return {
          success: false,
          error: 'Session ID is required'
        };
      }
      
      const result = await ScheduleBuilderStateModel.deleteOne({ sessionId });
      
      return {
        success: true,
        deleted: result.deletedCount > 0,
        message: result.deletedCount > 0 ? 'State deleted successfully' : 'State not found'
      };
    } catch (error) {
      const errorMessage = handleServerError(error, 'deleteScheduleBuilderState');
      return {
        success: false,
        error: errorMessage
      };
    }
  });
}

/**
 * List schedule builder states for a coach (for debugging or recovery)
 * Used for administrative purposes or state recovery
 */
export async function listScheduleBuilderStates(coachId: string) {
  return withDbConnection(async () => {
    try {
      if (!coachId) {
        return {
          success: false,
          error: 'Coach ID is required'
        };
      }
      
      const states = await ScheduleBuilderStateModel.find(
        { coach: coachId },
        { sessionId: 1, school: 1, date: 1, createdAt: 1, updatedAt: 1 }
      ).sort({ updatedAt: -1 });
      
      return {
        success: true,
        data: states.map(state => ({
          sessionId: state.sessionId,
          school: state.school,
          date: state.date,
          createdAt: state.createdAt,
          updatedAt: state.updatedAt
        }))
      };
    } catch (error) {
      const errorMessage = handleServerError(error, 'listScheduleBuilderStates');
      return {
        success: false,
        error: errorMessage
      };
    }
  });
}

/**
 * Clean up expired schedule builder states
 * Used by cleanup jobs or maintenance scripts
 */
export async function cleanupExpiredScheduleBuilderStates() {
  return withDbConnection(async () => {
    try {
      const result = await ScheduleBuilderStateModel.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      
      return {
        success: true,
        deletedCount: result.deletedCount,
        message: `Cleaned up ${result.deletedCount} expired states`
      };
    } catch (error) {
      const errorMessage = handleServerError(error, 'cleanupExpiredScheduleBuilderStates');
      return {
        success: false,
        error: errorMessage
      };
    }
  });
} 