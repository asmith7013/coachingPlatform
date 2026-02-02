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
 * - COACHING_PLATFORM_URL: URL for AI Coaching Platform
 *
 * The script dynamically fetches group IDs from the coaching platform's
 * podsie-scm-modules collection, then fetches assignments for those groups.
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
  moduleName: z.string().nullable().optional(),
  moduleOrder: z.number().nullable(),
  state: z.string().nullable(),
  groupId: z.number(),
});

const PodsieApiResponseSchema = z.object({
  success: z.literal(true),
  groupIds: z.array(z.number()),
  assignments: z.array(PodsieAssignmentSchema),
  count: z.number(),
});

const GroupIdsResponseSchema = z.object({
  success: z.literal(true),
  groupIds: z.array(z.number()),
  count: z.number(),
});

const CoachingPlatformSyncResponseSchema = z.object({
  success: z.literal(true),
  modulesUpdated: z.number().optional().default(0),
  assignmentsProcessed: z.number().optional().default(0),
});

type PodsieAssignment = z.infer<typeof PodsieAssignmentSchema>;

interface SyncResult {
  success: boolean;
  totalFetched: number;
  modulesUpdated: number;
  assignmentsProcessed: number;
  errors: string[];
}

async function sendFailureEmail(result: SyncResult, easternTime: string) {
  try {
    const { sendEmail } = await import('../src/lib/email/email-service');

    const subject = '❌ Podsie Assignments Sync Failed';
    const body = `Podsie assignments sync failed at ${easternTime}

SUMMARY:
  Total Fetched: ${result.totalFetched}
  Modules Updated: ${result.modulesUpdated}
  Assignments Processed: ${result.assignmentsProcessed}
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

function getCoachingPlatformUrl(): string {
  return process.env.COACHING_PLATFORM_URL || 'https://solvescoaching.com';
}

function getCoachingApiKey(): string {
  const apiKey = process.env.SOLVES_COACHING_API_KEY;
  if (!apiKey) {
    throw new Error('Missing SOLVES_COACHING_API_KEY environment variable');
  }
  return apiKey;
}

async function fetchGroupIdsFromCoachingPlatform(): Promise<number[]> {
  const baseUrl = getCoachingPlatformUrl();
  const apiKey = getCoachingApiKey();
  const url = `${baseUrl}/api/podsie/lesson-progress/groups`;

  console.log(`📋 Fetching group IDs from ${url}...`);

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch group IDs: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const parsed = GroupIdsResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Invalid group IDs response: ${parsed.error.message}`);
  }

  return parsed.data.groupIds;
}

async function fetchAssignmentsFromPodsie(groupIds: number[]): Promise<PodsieAssignment[]> {
  const baseUrl = process.env.PODSIE_BASE_URL;
  const apiToken = process.env.PODSIE_API_TOKEN;

  if (!baseUrl || !apiToken) {
    throw new Error('Missing PODSIE_BASE_URL or PODSIE_API_TOKEN environment variable');
  }

  const groupIdsParam = groupIds.join(',');
  const url = `${baseUrl}/api/sandbox/assignments/sync?groupIds=${groupIdsParam}`;
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
  modulesUpdated: number;
  assignmentsProcessed: number;
}> {
  const baseUrl = getCoachingPlatformUrl();
  const apiKey = getCoachingApiKey();
  const url = `${baseUrl}/api/podsie/assignments/sync`;

  console.log(`📤 Syncing ${assignments.length} assignments to ${url}...`);

  // Transform to API format — include groupId for module-level upsert
  const payload = {
    assignments: assignments.map(a => ({
      podsieAssignmentId: a.id,
      title: a.title,
      podsieModuleId: a.moduleId,
      moduleName: a.moduleName ?? null,
      podsieGroupId: a.groupId,
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
    modulesUpdated: parsed.data.modulesUpdated,
    assignmentsProcessed: parsed.data.assignmentsProcessed,
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
    modulesUpdated: 0,
    assignmentsProcessed: 0,
    errors: [],
  };

  try {
    // Step 1: Get group IDs from coaching platform
    const groupIds = await fetchGroupIdsFromCoachingPlatform();
    console.log(`✓ Found ${groupIds.length} group IDs: [${groupIds.join(', ')}]`);

    if (groupIds.length === 0) {
      console.log('⚠️ No group IDs configured — nothing to sync');
      result.success = true;
      process.exit(0);
    }

    // Step 2: Fetch assignments from Podsie
    const assignments = await fetchAssignmentsFromPodsie(groupIds);
    result.totalFetched = assignments.length;
    console.log(`✓ Fetched ${assignments.length} assignments from Podsie`);

    if (assignments.length === 0) {
      console.log('⚠️ No assignments to sync');
      result.success = true;
      process.exit(0);
    }

    // Step 3: Sync to AI Coaching Platform (upserts into podsie-scm-modules)
    const syncResult = await syncToCoachingPlatform(assignments);
    result.modulesUpdated = syncResult.modulesUpdated;
    result.assignmentsProcessed = syncResult.assignmentsProcessed;

    console.log('\n📊 Results Summary:');
    console.log(JSON.stringify({
      totalFetched: result.totalFetched,
      modulesUpdated: result.modulesUpdated,
      assignmentsProcessed: result.assignmentsProcessed,
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
