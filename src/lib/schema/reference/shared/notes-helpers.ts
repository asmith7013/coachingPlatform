import { Note } from "@zod-schema/shared/notes";
import { formatShortDate, toDateString } from '@transformers/utils/date-utils';

/**
 * Gets a display string for a note
 */
export function getNoteDisplayString(note: Note): string {
  const dateStr = note.date instanceof Date 
    ? formatShortDate(toDateString(note.date))
    : note.date ? formatShortDate(note.date) : '';
  
  return `${dateStr} - ${note.type}`;
}

/**
 * Formats subheadings as a comma-separated string with optional truncation
 */
export function formatSubheadings(note: Note, maxLength: number = 100): string {
  if (!note.subheading?.length) return '';
  
  const combined = note.subheading.join(', ');
  if (combined.length <= maxLength) {
    return combined;
  }
  
  return combined.slice(0, maxLength) + '...';
}

/**
 * Gets an appropriate color class based on note type
 */
export function getNoteTypeColorClass(note: Note): string {
  const type = note.type.toLowerCase();
  
  if (type.includes('reflection')) return 'bg-blue-100 text-blue-800';
  if (type.includes('observation')) return 'bg-green-100 text-green-800';
  if (type.includes('debrief')) return 'bg-purple-100 text-purple-800';
  if (type.includes('action')) return 'bg-amber-100 text-amber-800';
  
  return 'bg-gray-100 text-gray-800';
}