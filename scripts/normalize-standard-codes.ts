/**
 * Script to normalize all standard codes to consistent format: NY-X.XX.Xa
 *
 * Correct format examples:
 *   - NY-6.RP.3a (substandard)
 *   - NY-7.EE.4 (parent standard)
 *   - NY-8.G.1 (parent standard)
 *
 * Incorrect formats to fix:
 *   - NY-6.RP.A.3.a → NY-6.RP.3a (remove domain letter, merge suffix)
 *   - NY-6.RP.3.a → NY-6.RP.3a (merge suffix)
 *   - 6.RP.3a → NY-6.RP.3a (add NY- prefix)
 *   - NY-6.AEE.A.1 → NY-6.EE.1 (remove extra "A" in domain)
 *
 * Usage:
 *   npx ts-node scripts/normalize-standard-codes.ts [--dry-run]
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

/**
 * Check if a code should be deleted (MP standards)
 */
function shouldDeleteCode(code: string): boolean {
  // Delete Math Practice standards (MP1, MP2, etc.)
  return /^MP\d+$/.test(code);
}

/**
 * Normalize a standard code to the correct format: NY-X.XX.Xa
 *
 * Valid NY math standards domains (Grades 6-8):
 *   RP, NS, EE, G, SP, F
 *
 * We only normalize codes that clearly match CCSS/NY math standard patterns.
 * Codes from other frameworks (like numbered codes) are left unchanged.
 */
function normalizeStandardCode(code: string): string {
  if (!code) return code;

  let normalized = code.trim();

  // DON'T add NY- prefix to codes without it - Algebra 1 uses different prefixes (AI-, HS-)
  // Codes like "6.EE.A.3" in Algebra 1 are references to lower grade standards and stay as-is

  // Only normalize codes that match the CCSS-style pattern: NY-X.DOMAIN...
  // Valid domains: RP, NS, EE, G, SP, F, NF, NBT, MD, OA (and their variations)
  const validDomains = ['RP', 'NS', 'EE', 'G', 'SP', 'F', 'NF', 'NBT', 'MD', 'OA'];

  // Pattern: NY-X.DOMAIN.CLUSTER.NUM.LETTER (e.g., NY-6.EE.A.2.a) → NY-6.EE.2a
  // This removes the cluster letter (A, B, C, etc.) and merges the substandard letter
  const fullClusterPattern = normalized.match(/^NY-(\d+)\.([A-Z]+)\.([A-Z])\.(\d+)\.([a-d])$/);
  if (fullClusterPattern) {
    const [, grade, domain, , num, letter] = fullClusterPattern;
    if (validDomains.includes(domain)) {
      return `NY-${grade}.${domain}.${num}${letter}`;
    }
  }

  // Pattern: NY-X.DOMAIN.CLUSTER.NUM (e.g., NY-6.EE.A.2) → NY-6.EE.2
  // This removes the cluster letter
  const clusterPattern = normalized.match(/^NY-(\d+)\.([A-Z]+)\.([A-Z])\.(\d+)$/);
  if (clusterPattern) {
    const [, grade, domain, , num] = clusterPattern;
    if (validDomains.includes(domain)) {
      return `NY-${grade}.${domain}.${num}`;
    }
  }

  // Pattern: NY-X.DOMAIN.NUM.LETTER (e.g., NY-6.RP.3.a) → NY-6.RP.3a
  // This merges the separated substandard letter
  const separatedSuffixPattern = normalized.match(/^NY-(\d+)\.([A-Z]+)\.(\d+)\.([a-d])$/);
  if (separatedSuffixPattern) {
    const [, grade, domain, num, letter] = separatedSuffixPattern;
    if (validDomains.includes(domain)) {
      return `NY-${grade}.${domain}.${num}${letter}`;
    }
  }

  // Already correct format or from a different framework - leave unchanged
  return normalized;
}

interface StandardDoc {
  code: string;
  text?: string;
  context?: 'current' | 'buildingOn' | 'buildingTowards';
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log('='.repeat(60));
  console.log('Standard Code Normalization Script');
  console.log('='.repeat(60));
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE'}`);

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('ERROR: DATABASE_URL not found in environment');
    process.exit(1);
  }

  console.log('\nConnecting to MongoDB...');
  await mongoose.connect(dbUrl);
  const db = mongoose.connection;
  console.log('Connected.');

  const collection = db.collection('scope-and-sequence');

  // Get all documents with standards
  const docs = await collection.find({ standards: { $exists: true, $ne: [] } }).toArray();
  console.log(`\nFound ${docs.length} documents with standards`);

  let totalUpdated = 0;
  let totalCodesFixed = 0;
  let totalCodesDeleted = 0;
  const fixExamples: { before: string; after: string }[] = [];
  const deleteExamples: string[] = [];
  const nonStandardCodes = new Set<string>();

  // Regex for valid normalized format: NY-X.DOMAIN.NUM or NY-X.DOMAIN.NUMx
  const validFormat = /^NY-\d+\.(RP|NS|EE|G|SP|F|NF|NBT|MD|OA)\.\d+[a-d]?$/;

  for (const doc of docs) {
    const standards: StandardDoc[] = doc.standards || [];
    let hasChanges = false;

    // Filter out codes that should be deleted, then normalize the rest
    const updatedStandards = standards
      .filter(std => {
        if (shouldDeleteCode(std.code)) {
          hasChanges = true;
          totalCodesDeleted++;
          if (deleteExamples.length < 10) {
            deleteExamples.push(std.code);
          }
          return false;
        }
        return true;
      })
      .map(std => {
        const normalized = normalizeStandardCode(std.code);

        // Track codes that don't match valid format after normalization
        if (!validFormat.test(normalized)) {
          nonStandardCodes.add(normalized);
        }

        if (normalized !== std.code) {
          hasChanges = true;
          totalCodesFixed++;
          if (fixExamples.length < 20) {
            fixExamples.push({ before: std.code, after: normalized });
          }
          return { ...std, code: normalized };
        }
        return std;
      });

    if (hasChanges) {
      if (dryRun) {
        console.log(`  [DRY RUN] Would update: ${doc.scopeSequenceTag} Unit ${doc.unitNumber} Lesson ${doc.lessonNumber}`);
      } else {
        await collection.updateOne(
          { _id: doc._id },
          { $set: { standards: updatedStandards } }
        );
      }
      totalUpdated++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log(`Documents updated: ${totalUpdated}`);
  console.log(`Standard codes normalized: ${totalCodesFixed}`);
  console.log(`Standard codes deleted: ${totalCodesDeleted}`);

  if (deleteExamples.length > 0) {
    console.log('\nDeleted codes (MP standards):');
    console.log(`  ${[...new Set(deleteExamples)].join(', ')}`);
  }

  if (fixExamples.length > 0) {
    console.log('\nExample fixes:');
    fixExamples.forEach(ex => {
      console.log(`  ${ex.before} → ${ex.after}`);
    });
  }

  if (nonStandardCodes.size > 0) {
    console.log(`\nNon-standard codes (${nonStandardCodes.size} unique):`);
    const sortedNonStandard = Array.from(nonStandardCodes).sort();
    sortedNonStandard.slice(0, 50).forEach(code => {
      console.log(`  ${code}`);
    });
    if (sortedNonStandard.length > 50) {
      console.log(`  ... and ${sortedNonStandard.length - 50} more`);
    }
  }

  if (dryRun) {
    console.log('\nThis was a DRY RUN. No changes were made.');
    console.log('Run without --dry-run to apply changes.');
  }

  await mongoose.disconnect();
  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Normalization failed:', err);
  process.exit(1);
});
