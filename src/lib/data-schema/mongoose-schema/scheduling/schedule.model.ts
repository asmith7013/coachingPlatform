import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import mongoose, {  } from "mongoose";
import {
  DayTypes,
  BlockDayTypes,
  BellScheduleTypes,
  PeriodTypes,
} from "@data-schema/enum";

@modelOptions({ schemaOptions: { timestamps: true, _id: false, collection: 'classscheduleitems' } })
export class ClassScheduleItem {

  @prop({ enum: Object.values(DayTypes), type: String, required: true })
  dayType!: string;

  @prop({ type: String, required: true })
  startTime!: string;

  @prop({ type: String, required: true })
  endTime!: string;
}

@modelOptions({ schemaOptions: {timestamps: true, _id: false, collection: 'assignedcycledays' } })
export class AssignedCycleDay {

  @prop({ type: String, required: true })
  date!: string;

  @prop({ enum: Object.values(BlockDayTypes), type: String, required: true })
  blockDayType!: string;
}

@modelOptions({ schemaOptions: { timestamps: true, collection: 'bellschedules' } })
export class BellSchedule {

  @prop({ type: String, required: true })
  school!: string;

  @prop({ enum: Object.values(BellScheduleTypes), type: String, required: true })
  bellScheduleType!: string;

  @prop({ type: () => [ClassScheduleItem], required: true })
  classSchedule!: ClassScheduleItem[];

  @prop({ type: () => [AssignedCycleDay], required: true })
  assignedCycleDays!: AssignedCycleDay[];

  @prop({ type: () => [String], required: true })
  owners!: string[];
}

@modelOptions({ schemaOptions: { timestamps: true, _id: false, collection: 'periods' } })
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

@modelOptions({ schemaOptions: { timestamps: true, _id: false, collection: 'schedulebydays' } })
export class ScheduleByDay {

  @prop({ enum: Object.values(DayTypes), type: String, required: true })
  day!: string;

  @prop({ type: () => [Period], required: true })
  periods!: Period[];
}

@modelOptions({ schemaOptions: { timestamps: true, collection: 'teacherschedules' } })
export class TeacherSchedule {

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