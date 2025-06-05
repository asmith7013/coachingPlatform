import type { School } from "@domain-types/school";

import type { StaffMember, TeachingLabStaff, NYCPSStaff } from "@domain-types/staff";
import type { LookFor, LookForItem } from "@domain-types/look-fors";

import type { NextStep } from "@domain-types/look-fors";
import type { Note } from "@domain-types/shared";
import type { Visit, EventItem } from "@domain-types/visit";
import type { CoachingLog } from "@domain-types/visit";
import type { Cycle } from "@domain-types/cycle";

// 🔹 Generate Type-Safe Labels for Every Model

export const SchoolFieldLabels: Record<keyof School, string> = {
    _id: "ID",
    id: "School ID",
    schoolNumber: "School Number",
    district: "District",
    schoolName: "School Name",
    address: "Address",
    emoji: "Emoji",
    gradeLevelsSupported: "Grades Offered",
    staffList: "Staff Members",
    schedules: "Schedules",
    cycles: "Cycles",
    owners: "Owners",
    createdAt: "Created At",
    updatedAt: "Updated At",
};

export const StaffMemberFieldLabels: Record<keyof StaffMember, string> = {
    _id: "ID",
    id: "Staff ID",
    staffName: "Full Name",
    email: "Email Address",
    schools: "Assigned Schools",
    owners: "Owners",
    createdAt: "Created At",
    updatedAt: "Updated At",
    mondayUser: "Monday User",
};

export const TeachingLabStaffFieldLabels: Record<keyof TeachingLabStaff, string> = {
    ...StaffMemberFieldLabels,
    adminLevel: "Admin Level",
    assignedDistricts: "Assigned Districts",
    rolesTL: "Role",
};

export const NYCPSStaffFieldLabels: Record<keyof NYCPSStaff, string> = {
    ...StaffMemberFieldLabels,
    gradeLevelsSupported: "Grade Levels",
    subjects: "Subjects Taught",
    specialGroups: "Special Groups",
    rolesNYCPS: "Role",
    pronunciation: "Pronunciation",
    notes: "Notes",
    experience: "Experience",
};

export const CycleFieldLabels: Record<keyof Cycle, string> = {
    _id: "ID",
    id: "Cycle ID",
    cycleNum: "Cycle Number",
    ipgIndicator: "IPG Indicator",
    actionPlanURL: "Action Plan URL",
    implementationIndicator: "Implementation Indicator",
    supportCycle: "Support Cycle",
    lookFors: "Look Fors",
    owners: "Owners",
    createdAt: "Created At",
    updatedAt: "Updated At",
};

export const LookForFieldLabels: Record<keyof LookFor, string> = {
    _id: "ID",
    id: "Look For ID",
    lookForIndex: "Look For Index",
    schools: "Associated Schools",
    teachers: "Teachers",
    topic: "Topic",
    category: "Category",
    status: "Status",
    description: "Description",
    studentFacing: "Student Facing",
    rubric: "Rubric",
    owners: "Owners",
    createdAt: "Created At",
    updatedAt: "Updated At",
};

export const LookForItemFieldLabels: Record<keyof LookForItem, string> = {
    originalLookFor: "Original Look For",
    title: "Title",
    description: "Description",
    tags: "Tags",
    lookForIndex: "Look For Index",
    teacherIDs: "Teacher IDs",
    chosenBy: "Chosen By",
    active: "Active Status",
};

export const CoachingLogFieldLabels: Record<keyof CoachingLog, string> = {
    _id: "ID",
    id: "Coaching Log ID",
    visitId: "Visit ID",
    reasonDone: "Reason Done",
    microPLTopic: "Micro PL Topic",
    microPLDuration: "Micro PL Duration",
    modelTopic: "Model Topic",
    modelDuration: "Model Duration",
    adminMeet: "Admin Meeting",
    adminMeetDuration: "Admin Meeting Duration",
    NYCDone: "NYC Done",
    totalDuration: "Total Duration",
    solvesTouchpoint: "Solves Touchpoint",
    primaryStrategy: "Primary Strategy",
    solvesSpecificStrategy: "Solves-Specific Strategy",
    aiSummary: "AI Summary",
    owners: "Owners",
    createdAt: "Created At",
    updatedAt: "Updated At",
};

export const VisitFieldLabels: Record<keyof Visit, string> = {
    _id: "ID",
    id: "Visit ID",
    date: "Visit Date",
    school: "School",
    coach: "Coach",
    cycleRef: "Cycle Reference",
    plannedScheduleId: "Planned Schedule",
    allowedPurpose: "Purpose",
    modeDone: "Mode of Visit",
    gradeLevelsSupported: "Supported Grade Levels",
    events: "Events",
    sessionLinks: "Session Links",
    owners: "Owners",
    
    // Monday.com integration fields
    mondayItemId: "Monday Item ID",
    mondayBoardId: "Monday Board ID",
    mondayItemName: "Monday Item Name",
    mondayLastSyncedAt: "Last Synced with Monday",
    
    // Additional Monday.com related fields
    siteAddress: "Site Address",
    endDate: "End Date",
    
    // System fields
    createdAt: "Created At",
    updatedAt: "Updated At",
  };
  

export const EventItemFieldLabels: Record<keyof EventItem, string> = {
    eventType: "Event Type",
    staff: "Involved Staff",
    duration: "Duration",
};

export const NextStepFieldLabels: Record<keyof NextStep, string> = {
    _id: "ID",
    id: "Next Step ID",
    description: "Description",
    lookFor: "Associated Look For",
    teacher: "Teacher",
    school: "School",
    owners: "Owners",
    createdAt: "Created At",
    updatedAt: "Updated At",
};

export const NoteFieldLabels: Record<keyof Note, string> = {
    _id: "ID",
    id: "Note ID",
    owners: "Owners",
    date: "Date",
    type: "Type",
    heading: "Heading",
    subheading: "Subheadings",
    createdAt: "Created At",
    updatedAt: "Updated At",
}; 