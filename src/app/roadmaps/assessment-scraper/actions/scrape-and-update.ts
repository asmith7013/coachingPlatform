"use server";

import { scrapeAssessmentHistory } from './scrape-assessment-history';
import { updateStudentData } from './update-student-data';
import type { AssessmentScraperConfig } from '@/lib/schema/zod-schema/313/assessment-scraper';

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
    assessmentDate: new Date().toISOString()
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
