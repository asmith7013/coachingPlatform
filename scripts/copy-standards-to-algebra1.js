// Script to copy standards from Grade 8 lessons to their Algebra 1 counterparts

// Data from the analysis - lessons that need standards copied
const lessonsToUpdate = [
  { sourceId: "68ff7f1b5d8ca031d6032328", targetId: "6900dd9e465ed885ee46b7a5", name: "Introduction to Linear Relationships" },
  { sourceId: "68ff7f1b5d8ca031d603232b", targetId: "6900dd9e465ed885ee46b7a8", name: "More Linear Relationships" },
  { sourceId: "68ff7f1b5d8ca031d603232e", targetId: "6900dd9e465ed885ee46b7ab", name: "Translating to y=mx+b" },
  { sourceId: "68ff7f1b5d8ca031d6032331", targetId: "6900dd9e465ed885ee46b7ae", name: "Slopes Don't Have to be Positive" },
  { sourceId: "68ff7f1b5d8ca031d6032334", targetId: "6900dd9e465ed885ee46b7b1", name: "Calculating Slope" },
  { sourceId: "68ff7f1b5d8ca031d6032337", targetId: "6900dd9e465ed885ee46b7b4", name: "Equations of All Kinds of Lines" },
  { sourceId: "68ff7f1b5d8ca031d603233a", targetId: "6900dd9e465ed885ee46b7b7", name: "Solutions to Linear Equations" },
  { sourceId: "68ff7f1b5d8ca031d603233d", targetId: "6900dd9e465ed885ee46b7ba", name: "More Solutions to Linear Equations" },
  { sourceId: "68ff7f1b5d8ca031d6032349", targetId: "6900dd9e465ed885ee46b7c6", name: "Solving Any Linear Equation" },
  { sourceId: "68ff7f1b5d8ca031d603234c", targetId: "6900dd9e465ed885ee46b7c9", name: "Strategic Solving" },
  { sourceId: "68ff7f1b5d8ca031d603234f", targetId: "6900dd9e465ed885ee46b7cc", name: "All, Some, or No Solutions" },
  { sourceId: "68ff7f1b5d8ca031d6032352", targetId: "6900dd9f465ed885ee46b7cf", name: "When Are They the Same?" },
  { sourceId: "68ff7f1b5d8ca031d6032355", targetId: "6900dd9f465ed885ee46b7e1", name: "Introduction to Functions" },
  { sourceId: "68ff7f1b5d8ca031d6032358", targetId: "6900dd9f465ed885ee46b7e4", name: "Equations for Functions" },
  { sourceId: "68ff7f1b5d8ca031d603235b", targetId: "6900dd9f465ed885ee46b7e7", name: "Tables, Equations, and Graphs of Functions" },
  { sourceId: "68ff7f1b5d8ca031d603235e", targetId: "6900dd9f465ed885ee46b7f0", name: "Connecting Representations of Functions" },
  { sourceId: "68ff7f1c5d8ca031d6032361", targetId: "6900dd9f465ed885ee46b7f3", name: "Linear Functions" },
  { sourceId: "68ff7f1c5d8ca031d6032364", targetId: "6900dd9f465ed885ee46b7f6", name: "Linear Models" },
  { sourceId: "69330655ebe1c5e99394f4ed", targetId: "6900dd9f465ed885ee46b7fc", name: "Organizing Data" },
  { sourceId: "68ff7f1c5d8ca031d603237f", targetId: "6900dd9f465ed885ee46b7ff", name: "What a Point in a Scatter Plot Means" },
  { sourceId: "68ff7f1c5d8ca031d6032382", targetId: "6900dd9f465ed885ee46b802", name: "Fitting a Line to Data" },
  { sourceId: "68ff7f1c5d8ca031d6032385", targetId: "6900dd9f465ed885ee46b805", name: "Describing Trends in Scatter Plots" },
  { sourceId: "68ff7f1c5d8ca031d6032388", targetId: "6900dd9f465ed885ee46b808", name: "The Slope of a Fitted Line" },
  { sourceId: "68ff7f1c5d8ca031d603238b", targetId: "6900dd9f465ed885ee46b80b", name: "Observing More Patterns in Scatter Plots" },
  { sourceId: "68ff7f1c5d8ca031d603238e", targetId: "6900dd9f465ed885ee46b80e", name: "Analyzing Bivariate Data" },
  { sourceId: "69604b0083b6c2fa66085c6b", targetId: "6924e99b0e8f77a45b579bbb", name: "Ramp Up #1: Introduction to the Coordinate Plane" },
  { sourceId: "68ff7f1b5d8ca031d6032322", targetId: "6924e99b0e8f77a45b579bbe", name: "Ramp Up #2: Which Solution Makes the Equation True?" },
  { sourceId: "68ff7f1b5d8ca031d6032325", targetId: "6924e99b0e8f77a45b579bc4", name: "Ramp Up #4: Two-variable Relationships" },
  { sourceId: "68ff7f1b5d8ca031d6032346", targetId: "692f063ab40e9b0c397f3c48", name: "Balanced Moves" },
  { sourceId: "69330655ebe1c5e99394f4ec", targetId: "693307a5a2ef2edc39e558d5", name: "End of Unit Assessment: 8.5" },
  { sourceId: "69604b0083b6c2fa66085c6b", targetId: "693307a5a2ef2edc39e558d1", name: "End of Unit Assessment: 8.3" },
  { sourceId: "69330655ebe1c5e99394f4eb", targetId: "693307a5a2ef2edc39e558d3", name: "End of Unit Assessment: 8.4" },
  { sourceId: "69330655ebe1c5e99394f4ed", targetId: "693307a5a2ef2edc39e558d7", name: "End of Unit Assessment: 8.6" },
  { sourceId: "68ff7f1c5d8ca031d603237c", targetId: "69345e0150af09b50190b496", name: "Plotting Data" },
  { sourceId: "69330655ebe1c5e99394f4eb", targetId: "695fb78a0b99c31f2ef2c4d7", name: "Mid-Unit Assessment 8.4" },
];

print("Starting migration: Copy standards from Grade 8 to Algebra 1 lessons");
print("Total lessons to update: " + lessonsToUpdate.length);
print("");

let successCount = 0;
let errorCount = 0;

for (const lesson of lessonsToUpdate) {
  // Get the source document (Grade 8)
  const sourceDoc = db["scope-and-sequence"].findOne({ _id: ObjectId(lesson.sourceId) });

  if (!sourceDoc) {
    print("ERROR: Source not found for " + lesson.name + " (ID: " + lesson.sourceId + ")");
    errorCount++;
    continue;
  }

  if (!sourceDoc.standards || sourceDoc.standards.length === 0) {
    print("WARNING: Source has no standards for " + lesson.name);
    errorCount++;
    continue;
  }

  // Update the target document (Algebra 1)
  const result = db["scope-and-sequence"].updateOne(
    { _id: ObjectId(lesson.targetId) },
    { $set: { standards: sourceDoc.standards } }
  );

  if (result.modifiedCount === 1) {
    print("SUCCESS: " + lesson.name + " - copied " + sourceDoc.standards.length + " standards");
    successCount++;
  } else if (result.matchedCount === 0) {
    print("ERROR: Target not found for " + lesson.name + " (ID: " + lesson.targetId + ")");
    errorCount++;
  } else {
    print("WARNING: No change for " + lesson.name + " (may already have standards)");
  }
}

print("");
print("=== MIGRATION COMPLETE ===");
print("Successful updates: " + successCount);
print("Errors: " + errorCount);
