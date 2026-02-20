import mongoose from "mongoose";
import { StaffModel } from "@mongoose-schema/core/staff.model";
import { COACH_EMAIL, type CoachInfo } from "./config";

export async function connectToDb(): Promise<void> {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    console.error("Missing DATABASE_URL in .env.local");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("Connected.\n");
}

export async function lookupCoach(): Promise<CoachInfo> {
  const coachDoc = (await StaffModel.findOne({ email: COACH_EMAIL })
    .select("_id staffName")
    .lean()) as { _id: mongoose.Types.ObjectId; staffName: string } | null;
  if (!coachDoc) {
    console.error(`Coach not found: ${COACH_EMAIL}`);
    process.exit(1);
  }
  console.log(`Found coach: ${coachDoc.staffName} (${coachDoc._id})\n`);
  return coachDoc;
}

export async function lookupOrCreateTeacher(
  email: string,
  displayName: string,
): Promise<{ _id: mongoose.Types.ObjectId; staffName: string }> {
  const existing = (await StaffModel.findOne({ email })
    .select("_id staffName")
    .lean()) as { _id: mongoose.Types.ObjectId; staffName: string } | null;

  if (existing) {
    console.log(`Found teacher: ${existing.staffName} (${existing._id})`);
    return existing;
  }

  // Create a minimal staff record for seed data
  const created = await StaffModel.create({
    staffName: displayName,
    email,
    roles: ["Teacher"],
  });
  console.log(`Created teacher: ${displayName} (${created._id})`);
  return { _id: created._id, staffName: displayName };
}
