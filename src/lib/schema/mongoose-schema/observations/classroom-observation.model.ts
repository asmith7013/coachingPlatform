import mongoose from "mongoose";
import { getModelForClass, prop } from "@typegoose/typegoose";
import { getModel } from "@server/db/model-registry";
import { BaseMongooseDocument } from "@mongoose-schema/base-document";

// Progress Monitoring subdocument schemas
class CriterionObservation {
  @prop({ type: String, required: true })
  criterion!: string;
  
  @prop({ type: Boolean, default: false })
  observed!: boolean;
  
  @prop({ type: String })
  notes?: string;
  
  @prop({ type: String })
  category?: string;
}

class ProgressMonitoring {
  @prop({ type: () => [CriterionObservation], default: [] })
  observedCriteria!: CriterionObservation[];
  
  @prop({ type: String, default: '' })
  overallNotes!: string;
}

// Activity Section subdocument schema
class ActivitySection {
  @prop({ type: String, default: '' })
  launch!: string;
  
  @prop({ type: String, default: '' })
  workTime!: string;
  
  @prop({ type: String, default: '' })
  synthesis!: string;
  
  @prop({ type: () => [String], default: [] })
  notes!: string[];
}

class LessonFlow {
  @prop({ type: () => ActivitySection, default: {} })
  warmUp!: ActivitySection;
  
  @prop({ type: () => ActivitySection, default: {} })
  activity1!: ActivitySection;
  
  @prop({ type: () => ActivitySection })
  activity2?: ActivitySection;
  
  @prop({ type: () => ActivitySection, default: {} })
  lessonSynthesis!: ActivitySection;
}

class Lesson {
  @prop({ type: String, default: '' })
  title!: string;
  
  @prop({ type: String, default: '' })
  course!: string;
  
  @prop({ type: String, default: '' })
  unit!: string;
  
  @prop({ type: String, default: '' })
  lessonNumber!: string;
  
  @prop({ type: String, default: '' })
  curriculum!: string;
}

class Feedback {
  @prop({ type: () => [String], default: [] })
  glow!: string[];
  
  @prop({ type: () => [String], default: [] })
  wonder!: string[];
  
  @prop({ type: () => [String], default: [] })
  grow!: string[];
  
  @prop({ type: () => [String], default: [] })
  nextSteps!: string[];
}

class TimeTracking {
  @prop({ type: String, default: '' })
  classStartTime!: string;
  
  @prop({ type: String, default: '' })
  classEndTime!: string;
  
  @prop({ type: Date })
  observationStartTime?: Date;
  
  @prop({ type: Date })
  observationEndTime?: Date;
  
  @prop({ type: String, default: '00:00:00' })
  stopwatchTime!: string;
  
  @prop({ type: Number })
  startedWhenMinutes?: number;
}

class TranscriptSection {
  @prop({ type: String, default: '' })
  warmUpLaunch!: string;
  
  @prop({ type: String, default: '' })
  activity1Launch!: string;
  
  @prop({ type: String, default: '' })
  activity2Launch!: string;
  
  @prop({ type: String, default: '' })
  synthesisLaunch!: string;
  
  @prop({ type: Object, default: {} })
  customSections!: Record<string, string>;
}

class ClassroomObservation extends BaseMongooseDocument {
  @prop({ type: String, default: '' })
  cycle!: string;
  
  @prop({ type: String, default: '' })
  session!: string;
  
  @prop({ type: Date, required: true })
  date!: Date;
  
  @prop({ type: String, default: '' })
  teacherId!: string;
  
  @prop({ type: String, default: '' })
  coachId!: string;
  
  @prop({ type: String, default: '' })
  schoolId!: string;
  
  @prop({ type: () => Lesson, default: {} })
  lesson!: Lesson;
  
  @prop({ type: String, default: '' })
  otherContext!: string;
  
  @prop({ type: () => [String], default: [] })
  learningTargets!: string[];
  
  @prop({ type: String, default: '' })
  coolDown!: string;
  
  @prop({ type: () => Feedback, default: {} })
  feedback!: Feedback;
  
  @prop({ type: () => LessonFlow, default: {} })
  lessonFlow!: LessonFlow;
  
  @prop({ type: () => ProgressMonitoring, default: {} })
  progressMonitoring!: ProgressMonitoring;
  
  @prop({ type: () => TimeTracking, default: {} })
  timeTracking!: TimeTracking;
  
  @prop({ type: () => TranscriptSection, default: {} })
  transcripts!: TranscriptSection;
  
  @prop({ type: () => [String], default: [] })
  contextualNotes!: string[];
  
  @prop({ type: Object, required: true })
  tagging!: object;
  
  @prop({ type: String, enum: ['draft', 'in_progress', 'completed', 'reviewed'], default: 'draft' })
  status!: string;
  
  @prop({ type: Boolean, default: false })
  isSharedWithTeacher!: boolean;
  
  @prop({ type: String })
  visitId?: string;
  
  @prop({ type: String })
  coachingActionPlanId?: string;
}

export const ClassroomObservationModel =
  mongoose.models.ClassroomObservation || getModelForClass(ClassroomObservation, { schemaOptions: { collection: 'classroomobservations' } });

export async function getClassroomObservationModel() {
  return getModel<ClassroomObservation>('ClassroomObservation', () => getModelForClass(ClassroomObservation));
} 