// --------------------
// Shared Enums
// --------------------

export enum AllowedGradeEnum {
  KINDERGARTEN = "Kindergarten",
  GRADE_1 = "Grade 1",
  GRADE_2 = "Grade 2",
  GRADE_3 = "Grade 3",
  GRADE_4 = "Grade 4",
  GRADE_5 = "Grade 5",
  GRADE_6 = "Grade 6",
  GRADE_7 = "Grade 7",
  GRADE_8 = "Grade 8",
  GRADE_9 = "Grade 9",
  GRADE_10 = "Grade 10",
  GRADE_11 = "Grade 11",
  GRADE_12 = "Grade 12",
}

export enum AllowedSubjectsEnum {
  MATH_6 = "Math 6",
  MATH_7 = "Math 7",
  MATH_8 = "Math 8",
  ALGEBRA_I = "Algebra I",
  GEOMETRY = "Geometry",
  ALGEBRA_II = "Algebra II",
}

export enum AllowedSpecialGroupsEnum {
  SPED = "SPED",
  ELL = "ELL",
}

export enum AllowedRolesNYCPSEnum {
  TEACHER = "Teacher",
  PRINCIPAL = "Principal",
  AP = "AP",
  COACH = "Coach",
  ADMINISTRATOR = "Administrator",
}

export enum AllowedRolesTLEnum {
  COACH = "Coach",
  CPM = "CPM",
  DIRECTOR = "Director",
  SENIOR_DIRECTOR = "Senior Director",
}

export enum TLAdminTypeEnum {
  COACH = "Coach",
  MANAGER = "Manager",
  CPM = "CPM",
  DIRECTOR = "Director",
  SENIOR_DIRECTOR = "Senior Director",
}

export enum DayTypeEnum {
  UNIFORM = "uniform",
  MONDAY = "Monday",
  TUESDAY = "Tuesday",
  WEDNESDAY = "Wednesday",
  THURSDAY = "Thursday",
  FRIDAY = "Friday",
  A = "A",
  B = "B",
  C = "C",
}

export enum BlockDayTypeEnum {
  A = "A",
  B = "B",
  C = "C",
}

export enum BellScheduleTypesEnum {
  UNIFORM = "uniform",
  WEEKLYCYCLE = "weeklyCycle",
  ABCCYCLE = "abcCycle",
}

export enum PeriodTypesEnum {
  CLASS = "class",
  PREP = "prep",
  LUNCH = "lunch",
  MEETING = "meeting",
}

export enum DurationTypesEnum {
  MIN_15 = 15,
  MIN_30 = 30,
  MIN_45 = 45,
  MIN_60 = 60,
  MIN_75 = 75,
  MIN_90 = 90,
}

export enum EventTypesEnum {
  OBSERVATION = "observation",
  DEBRIEF = "debrief",
}

export enum SettingTypesEnum {
  IN_PERSON = "In-person",
  VIRTUAL = "Virtual",
  HYBRID = "Hybrid",
}

export enum YesNoEnum {
  YES = "Yes",
  NO = "No",
}

export enum LengthTypeEnum {
  FULL_DAY___6_HOURS = "Full day - 6 hours",
  HALF_DAY___3_HOURS = "Half day - 3 hours",
}

export enum TeacherLeaderTypeEnum {
  TEACHER_SUPPORT = "Teacher support",
  LEADER_SUPPORT = "Leader support",
  TEACHER_OR_TEACHER___LEADER_SUPPORT = "Teacher OR teacher & leader support",
}

export enum AllowedPurposeEnum {
  INITIAL_WALKTHROUGH = "Initial Walkthrough",
  VISIT = "Visit",
  FINAL_WALKTHROUGH = "Final Walkthrough",
}