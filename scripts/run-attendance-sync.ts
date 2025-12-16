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
 * Optional environment variables (for failure notifications):
 * - EMAIL_USER: Gmail address for sending notifications
 * - EMAIL_PASSWORD: Gmail app password
 *
 * Optional arguments:
 * - --start-date=YYYY-MM-DD: Start date for sync (defaults to yesterday)
 * - --school=SCHOOL_CODE: School code to sync (e.g., PS313, X644, PS19)
 *
 * Usage:
 *   npx tsx scripts/run-attendance-sync.ts
 *   npx tsx scripts/run-attendance-sync.ts --start-date=2024-12-01
 *   npx tsx scripts/run-attendance-sync.ts --school=PS313
 */

// Load environment variables from .env.local for local development
// This MUST happen before any other imports that use DATABASE_URL
import { config } from 'dotenv';
config({ path: '.env.local' });

import type { SyncAllAttendanceResult } from '../src/app/actions/scm/student/attendance-sync/scheduled/sync-all-attendance';

const NOTIFICATION_EMAIL = 'asmith7013@gmail.com';

async function sendFailureEmail(school: string | undefined, result: SyncAllAttendanceResult, easternTime: string) {
  try {
    const { sendEmail } = await import('../src/lib/email/email-service');

    // Build detailed error report
    let sectionDetails = '';
    if (result.sectionResults) {
      const failedSections = result.sectionResults.filter(sr => !sr.success);
      if (failedSections.length > 0) {
        failedSections.forEach(sr => {
          sectionDetails += `\n  • ${sr.section}: ${sr.error || 'Unknown error'}`;
        });
      }
    }

    const subject = `❌ Attendance Sync Failed${school ? ` - ${school}` : ''}`;
    const body = `Attendance sync failed at ${easternTime}

SUMMARY:
  School Filter: ${school || 'All schools'}
  Start Date: ${result.startDate}
  Total Sections: ${result.totalSections}
  Sections Processed: ${result.sectionsProcessed}
  Sections Failed: ${result.sectionsFailed}
  Total Records: ${result.totalRecords}
  Created: ${result.created}
  Updated: ${result.updated}

ERRORS:
${result.errors.map((e, i) => `  ${i + 1}. ${e}`).join('\n') || '  None'}

FAILED SECTIONS:${sectionDetails || '\n  None'}

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

  // Parse optional school from command line args
  let school: string | undefined;
  const schoolArg = process.argv.find(arg => arg.startsWith('--school='));
  if (schoolArg) {
    school = schoolArg.split('=')[1];
    console.log(`🏫 Filtering to school: ${school}`);
  }

  try {
    // Dynamic import AFTER dotenv has loaded
    const { syncAllAttendance } = await import('../src/app/actions/scm/student/attendance-sync/scheduled/sync-all-attendance');

    const result = await syncAllAttendance({ startDate, school });

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
      await sendFailureEmail(school, result, easternTime);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Unexpected error:', error);
    // Send email for unexpected errors
    const errorResult: SyncAllAttendanceResult = {
      success: false,
      totalSections: 0,
      sectionsProcessed: 0,
      sectionsFailed: 0,
      totalRecords: 0,
      created: 0,
      updated: 0,
      notTracked: 0,
      errors: [error instanceof Error ? error.message : String(error)],
      sectionResults: [],
      startDate: startDate || 'unknown'
    };
    const easternTime = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
    await sendFailureEmail(school, errorResult, easternTime);
    process.exit(1);
  }
}

main();
