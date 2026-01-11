'use server';

import { withDbConnection } from '@server/db/ensure-connection';
import { handleServerError } from '@error/handlers/server';
import { ScopeAndSequenceModel } from '@mongoose-schema/scm/scope-and-sequence/scope-and-sequence.model';

export interface UnitWithStandards {
  unitNumber: number;
  unitName: string;
  grade: string;
  standards: string[]; // All unique standard codes in this unit
}

export interface SectionWithStandards {
  section: string;
  subsection?: number;
  displayName: string;
  lessonCount: number;
  standards: string[]; // All unique standard codes in this section
}

interface GetUnitsResult {
  success: boolean;
  units?: UnitWithStandards[];
  error?: string;
}

interface GetSectionsResult {
  success: boolean;
  sections?: SectionWithStandards[];
  allStandards?: string[]; // All standards in the entire unit
  error?: string;
}

/**
 * Get all units for a grade with their standards
 */
export async function getUnitsWithStandards(grade: string): Promise<GetUnitsResult> {
  return withDbConnection(async () => {
    try {
      // Map grade to scopeSequenceTag format
      const scopeSequenceTag = `Grade ${grade}`;

      // Aggregate to get unique units with all their standards
      // Group by unitNumber only and pick the first non-null unit name
      const unitsData = await ScopeAndSequenceModel.aggregate([
        { $match: { scopeSequenceTag } },
        {
          $group: {
            _id: '$unitNumber',
            // Collect all unit names, filter out nulls, take first
            unitNames: { $addToSet: '$unit' },
            standards: { $push: '$standards.code' }
          }
        },
        {
          $project: {
            unitNumber: '$_id',
            // Filter out null/empty names and take first
            unitName: {
              $first: {
                $filter: {
                  input: '$unitNames',
                  cond: { $and: [{ $ne: ['$$this', null] }, { $ne: ['$$this', ''] }] }
                }
              }
            },
            // Flatten array of arrays and get unique values
            standards: {
              $reduce: {
                input: '$standards',
                initialValue: [],
                in: { $setUnion: ['$$value', '$$this'] }
              }
            }
          }
        },
        { $sort: { unitNumber: 1 } }
      ]);

      const units: UnitWithStandards[] = unitsData.map((u) => ({
        unitNumber: u.unitNumber,
        unitName: u.unitName,
        grade,
        standards: u.standards.filter((s: string | null) => s) // Remove nulls
      }));

      return { success: true, units };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, 'Failed to fetch units')
      };
    }
  });
}

/**
 * Get all sections within a unit with their standards
 */
export async function getSectionsWithStandards(
  grade: string,
  unitNumber: number
): Promise<GetSectionsResult> {
  return withDbConnection(async () => {
    try {
      const scopeSequenceTag = `Grade ${grade}`;

      // Get all lessons in this unit grouped by section
      const sectionsData = await ScopeAndSequenceModel.aggregate([
        {
          $match: {
            scopeSequenceTag,
            unitNumber
          }
        },
        {
          $group: {
            _id: { section: '$section', subsection: '$subsection' },
            lessonCount: { $sum: 1 },
            standards: { $push: '$standards.code' }
          }
        },
        {
          $project: {
            section: '$_id.section',
            subsection: '$_id.subsection',
            lessonCount: 1,
            standards: {
              $reduce: {
                input: '$standards',
                initialValue: [],
                in: { $setUnion: ['$$value', '$$this'] }
              }
            }
          }
        },
        { $sort: { section: 1, subsection: 1 } }
      ]);

      // Define section order for sorting
      const sectionOrder: Record<string, number> = {
        'Ramp Ups': 0,
        'A': 1,
        'B': 2,
        'C': 3,
        'D': 4,
        'E': 5,
        'F': 6,
        'Unit Assessment': 7
      };

      const sections: SectionWithStandards[] = sectionsData
        .map((s) => ({
          section: s.section || 'Unknown',
          subsection: s.subsection,
          displayName: s.subsection
            ? `${s.section} (Part ${s.subsection})`
            : s.section || 'Unknown',
          lessonCount: s.lessonCount,
          standards: s.standards.filter((std: string | null) => std)
        }))
        .sort((a, b) => {
          const orderA = sectionOrder[a.section] ?? 99;
          const orderB = sectionOrder[b.section] ?? 99;
          if (orderA !== orderB) return orderA - orderB;
          return (a.subsection ?? 0) - (b.subsection ?? 0);
        });

      // Collect all unique standards across all sections
      const allStandards = Array.from(new Set(sections.flatMap(s => s.standards)));

      return { success: true, sections, allStandards };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, 'Failed to fetch sections')
      };
    }
  });
}
