/**
 * Standalone script to sync Podsie assignment metadata
 *
 * This script is designed to be run by GitHub Actions.
 * It fetches all assignments from Podsie and syncs them to the
 * AI Coaching Platform for use as context in the pacing editor.
 *
 * Required environment variables:
 * - DATABASE_URL: MongoDB connection string (for direct DB access if needed)
 * - PODSIE_API_TOKEN: API token for Podsie
 * - PODSIE_BASE_URL: Base URL for Podsie API (e.g., https://podsie.org)
 * - SOLVES_COACHING_API_KEY: API key for AI Coaching Platform
 *
 * Usage:
 *   npx tsx scripts/sync-podsie-assignments.ts
 */

// Load environment variables from .env.local for local development
import { config } from 'dotenv';
import { z } from 'zod';
config({ path: '.env.local' });

const NOTIFICATION_EMAIL = process.env.ALERT_EMAIL || 'asmith7013@gmail.com';

// Zod schemas for external API response validation
const PodsieAssignmentSchema = z.object({
  id: z.number(),
  title: z.string(),
  moduleId: z.number().nullable(),
  moduleOrder: z.number().nullable(),
  state: z.string().nullable(),
});

const PodsieApiResponseSchema = z.object({
  success: z.literal(true),
  assignments: z.array(PodsieAssignmentSchema),
});

const CoachingPlatformSyncResponseSchema = z.object({
  success: z.literal(true),
  upsertedCount: z.number().optional().default(0),
  insertedCount: z.number().optional().default(0),
  modifiedCount: z.number().optional().default(0),
});

type PodsieAssignment = z.infer<typeof PodsieAssignmentSchema>;

interface SyncResult {
  success: boolean;
  totalFetched: number;
  upsertedCount: number;
  insertedCount: number;
  modifiedCount: number;
  errors: string[];
}

async function sendFailureEmail(result: SyncResult, easternTime: string) {
  try {
    const { sendEmail } = await import('../src/lib/email/email-service');

    const subject = '❌ Podsie Assignments Sync Failed';
    const body = `Podsie assignments sync failed at ${easternTime}

SUMMARY:
  Total Fetched: ${result.totalFetched}
  Upserted: ${result.upsertedCount}
  Inserted: ${result.insertedCount}
  Modified: ${result.modifiedCount}
  Error Count: ${result.errors.length}

ERRORS:
${result.errors.map((e, i) => `  ${i + 1}. ${e}`).join('\n') || '  None'}

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

async function fetchAssignmentsFromPodsie(): Promise<PodsieAssignment[]> {
  const baseUrl = process.env.PODSIE_BASE_URL;
  const apiToken = process.env.PODSIE_API_TOKEN;

  if (!baseUrl || !apiToken) {
    throw new Error('Missing PODSIE_BASE_URL or PODSIE_API_TOKEN environment variable');
  }

  const url = `${baseUrl}/api/assignments/sync`;
  console.log(`📥 Fetching assignments from ${url}...`);

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch from Podsie: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  const parsed = PodsieApiResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Invalid response format from Podsie: ${parsed.error.message}`);
  }

  return parsed.data.assignments;
}

async function syncToCoachingPlatform(assignments: PodsieAssignment[]): Promise<{
  upsertedCount: number;
  insertedCount: number;
  modifiedCount: number;
}> {
  const apiKey = process.env.SOLVES_COACHING_API_KEY;

  if (!apiKey) {
    throw new Error('Missing SOLVES_COACHING_API_KEY environment variable');
  }

  // For local development, use localhost; for production, this would be the deployed URL
  const baseUrl = process.env.COACHING_PLATFORM_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/podsie/assignments/sync`;

  console.log(`📤 Syncing ${assignments.length} assignments to ${url}...`);

  // Transform to API format
  const payload = {
    assignments: assignments.map(a => ({
      podsieAssignmentId: a.id,
      title: a.title,
      podsieModuleId: a.moduleId,
      moduleOrder: a.moduleOrder,
      state: a.state,
    })),
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to sync to Coaching Platform: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();

  const parsed = CoachingPlatformSyncResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Invalid response format from Coaching Platform: ${parsed.error.message}`);
  }

  return {
    upsertedCount: parsed.data.upsertedCount,
    insertedCount: parsed.data.insertedCount,
    modifiedCount: parsed.data.modifiedCount,
  };
}

async function main() {
  console.log('🚀 Starting Podsie assignments sync...');
  const easternTime = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    dateStyle: 'full',
    timeStyle: 'long'
  });
  console.log(`📅 Time (ET): ${easternTime}`);

  const result: SyncResult = {
    success: false,
    totalFetched: 0,
    upsertedCount: 0,
    insertedCount: 0,
    modifiedCount: 0,
    errors: [],
  };

  try {
    // Step 1: Fetch assignments from Podsie
    const assignments = await fetchAssignmentsFromPodsie();
    result.totalFetched = assignments.length;
    console.log(`✓ Fetched ${assignments.length} assignments from Podsie`);

    if (assignments.length === 0) {
      console.log('⚠️ No assignments to sync');
      result.success = true;
      return;
    }

    // Step 2: Sync to AI Coaching Platform
    const syncResult = await syncToCoachingPlatform(assignments);
    result.upsertedCount = syncResult.upsertedCount;
    result.insertedCount = syncResult.insertedCount;
    result.modifiedCount = syncResult.modifiedCount;

    console.log('\n📊 Results Summary:');
    console.log(JSON.stringify({
      totalFetched: result.totalFetched,
      upsertedCount: result.upsertedCount,
      insertedCount: result.insertedCount,
      modifiedCount: result.modifiedCount,
    }, null, 2));

    result.success = true;
    console.log('\n✅ Podsie assignments sync completed successfully!');
    process.exit(0);

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    result.errors.push(errorMsg);
    console.error('\n💥 Sync failed:', errorMsg);
    await sendFailureEmail(result, easternTime);
    process.exit(1);
  }
}

main();
