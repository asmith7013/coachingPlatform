/**
 * Standalone script to sync current units from Podsie
 *
 * This script is designed to be run by GitHub Actions.
 * It connects directly to MongoDB and syncs student progress
 * for all assignments in the current unit of each section.
 *
 * Required environment variables:
 * - DATABASE_URL: MongoDB connection string
 */

// Load environment variables from .env.local for local development
// This MUST happen before any other imports that use DATABASE_URL
import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  console.log('🚀 Starting Podsie current units sync...');
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

  try {
    // Dynamic import AFTER dotenv has loaded
    const { syncCurrentUnits } = await import('../src/app/actions/scm/podsie/scheduled/sync-current-units');

    const result = await syncCurrentUnits();

    console.log('\n📊 Results Summary:');
    console.log(JSON.stringify({
      success: result.success,
      totalSections: result.totalSections,
      totalAssignments: result.totalAssignments,
      totalActivities: result.totalActivities,
      successfulSyncs: result.successfulSyncs,
      failedSyncs: result.failedSyncs,
      errorCount: result.errors.length
    }, null, 2));

    if (result.errors.length > 0) {
      console.log('\n⚠️ Errors:');
      result.errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    }

    if (result.success) {
      console.log('\n✅ Podsie sync completed successfully!');
      process.exit(0);
    } else {
      console.error('\n❌ Podsie sync completed with errors');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  }
}

main();
