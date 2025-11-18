/**
 * Standalone script to run the roadmaps assessment scraper
 *
 * This script is designed to be run by GitHub Actions.
 * It connects directly to MongoDB and runs the scraper.
 *
 * Required environment variables:
 * - DATABASE_URL: MongoDB connection string
 * - ROADMAPS_EMAIL: Teach to One Roadmaps email
 * - ROADMAPS_PASSWORD: Teach to One Roadmaps password
 */

import { scrapeAndUpdateAllSections } from '../src/app/roadmaps/assessment-scraper/actions/scrape-and-update';

async function main() {
  console.log('🚀 Starting assessment scraper...');
  console.log(`📅 Time: ${new Date().toISOString()}`);

  // Validate environment variables
  const email = process.env.ROADMAPS_EMAIL;
  const password = process.env.ROADMAPS_PASSWORD;
  const databaseUrl = process.env.DATABASE_URL;

  if (!email || !password) {
    console.error('❌ Missing ROADMAPS_EMAIL or ROADMAPS_PASSWORD environment variables');
    process.exit(1);
  }

  if (!databaseUrl) {
    console.error('❌ Missing DATABASE_URL environment variable');
    process.exit(1);
  }

  console.log(`📧 Using email: ${email}`);
  console.log(`🔗 Database: ${databaseUrl.substring(0, 30)}...`);

  try {
    const result = await scrapeAndUpdateAllSections({
      email,
      password,
    });

    if (result.success) {
      console.log('\n✅ Scraper completed successfully!');
      console.log('📊 Results:');
      console.log(JSON.stringify(result.data, null, 2));
      process.exit(0);
    } else {
      console.error('\n❌ Scraper failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  }
}

main();
