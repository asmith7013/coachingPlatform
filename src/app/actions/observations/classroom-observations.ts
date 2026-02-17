"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { createCrudActions } from "@server/crud";
import { ZodType } from "zod";

import {
  ClassroomObservationModel,
  ObservationCriterionModel,
  FeedbackItemModel,
  LessonFlowStepModel,
  LessonFlowNoteModel,
  LearningTargetModel,
  ObservationTimeTrackingModel,
  TranscriptSectionModel,
  CustomTranscriptSectionModel,
  ContextualNoteModel,
  ObservationTagModel,
  ObservationMetadataModel,
} from "@mongoose-schema/visits/classroom-observation.model";

import {
  ClassroomObservation,
  ClassroomObservationZodSchema,
  ClassroomObservationInputZodSchema,
  ClassroomObservationInput,
  ObservationCriterionZodSchema,
  ObservationCriterionInput,
  FeedbackItemZodSchema,
  FeedbackItemInput,
  LessonFlowStepZodSchema,
  LessonFlowStepInput,
  LessonFlowNoteZodSchema,
  LearningTargetZodSchema,
  LearningTargetInput,
  ObservationTimeTrackingZodSchema,
  ObservationTimeTrackingInput,
  TranscriptSectionZodSchema,
  CustomTranscriptSectionZodSchema,
  ContextualNote,
  ContextualNoteZodSchema,
  ContextualNoteInput,
  ObservationTagZodSchema,
  ObservationTagInput,
  ObservationMetadataZodSchema,
} from "@zod-schema/visits/classroom-observation";

import { QueryParams, DEFAULT_QUERY_PARAMS } from "@core-types/query";
import { Model } from "mongoose";

// --- Core CRUD for ClassroomObservation ---
const classroomObservationActions = createCrudActions({
  model: ClassroomObservationModel,
  schema: ClassroomObservationZodSchema as ZodType<ClassroomObservation>,
  inputSchema:
    ClassroomObservationInputZodSchema as ZodType<ClassroomObservationInput>,
  name: "ClassroomObservation",
  revalidationPaths: [
    "/dashboard/observations",
    "/dashboard/classroom-observations",
  ],
  sortFields: ["date", "teacherId", "status", "createdAt", "updatedAt"],
  defaultSortField: "date",
  defaultSortOrder: "desc",
});

export async function fetchClassroomObservations(
  params: QueryParams = DEFAULT_QUERY_PARAMS,
) {
  return withDbConnection(() => classroomObservationActions.fetch(params));
}
export async function createClassroomObservation(
  data: ClassroomObservationInput,
) {
  return withDbConnection(() => classroomObservationActions.create(data));
}
export async function updateClassroomObservation(
  id: string,
  data: Partial<ClassroomObservationInput>,
) {
  return withDbConnection(() => classroomObservationActions.update(id, data));
}
export async function deleteClassroomObservation(id: string) {
  return withDbConnection(() => classroomObservationActions.delete(id));
}
export async function fetchClassroomObservationById(id: string) {
  return withDbConnection(() => classroomObservationActions.fetchById(id));
}

// --- Contextual Notes CRUD (used independently) ---
const contextualNoteActions = createCrudActions({
  model: ContextualNoteModel,
  schema: ContextualNoteZodSchema as ZodType<ContextualNote>,
  inputSchema: ContextualNoteZodSchema as ZodType<ContextualNoteInput>,
  name: "ContextualNote",
  revalidationPaths: ["/dashboard/observations"],
  sortFields: ["noteType", "priority", "sortOrder", "createdAt"],
  defaultSortField: "sortOrder",
  defaultSortOrder: "asc",
});
export async function fetchContextualNotes(
  params: QueryParams = DEFAULT_QUERY_PARAMS,
) {
  return withDbConnection(() => contextualNoteActions.fetch(params));
}
export async function createContextualNote(data: ContextualNoteInput) {
  return withDbConnection(() => contextualNoteActions.create(data));
}
export async function updateContextualNote(
  id: string,
  data: Partial<ContextualNoteInput>,
) {
  return withDbConnection(() => contextualNoteActions.update(id, data));
}
export async function deleteContextualNote(id: string) {
  return withDbConnection(() => contextualNoteActions.delete(id));
}

// --- Reusable Helper for Related Entity Fetches ---
type CollectionResponse<T> = {
  success: boolean;
  items: T[];
  total: number;
  error?: unknown;
};

type MongoSortOptions = Record<string, 1 | -1>;

async function fetchRelatedByObservation<T>(
  model: Model<T>,
  schema: ZodType<T>,
  observationId: string,
  sortOptions: MongoSortOptions = { sortOrder: 1 },
): Promise<CollectionResponse<T>> {
  try {
    const results = await model
      .find({ observationId })
      .sort(sortOptions)
      .exec();
    return {
      success: true,
      items: (results as unknown[]).map((item: unknown) => schema.parse(item)),
      total: (results as unknown[]).length,
    };
  } catch (error) {
    return {
      success: false,
      items: [],
      total: 0,
      error: handleServerError(error),
    };
  }
}

// --- Related Entity Fetchers (using helper) ---
export async function fetchCriteriaByObservation(observationId: string) {
  return withDbConnection(() =>
    fetchRelatedByObservation(
      ObservationCriterionModel,
      ObservationCriterionZodSchema,
      observationId,
      { sortOrder: 1, category: 1 } as MongoSortOptions,
    ),
  );
}
export async function fetchFeedbackByObservation(observationId: string) {
  return withDbConnection(() =>
    fetchRelatedByObservation(
      FeedbackItemModel,
      FeedbackItemZodSchema,
      observationId,
      { type: 1, sortOrder: 1 } as MongoSortOptions,
    ),
  );
}
export async function fetchLessonFlowByObservation(observationId: string) {
  return withDbConnection(() =>
    fetchRelatedByObservation(
      LessonFlowStepModel,
      LessonFlowStepZodSchema,
      observationId,
      { activity: 1, stepType: 1, sortOrder: 1 } as MongoSortOptions,
    ),
  );
}
export async function fetchLessonFlowNotesByObservation(observationId: string) {
  return withDbConnection(() =>
    fetchRelatedByObservation(
      LessonFlowNoteModel,
      LessonFlowNoteZodSchema,
      observationId,
      { activity: 1, sortOrder: 1 } as MongoSortOptions,
    ),
  );
}
export async function fetchLearningTargetsByObservation(observationId: string) {
  return withDbConnection(() =>
    fetchRelatedByObservation(
      LearningTargetModel,
      LearningTargetZodSchema,
      observationId,
      { sortOrder: 1 } as MongoSortOptions,
    ),
  );
}
export async function fetchTagsByObservation(observationId: string) {
  return withDbConnection(() =>
    fetchRelatedByObservation(
      ObservationTagModel,
      ObservationTagZodSchema,
      observationId,
      { type: 1, value: 1 } as MongoSortOptions,
    ),
  );
}
export async function fetchTranscriptSectionsByObservation(
  observationId: string,
) {
  return withDbConnection(() =>
    fetchRelatedByObservation(
      TranscriptSectionModel,
      TranscriptSectionZodSchema,
      observationId,
    ),
  );
}
export async function fetchCustomTranscriptSectionsByObservation(
  observationId: string,
) {
  return withDbConnection(() =>
    fetchRelatedByObservation(
      CustomTranscriptSectionModel,
      CustomTranscriptSectionZodSchema,
      observationId,
    ),
  );
}

// --- Time Tracking and Metadata (findOne pattern) ---
export async function fetchTimeTrackingByObservation(observationId: string) {
  return withDbConnection(async () => {
    try {
      const result = await ObservationTimeTrackingModel.findOne({
        observationId,
      });
      return {
        success: true,
        data: result ? ObservationTimeTrackingZodSchema.parse(result) : null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: handleServerError(error),
      };
    }
  });
}
export async function fetchObservationMetadataByObservation(
  observationId: string,
) {
  return withDbConnection(async () => {
    try {
      const result = await ObservationMetadataModel.findOne({ observationId });
      return {
        success: true,
        data: result ? ObservationMetadataZodSchema.parse(result) : null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: handleServerError(error),
      };
    }
  });
}

// --- Complex Aggregated Operations (unchanged) ---
export async function fetchCompleteObservation(observationId: string) {
  return withDbConnection(async () => {
    try {
      const observation =
        await ClassroomObservationModel.findById(observationId);
      if (!observation) {
        return {
          success: false,
          error: "Observation not found",
        };
      }
      const [
        criteria,
        feedback,
        lessonFlowSteps,
        lessonFlowNotes,
        learningTargets,
        timeTracking,
        transcripts,
        customTranscripts,
        contextualNotes,
        tags,
        metadata,
      ] = await Promise.all([
        ObservationCriterionModel.find({ observationId }).sort({
          sortOrder: 1,
        }),
        FeedbackItemModel.find({ observationId }).sort({
          type: 1,
          sortOrder: 1,
        }),
        LessonFlowStepModel.find({ observationId }).sort({
          activity: 1,
          stepType: 1,
          sortOrder: 1,
        }),
        LessonFlowNoteModel.find({ observationId }).sort({
          activity: 1,
          sortOrder: 1,
        }),
        LearningTargetModel.find({ observationId }).sort({ sortOrder: 1 }),
        ObservationTimeTrackingModel.findOne({ observationId }),
        TranscriptSectionModel.find({ observationId }),
        CustomTranscriptSectionModel.find({ observationId }),
        ContextualNoteModel.find({ observationId }).sort({ sortOrder: 1 }),
        ObservationTagModel.find({ observationId }),
        ObservationMetadataModel.findOne({ observationId }),
      ]);
      return {
        success: true,
        data: {
          observation: ClassroomObservationZodSchema.parse(observation),
          criteria: criteria.map((item) =>
            ObservationCriterionZodSchema.parse(item),
          ),
          feedback: feedback.map((item) => FeedbackItemZodSchema.parse(item)),
          lessonFlowSteps: lessonFlowSteps.map((item) =>
            LessonFlowStepZodSchema.parse(item),
          ),
          lessonFlowNotes: lessonFlowNotes.map((item) =>
            LessonFlowNoteZodSchema.parse(item),
          ),
          learningTargets: learningTargets.map((item) =>
            LearningTargetZodSchema.parse(item),
          ),
          timeTracking: timeTracking
            ? ObservationTimeTrackingZodSchema.parse(timeTracking)
            : null,
          transcripts: transcripts.map((item) =>
            TranscriptSectionZodSchema.parse(item),
          ),
          customTranscripts: customTranscripts.map((item) =>
            CustomTranscriptSectionZodSchema.parse(item),
          ),
          contextualNotes: contextualNotes.map((item) =>
            ContextualNoteZodSchema.parse(item),
          ),
          tags: tags.map((item) => ObservationTagZodSchema.parse(item)),
          metadata: metadata
            ? ObservationMetadataZodSchema.parse(metadata)
            : null,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error),
      };
    }
  });
}

export async function autoSaveObservationData(
  observationId: string,
  updates: {
    observation?: Partial<ClassroomObservationInput>;
    criteria?: ObservationCriterionInput[];
    feedback?: FeedbackItemInput[];
    lessonFlowSteps?: LessonFlowStepInput[];
    learningTargets?: LearningTargetInput[];
    timeTracking?: ObservationTimeTrackingInput;
    contextualNotes?: ContextualNoteInput[];
    tags?: ObservationTagInput[];
  },
) {
  return withDbConnection(async () => {
    try {
      const updatePromises: Promise<unknown>[] = [];
      if (updates.observation) {
        updatePromises.push(
          ClassroomObservationModel.findByIdAndUpdate(
            observationId,
            updates.observation,
            { new: true },
          ),
        );
      }
      if (updates.criteria) {
        updatePromises.push(
          ObservationCriterionModel.deleteMany({ observationId }).then(() =>
            ObservationCriterionModel.insertMany(
              updates.criteria!.map((criterion) => ({
                ...criterion,
                observationId,
              })),
            ),
          ),
        );
      }
      if (updates.feedback) {
        updatePromises.push(
          FeedbackItemModel.deleteMany({ observationId }).then(() =>
            FeedbackItemModel.insertMany(
              updates.feedback!.map((item) => ({ ...item, observationId })),
            ),
          ),
        );
      }
      if (updates.lessonFlowSteps) {
        updatePromises.push(
          LessonFlowStepModel.deleteMany({ observationId }).then(() =>
            LessonFlowStepModel.insertMany(
              updates.lessonFlowSteps!.map((step) => ({
                ...step,
                observationId,
              })),
            ),
          ),
        );
      }
      if (updates.learningTargets) {
        updatePromises.push(
          LearningTargetModel.deleteMany({ observationId }).then(() =>
            LearningTargetModel.insertMany(
              updates.learningTargets!.map((target) => ({
                ...target,
                observationId,
              })),
            ),
          ),
        );
      }
      if (updates.timeTracking) {
        updatePromises.push(
          ObservationTimeTrackingModel.findOneAndUpdate(
            { observationId },
            { ...updates.timeTracking, observationId },
            { upsert: true, new: true },
          ),
        );
      }
      if (updates.contextualNotes) {
        updatePromises.push(
          ContextualNoteModel.deleteMany({ observationId }).then(() =>
            ContextualNoteModel.insertMany(
              updates.contextualNotes!.map((note) => ({
                ...note,
                observationId,
              })),
            ),
          ),
        );
      }
      if (updates.tags) {
        updatePromises.push(
          ObservationTagModel.deleteMany({ observationId }).then(() =>
            ObservationTagModel.insertMany(
              updates.tags!.map((tag) => ({ ...tag, observationId })),
            ),
          ),
        );
      }
      await Promise.all(updatePromises);
      return {
        success: true,
        message: "Auto-save completed successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error),
      };
    }
  });
}

export async function deleteCompleteObservation(observationId: string) {
  return withDbConnection(async () => {
    try {
      await Promise.all([
        ClassroomObservationModel.findByIdAndDelete(observationId),
        ObservationCriterionModel.deleteMany({ observationId }),
        FeedbackItemModel.deleteMany({ observationId }),
        LessonFlowStepModel.deleteMany({ observationId }),
        LessonFlowNoteModel.deleteMany({ observationId }),
        LearningTargetModel.deleteMany({ observationId }),
        ObservationTimeTrackingModel.deleteMany({ observationId }),
        TranscriptSectionModel.deleteMany({ observationId }),
        CustomTranscriptSectionModel.deleteMany({ observationId }),
        ContextualNoteModel.deleteMany({ observationId }),
        ObservationTagModel.deleteMany({ observationId }),
        ObservationMetadataModel.deleteMany({ observationId }),
      ]);
      return {
        success: true,
        message: "Observation and all related data deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error),
      };
    }
  });
}
