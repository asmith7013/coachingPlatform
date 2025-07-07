import { google } from 'googleapis';

/**
 * Google Sheets API client configuration (read-only)
 */
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

export const sheets = google.sheets({ version: 'v4', auth });

/**
 * Google Sheets API client configuration (write-enabled)
 */
const authWrite = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/spreadsheets' // Add write permissions
  ],
});

export const sheetsWrite = google.sheets({ version: 'v4', auth: authWrite });

/**
 * Fetch data from Google Sheets
 */
export async function fetchSheetData(spreadsheetId: string, range: string) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return {
      success: true,
      data: response.data.values || [],
    };
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [],
    };
  }
}

/**
 * Get spreadsheet metadata
 */
export async function getSheetMetadata(spreadsheetId: string) {
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: false
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching sheet metadata:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Append data to Google Sheets
 */
export async function appendSheetData(spreadsheetId: string, range: string, values: (string | number | boolean)[][]) {
  try {
    const response = await sheetsWrite.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values }
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error appending sheet data:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Update data in Google Sheets
 */
export async function updateSheetRange(spreadsheetId: string, range: string, values: (string | number | boolean)[][]) {
  try {
    const response = await sheetsWrite.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values }
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating sheet range:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Clear data from Google Sheets
 */
export async function clearSheetRange(spreadsheetId: string, range: string) {
  try {
    const response = await sheetsWrite.spreadsheets.values.clear({
      spreadsheetId,
      range
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error clearing sheet range:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Convert sheet rows to objects using headers
 */
export function rowsToObjects<T>(rows: string[][]): T[] {
  if (rows.length === 0) return [];
  
  const [headers, ...dataRows] = rows;
  
  return dataRows.map(row => {
    const obj = {} as Record<string, string>;
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj as T;
  });
}
