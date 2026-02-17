// src/lib/integrations/monday/mappers/utils/value-transformers.ts

import { MondayColumnValue } from "@lib/integrations/monday/types/board";
import { ValueTransformer } from "@lib/integrations/monday/types/mapping";

/**
 * Extract text value from a Monday column value
 */
export const textTransformer: ValueTransformer<string> = (
  value: MondayColumnValue,
) => value.text || "";

/**
 * Extract a date from a timeline or date value
 */
export const dateTransformer: ValueTransformer<string> = (
  value: MondayColumnValue,
) => {
  try {
    if (value.value) {
      const parsed = JSON.parse(value.value);
      if (parsed.from) {
        return parsed.from;
      } else if (parsed.date) {
        return parsed.date;
      }
    }

    // Fallback to text
    if (value.text) {
      const match = value.text.match(/(\d{4}-\d{2}-\d{2})/);
      if (match) {
        return match[1];
      }
    }
  } catch (e) {
    // Ignore parsing errors
    console.error("Error parsing timeline/date value:", e);
  }

  return value.text || "";
};

/**
 * Extract a person ID from a people column value
 */
export const personTransformer: ValueTransformer<string> = (
  value: MondayColumnValue,
) => {
  try {
    if (value.value) {
      const parsed = JSON.parse(value.value);
      if (parsed.personsAndTeams && parsed.personsAndTeams.length > 0) {
        return parsed.personsAndTeams[0].id.toString();
      }
    }
  } catch (e) {
    // Ignore parsing errors
    console.error("Error parsing people value:", e);
  }

  // Fallback to text
  return value.text || "";
};

/**
 * Extract multiple person IDs from a people column value
 */
export const peopleTransformer: ValueTransformer<string[]> = (
  value: MondayColumnValue,
) => {
  const people: string[] = [];

  try {
    if (value.value) {
      const parsed = JSON.parse(value.value);
      if (parsed.personsAndTeams && parsed.personsAndTeams.length > 0) {
        return parsed.personsAndTeams.map((person: unknown) =>
          (person as { id: string }).id.toString(),
        );
      }
    }
  } catch (e) {
    // Ignore parsing errors
    console.error("Error parsing multiple people value:", e);
  }

  // Fallback to text - not ideal, but better than nothing
  if (value.text) {
    people.push(value.text);
  }

  return people;
};

/**
 * Transform a boolean or checkbox value
 */
export const booleanTransformer: ValueTransformer<boolean> = (
  value: MondayColumnValue,
) => {
  if (value.value) {
    const lowerValue = value.value.toLowerCase();
    return (
      lowerValue === "true" || lowerValue === "yes" || lowerValue === "checked"
    );
  }
  return false;
};

/**
 * Convert a number value
 */
export const numberTransformer: ValueTransformer<number> = (
  value: MondayColumnValue,
) => {
  if (value.value) {
    const num = parseFloat(value.value);
    if (!isNaN(num)) return num;
  }
  if (value.text) {
    const num = parseFloat(value.text);
    if (!isNaN(num)) return num;
  }
  return 0;
};
