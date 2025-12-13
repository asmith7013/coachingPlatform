/**
 * Standalone script to sync attendance data from Podsie
 *
 * This script is designed to be run by GitHub Actions.
 * It connects directly to MongoDB and syncs attendance data
 * for all sections with a Podsie groupId.
 *
 * Required environment variables:
 * - DATABASE_URL: MongoDB connection string
 *
 * Optional arguments:
 * - --start-date=YYYY-MM-DD: Start date for sync (defaults to yesterday)
 *
 * Usage:
 *   npx tsx scripts/run-attendance-sync.ts
 *   npx tsx scripts/run-attendance-sync.ts --start-date=2024-12-01
 */

// Load environment variables from .env.local for local development
// This MUST happen before any other imports that use DATABASE_URL
import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  console.log('🚀 Starting Podsie attendance sync...');
  const easternTime = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    dateStyle: 'full',
    timeStyle: 'long'
  });
  console.log(`📅 Time (ET): ${easternTime}`);

  // Validate environment variables
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ Missing DATABASE_URL environment variable');
    process.exit(1);
  }

  console.log(`🔗 Database: ${databaseUrl.substring(0, 30)}...`);

  // Parse optional start date from command line args
  let startDate: string | undefined;
  const startDateArg = process.argv.find(arg => arg.startsWith('--start-date='));
  if (startDateArg) {
    startDate = startDateArg.split('=')[1];
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      console.error('❌ Invalid date format. Use YYYY-MM-DD');
      process.exit(1);
    }
    console.log(`📆 Using custom start date: ${startDate}`);
  }

  try {
    // Dynamic import AFTER dotenv has loaded
    const { syncAllAttendance } = await import('../src/app/actions/313/attendance-sync/scheduled/sync-all-attendance');

    const result = await syncAllAttendance({ startDate });

    console.log('\n📊 Results Summary:');
    console.log(JSON.stringify({
      success: result.success,
      startDate: result.startDate,
      totalSections: result.totalSections,
      sectionsProcessed: result.sectionsProcessed,
      sectionsFailed: result.sectionsFailed,
      totalRecords: result.totalRecords,
      created: result.created,
      updated: result.updated,
      notTracked: result.notTracked,
      errorCount: result.errors.length
    }, null, 2));

    if (result.errors.length > 0) {
      console.log('\n⚠️ Errors:');
      result.errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    }

    // Log per-section results
    if (result.sectionResults.length > 0) {
      console.log('\n📋 Per-Section Results:');
      result.sectionResults.forEach(sr => {
        const status = sr.success ? '✓' : '✗';
        console.log(`  ${status} ${sr.section}: ${sr.totalProcessed} records (${sr.created} new, ${sr.updated} updated)`);
      });
    }

    if (result.success) {
      console.log('\n✅ Attendance sync completed successfully!');
      process.exit(0);
    } else {
      console.error('\n❌ Attendance sync completed with errors');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  }
}

main();
