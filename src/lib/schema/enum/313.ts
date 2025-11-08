import { z } from "zod";

export const SummerDistricts = [
    "D11",
    "D9",
] as const;

export const Sections313 = [
    "802",
    "803",
    "804",
    "805",
    "603/605",
    "604",
    "704",
    "604/704", // Keep for backward compatibility with student records
    "703/705"
] as const;

export const Teachers313 = [
    "CARDONA",
    "COMPRES",
    "MALUNGA",
    "DELANCER",
    "VIERY",
    "NEWMAN"
] as const;

export const Roadmaps313 = [
    "Illustrative Math New York - 4th Grade",
    "Illustrative Math New York - 5th Grade",
    "Illustrative Math New York - 6th Grade",
    "Illustrative Math New York - 7th Grade",
    "Illustrative Math New York - 8th Grade",
    "Illustrative Math New York - Algebra 1"
] as const;

export const SummerDistrictsZod = z.enum(SummerDistricts);
export type SummerDistrictsType = z.infer<typeof SummerDistrictsZod>;

export const Sections313Zod = z.enum(Sections313);
export type Sections313Type = z.infer<typeof Sections313Zod>;

export const Teachers313Zod = z.enum(Teachers313);
export type Teachers313Type = z.infer<typeof Teachers313Zod>;

export const Roadmaps313Zod = z.enum(Roadmaps313);
export type Roadmaps313Type = z.infer<typeof Roadmaps313Zod>;

// =====================================
// SECTION-ROADMAP CONFIGURATION
// =====================================

/**
 * Roadmap assignment for a section
 */
export type RoadmapAssignment = {
  roadmapName: Roadmaps313Type;
  isPrimary: boolean;
};

/**
 * Section configuration with assigned roadmaps
 */
export type SectionRoadmapConfig = {
  section: string;
  roadmaps: RoadmapAssignment[];
};

/**
 * Master configuration mapping sections to roadmaps
 *
 * Usage:
 * - Scrapers: Determine which roadmaps to scrape for a section
 * - Filters: Show skills from all assigned roadmaps for a section
 * - Reports: Distinguish between primary and secondary roadmap performance
 */
export const SECTION_ROADMAP_CONFIG: SectionRoadmapConfig[] = [
  // 6th Grade
  {
    section: "603/605",
    roadmaps: [
      { roadmapName: "Illustrative Math New York - 6th Grade", isPrimary: true }
    ]
  },
  {
    section: "604",
    roadmaps: [
      { roadmapName: "Illustrative Math New York - 6th Grade", isPrimary: true }
    ]
  },

  // 7th Grade
  {
    section: "704",
    roadmaps: [
      { roadmapName: "Illustrative Math New York - 7th Grade", isPrimary: true }
    ]
  },
  {
    section: "703/705",
    roadmaps: [
      { roadmapName: "Illustrative Math New York - 7th Grade", isPrimary: true }
    ]
  },

  // 8th Grade - Algebra 1 Track
  {
    section: "802",
    roadmaps: [
      { roadmapName: "Illustrative Math New York - Algebra 1", isPrimary: true },
      { roadmapName: "Illustrative Math New York - 8th Grade", isPrimary: false }
    ]
  },

  // 8th Grade - Standard Track
  {
    section: "803",
    roadmaps: [
      { roadmapName: "Illustrative Math New York - 8th Grade", isPrimary: true }
    ]
  },
  {
    section: "804",
    roadmaps: [
      { roadmapName: "Illustrative Math New York - 8th Grade", isPrimary: true }
    ]
  },
  {
    section: "805",
    roadmaps: [
      { roadmapName: "Illustrative Math New York - 8th Grade", isPrimary: true }
    ]
  }
];

/**
 * Helper function to get roadmap assignments for a section
 * Returns empty array if section not found
 */
export function getRoadmapsForSection(section: string): RoadmapAssignment[] {
  const config = SECTION_ROADMAP_CONFIG.find(c => c.section === section);
  return config?.roadmaps || [];
}

/**
 * Helper function to get primary roadmap for a section
 * Returns undefined if no primary roadmap found
 */
export function getPrimaryRoadmapForSection(section: string): Roadmaps313Type | undefined {
  const roadmaps = getRoadmapsForSection(section);
  return roadmaps.find(r => r.isPrimary)?.roadmapName;
}

/**
 * Helper function to get all roadmap names for a section
 */
export function getAllRoadmapNamesForSection(section: string): Roadmaps313Type[] {
  return getRoadmapsForSection(section).map(r => r.roadmapName);
}

// =====================================
// ASSESSMENT SCRAPER CONFIGURATIONS
// =====================================

/**
 * Configuration for a single scraper run
 */
export interface ScraperFilterConfig {
  classes: string[];
  roadmap: Roadmaps313Type;
  studentGrade: string;
  skillGrade: string;
}

/**
 * Section scraper configuration (may have multiple configs for dual-roadmap sections)
 */
export interface SectionScraperConfig {
  sectionName: Sections313Type;
  displayName: string;
  configs: ScraperFilterConfig[];
}

/**
 * Pre-configured scraper settings for all sections
 * Section 802 has 2 configs (Algebra 1 + 8th Grade)
 * All other sections have 1 config
 */
export const SCRAPER_SECTION_CONFIGS: SectionScraperConfig[] = [
  // 6th Grade Sections
  {
    sectionName: "603/605",
    displayName: "603/605 - 6th Grade",
    configs: [{
      classes: ["603/605"],
      roadmap: "Illustrative Math New York - 6th Grade",
      studentGrade: "6th Grade",
      skillGrade: "6th Grade"
    }]
  },
  {
    sectionName: "604",
    displayName: "604 - 6th Grade",
    configs: [{
      classes: ["604"],
      roadmap: "Illustrative Math New York - 6th Grade",
      studentGrade: "6th Grade",
      skillGrade: "6th Grade"
    }]
  },

  // 7th Grade Sections
  {
    sectionName: "704",
    displayName: "704 - 7th Grade",
    configs: [{
      classes: ["704"],
      roadmap: "Illustrative Math New York - 7th Grade",
      studentGrade: "7th Grade",
      skillGrade: "7th Grade"
    }]
  },
  {
    sectionName: "703/705",
    displayName: "703/705 - 7th Grade",
    configs: [{
      classes: ["703/705"],
      roadmap: "Illustrative Math New York - 7th Grade",
      studentGrade: "7th Grade",
      skillGrade: "7th Grade"
    }]
  },

  // 8th Grade - Algebra 1 Track (DUAL ROADMAP)
  {
    sectionName: "802",
    displayName: "802 - Algebra 1 & 8th Grade (2 roadmaps)",
    configs: [
      {
        classes: ["802"],
        roadmap: "Illustrative Math New York - Algebra 1",
        studentGrade: "8th Grade",
        skillGrade: "Algebra 1"
      },
      {
        classes: ["802"],
        roadmap: "Illustrative Math New York - 8th Grade",
        studentGrade: "8th Grade",
        skillGrade: "8th Grade"
      }
    ]
  },

  // 8th Grade - Standard Track
  {
    sectionName: "803",
    displayName: "803 - 8th Grade",
    configs: [{
      classes: ["803"],
      roadmap: "Illustrative Math New York - 8th Grade",
      studentGrade: "8th Grade",
      skillGrade: "8th Grade"
    }]
  },
  {
    sectionName: "804",
    displayName: "804 - 8th Grade",
    configs: [{
      classes: ["804"],
      roadmap: "Illustrative Math New York - 8th Grade",
      studentGrade: "8th Grade",
      skillGrade: "8th Grade"
    }]
  },
  {
    sectionName: "805",
    displayName: "805 - 8th Grade",
    configs: [{
      classes: ["805"],
      roadmap: "Illustrative Math New York - 8th Grade",
      studentGrade: "8th Grade",
      skillGrade: "8th Grade"
    }]
  }
];

/**
 * Helper function to get scraper config for a specific section
 */
export function getScraperConfigForSection(section: Sections313Type): SectionScraperConfig | undefined {
  return SCRAPER_SECTION_CONFIGS.find(c => c.sectionName === section);
}

/**
 * Helper function to get all section options for scraper dropdown
 */
export function getScraperSectionOptions() {
  return SCRAPER_SECTION_CONFIGS.map(config => ({
    value: config.sectionName,
    label: config.displayName,
    hasMultipleConfigs: config.configs.length > 1
  }));
}