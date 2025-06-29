import { google } from 'googleapis';

/**
 * Google Sheets API client configuration
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
