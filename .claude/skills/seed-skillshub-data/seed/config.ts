import mongoose from "mongoose";

export const COACH_EMAIL = "alex.smith@teachinglab.org";

export interface StaffIds {
  teacherId: mongoose.Types.ObjectId;
  coachId: mongoose.Types.ObjectId;
  teacherName: string;
  coachName: string;
}

export interface CoachInfo {
  _id: mongoose.Types.ObjectId;
  staffName: string;
}

export function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(9 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 60));
  return d;
}
