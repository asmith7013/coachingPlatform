import { Sections, SectionsPS19, SectionsX644 } from "@schema/enum/scm";

// Map section to scopeSequenceTag based on first digit
// 802 = Algebra 1
// 6xx = Grade 6
// 7xx = Grade 7
// 8xx (except 802) = Grade 8
export function getScopeTagForSection(section: string): string {
  if (section === "802") {
    return "Algebra 1";
  }
  if (section.startsWith("6")) {
    return "Grade 6";
  }
  if (section.startsWith("7")) {
    return "Grade 7";
  }
  if (section.startsWith("8")) {
    return "Grade 8";
  }
  // Default fallback
  return "Grade 8";
}

// Get grade from section
export function getGradeForSection(section: string): string {
  if (section === "802") {
    return "8"; // Algebra 1 uses grade 8 in the database
  }
  if (section.startsWith("6")) {
    return "6";
  }
  if (section.startsWith("7")) {
    return "7";
  }
  if (section.startsWith("8")) {
    return "8";
  }
  // Default fallback
  return "8";
}

// Get school for a section
export function getSchoolForSection(
  section: string,
): "IS313" | "PS19" | "X644" | "Unknown" {
  if (Sections.includes(section as (typeof Sections)[number])) {
    return "IS313";
  }
  if (SectionsPS19.includes(section as (typeof SectionsPS19)[number])) {
    return "PS19";
  }
  if (SectionsX644.includes(section as (typeof SectionsX644)[number])) {
    return "X644";
  }
  return "Unknown";
}

// Group sections by school
export function groupSectionsBySchool(
  sections: string[],
): Array<{ school: string; sections: string[] }> {
  const is313 = sections
    .filter((s) => getSchoolForSection(s) === "IS313")
    .sort();
  const ps19 = sections.filter((s) => getSchoolForSection(s) === "PS19").sort();
  const x644 = sections.filter((s) => getSchoolForSection(s) === "X644").sort();
  const unknown = sections
    .filter((s) => getSchoolForSection(s) === "Unknown")
    .sort();

  const groups = [];
  if (is313.length > 0) groups.push({ school: "IS313", sections: is313 });
  if (ps19.length > 0) groups.push({ school: "PS19", sections: ps19 });
  if (x644.length > 0) groups.push({ school: "X644", sections: x644 });
  if (unknown.length > 0) groups.push({ school: "Other", sections: unknown });

  return groups;
}
