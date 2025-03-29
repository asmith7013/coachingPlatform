import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import mongoose from "mongoose";
import {
  DayTypeEnum,
  BlockDayTypeEnum,
  BellScheduleTypesEnum,
  PeriodTypesEnum,
} from "../shared/shared-types.model";

@modelOptions({ schemaOptions: { timestamps: true } })
class ClassScheduleItem {
  @prop({ enum: DayTypeEnum, type: String, required: true })
  day!: DayTypeEnum;

  @prop({ type: String, required: true })
  startTime!: string;

  @prop({ type: String, required: true })
  endTime!: string;
}

@modelOptions({ schemaOptions: { timestamps: true } })
class AssignedCycleDay {
  @prop({ type: Date, required: true })
  date!: Date;

  @prop({ enum: BlockDayTypeEnum, type: String, required: true })
  blockDayType!: BlockDayTypeEnum;
}

@modelOptions({ schemaOptions: { timestamps: true } })
class BellSchedule {
  @prop({ type: String })
  _id?: string;

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

  @prop({ type: Date })
  createdAt?: Date;

  @prop({ type: Date })
  updatedAt?: Date;
}

@modelOptions({ schemaOptions: { timestamps: true } })
class Period {
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
class DailySchedule {
  @prop({ enum: DayTypeEnum, type: String, required: true })
  day!: DayTypeEnum;

  @prop({ type: () => [Period], required: true })
  periods!: Period[];
}

@modelOptions({ schemaOptions: { timestamps: true } })
class TeacherSchedule {
  @prop({ type: String })
  _id?: string;

  @prop({ type: String, required: true })
  teacher!: string;

  @prop({ type: String, required: true })
  school!: string;

  @prop({ type: () => [DailySchedule], required: true })
  scheduleByDay!: DailySchedule[];

  @prop({ type: () => [String], required: true })
  owners!: string[];

  @prop({ type: Date })
  createdAt?: Date;

  @prop({ type: Date })
  updatedAt?: Date;
}

export const ClassScheduleItemModel =
  mongoose.models.ClassScheduleItem || getModelForClass(ClassScheduleItem);

export const AssignedCycleDayModel =
  mongoose.models.AssignedCycleDay || getModelForClass(AssignedCycleDay);

export const BellScheduleModel =
  mongoose.models.BellSchedule || getModelForClass(BellSchedule);

export const PeriodModel =
  mongoose.models.Period || getModelForClass(Period);

export const DailyScheduleModel =
  mongoose.models.DailySchedule || getModelForClass(DailySchedule);

export const TeacherScheduleModel =
  mongoose.models.TeacherSchedule || getModelForClass(TeacherSchedule);

export {
  ClassScheduleItem,
  AssignedCycleDay,
  BellSchedule,
  Period,
  DailySchedule,
  TeacherSchedule,
};