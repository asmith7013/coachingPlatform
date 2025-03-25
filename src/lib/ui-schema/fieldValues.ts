import type {
    AllowedPurpose, GradeLevelsSupported, Subjects, SpecialGroups,
    RolesNYCPS, RolesTL, DayType, BlockDayType,
    BellScheduleType, PeriodType, ModeDone, ReasonDone, TotalDuration,
    EventType, Duration, AdminLevel, SolvesTouchpoint
} from "@/models/models";

// ✅ Dynamically Extract Enum Values
export const AllowedPurposeValues: AllowedPurpose[] = [
    "Initial Walkthrough", "Visit", "Final Walkthrough"
] as const;

export const GradeLevelsSupportedValues: GradeLevelsSupported[] = [
    "Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"
] as const;

export const SubjectsValues: Subjects[] = [
    "Math 6", "Math 7", "Math 8", "Algebra I", "Geometry", "Algebra II"
] as const;

export const SpecialGroupsValues: SpecialGroups[] = [
    "SPED", "ELL"
] as const;

export const RolesNYCPSValues: RolesNYCPS[] = [
    "Teacher", "Principal", "AP", "Coach", "Administrator"
] as const;

export const RolesTLValues: RolesTL[] = [
    "Coach", "CPM", "Director", "Senior Director"
] as const;

export const DayTypeValues: DayType[] = [
    "uniform", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "A", "B", "C"
] as const;

export const BlockDayTypeValues: BlockDayType[] = [
    "A", "B", "C"
] as const;

export const BellScheduleTypeValues: BellScheduleType[] = [
    "uniform", "weeklyCycle", "abcCycle"
] as const;

export const PeriodTypeValues: PeriodType[] = [
    "class", "prep", "lunch", "meeting"
] as const;

export const ModeDoneValues: ModeDone[] = [
    "In-person", "Virtual", "Hybrid"
] as const;

export const ReasonDoneValues: ReasonDone[] = [
    "Yes", "No"
] as const;

export const TotalDurationValues: TotalDuration[] = [
    "Full day - 6 hours", "Half day - 3 hours"
] as const;

export const SolvesTouchpointValues: SolvesTouchpoint[] = [
    "Teacher support", "Leader support", "Teacher OR teacher & leader support"
] as const;

export const EventTypeValues: EventType[] = [
    "observation", "debrief"
] as const;

export const DurationValues: Duration[] = [
    15, 30, 45, 60, 75, 90
] as const;

export const AdminLevelValues: AdminLevel[] = [
    "Coach", "Manager", "CPM", "Director", "Senior Director"
] as const;