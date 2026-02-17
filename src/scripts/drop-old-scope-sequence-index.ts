/**
 * Migration script to drop the old unitLessonId unique index
 * and create the new compound unique index
 *
 * Run with: npx tsx src/scripts/drop-old-scope-sequence-index.ts
 */

import mongoose from "mongoose";

async function dropOldIndex() {
  try {
    // Connect to MongoDB
    const mongoUri =
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/ai-coaching-platform";
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not available");
    }

    const collection = db.collection("scope-and-sequence");

    // Get all indexes
    console.log("\n📋 Current indexes:");
    const indexes = await collection.indexes();
    indexes.forEach((idx) => {
      console.log(`  - ${idx.name}:`, idx.key);
    });

    // Check if the old index exists
    const oldIndexExists = indexes.some((idx) => idx.name === "unitLessonId_1");

    if (oldIndexExists) {
      console.log("\n🗑️  Dropping old unique index: unitLessonId_1");
      await collection.dropIndex("unitLessonId_1");
      console.log("✅ Successfully dropped old index");
    } else {
      console.log(
        "\n✅ Old index (unitLessonId_1) does not exist - nothing to drop",
      );
    }

    // Verify the new compound index exists
    const newIndexExists = indexes.some(
      (idx) => idx.name === "grade_1_unitLessonId_1_scopeSequenceTag_1",
    );

    if (!newIndexExists) {
      console.log(
        "\n⚠️  New compound index not found. It should be created automatically by Mongoose on next server start.",
      );
      console.log(
        "   Index: { grade: 1, unitLessonId: 1, scopeSequenceTag: 1 }",
      );
    } else {
      console.log("\n✅ New compound index already exists");
    }

    console.log("\n📋 Updated indexes:");
    const updatedIndexes = await collection.indexes();
    updatedIndexes.forEach((idx) => {
      console.log(`  - ${idx.name}:`, idx.key);
    });

    console.log("\n🎉 Migration complete!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

dropOldIndex();
