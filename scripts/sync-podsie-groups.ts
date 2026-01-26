/**
 * Standalone script to sync Podsie groups/sections
 *
 * This script is designed to be run by GitHub Actions daily.
 * It fetches all groups from Podsie and checks for new sections
 * that don't have SectionConfig records yet. When new sections
 * are found, it sends an email notification with a link to
 * configure them.
 *
 * Required environment variables:
 * - DATABASE_URL: MongoDB connection string
 * - PODSIE_API_TOKEN: API token for Podsie
 * - PODSIE_BASE_URL: Base URL for Podsie API (e.g., https://podsie.org)
 * - EMAIL_USER: Gmail user for sending notifications
 * - EMAIL_PASSWORD: Gmail app password
 *
 * Usage:
 *   npx tsx scripts/sync-podsie-groups.ts
 */

// Load environment variables from .env.local for local development
import { config } from 'dotenv';
import { z } from 'zod';
import mongoose from 'mongoose';
config({ path: '.env.local' });

const NOTIFICATION_EMAIL = 'asmith7013@gmail.com';
const ADMIN_PAGE_URL = process.env.COACHING_PLATFORM_URL
  ? `${process.env.COACHING_PLATFORM_URL}/scm/podsie/sections/new`
  : 'http://localhost:3000/scm/podsie/sections/new';

// Zod schemas for Podsie API response validation
const PodsieTeacherSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
});

const PodsieGroupSchema = z.object({
  id: z.number(),
  groupName: z.string(),
  groupCode: z.string(),
  courseId: z.number(),
  courseName: z.string(),
  isPreview: z.boolean(),
  createdAt: z.string().nullable(),
  teachers: z.array(PodsieTeacherSchema),
});

const PodsieApiResponseSchema = z.object({
  success: z.literal(true),
  groups: z.array(PodsieGroupSchema),
  count: z.number(),
});

type PodsieGroup = z.infer<typeof PodsieGroupSchema>;

interface SyncResult {
  success: boolean;
  totalFetched: number;
  existingCount: number;
  newCount: number;
  newGroups: PodsieGroup[];
  errors: string[];
}

async function connectToDatabase() {
  const mongoUri = process.env.DATABASE_URL;
  if (!mongoUri) {
    throw new Error('Missing DATABASE_URL environment variable');
  }

  console.log('📦 Connecting to MongoDB...');
  await mongoose.connect(mongoUri, {
    bufferCommands: false,
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
  });
  console.log('✓ Connected to MongoDB');
}

async function getExistingGroupIds(): Promise<Set<string>> {
  // Query SectionConfig collection for existing groupId values
  const SectionConfig = mongoose.connection.collection('section-configs');

  const existingConfigs = await SectionConfig.find(
    { groupId: { $exists: true, $ne: null } },
    { projection: { groupId: 1 } }
  ).toArray();

  const groupIds = new Set<string>();
  for (const config of existingConfigs) {
    if (config.groupId) {
      groupIds.add(String(config.groupId));
    }
  }

  return groupIds;
}

async function fetchGroupsFromPodsie(): Promise<PodsieGroup[]> {
  const baseUrl = process.env.PODSIE_BASE_URL;
  const apiToken = process.env.PODSIE_API_TOKEN;

  if (!baseUrl || !apiToken) {
    throw new Error('Missing PODSIE_BASE_URL or PODSIE_API_TOKEN environment variable');
  }

  const url = `${baseUrl}/api/groups/sync`;
  console.log(`📥 Fetching groups from ${url}...`);

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

  return parsed.data.groups;
}

async function sendNewSectionsEmail(newGroups: PodsieGroup[], easternTime: string) {
  try {
    const { sendEmail } = await import('../src/lib/email/email-service');

    const subject = `🆕 New Podsie Sections Detected - Action Required (${newGroups.length} new)`;

    // Build the group details section
    const groupDetails = newGroups.map((group, index) => {
      const teacherList = group.teachers.length > 0
        ? group.teachers.map(t => t.email).join(', ')
        : 'No teachers assigned';

      return `
${index + 1}. ${group.groupName}
   Group Code: ${group.groupCode}
   Podsie ID: ${group.id}
   Course: ${group.courseName}
   Teachers: ${teacherList}
   Created: ${group.createdAt || 'Unknown'}
`;
    }).join('\n');

    const body = `New Podsie sections detected during daily sync at ${easternTime}

The following ${newGroups.length} new section(s) were found in Podsie that don't have
corresponding SectionConfig records in the AI Coaching Platform:

${groupDetails}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACTION REQUIRED:
Please configure these sections with the correct:
  • School (IS313, PS19, X644)
  • Grade Level (Grade 6, Grade 7, Grade 8, Algebra 1)
  • Special Populations (ICT, 12-1-1, MLL)

Configure sections here:
${ADMIN_PAGE_URL}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    await sendEmail({
      to: NOTIFICATION_EMAIL,
      subject,
      body
    });
    console.log('📧 New sections notification email sent');
  } catch (emailError) {
    console.error('Failed to send notification email:', emailError);
  }
}

async function sendFailureEmail(result: SyncResult, easternTime: string) {
  try {
    const { sendEmail } = await import('../src/lib/email/email-service');

    const subject = '❌ Podsie Groups Sync Failed';
    const body = `Podsie groups sync failed at ${easternTime}

SUMMARY:
  Total Fetched: ${result.totalFetched}
  Existing: ${result.existingCount}
  New: ${result.newCount}
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

async function main() {
  console.log('🚀 Starting Podsie groups sync...');
  const easternTime = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    dateStyle: 'full',
    timeStyle: 'long'
  });
  console.log(`📅 Time (ET): ${easternTime}`);

  const result: SyncResult = {
    success: false,
    totalFetched: 0,
    existingCount: 0,
    newCount: 0,
    newGroups: [],
    errors: [],
  };

  try {
    // Step 1: Connect to MongoDB
    await connectToDatabase();

    // Step 2: Get existing group IDs from SectionConfig
    const existingGroupIds = await getExistingGroupIds();
    console.log(`✓ Found ${existingGroupIds.size} existing SectionConfig records with groupId`);

    // Step 3: Fetch groups from Podsie
    const groups = await fetchGroupsFromPodsie();
    result.totalFetched = groups.length;
    console.log(`✓ Fetched ${groups.length} groups from Podsie`);

    if (groups.length === 0) {
      console.log('⚠️ No groups found in Podsie');
      result.success = true;
      await mongoose.disconnect();
      process.exit(0);
    }

    // Step 4: Identify new groups
    const newGroups = groups.filter(group => !existingGroupIds.has(String(group.id)));
    result.existingCount = groups.length - newGroups.length;
    result.newCount = newGroups.length;
    result.newGroups = newGroups;

    console.log(`\n📊 Results Summary:`);
    console.log(`  Total groups in Podsie: ${result.totalFetched}`);
    console.log(`  Already configured: ${result.existingCount}`);
    console.log(`  NEW (need configuration): ${result.newCount}`);

    // Step 5: Send email if new groups found
    if (newGroups.length > 0) {
      console.log(`\n🆕 New sections detected:`);
      newGroups.forEach((g, i) => {
        console.log(`  ${i + 1}. ${g.groupName} (${g.groupCode}) - ID: ${g.id}`);
      });

      await sendNewSectionsEmail(newGroups, easternTime);
    } else {
      console.log('\n✓ All Podsie groups have existing SectionConfig records');
    }

    result.success = true;
    console.log('\n✅ Podsie groups sync completed successfully!');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    result.errors.push(errorMsg);
    console.error('\n💥 Sync failed:', errorMsg);
    await sendFailureEmail(result, easternTime);

    try {
      await mongoose.disconnect();
    } catch {
      // Ignore disconnect errors
    }

    process.exit(1);
  }
}

main();
