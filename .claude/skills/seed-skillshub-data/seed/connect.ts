import mongoose from "mongoose";
import { StaffModel } from "@mongoose-schema/core/staff.model";
import { TEACHER_EMAIL, COACH_EMAIL, type StaffIds } from "./config";

export async function connectAndLookupStaff(): Promise<StaffIds> {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    console.error("Missing DATABASE_URL in .env.local");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("Connected.\n");

  const teacherDoc = (await StaffModel.findOne({ email: TEACHER_EMAIL })
    .select("_id staffName")
    .lean()) as { _id: mongoose.Types.ObjectId; staffName: string } | null;
  if (!teacherDoc) {
    console.error(`Teacher not found: ${TEACHER_EMAIL}`);
    process.exit(1);
  }
  console.log(`Found teacher: ${teacherDoc.staffName} (${teacherDoc._id})`);

  const coachDoc = (await StaffModel.findOne({ email: COACH_EMAIL })
    .select("_id staffName")
    .lean()) as { _id: mongoose.Types.ObjectId; staffName: string } | null;
  if (!coachDoc) {
    console.error(`Coach not found: ${COACH_EMAIL}`);
    process.exit(1);
  }
  console.log(`Found coach: ${coachDoc.staffName} (${coachDoc._id})\n`);

  return {
    teacherId: teacherDoc._id,
    coachId: coachDoc._id,
    teacherName: teacherDoc.staffName,
    coachName: coachDoc.staffName,
  };
}
