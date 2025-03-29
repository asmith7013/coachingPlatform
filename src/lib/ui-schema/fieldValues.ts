import {
    AllowedGradeEnum,
    AllowedSubjectsEnum,
    AllowedSpecialGroupsEnum,
    AllowedRolesNYCPSEnum,
    AllowedRolesTLEnum,
    TLAdminTypeEnum,
    DayTypeEnum,
    BlockDayTypeEnum,
    BellScheduleTypesEnum,
    PeriodTypesEnum,
    DurationTypesEnum,
    EventTypesEnum,
    SettingTypesEnum,
    YesNoEnum,
    LengthTypeEnum,
    TeacherLeaderTypeEnum,
    AllowedPurposeEnum,
} from "@/models/shared";

// import type {
//     AllowedPurpose, GradeLevelsSupported, Subjects, SpecialGroups,
//     RolesNYCPS, RolesTL, DayType, BlockDayType,
//     BellScheduleType, PeriodType, ModeDone, ReasonDone, TotalDuration,
//     EventType, Duration, AdminLevel, SolvesTouchpoint
// } from "@/models/models";

// ✅ Dynamically Extract Enum Values
export const AllowedPurposeValues: AllowedPurposeEnum[] = [
    AllowedPurposeEnum.INITIAL_WALKTHROUGH,
    AllowedPurposeEnum.VISIT,
    AllowedPurposeEnum.FINAL_WALKTHROUGH
] as const;

export const GradeLevelsSupportedValues: AllowedGradeEnum[] = [
    AllowedGradeEnum.KINDERGARTEN,
    AllowedGradeEnum.GRADE_1,
    AllowedGradeEnum.GRADE_2,
    AllowedGradeEnum.GRADE_3,
    AllowedGradeEnum.GRADE_4,
    AllowedGradeEnum.GRADE_5,
    AllowedGradeEnum.GRADE_6,
    AllowedGradeEnum.GRADE_7,
    AllowedGradeEnum.GRADE_8,
    AllowedGradeEnum.GRADE_9,
    AllowedGradeEnum.GRADE_10,
    AllowedGradeEnum.GRADE_11,
    AllowedGradeEnum.GRADE_12
] as const;

export const SubjectsValues: AllowedSubjectsEnum[] = [
    AllowedSubjectsEnum.MATH_6,
    AllowedSubjectsEnum.MATH_7,
    AllowedSubjectsEnum.MATH_8,
    AllowedSubjectsEnum.ALGEBRA_I,
    AllowedSubjectsEnum.GEOMETRY,
    AllowedSubjectsEnum.ALGEBRA_II
] as const;

export const SpecialGroupsValues: AllowedSpecialGroupsEnum[] = [
    AllowedSpecialGroupsEnum.SPED,
    AllowedSpecialGroupsEnum.ELL
] as const;

export const RolesNYCPSValues: AllowedRolesNYCPSEnum[] = [
    AllowedRolesNYCPSEnum.TEACHER,
    AllowedRolesNYCPSEnum.PRINCIPAL,
    AllowedRolesNYCPSEnum.AP,
    AllowedRolesNYCPSEnum.COACH,
    AllowedRolesNYCPSEnum.ADMINISTRATOR
] as const;

export const RolesTLValues: AllowedRolesTLEnum[] = [
    AllowedRolesTLEnum.COACH,
    AllowedRolesTLEnum.CPM,
    AllowedRolesTLEnum.DIRECTOR,
    AllowedRolesTLEnum.SENIOR_DIRECTOR
] as const;

export const DayTypeValues: DayTypeEnum[] = [
    DayTypeEnum.UNIFORM,
    DayTypeEnum.MONDAY,
    DayTypeEnum.TUESDAY,
    DayTypeEnum.WEDNESDAY,
    DayTypeEnum.THURSDAY,
    DayTypeEnum.FRIDAY,
    DayTypeEnum.A,
    DayTypeEnum.B,
    DayTypeEnum.C
] as const;

export const BlockDayTypeValues: BlockDayTypeEnum[] = [
    BlockDayTypeEnum.A,
    BlockDayTypeEnum.B,
    BlockDayTypeEnum.C
] as const;

export const BellScheduleTypeValues: BellScheduleTypesEnum[] = [
    BellScheduleTypesEnum.UNIFORM,
    BellScheduleTypesEnum.WEEKLYCYCLE,
    BellScheduleTypesEnum.ABCCYCLE
] as const;

export const PeriodTypeValues: PeriodTypesEnum[] = [
    PeriodTypesEnum.CLASS,
    PeriodTypesEnum.PREP,
    PeriodTypesEnum.LUNCH,
    PeriodTypesEnum.MEETING
] as const;

export const ModeDoneValues: SettingTypesEnum[] = [
    SettingTypesEnum.IN_PERSON,
    SettingTypesEnum.VIRTUAL,
    SettingTypesEnum.HYBRID
] as const;

export const ReasonDoneValues: YesNoEnum[] = [
    YesNoEnum.YES,
    YesNoEnum.NO
] as const;

export const TotalDurationValues: LengthTypeEnum[] = [
    LengthTypeEnum.FULL_DAY___6_HOURS,
    LengthTypeEnum.HALF_DAY___3_HOURS
] as const;

export const SolvesTouchpointValues: TeacherLeaderTypeEnum[] = [
    TeacherLeaderTypeEnum.TEACHER_SUPPORT,
    TeacherLeaderTypeEnum.LEADER_SUPPORT,
    TeacherLeaderTypeEnum.TEACHER_OR_TEACHER___LEADER_SUPPORT
] as const;

export const EventTypeValues: EventTypesEnum[] = [
    EventTypesEnum.OBSERVATION,
    EventTypesEnum.DEBRIEF
] as const;

export const DurationValues: DurationTypesEnum[] = [
    DurationTypesEnum.MIN_15,
    DurationTypesEnum.MIN_30,
    DurationTypesEnum.MIN_45,
    DurationTypesEnum.MIN_60,
    DurationTypesEnum.MIN_75,
    DurationTypesEnum.MIN_90
] as const;

export const AdminLevelValues: TLAdminTypeEnum[] = [
    TLAdminTypeEnum.COACH,
    TLAdminTypeEnum.MANAGER,
    TLAdminTypeEnum.CPM,
    TLAdminTypeEnum.DIRECTOR,
    TLAdminTypeEnum.SENIOR_DIRECTOR
] as const;