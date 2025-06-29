#!/usr/bin/env tsx
import { google } from 'googleapis';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testGoogleSheetsConnection() {
  console.log('🔄 Testing Google Sheets connection...');
  
  try {
    // Check environment variables
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID;
    
    console.log('📋 Environment check:');
    console.log(`  - GOOGLE_CLIENT_EMAIL: ${clientEmail ? '✅ Set' : '❌ Missing'}`);
    console.log(`  - GOOGLE_PRIVATE_KEY: ${privateKey ? '✅ Set' : '❌ Missing'}`);
    console.log(`  - GOOGLE_SHEET_ID: ${sheetId ? '✅ Set' : '❌ Missing'}`);
    
    if (!clientEmail || !privateKey) {
      throw new Error('Missing required Google credentials in .env file');
    }
    
    // Debug private key format
    console.log('\n🔍 Private key format check:');
    console.log(`  - Length: ${privateKey.length} characters`);
    console.log(`  - Starts correctly: ${privateKey.startsWith('"-----BEGIN PRIVATE KEY-----') ? '✅' : '❌'}`);
    console.log(`  - Ends correctly: ${privateKey.endsWith('-----END PRIVATE KEY-----"') ? '✅' : '❌'}`);
    console.log(`  - Contains \\n sequences: ${privateKey.includes('\\n') ? '✅' : '❌'}`);
    
    // Clean and format the private key
    let formattedPrivateKey = privateKey;
    
    // Remove quotes if present
    if (formattedPrivateKey.startsWith('"') && formattedPrivateKey.endsWith('"')) {
      formattedPrivateKey = formattedPrivateKey.slice(1, -1);
    }
    
    // Replace \\n with actual newlines
    formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, '\n');
    
    console.log('\n🔧 Formatted private key check:');
    console.log(`  - First line: ${formattedPrivateKey.split('\n')[0]}`);
    console.log(`  - Last line: ${formattedPrivateKey.split('\n').pop()}`);
    console.log(`  - Total lines: ${formattedPrivateKey.split('\n').length}`);
    
    // Set up authentication with cleaned key
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: formattedPrivateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    
    console.log('\n🔐 Testing authentication...');
    
    // Test getting an access token first
    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();
    
    if (accessToken.token) {
      console.log('✅ Successfully obtained access token');
    } else {
      throw new Error('Failed to obtain access token');
    }
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    if (sheetId) {
      console.log('\n📊 Testing sheet access...');
      
      // Try to read sheet metadata
      const metadataResponse = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      });
      
      console.log(`✅ Successfully connected to sheet: "${metadataResponse.data.properties?.title}"`);
      
      // List available sheets/tabs
      const sheetTabs = metadataResponse.data.sheets?.map(sheet => ({
        name: sheet.properties?.title,
        id: sheet.properties?.sheetId,
        rows: sheet.properties?.gridProperties?.rowCount,
        cols: sheet.properties?.gridProperties?.columnCount
      }));
      
      console.log('\n📋 Available sheets:');
      sheetTabs?.forEach(tab => {
        console.log(`  - "${tab.name}" (${tab.rows} rows × ${tab.cols} cols)`);
      });
      
      // Try to read some data from the first sheet
      const firstSheet = sheetTabs?.[0]?.name || 'Sheet1';
      console.log(`\n📖 Reading sample data from "${firstSheet}"...`);
      
      const dataResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${firstSheet}!A1:Z10`, // First 10 rows, all columns
      });
      
      const rows = dataResponse.data.values || [];
      console.log(`✅ Read ${rows.length} rows of data`);
      
      if (rows.length > 0) {
        console.log('\n📝 Headers (first row):');
        console.log(`  ${rows[0].join(' | ')}`);
        
        if (rows.length > 1) {
          console.log('\n📝 Sample data (second row):');
          console.log(`  ${rows[1].join(' | ')}`);
        }
      }
      
    } else {
      console.log('⚠️  No GOOGLE_SHEET_ID provided - skipping sheet access test');
    }
    
    console.log('\n✅ Google Sheets connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Google Sheets connection test failed:');
    console.error(error);
    
    // Type guard for Error objects
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('DECODER routines')) {
      console.log('\n💡 Private key formatting issue detected!');
      console.log('  1. Make sure your private key is properly formatted');
      console.log('  2. Check that line breaks are represented as \\n (not actual line breaks)');
      console.log('  3. Ensure the key is wrapped in double quotes');
      console.log('  4. Example format:');
      console.log('     GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIE...\\n-----END PRIVATE KEY-----\\n"');
    }
    
    if (errorMessage.includes('403')) {
      console.log('\n💡 If you get a 403 error:');
      console.log('  1. Make sure the service account email has access to the sheet');
      console.log('  2. Share the sheet with your service account email');
      console.log(`  3. Service account email: ${process.env.GOOGLE_CLIENT_EMAIL}`);
    }
    
    if (errorMessage.includes('404')) {
      console.log('\n💡 If you get a 404 error:');
      console.log('  1. Check that GOOGLE_SHEET_ID is correct');
      console.log('  2. Make sure the sheet exists and is accessible');
    }
    
    process.exit(1);
  }
}

// Run the test
testGoogleSheetsConnection();
