// scripts/snorkl-orchestrator.ts
import { SnorklComprehensiveScraper, type ScrapingResult } from './snorkl-comprehensive-scraper';
import { SnorklCsvProcessor } from './snorkl-csv-processor';
import { saveSnorklActivities, saveScrapingMetadata } from '../src/app/actions/integrations/snorkl';
import { type SnorklActivityInput } from '../src/lib/schema/zod-schema/313/storage';
import * as fs from 'fs/promises';

interface OrchestrationResult {
  scrapingResult: ScrapingResult | null;
  processedActivities: SnorklActivityInput[];
  savedCount: number;
  errors: string[];
}

class SnorklOrchestrator {
  private credentials = {
    email: 'alex.smith@teachinglab.org',
    password: 'Cf3C&vZ6JH$nuVE#'
  };

  async runCompleteProcess(): Promise<OrchestrationResult> {
    const errors: string[] = [];
    let scrapingResult: ScrapingResult | null = null;
    let processedActivities: SnorklActivityInput[] = [];
    let savedCount = 0;

    try {
      console.log('🎯 Starting complete Snorkl data extraction process...\n');

      // Step 1: Scrape activity IDs
      console.log('📋 Step 1: Scraping activity IDs from Snorkl...');
      const scraper = new SnorklComprehensiveScraper();
      scrapingResult = await scraper.run(this.credentials.email, this.credentials.password);
      
      console.log(`✅ Scraping complete: ${scrapingResult.totalActivities} activities found\n`);

      // Step 2: Process CSV data
      console.log('📊 Step 2: Processing CSV data...');
      const processor = new SnorklCsvProcessor();
      processedActivities = await processor.run(
        scrapingResult.activities,
        this.credentials.email,
        this.credentials.password
      );
      
      console.log(`✅ CSV processing complete: ${processedActivities.length} activities processed\n`);

      // Step 3: Save to database
      console.log('💾 Step 3: Saving data to database...');
      
      if (processedActivities.length > 0) {
        const saveResult = await saveSnorklActivities(processedActivities);
        if (saveResult.success && saveResult.data) {
          savedCount = saveResult.data.length;
          console.log(`✅ Database save complete: ${savedCount} activities saved`);
        } else {
          errors.push(`Database save failed: ${saveResult.error}`);
        }
      }

      // Step 4: Save metadata
      if (scrapingResult) {
        const metadata = {
          scrapingDate: new Date().toISOString(),
          totalClassesScraped: scrapingResult.classes.length,
          totalActivitiesFound: scrapingResult.totalActivities,
          totalErrorsEncountered: scrapingResult.errors.length,
          classesProcessed: scrapingResult.classes.map((cls) => ({
            className: cls.name,
            classId: cls.id,
            activitiesFound: scrapingResult?.activities.filter((act) => act.section === cls.name).length || 0,
            errors: []
          })),
          globalErrors: scrapingResult.errors,
          csvUrlsGenerated: scrapingResult.csvUrls
        };

        await saveScrapingMetadata(metadata);
        console.log('✅ Metadata saved');
      }

      // Step 5: Generate summary report
      await this.generateSummaryReport({
        scrapingResult,
        processedActivities,
        savedCount,
        errors
      });

    } catch (error) {
      console.error('❌ Orchestration failed:', error);
      errors.push(`Orchestration error: ${error}`);
    }

    return {
      scrapingResult,
      processedActivities,
      savedCount,
      errors
    };
  }

  private async generateSummaryReport(result: OrchestrationResult): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFilename = `snorkl-summary-report-${timestamp}.json`;

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        classesProcessed: result.scrapingResult?.classes?.length || 0,
        activitiesFound: result.scrapingResult?.totalActivities || 0,
        csvDataProcessed: result.processedActivities.length,
        studentsTotal: result.processedActivities.reduce((sum, act) => sum + act.data.length, 0),
        savedToDatabase: result.savedCount,
        errorsEncountered: result.errors.length
      },
      classBreakdown: result.scrapingResult?.classes?.map((cls) => ({
        className: cls.name,
        district: cls.district,
        activitiesFound: result.scrapingResult?.activities.filter((act) => act.section === cls.name).length || 0
      })) || [],
      errors: result.errors,
      csvUrls: result.scrapingResult?.csvUrls || []
    };

    try {
      await fs.writeFile(reportFilename, JSON.stringify(report, null, 2));
      console.log(`📋 Summary report saved: ${reportFilename}`);
    } catch (error) {
      console.error('❌ Failed to save summary report:', error);
    }
  }
}

async function main() {
  const orchestrator = new SnorklOrchestrator();
  
  try {
    const result = await orchestrator.runCompleteProcess();
    
    console.log('\n🎉 COMPLETE PROCESS FINISHED!');
    console.log(`📊 Final Results:`);
    console.log(`   - Activities scraped: ${result.scrapingResult?.totalActivities || 0}`);
    console.log(`   - CSV data processed: ${result.processedActivities.length}`);
    console.log(`   - Saved to database: ${result.savedCount}`);
    console.log(`   - Errors: ${result.errors.length}`);
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      result.errors.forEach(error => console.log(`   - ${error}`));
    }
    
  } catch (error) {
    console.error('❌ Process failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { SnorklOrchestrator }; 