import {
    GradeLevelsSupportedZod,
    SubjectsZod,
    SpecialGroupsZod,
    DayTypeZod,
    BlockDayTypeZod,
    BellScheduleTypeZod,
    PeriodTypeZod,
    DurationValues,
    EventTypeZod,
    NoteTypeZod,
    SessionPurposeZod,
    RolesNYCPSZod,
    RolesTLZod,
    AdminLevelZod,
    IPGIndicatorZod,
    ImplementationIndicatorZod,
    SupportCycleTypeZod,
    AllowedPurposeZod,
    ReasonDoneZod,
    TotalDurationZod,
    SolvesTouchpointZod,
} from "@/lib/data/schemas/shared";

import { SettingTypesEnum, YesNoEnum, LengthTypeEnum, TeacherLeaderTypeEnum } from "@/models/shared";

// import type {
//     AllowedPurpose, GradeLevelsSupported, Subjects, SpecialGroups,
//     RolesNYCPS, RolesTL, DayType, BlockDayType,
//     BellScheduleType, PeriodType, ModeDone, ReasonDone, TotalDuration,
//     EventType, Duration, AdminLevel, SolvesTouchpoint
// } from "@/models/models";

// ✅ Grade Levels Supported Values
export const GradeLevelsSupportedValues = GradeLevelsSupportedZod.options;

// ✅ Subjects Values
export const SubjectsValues = SubjectsZod.options;

// ✅ Special Groups Values
export const SpecialGroupsValues = SpecialGroupsZod.options;

// ✅ Day Type Values
export const DayTypeValues = DayTypeZod.options;

// ✅ Block Day Type Values
export const BlockDayTypeValues = BlockDayTypeZod.options;

// ✅ Bell Schedule Type Values
export const BellScheduleTypeValues = BellScheduleTypeZod.options;

// ✅ Period Type Values
export const PeriodTypeValues = PeriodTypeZod.options;

// ✅ Duration Values
export { DurationValues };

// ✅ Event Type Values
export const EventTypeValues = EventTypeZod.options;

// ✅ Note Type Values
export const NoteTypeValues = NoteTypeZod.options;

// ✅ Session Purpose Values
export const SessionPurposeValues = SessionPurposeZod.options;

// ✅ Roles NYCPS Values
export const RolesNYCPSValues = RolesNYCPSZod.options;

// ✅ Roles TL Values
export const RolesTLValues = RolesTLZod.options;

// ✅ Admin Level Values
export const AdminLevelValues = AdminLevelZod.options;

// ✅ IPG Indicator Values
export const IPGIndicatorValues = IPGIndicatorZod.options;

// ✅ Implementation Indicator Values
export const ImplementationIndicatorValues = ImplementationIndicatorZod.options;

// ✅ Support Cycle Type Values
export const SupportCycleTypeValues = SupportCycleTypeZod.options;

// ✅ Allowed Purpose Values
export const AllowedPurposeValues = AllowedPurposeZod.options;

// ✅ Reason Done Values
export const ReasonDoneValues = ReasonDoneZod.options;

// ✅ Total Duration Values
export const TotalDurationValues = TotalDurationZod.options;

// ✅ Solves Touchpoint Values
export const SolvesTouchpointValues = SolvesTouchpointZod.options;

// Legacy Enum Values
export const ModeDoneValues: SettingTypesEnum[] = [
    SettingTypesEnum.IN_PERSON,
    SettingTypesEnum.VIRTUAL,
    SettingTypesEnum.HYBRID,
] as const;

export const YesNoValues: YesNoEnum[] = [
    YesNoEnum.YES,
    YesNoEnum.NO,
] as const;

export const LengthTypeValues: LengthTypeEnum[] = [
    LengthTypeEnum.FULL_DAY___6_HOURS,
    LengthTypeEnum.HALF_DAY___3_HOURS,
] as const;

export const TeacherLeaderTypeValues: TeacherLeaderTypeEnum[] = [
    TeacherLeaderTypeEnum.TEACHER_SUPPORT,
    TeacherLeaderTypeEnum.LEADER_SUPPORT,
    TeacherLeaderTypeEnum.TEACHER_OR_TEACHER___LEADER_SUPPORT,
] as const;