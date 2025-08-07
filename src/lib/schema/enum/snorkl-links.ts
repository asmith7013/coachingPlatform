import { Grade6Lessons, Grade7Lessons, Grade8Lessons, type GradeLevel } from './scope-sequence';

export type SectionType = 'SRF' | 'SR6' | 'SR7' | 'SR8';

/**
 * Snorkl submission links by section for Grade 6
 */
export const Grade6SnorklLinks: Record<Grade6Lessons, Partial<Record<SectionType, string>>> = {
  "G6 U2 L01": {
    "SRF": "https://student.snorkl.app/4uhgug",
    "SR6": "https://student.snorkl.app/k8fy7h"
  },
  "G6 U2 L02": {
    "SRF": "https://student.snorkl.app/11vdsn",
    "SR6": "https://student.snorkl.app/9kf4vz"
  },
  "G6 U2 L03": {
    "SRF": "https://student.snorkl.app/38424u",
    "SR6": "https://student.snorkl.app/ybrmuc"
  },
  "G6 U2 L04": {
    "SRF": "https://student.snorkl.app/en718n",
    "SR6": "https://student.snorkl.app/ecv8c2"
  },
  "G6 U2 L05": {
    "SRF": "https://student.snorkl.app/b6p8d6",
    "SR6": "https://student.snorkl.app/vqdpd7"
  },
  "G6 U2 L06": {
    "SRF": "https://student.snorkl.app/9eyzmj",
    "SR6": "https://student.snorkl.app/uzuebh"
  },
  "G6 U2 L07": {
    "SRF": "https://student.snorkl.app/rdrmyq",
    "SR6": "https://student.snorkl.app/k34qkg"
  },
  "G6 U2 L08": {
    "SRF": "https://student.snorkl.app/a7gn3k",
    "SR6": "https://student.snorkl.app/51n1ze"
  },
  "G6 U2 L09": {
    // Non-Summer Rising lesson - no Snorkl links
  },
  "G6 U2 L10": {
    // Non-Summer Rising lesson - no Snorkl links
  },
  "G6 U2 L11": {
    "SRF": "https://student.snorkl.app/awde5n",
    "SR6": "https://student.snorkl.app/zcucjt"
  },
  "G6 U2 L12": {
    "SRF": "https://student.snorkl.app/ssert3",
    "SR6": "https://student.snorkl.app/61td9n"
  },
  "G6 U2 L13": {
    "SRF": "https://student.snorkl.app/98tqh8",
    "SR6": "https://student.snorkl.app/nk84b6"
  },
  "G6 U2 L14": {
    "SRF": "https://student.snorkl.app/bpkbfc",
    "SR6": "https://student.snorkl.app/9mxj64"
  },
  "G6 U2 L15": {
    // Non-Summer Rising lesson - no Snorkl links
  },
  "G6 U2 L16": {
    "SRF": "https://student.snorkl.app/qpsdb6",
    "SR6": "https://student.snorkl.app/vej4gx"
  },
  "G6 U3 L01": {
    // Non-Summer Rising lesson - no Snorkl links
  },
  "G6 U3 L03": {
    // Non-Summer Rising lesson - no Snorkl links
  },
  "G6 U3 L06": {
    "SRF": "https://student.snorkl.app/8r9a6c",
    "SR6": "https://student.snorkl.app/r9xeve"
  },
  "G6 U3 L07": {
    "SRF": "https://student.snorkl.app/18m1zh",
    "SR6": "https://student.snorkl.app/tfa3v1"
  },
  "G6 U3 L09": {
    "SRF": "https://student.snorkl.app/yfes98",
    "SR6": "https://student.snorkl.app/3b17j5"
  },
  "G6 U3 L10": {
    "SRF": "https://student.snorkl.app/7vhnbr",
    "SR6": "https://student.snorkl.app/reamtn"
  },
  "G6 U3 L11": {
    "SRF": "https://student.snorkl.app/qu27f5",
    "SR6": "https://student.snorkl.app/exm3pn"
  },
  "G6 U3 L12": {
    "SRF": "https://student.snorkl.app/9vdzzq",
    "SR6": "https://student.snorkl.app/61td9n"
  },
  "G6 U3 L13": {
    "SRF": "https://student.snorkl.app/d9yvrr",
    "SR6": "https://student.snorkl.app/uvsje7"
  },
  "G6 U3 L14": {
    "SRF": "https://student.snorkl.app/39tmk6",
    "SR6": "https://student.snorkl.app/rqhv6n"
  },
  "G6 U3 L16": {
    "SRF": "https://student.snorkl.app/9nfnm9",
    "SR6": "https://student.snorkl.app/t2tkh7"
  },
  "G6 U3 L17": {
    "SRF": "https://student.snorkl.app/ewxtur",
    "SR6": "https://student.snorkl.app/zurrsg"
  }
};

/**
 * Grade 7 and 8 have no Snorkl links yet
 */
export const Grade7SnorklLinks: Record<Grade7Lessons, Partial<Record<SectionType, string>>> = {
  "G7 U2 L02": {},
  "G7 U2 L03": {},
  "G7 U2 L04": {},
  "G7 U2 L05": {},
  "G7 U2 L06": {},
  "G7 U2 L07": {},
  "G7 U2 L08": {},
  "G7 U2 L10": {},
  "G7 U2 L11": {},
  "G7 U2 L12": {},
  "G7 U2 L13": {},
  "G7 U6 L04": {},
  "G7 U6 L05": {},
  "G7 U6 L06": {},
  "G7 U6 L07": {},
  "G7 U6 L08": {},
  "G7 U6 L09": {},
  "G7 U6 L10": {},
  "G7 U6 L11": {},
  "G7 U6 L13": {},
  "G7 U6 L14": {},
  "G7 U6 L15": {},
  "G7 U6 L16": {}
};

export const Grade8SnorklLinks: Record<Grade8Lessons, Partial<Record<SectionType, string>>> = {
  "G8 U2 L10": {},
  "G8 U2 L11": {},
  "G8 U2 L12": {},
  "G8 U3 L01": {},
  "G8 U3 L02": {},
  "G8 U3 L03": {},
  "G8 U3 L04": {},
  "G8 U3 L05": {},
  "G8 U3 L06": {},
  "G8 U3 L07": {},
  "G8 U3 L08": {},
  "G8 U3 L09": {},
  "G8 U3 L10": {},
  "G8 U3 L11": {},
  "G8 U3 L13": {},
  "G8 U3 L14": {},
  "G8 U5 L01": {},
  "G8 U5 L02": {},
  "G8 U5 L03": {},
  "G8 U5 L04": {},
  "G8 U5 L05": {}
};

/**
 * Get Snorkl link for a specific lesson, grade, and section
 */
export function getSnorklLink(lesson: string, grade: GradeLevel, section: SectionType): string | null {
  switch (grade) {
    case "6":
      return Grade6SnorklLinks[lesson as Grade6Lessons]?.[section] || null;
    case "7":
      return Grade7SnorklLinks[lesson as Grade7Lessons]?.[section] || null;
    case "8":
      return Grade8SnorklLinks[lesson as Grade8Lessons]?.[section] || null;
    default:
      return null;
  }
}

/**
 * Check if a lesson has a Snorkl link for the given section
 */
export function hasSnorklLink(lesson: string, grade: GradeLevel, section: SectionType): boolean {
  return getSnorklLink(lesson, grade, section) !== null;
} 