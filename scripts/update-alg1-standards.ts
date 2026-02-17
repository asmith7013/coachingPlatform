/**
 * Update Algebra 1 state test questions with data from scoring key JSON files.
 *
 * Updates the following fields for each question:
 *   - standard: cluster code from scoring key (e.g., "A-CED.A", "F-IF.B")
 *   - responseType: "multipleChoice" or "constructedResponse" (from MC/CR)
 *   - points: credit value from scoring key
 *
 * Usage:
 *   npx tsx scripts/update-alg1-standards.ts [--dry-run]
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: ".env.local" });

interface ScoringKeyQuestion {
  number: number;
  type: "MC" | "CR";
  credits: number;
  cluster: string;
}

interface ScoringKeyFile {
  exam: string;
  sitting: string;
  questions: ScoringKeyQuestion[];
}

const SCORING_KEYS_DIR =
  "/Users/alexsmith/Documents/GitHub/mathkcs/raw/ny-eoy/scoring-keys";

const SCORING_KEY_FILES = [
  "alg1-june-2024.json",
  "alg1-august-2024.json",
  "alg1-january-2025.json",
  "alg1-june-2025.json",
  "alg1-august-2025.json",
];

function mapResponseType(
  type: string,
): "multipleChoice" | "constructedResponse" {
  if (type === "MC") return "multipleChoice";
  if (type === "CR") return "constructedResponse";
  throw new Error(`Unknown question type: ${type}`);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  console.log("=".repeat(60));
  console.log("Update Algebra 1 State Test Questions from Scoring Keys");
  console.log("=".repeat(60));
  console.log(`Mode: ${dryRun ? "DRY RUN (no changes will be made)" : "LIVE"}`);

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("ERROR: DATABASE_URL not found in environment");
    process.exit(1);
  }

  console.log("\nConnecting to MongoDB...");
  await mongoose.connect(dbUrl);
  const db = mongoose.connection.db!;
  const collection = db.collection("state-test-questions");
  console.log("Connected.");

  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalExamsProcessed = 0;
  const changeExamples: Array<{
    exam: string;
    qNum: number;
    oldStd: string;
    newStd: string;
  }> = [];

  for (const filename of SCORING_KEY_FILES) {
    const filePath = path.join(SCORING_KEYS_DIR, filename);

    if (!fs.existsSync(filePath)) {
      console.log(`\nWARNING: File not found: ${filePath}, skipping`);
      continue;
    }

    const scoringKey: ScoringKeyFile = JSON.parse(
      fs.readFileSync(filePath, "utf-8"),
    );
    const examTitle = scoringKey.sitting;

    console.log(
      `\nProcessing: ${examTitle} (${scoringKey.questions.length} questions)`,
    );

    // Query DB using same pattern as replace-alg1-screenshots.mjs
    const dbDocs = await collection
      .find({ grade: "alg1", examTitle })
      .sort({ pageIndex: 1 })
      .toArray();

    console.log(`  Found ${dbDocs.length} documents in DB`);

    if (dbDocs.length !== scoringKey.questions.length) {
      console.error(
        `  ERROR: Count mismatch (DB: ${dbDocs.length}, Key: ${scoringKey.questions.length}) — SKIPPING`,
      );
      totalSkipped += scoringKey.questions.length;
      continue;
    }

    totalExamsProcessed++;
    let examUpdated = 0;

    for (let i = 0; i < dbDocs.length; i++) {
      const doc = dbDocs[i];
      const keyQ = scoringKey.questions[i];

      // Sanity check: pageIndex should match question number
      if (doc.pageIndex !== keyQ.number) {
        console.error(
          `  WARNING: pageIndex mismatch at position ${i}: DB pageIndex=${doc.pageIndex}, key number=${keyQ.number}`,
        );
      }

      const newStandard = keyQ.cluster;
      const newResponseType = mapResponseType(keyQ.type);
      const newPoints = keyQ.credits;

      const updates = {
        standard: newStandard,
        responseType: newResponseType,
        points: newPoints,
      };

      if (dryRun) {
        console.log(
          `  [DRY RUN] Q${keyQ.number}: standard "${doc.standard}" -> "${newStandard}", responseType -> "${newResponseType}", points -> ${newPoints}`,
        );
      } else {
        await collection.updateOne({ _id: doc._id }, { $set: updates });
      }

      if (doc.standard !== newStandard && changeExamples.length < 20) {
        changeExamples.push({
          exam: examTitle,
          qNum: keyQ.number,
          oldStd: doc.standard as string,
          newStd: newStandard,
        });
      }

      examUpdated++;
    }

    totalUpdated += examUpdated;
    console.log(`  Updated: ${examUpdated} questions`);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("Summary");
  console.log("=".repeat(60));
  console.log(`Exams processed: ${totalExamsProcessed}`);
  console.log(`Questions updated: ${totalUpdated}`);
  if (totalSkipped > 0) {
    console.log(`Questions skipped: ${totalSkipped}`);
  }

  if (changeExamples.length > 0) {
    console.log("\nExample standard changes:");
    changeExamples.forEach((ex) => {
      console.log(`  ${ex.exam} Q${ex.qNum}: "${ex.oldStd}" -> "${ex.newStd}"`);
    });
  }

  if (dryRun) {
    console.log("\nThis was a DRY RUN. No changes were made.");
    console.log("Run without --dry-run to apply changes.");
  }

  await mongoose.disconnect();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
