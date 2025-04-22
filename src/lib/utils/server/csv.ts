import { handleServerError } from "@/lib/core/error/handleServerError";

interface CSVRow {
  [key: string]: string;
}

/**
 * Parses a CSV string into an array of objects
 * Assumes first row contains headers
 */
export function parseCSV(csvString: string): CSVRow[] {
  try {
    // Split into lines and remove empty lines
    const lines = csvString.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error("CSV file must contain headers and at least one data row");
    }

    // Parse headers
    const headers = lines[0].split(',').map(header => 
      header.trim().toLowerCase().replace(/\s+/g, '_')
    );

    // Parse data rows
    return lines.slice(1).map(line => {
      const values = line.split(',').map(value => value.trim());
      
      if (values.length !== headers.length) {
        throw new Error(`Row has ${values.length} values but expected ${headers.length}`);
      }

      return headers.reduce((obj, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {} as CSVRow);
    });
  } catch (error) {
    throw new Error(handleServerError(error));
  }
}

/**
 * Validates that a CSV row has all required fields
 */
export function validateCSVRow(row: CSVRow, requiredFields: string[]): boolean {
  return requiredFields.every(field => 
    row[field] !== undefined && row[field].trim() !== ''
  );
} 