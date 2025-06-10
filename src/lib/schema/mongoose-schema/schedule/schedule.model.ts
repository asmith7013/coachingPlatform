import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import mongoose from "mongoose";
import {
  DayTypes,
  BlockDayTypes,
  BellScheduleTypes,
  PeriodTypes,
} from "@enums";
import { getModel } from "@server/db/model-registry";
import { BaseMongooseDocument } from "@mongoose-schema/base-document";
import { standardSchemaOptions } from "@server/db/mongoose-transform-helper";

@modelOptions({ schemaOptions: { _id: false, collection: 'classscheduleitems' } })
export class ClassScheduleItem {
  @prop({ enum: Object.values(DayTypes), type: String, required: true })
  dayType!: string;

  @prop({ type: String, required: true })
  startTime!: string;

  @prop({ type: String, required: true })
  endTime!: string;
}

@modelOptions({ schemaOptions: { _id: false, collection: 'assignedcycledays' } })
export class AssignedCycleDay {
  @prop({ type: Date, required: true })
  date!: Date;

  @prop({ enum: Object.values(BlockDayTypes), type: String, required: true })
  blockDayType!: string;
}

@modelOptions({ 
  schemaOptions: { 
    ...standardSchemaOptions,
    collection: 'bellschedules' 
  } 
})
export class BellSchedule extends BaseMongooseDocument {
  @prop({ type: String, required: true })
  schoolId!: string;

  @prop({ enum: Object.values(BellScheduleTypes), type: String, required: true })
  bellScheduleType!: string;

  @prop({ type: () => [ClassScheduleItem], required: true })
  classSchedule!: ClassScheduleItem[];

  @prop({ type: () => [AssignedCycleDay], required: true })
  assignedCycleDays!: AssignedCycleDay[];
}

@modelOptions({ schemaOptions: { _id: false, collection: 'periods' } })
export class Period {
  @prop({ type: Number, required: true })
  periodNum!: number;

  @prop({ type: String, required: true })
  className!: string;

  @prop({ type: String })
  room?: string;

  @prop({ enum: Object.values(PeriodTypes), type: String, required: true })
  periodType!: string;
}

@modelOptions({ schemaOptions: { _id: false, collection: 'schedulebydays' } })
export class ScheduleByDay {
  @prop({ enum: Object.values(DayTypes), type: String, required: true })
  day!: string;

  @prop({ type: () => [Period], required: true })
  periods!: Period[];
}

@modelOptions({ 
  schemaOptions: { 
    ...standardSchemaOptions,
    collection: 'teacherschedules' 
  } 
})
export class TeacherSchedule extends BaseMongooseDocument {
  @prop({ type: String, required: true })
  teacherId!: string;

  @prop({ type: String, required: true })
  schoolId!: string;

  @prop({ type: () => [ScheduleByDay], required: true })
  scheduleByDay!: ScheduleByDay[];
}

export const ClassScheduleItemModel =
  mongoose.models.ClassScheduleItem || getModelForClass(ClassScheduleItem);

export const AssignedCycleDayModel =
  mongoose.models.AssignedCycleDay || getModelForClass(AssignedCycleDay);

export const BellScheduleModel =
  mongoose.models.BellSchedule || getModelForClass(BellSchedule);

export const PeriodModel =
  mongoose.models.Period || getModelForClass(Period);

export const ScheduleByDayModel =
  mongoose.models.ScheduleByDay || getModelForClass(ScheduleByDay);

export const TeacherScheduleModel =
  mongoose.models.TeacherSchedule || getModelForClass(TeacherSchedule);

export async function getClassScheduleItemModel() {
  return getModel<ClassScheduleItem>('ClassScheduleItem', () => getModelForClass(ClassScheduleItem));
}

export async function getAssignedCycleDayModel() {
  return getModel<AssignedCycleDay>('AssignedCycleDay', () => getModelForClass(AssignedCycleDay));
}

export async function getBellScheduleModel() {
  return getModel<BellSchedule>('BellSchedule', () => getModelForClass(BellSchedule));
}

export async function getPeriodModel() {
  return getModel<Period>('Period', () => getModelForClass(Period));
}

export async function getScheduleByDayModel() {
  return getModel<ScheduleByDay>('ScheduleByDay', () => getModelForClass(ScheduleByDay));
}

export async function getTeacherScheduleModel() {
  return getModel<TeacherSchedule>('TeacherSchedule', () => getModelForClass(TeacherSchedule));
}
