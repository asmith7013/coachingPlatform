/**
 * Standalone script to sync current units from Podsie
 *
 * This script is designed to be run by GitHub Actions.
 * It connects directly to MongoDB and syncs student progress
 * for all assignments in the current unit of each section.
 *
 * Required environment variables:
 * - DATABASE_URL: MongoDB connection string
 *
 * Optional environment variables (for failure notifications):
 * - EMAIL_USER: Gmail address for sending notifications
 * - EMAIL_PASSWORD: Gmail app password
 *
 * Optional arguments:
 * - --school=SCHOOL_CODE: School code to sync (e.g., PS313, X644, PS19)
 *
 * Usage:
 *   npx tsx scripts/run-podsie-sync.ts
 *   npx tsx scripts/run-podsie-sync.ts --school=PS313
 */

// Load environment variables from .env.local for local development
// This MUST happen before any other imports that use DATABASE_URL
import { config } from 'dotenv';
config({ path: '.env.local' });

import type { SyncCurrentUnitsResult } from '../src/app/actions/scm/podsie/scheduled/sync-current-units';

const NOTIFICATION_EMAIL = 'asmith7013@gmail.com';

async function sendFailureEmail(school: string | undefined, result: SyncCurrentUnitsResult, easternTime: string) {
  try {
    const { sendEmail } = await import('../src/lib/email/email-service');

    // Build detailed error report
    let errorDetails = '';
    if (result.sectionResults) {
      result.sectionResults.forEach(sr => {
        if (sr.errors && sr.errors.length > 0) {
          errorDetails += `\n${sr.school} - ${sr.classSection} (Unit ${sr.currentUnit}):\n`;
          sr.errors.forEach(err => {
            errorDetails += `  • ${err}\n`;
          });
        }
      });
    }

    const subject = `❌ Podsie Sync Failed${school ? ` - ${school}` : ''}`;
    const body = `Podsie progress sync failed at ${easternTime}

SUMMARY:
  School Filter: ${school || 'All schools'}
  Total Sections: ${result.totalSections}
  Total Assignments: ${result.totalAssignments}
  Successful Syncs: ${result.successfulSyncs}
  Failed Syncs: ${result.failedSyncs}
  Error Count: ${result.errors.length}

TOP-LEVEL ERRORS:
${result.errors.map((e, i) => `  ${i + 1}. ${e}`).join('\n') || '  None'}

SECTION DETAILS:${errorDetails || '\n  No section-level errors'}

View full logs: https://github.com/asmith7013/coachingPlatform/actions
`;

    await sendEmail({
      to: NOTIFICATION_EMAIL,
      subject,
      body
    });
    console.log('📧 Failure notification email sent');
  } catch (emailError) {
    console.error('Failed to send notification email:', emailError);
  }
}

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

  // Parse optional arguments from command line
  let school: string | undefined;
  let chunk: number | undefined;
  let chunkSize: number | undefined;

  const schoolArg = process.argv.find(arg => arg.startsWith('--school='));
  if (schoolArg) {
    school = schoolArg.split('=')[1];
    console.log(`🏫 Filtering to school: ${school}`);
  }

  const chunkArg = process.argv.find(arg => arg.startsWith('--chunk='));
  if (chunkArg) {
    chunk = parseInt(chunkArg.split('=')[1], 10);
    console.log(`📦 Processing chunk: ${chunk}`);
  }

  const chunkSizeArg = process.argv.find(arg => arg.startsWith('--chunkSize='));
  if (chunkSizeArg) {
    chunkSize = parseInt(chunkSizeArg.split('=')[1], 10);
    console.log(`📏 Chunk size: ${chunkSize} sections`);
  }

  try {
    // Dynamic import AFTER dotenv has loaded
    const { syncCurrentUnits } = await import('../src/app/actions/scm/podsie/scheduled/sync-current-units');

    const result = await syncCurrentUnits({ school, chunk, chunkSize });

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
      await sendFailureEmail(school, result, easternTime);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Unexpected error:', error);
    // Send email for unexpected errors
    const errorResult: SyncCurrentUnitsResult = {
      success: false,
      totalSections: 0,
      totalAssignments: 0,
      totalActivities: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      errors: [error instanceof Error ? error.message : String(error)],
      sectionResults: []
    };
    const easternTime = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
    await sendFailureEmail(school, errorResult, easternTime);
    process.exit(1);
  }
}

main();
