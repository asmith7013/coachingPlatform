"use server";

import { scrapeAssessmentHistory } from './scrape-assessment-history';
import { scrapeAssessmentHistoryBatch } from './scrape-assessment-history-batch';
import { updateStudentData } from './update-student-data';
import type { AssessmentScraperConfig } from '@/lib/schema/zod-schema/scm/assessment-scraper';
import { SCRAPER_SECTION_CONFIGS } from '@/lib/schema/enum/313';

/**
 * Get current time in Eastern Time (ET) as ISO string
 * GitHub Actions runs in UTC, so we need to explicitly handle ET
 */
function getEasternTime(): string {
  return new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York'
  });
}

/**
 * Convert Eastern Time string to ISO format for database storage
 */
function easternTimeToISO(etString: string): string {
  const date = new Date(etString);
  return date.toISOString();
}

/**
 * Combined action: Scrape assessment history and update student data
 */
export async function scrapeAndUpdateAssessmentData(config: AssessmentScraperConfig) {
  console.log('🚀 Starting scrape and update process...');

  // Step 1: Scrape assessment history
  console.log('📥 Step 1: Scraping assessment history...');
  const scrapeResult = await scrapeAssessmentHistory(config);

  if (!scrapeResult.success || !scrapeResult.data) {
    console.error('❌ Scraping failed:', scrapeResult.error);
    return {
      success: false,
      error: `Scraping failed: ${scrapeResult.error}`
    };
  }

  console.log('✅ Scraping complete');
  console.log(`   📊 Total rows: ${scrapeResult.data.totalRows}`);
  console.log(`   👥 Students: ${scrapeResult.data.studentsProcessed}`);
  console.log(`   🎯 Skills: ${scrapeResult.data.skillsProcessed}`);

  // Step 2: Update student data in MongoDB
  console.log('💾 Step 2: Updating student data in MongoDB...');
  const updateResult = await updateStudentData({
    assessmentData: scrapeResult.data.assessmentData,
    schoolId: config.schoolId,
    assessmentDate: easternTimeToISO(getEasternTime())
  });

  if (!updateResult.success) {
    console.error('❌ Update failed:', updateResult.error);
    return {
      success: false,
      error: `Update failed: ${updateResult.error}`,
      scrapedData: scrapeResult.data
    };
  }

  console.log('✅ Update complete');
  console.log(`   📝 Students updated: ${updateResult.data?.studentsUpdated || 0}`);

  return {
    success: true,
    data: {
      scrapeResults: {
        totalRows: scrapeResult.data.totalRows,
        studentsProcessed: scrapeResult.data.studentsProcessed,
        skillsProcessed: scrapeResult.data.skillsProcessed,
        duration: scrapeResult.data.duration
      },
      updateResults: {
        studentsUpdated: updateResult.data?.studentsUpdated || 0,
        totalStudents: updateResult.data?.totalStudents || 0,
        errors: updateResult.data?.errors || []
      }
    }
  };
}

/**
 * Batch scrape and update all sections
 */
export async function scrapeAndUpdateAllSections(credentials: { email: string; password: string }) {
  console.log('🚀 Starting batch scrape and update for all sections...');

  const startTime = easternTimeToISO(getEasternTime());

  // Build configs for all sections
  const configs: AssessmentScraperConfig[] = [];

  for (const sectionConfig of SCRAPER_SECTION_CONFIGS) {
    for (const filterConfig of sectionConfig.configs) {
      configs.push({
        credentials,
        filters: {
          classes: filterConfig.classes,
          roadmap: filterConfig.roadmap,
          studentGrade: filterConfig.studentGrade as never,
          skillGrade: filterConfig.skillGrade as never
        },
        schoolId: 'school-313',
        delayBetweenActions: 1000
      });
    }
  }

  console.log(`📊 Total configurations to scrape: ${configs.length}`);

  // Step 1: Batch scrape all configurations
  console.log('📥 Step 1: Batch scraping all configurations...');
  const scrapeResult = await scrapeAssessmentHistoryBatch(configs);

  if (!scrapeResult.success || !scrapeResult.data) {
    console.error('❌ Batch scraping failed:', scrapeResult.error);
    return {
      success: false,
      error: `Batch scraping failed: ${scrapeResult.error}`
    };
  }

  console.log('✅ Batch scraping complete');
  console.log(`   ✅ Successful: ${scrapeResult.data.successfulConfigs}`);
  console.log(`   ❌ Failed: ${scrapeResult.data.failedConfigs}`);

  // Step 2: Update student data for each successful scrape
  console.log('💾 Step 2: Updating student data for all scraped configurations...');

  const updateResults = [];
  const assessmentDate = easternTimeToISO(getEasternTime());

  for (let i = 0; i < scrapeResult.data.results.length; i++) {
    const result = scrapeResult.data.results[i];

    if (!result.success || result.assessmentData.length === 0) {
      console.log(`  ⏭️  Skipping config ${i + 1} (no data)`);
      continue;
    }

    console.log(`  💾 Updating data for config ${i + 1}/${scrapeResult.data.results.length}...`);

    const updateResult = await updateStudentData({
      assessmentData: result.assessmentData,
      schoolId: 'school-313',
      assessmentDate
    });

    updateResults.push({
      configIndex: i + 1,
      success: updateResult.success,
      studentsUpdated: updateResult.data?.studentsUpdated || 0,
      errors: updateResult.data?.errors || []
    });

    if (updateResult.success) {
      console.log(`  ✅ Config ${i + 1}: ${updateResult.data?.studentsUpdated} students updated`);
    } else {
      console.log(`  ❌ Config ${i + 1}: Update failed`);
    }
  }

  const endTime = easternTimeToISO(getEasternTime());
  const totalDuration = `${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)}s`;

  console.log('✅ Batch scrape and update complete');
  console.log(`   ⏱️ Total duration: ${totalDuration}`);

  const totalStudentsUpdated = updateResults.reduce((sum, r) => sum + r.studentsUpdated, 0);
  const allErrors = updateResults.flatMap(r => r.errors);

  return {
    success: true,
    data: {
      scrapeResults: {
        totalConfigs: scrapeResult.data.totalConfigs,
        successfulConfigs: scrapeResult.data.successfulConfigs,
        failedConfigs: scrapeResult.data.failedConfigs,
        duration: scrapeResult.data.duration
      },
      updateResults: {
        totalStudentsUpdated,
        configsProcessed: updateResults.length,
        errors: allErrors
      },
      totalDuration
    }
  };
}
