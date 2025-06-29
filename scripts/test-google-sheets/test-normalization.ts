#!/usr/bin/env tsx
import { google } from 'googleapis';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Mock the normalization function for now
function mockNormalizeRowToEvents(row: unknown[], headers: string[]) {
  console.log('📋 Headers:', headers);
  console.log('📝 Sample row:', row);
  
  // Mock processing
  return {
    success: true,
    data: {
      dailyEvents: [{ 
        studentName: row[headers.indexOf('Name')] || 'Unknown',
        date: row[headers.indexOf('Date')] || 'Unknown'
      }],
      lessonCompletions: []
    },
    metadata: {
      zearnCompletionsCreated: 0,
      snorklCompletionsCreated: 0,
      dailyEventsCreated: 1
    }
  };
}

async function testDataNormalization() {
  console.log('🔄 Testing data normalization...');
  
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = process.env.GOOGLE_SHEET_ID;
    
    if (!sheetId) {
      throw new Error('GOOGLE_SHEET_ID not set');
    }
    
    // Read data from the sheet
    console.log('📖 Reading data from sheet...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Daily Log!A:Z', // Adjust range as needed
    });
    
    const rows = response.data.values || [];
    if (rows.length === 0) {
      console.log('⚠️  No data found in sheet');
      return;
    }
    
    const [headers, ...dataRows] = rows;
    console.log(`✅ Found ${dataRows.length} data rows`);
    
    // Test normalization on first few rows
    const testRows = dataRows.slice(0, 3); // Test first 3 rows
    
    console.log('\n🧪 Testing normalization...');
    testRows.forEach((row, index) => {
      console.log(`\n--- Row ${index + 1} ---`);
      try {
        const result = mockNormalizeRowToEvents(row, headers);
        console.log('✅ Normalization successful:', result.metadata);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log('❌ Normalization failed:', errorMessage);
      }
    });
    
    console.log('\n✅ Data normalization test completed!');
    
  } catch (error) {
    console.error('❌ Data normalization test failed:', error);
  }
}

testDataNormalization();
