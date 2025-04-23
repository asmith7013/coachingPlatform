import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import mongoose, { Types } from "mongoose";
import {
  DayTypeEnum,
  BlockDayTypeEnum,
  BellScheduleTypesEnum,
  PeriodTypesEnum,
} from "../shared/shared-types.model";

@modelOptions({ schemaOptions: { timestamps: true } })
export class ClassScheduleItem {
  @prop({ type: Types.ObjectId, required: true })
  _id!: Types.ObjectId;

  @prop({ enum: DayTypeEnum, type: String, required: true })
  dayType!: DayTypeEnum;

  @prop({ type: String, required: true })
  startTime!: string;

  @prop({ type: String, required: true })
  endTime!: string;
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class AssignedCycleDay {
  @prop({ type: Types.ObjectId, required: true })
  _id!: Types.ObjectId;

  @prop({ type: String, required: true })
  date!: string;

  @prop({ enum: BlockDayTypeEnum, type: String, required: true })
  blockDayType!: BlockDayTypeEnum;
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class BellSchedule {
  @prop({ type: Types.ObjectId, required: true })
  _id!: Types.ObjectId;

  @prop({ type: String, required: true })
  school!: string;

  @prop({ enum: BellScheduleTypesEnum, type: String, required: true })
  bellScheduleType!: BellScheduleTypesEnum;

  @prop({ type: () => [ClassScheduleItem], required: true })
  classSchedule!: ClassScheduleItem[];

  @prop({ type: () => [AssignedCycleDay], required: true })
  assignedCycleDays!: AssignedCycleDay[];

  @prop({ type: () => [String], required: true })
  owners!: string[];
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class Period {
  @prop({ type: Types.ObjectId, required: true })
  _id!: Types.ObjectId;

  @prop({ type: Number, required: true })
  periodNum!: number;

  @prop({ type: String, required: true })
  className!: string;

  @prop({ type: String })
  room?: string;

  @prop({ enum: PeriodTypesEnum, type: String, required: true })
  periodType!: PeriodTypesEnum;
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class ScheduleByDay {
  @prop({ type: Types.ObjectId, required: true })
  _id!: Types.ObjectId;

  @prop({ enum: DayTypeEnum, type: String, required: true })
  day!: DayTypeEnum;

  @prop({ type: () => [Period], required: true })
  periods!: Period[];
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class TeacherSchedule {
  @prop({ type: Types.ObjectId, required: true })
  _id!: Types.ObjectId;

  @prop({ type: String, required: true })
  teacher!: string;

  @prop({ type: String, required: true })
  school!: string;

  @prop({ type: () => [ScheduleByDay], required: true })
  scheduleByDay!: ScheduleByDay[];

  @prop({ type: () => [String], required: true })
  owners!: string[];
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