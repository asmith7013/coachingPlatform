"use server";

import { 
  ClassroomObservationV2Model,
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
  ObservationMetadataModel
} from "@mongoose-schema/observations/classroom-observation-v2.model";

import { 
  ClassroomObservationV2,
  ClassroomObservationV2ZodSchema,
  ClassroomObservationV2InputZodSchema,
  ClassroomObservationV2Input,
  ObservationCriterion,
  ObservationCriterionZodSchema,
  ObservationCriterionInput,
  FeedbackItem,
  FeedbackItemZodSchema,
  FeedbackItemInput,
  LessonFlowStep,
  LessonFlowStepZodSchema,
  LessonFlowStepInput,
  LessonFlowNote,
  LessonFlowNoteZodSchema,
  LessonFlowNoteInput,
  LearningTarget,
  LearningTargetZodSchema,
  LearningTargetInput,
  ObservationTimeTracking,
  ObservationTimeTrackingZodSchema,
  ObservationTimeTrackingInput,
  TranscriptSection,
  TranscriptSectionZodSchema,
  TranscriptSectionInput,
  CustomTranscriptSection,
  CustomTranscriptSectionZodSchema,
  CustomTranscriptSectionInput,
  ContextualNote,
  ContextualNoteZodSchema,
  ContextualNoteInput,
  ObservationTag,
  ObservationTagZodSchema,
  ObservationTagInput,
  ObservationMetadata,
  ObservationMetadataZodSchema,
  ObservationMetadataInput
} from "@zod-schema/observations/classroom-observation-v2";

import { createCrudActions } from "@server/crud";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { ZodType } from "zod";
import { QueryParams } from "@core-types/query";

// ===== CORE OBSERVATION ACTIONS =====
const classroomObservationV2Actions = createCrudActions({
  model: ClassroomObservationV2Model,
  schema: ClassroomObservationV2ZodSchema as ZodType<ClassroomObservationV2>,
  inputSchema: ClassroomObservationV2InputZodSchema as ZodType<ClassroomObservationV2Input>,
  name: "ClassroomObservationV2",
  revalidationPaths: ["/dashboard/observations", "/dashboard/classroom-observations"],
  sortFields: ['date', 'teacherId', 'status', 'createdAt', 'updatedAt'],
  defaultSortField: 'date',
  defaultSortOrder: 'desc'
});

export async function fetchClassroomObservationsV2(params: QueryParams) {
  return withDbConnection(() => classroomObservationV2Actions.fetch(params));
}

export async function createClassroomObservationV2(data: ClassroomObservationV2Input) {
  return withDbConnection(() => classroomObservationV2Actions.create(data));
}

export async function updateClassroomObservationV2(id: string, data: Partial<ClassroomObservationV2Input>) {
  return withDbConnection(() => classroomObservationV2Actions.update(id, data));
}

export async function deleteClassroomObservationV2(id: string) {
  return withDbConnection(() => classroomObservationV2Actions.delete(id));
}

export async function fetchClassroomObservationV2ById(id: string) {
  return withDbConnection(() => classroomObservationV2Actions.fetchById(id));
}

// ===== OBSERVATION CRITERIA ACTIONS =====
const observationCriterionActions = createCrudActions({
  model: ObservationCriterionModel,
  schema: ObservationCriterionZodSchema as ZodType<ObservationCriterion>,
  inputSchema: ObservationCriterionZodSchema as ZodType<ObservationCriterionInput>,
  name: "ObservationCriterion",
  revalidationPaths: ["/dashboard/observations"],
  sortFields: ['sortOrder', 'category', 'createdAt'],
  defaultSortField: 'sortOrder',
  defaultSortOrder: 'asc'
});

export async function fetchObservationCriteria(params: QueryParams) {
  return withDbConnection(() => observationCriterionActions.fetch(params));
}

export async function createObservationCriterion(data: ObservationCriterionInput) {
  return withDbConnection(() => observationCriterionActions.create(data));
}

export async function updateObservationCriterion(id: string, data: Partial<ObservationCriterionInput>) {
  return withDbConnection(() => observationCriterionActions.update(id, data));
}

export async function deleteObservationCriterion(id: string) {
  return withDbConnection(() => observationCriterionActions.delete(id));
}

export async function fetchCriteriaByObservation(observationId: string) {
  return withDbConnection(async () => {
    try {
      const results = await ObservationCriterionModel.find({ observationId })
        .sort({ sortOrder: 1, category: 1 })
        .exec();
      
      return {
        success: true,
        items: results.map(item => ObservationCriterionZodSchema.parse(item)),
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

// ===== FEEDBACK ITEMS ACTIONS =====
const feedbackItemActions = createCrudActions({
  model: FeedbackItemModel,
  schema: FeedbackItemZodSchema as ZodType<FeedbackItem>,
  inputSchema: FeedbackItemZodSchema as ZodType<FeedbackItemInput>,
  name: "FeedbackItem",
  revalidationPaths: ["/dashboard/observations"],
  sortFields: ['type', 'sortOrder', 'createdAt'],
  defaultSortField: 'sortOrder',
  defaultSortOrder: 'asc'
});

export async function fetchFeedbackItems(params: QueryParams) {
  return withDbConnection(() => feedbackItemActions.fetch(params));
}

export async function createFeedbackItem(data: FeedbackItemInput) {
  return withDbConnection(() => feedbackItemActions.create(data));
}

export async function updateFeedbackItem(id: string, data: Partial<FeedbackItemInput>) {
  return withDbConnection(() => feedbackItemActions.update(id, data));
}

export async function deleteFeedbackItem(id: string) {
  return withDbConnection(() => feedbackItemActions.delete(id));
}

export async function fetchFeedbackByObservation(observationId: string) {
  return withDbConnection(async () => {
    try {
      const results = await FeedbackItemModel.find({ observationId })
        .sort({ type: 1, sortOrder: 1 })
        .exec();
      
      return {
        success: true,
        items: results.map(item => FeedbackItemZodSchema.parse(item)),
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

// ===== LESSON FLOW STEPS ACTIONS =====
const lessonFlowStepActions = createCrudActions({
  model: LessonFlowStepModel,
  schema: LessonFlowStepZodSchema as ZodType<LessonFlowStep>,
  inputSchema: LessonFlowStepZodSchema as ZodType<LessonFlowStepInput>,
  name: "LessonFlowStep",
  revalidationPaths: ["/dashboard/observations"],
  sortFields: ['activity', 'stepType', 'sortOrder', 'createdAt'],
  defaultSortField: 'sortOrder',
  defaultSortOrder: 'asc'
});

export async function fetchLessonFlowSteps(params: QueryParams) {
  return withDbConnection(() => lessonFlowStepActions.fetch(params));
}

export async function createLessonFlowStep(data: LessonFlowStepInput) {
  return withDbConnection(() => lessonFlowStepActions.create(data));
}

export async function updateLessonFlowStep(id: string, data: Partial<LessonFlowStepInput>) {
  return withDbConnection(() => lessonFlowStepActions.update(id, data));
}

export async function deleteLessonFlowStep(id: string) {
  return withDbConnection(() => lessonFlowStepActions.delete(id));
}

export async function fetchLessonFlowByObservation(observationId: string) {
  return withDbConnection(async () => {
    try {
      const results = await LessonFlowStepModel.find({ observationId })
        .sort({ activity: 1, stepType: 1, sortOrder: 1 })
        .exec();
      
      return {
        success: true,
        items: results.map(item => LessonFlowStepZodSchema.parse(item)),
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

// ===== LEARNING TARGETS ACTIONS =====
const learningTargetActions = createCrudActions({
  model: LearningTargetModel,
  schema: LearningTargetZodSchema as ZodType<LearningTarget>,
  inputSchema: LearningTargetZodSchema as ZodType<LearningTargetInput>,
  name: "LearningTarget",
  revalidationPaths: ["/dashboard/observations"],
  sortFields: ['sortOrder', 'createdAt'],
  defaultSortField: 'sortOrder',
  defaultSortOrder: 'asc'
});

export async function fetchLearningTargets(params: QueryParams) {
  return withDbConnection(() => learningTargetActions.fetch(params));
}

export async function createLearningTarget(data: LearningTargetInput) {
  return withDbConnection(() => learningTargetActions.create(data));
}

export async function updateLearningTarget(id: string, data: Partial<LearningTargetInput>) {
  return withDbConnection(() => learningTargetActions.update(id, data));
}

export async function deleteLearningTarget(id: string) {
  return withDbConnection(() => learningTargetActions.delete(id));
}

export async function fetchLearningTargetsByObservation(observationId: string) {
  return withDbConnection(async () => {
    try {
      const results = await LearningTargetModel.find({ observationId })
        .sort({ sortOrder: 1 })
        .exec();
      
      return {
        success: true,
        items: results.map(item => LearningTargetZodSchema.parse(item)),
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

// ===== TIME TRACKING ACTIONS =====
const timeTrackingActions = createCrudActions({
  model: ObservationTimeTrackingModel,
  schema: ObservationTimeTrackingZodSchema as ZodType<ObservationTimeTracking>,
  inputSchema: ObservationTimeTrackingZodSchema as ZodType<ObservationTimeTrackingInput>,
  name: "ObservationTimeTracking",
  revalidationPaths: ["/dashboard/observations"],
  sortFields: ['createdAt', 'updatedAt'],
  defaultSortField: 'createdAt',
  defaultSortOrder: 'desc'
});

export async function fetchTimeTrackingByObservation(observationId: string) {
  return withDbConnection(async () => {
    try {
      const result = await ObservationTimeTrackingModel.findOne({ observationId });
      
      return {
        success: true,
        data: result ? ObservationTimeTrackingZodSchema.parse(result) : null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: handleServerError(error)
      };
    }
  });
}

export async function createTimeTracking(data: ObservationTimeTrackingInput) {
  return withDbConnection(() => timeTrackingActions.create(data));
}

export async function updateTimeTracking(id: string, data: Partial<ObservationTimeTrackingInput>) {
  return withDbConnection(() => timeTrackingActions.update(id, data));
}

// ===== CONTEXTUAL NOTES ACTIONS =====
const contextualNoteActions = createCrudActions({
  model: ContextualNoteModel,
  schema: ContextualNoteZodSchema as ZodType<ContextualNote>,
  inputSchema: ContextualNoteZodSchema as ZodType<ContextualNoteInput>,
  name: "ContextualNote",
  revalidationPaths: ["/dashboard/observations"],
  sortFields: ['noteType', 'priority', 'sortOrder', 'createdAt'],
  defaultSortField: 'sortOrder',
  defaultSortOrder: 'asc'
});

export async function fetchContextualNotes(params: QueryParams) {
  return withDbConnection(() => contextualNoteActions.fetch(params));
}

export async function createContextualNote(data: ContextualNoteInput) {
  return withDbConnection(() => contextualNoteActions.create(data));
}

export async function updateContextualNote(id: string, data: Partial<ContextualNoteInput>) {
  return withDbConnection(() => contextualNoteActions.update(id, data));
}

export async function deleteContextualNote(id: string) {
  return withDbConnection(() => contextualNoteActions.delete(id));
}

export async function fetchNotesByObservation(observationId: string) {
  return withDbConnection(async () => {
    try {
      const results = await ContextualNoteModel.find({ observationId })
        .sort({ sortOrder: 1, createdAt: 1 })
        .exec();
      
      return {
        success: true,
        items: results.map(item => ContextualNoteZodSchema.parse(item)),
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

// ===== OBSERVATION TAGS ACTIONS =====
const observationTagActions = createCrudActions({
  model: ObservationTagModel,
  schema: ObservationTagZodSchema as ZodType<ObservationTag>,
  inputSchema: ObservationTagZodSchema as ZodType<ObservationTagInput>,
  name: "ObservationTag",
  revalidationPaths: ["/dashboard/observations"],
  sortFields: ['type', 'value', 'createdAt'],
  defaultSortField: 'type',
  defaultSortOrder: 'asc'
});

export async function fetchObservationTags(params: QueryParams) {
  return withDbConnection(() => observationTagActions.fetch(params));
}

export async function createObservationTag(data: ObservationTagInput) {
  return withDbConnection(() => observationTagActions.create(data));
}

export async function updateObservationTag(id: string, data: Partial<ObservationTagInput>) {
  return withDbConnection(() => observationTagActions.update(id, data));
}

export async function deleteObservationTag(id: string) {
  return withDbConnection(() => observationTagActions.delete(id));
}

export async function fetchTagsByObservation(observationId: string) {
  return withDbConnection(async () => {
    try {
      const results = await ObservationTagModel.find({ observationId })
        .sort({ type: 1, value: 1 })
        .exec();
      
      return {
        success: true,
        items: results.map(item => ObservationTagZodSchema.parse(item)),
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

// ===== AGGREGATED OBSERVATION DATA =====
export async function fetchCompleteObservationV2(observationId: string) {
  return withDbConnection(async () => {
    try {
      // Fetch main observation
      const observation = await ClassroomObservationV2Model.findById(observationId);
      if (!observation) {
        return {
          success: false,
          error: "Observation not found"
        };
      }

      // Fetch all related data in parallel
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
        metadata
      ] = await Promise.all([
        ObservationCriterionModel.find({ observationId }).sort({ sortOrder: 1 }),
        FeedbackItemModel.find({ observationId }).sort({ type: 1, sortOrder: 1 }),
        LessonFlowStepModel.find({ observationId }).sort({ activity: 1, stepType: 1, sortOrder: 1 }),
        LessonFlowNoteModel.find({ observationId }).sort({ activity: 1, sortOrder: 1 }),
        LearningTargetModel.find({ observationId }).sort({ sortOrder: 1 }),
        ObservationTimeTrackingModel.findOne({ observationId }),
        TranscriptSectionModel.find({ observationId }),
        CustomTranscriptSectionModel.find({ observationId }),
        ContextualNoteModel.find({ observationId }).sort({ sortOrder: 1 }),
        ObservationTagModel.find({ observationId }),
        ObservationMetadataModel.findOne({ observationId })
      ]);

      return {
        success: true,
        data: {
          observation: ClassroomObservationV2ZodSchema.parse(observation),
          criteria: criteria.map(item => ObservationCriterionZodSchema.parse(item)),
          feedback: feedback.map(item => FeedbackItemZodSchema.parse(item)),
          lessonFlowSteps: lessonFlowSteps.map(item => LessonFlowStepZodSchema.parse(item)),
          lessonFlowNotes: lessonFlowNotes.map(item => LessonFlowNoteZodSchema.parse(item)),
          learningTargets: learningTargets.map(item => LearningTargetZodSchema.parse(item)),
          timeTracking: timeTracking ? ObservationTimeTrackingZodSchema.parse(timeTracking) : null,
          transcripts: transcripts.map(item => TranscriptSectionZodSchema.parse(item)),
          customTranscripts: customTranscripts.map(item => CustomTranscriptSectionZodSchema.parse(item)),
          contextualNotes: contextualNotes.map(item => ContextualNoteZodSchema.parse(item)),
          tags: tags.map(item => ObservationTagZodSchema.parse(item)),
          metadata: metadata ? ObservationMetadataZodSchema.parse(metadata) : null
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

// ===== BATCH AUTOSAVE OPERATIONS =====
export async function autoSaveObservationData(observationId: string, updates: {
  observation?: Partial<ClassroomObservationV2Input>;
  criteria?: ObservationCriterionInput[];
  feedback?: FeedbackItemInput[];
  lessonFlowSteps?: LessonFlowStepInput[];
  learningTargets?: LearningTargetInput[];
  timeTracking?: ObservationTimeTrackingInput;
  contextualNotes?: ContextualNoteInput[];
  tags?: ObservationTagInput[];
}) {
  return withDbConnection(async () => {
    try {
      const updatePromises: Promise<any>[] = [];

      // Update main observation
      if (updates.observation) {
        updatePromises.push(
          ClassroomObservationV2Model.findByIdAndUpdate(observationId, updates.observation, { new: true })
        );
      }

      // Update criteria
      if (updates.criteria) {
        // Replace all criteria for this observation
        updatePromises.push(
          ObservationCriterionModel.deleteMany({ observationId }).then(() =>
            ObservationCriterionModel.insertMany(
              updates.criteria!.map(criterion => ({ ...criterion, observationId }))
            )
          )
        );
      }

      // Update feedback
      if (updates.feedback) {
        updatePromises.push(
          FeedbackItemModel.deleteMany({ observationId }).then(() =>
            FeedbackItemModel.insertMany(
              updates.feedback!.map(item => ({ ...item, observationId }))
            )
          )
        );
      }

      // Update lesson flow steps
      if (updates.lessonFlowSteps) {
        updatePromises.push(
          LessonFlowStepModel.deleteMany({ observationId }).then(() =>
            LessonFlowStepModel.insertMany(
              updates.lessonFlowSteps!.map(step => ({ ...step, observationId }))
            )
          )
        );
      }

      // Update learning targets
      if (updates.learningTargets) {
        updatePromises.push(
          LearningTargetModel.deleteMany({ observationId }).then(() =>
            LearningTargetModel.insertMany(
              updates.learningTargets!.map(target => ({ ...target, observationId }))
            )
          )
        );
      }

      // Update time tracking (upsert)
      if (updates.timeTracking) {
        updatePromises.push(
          ObservationTimeTrackingModel.findOneAndUpdate(
            { observationId },
            { ...updates.timeTracking, observationId },
            { upsert: true, new: true }
          )
        );
      }

      // Update contextual notes
      if (updates.contextualNotes) {
        updatePromises.push(
          ContextualNoteModel.deleteMany({ observationId }).then(() =>
            ContextualNoteModel.insertMany(
              updates.contextualNotes!.map(note => ({ ...note, observationId }))
            )
          )
        );
      }

      // Update tags
      if (updates.tags) {
        updatePromises.push(
          ObservationTagModel.deleteMany({ observationId }).then(() =>
            ObservationTagModel.insertMany(
              updates.tags!.map(tag => ({ ...tag, observationId }))
            )
          )
        );
      }

      await Promise.all(updatePromises);

      return {
        success: true,
        message: "Auto-save completed successfully"
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error)
      };
    }
  });
}
