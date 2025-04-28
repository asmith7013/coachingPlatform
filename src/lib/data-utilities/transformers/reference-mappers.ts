import type { School } from "@zod-schema/core/school";
import type { NYCPSStaff, TeachingLabStaff } from "@zod-schema/core/staff";
import type { TeacherSchedule, BellSchedule } from "@/lib/data-schema/zod-schema/schedule/schedule";
import type { LookFor } from "@zod-schema/look-fors/look-for";
import type { Visit } from "@zod-schema/visits/visit";
import type { CoachingLog } from "@zod-schema/visits/coaching-log";

import type {
  SchoolReference,
  StaffReference,
  ScheduleReference,
  BellScheduleReference,
  LookForReference,
  VisitReference,
  CoachingLogReference
} from "@core-types/reference";

/**
 * Maps a School entity to a SchoolReference for UI components
 */
export function mapSchoolToReference(school: School): SchoolReference {
  return {
    _id: school._id,
    label: school.schoolName,
    schoolNumber: school.schoolNumber
  };
}

/**
 * Maps a Staff entity to a StaffReference for UI components
 */
export function mapStaffToReference(staff: NYCPSStaff | TeachingLabStaff): StaffReference {
  return {
    _id: staff._id,
    label: staff.staffName,
    email: staff.email
  };
}

/**
 * Maps a TeacherSchedule entity to a ScheduleReference for UI components
 */
export function mapScheduleToReference(schedule: TeacherSchedule): ScheduleReference {
  return {
    _id: schedule._id,
    label: `Schedule: ${schedule.teacher}`, // This would be improved if you had teacher name
    teacher: schedule.teacher,
    school: schedule.school
  };
}

/**
 * Maps a BellSchedule entity to a BellScheduleReference for UI components
 */
export function mapBellScheduleToReference(schedule: BellSchedule): BellScheduleReference {
  return {
    _id: schedule._id,
    label: `${schedule.bellScheduleType} Bell Schedule`,
    school: schedule.school,
    bellScheduleType: schedule.bellScheduleType
  };
}

/**
 * Maps a LookFor entity to a LookForReference for UI components
 */
export function mapLookForToReference(lookFor: LookFor): LookForReference {
  return {
    _id: lookFor._id,
    label: lookFor.topic,
    lookForIndex: lookFor.lookForIndex
  };
}

/**
 * Maps a Visit entity to a VisitReference for UI components
 */
export function mapVisitToReference(visit: Visit): VisitReference {
  return {
    _id: visit._id,
    label: `Visit: ${visit.date}`, // This would be improved with school name
    date: visit.date,
    school: visit.school
  };
}

/**
 * Maps a CoachingLog entity to a CoachingLogReference for UI components
 */
export function mapCoachingLogToReference(log: CoachingLog): CoachingLogReference {
  return {
    _id: log._id,
    label: log.primaryStrategy,
    solvesTouchpoint: log.solvesTouchpoint
  };
}

/**
 * Collection of all reference mappers for easy import
 */
export const referenceMappers = {
  school: mapSchoolToReference,
  staff: mapStaffToReference,
  schedule: mapScheduleToReference,
  bellSchedule: mapBellScheduleToReference,
  lookFor: mapLookForToReference,
  visit: mapVisitToReference,
  coachingLog: mapCoachingLogToReference
};