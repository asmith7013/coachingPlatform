import mongoose from "mongoose";
import { SkillsHubActionPlan } from "@lib/skills-hub/coach/action-plans/action-plan.model";
import { SkillsHubActionStep } from "@lib/skills-hub/coach/action-plans/action-step.model";
import { SkillsHubCoachTeacherAssignment } from "@lib/skills-hub/admin/coaching-assignments/coaching-assignment.model";
import { ACTION_PLANS, daysAgo, type StaffIds } from "./config";

export interface PlanDocs {
  open: mongoose.Document;
  closed: mongoose.Document;
  archived: mongoose.Document;
}

export async function seedCoachingAssignment(staff: StaffIds): Promise<void> {
  console.log("Creating coaching assignment...");
  await SkillsHubCoachTeacherAssignment.create({
    coachStaffId: staff.coachId,
    teacherStaffId: staff.teacherId,
    schoolId: null,
    assignedAt: daysAgo(60),
  });
  console.log("  coach → teacher assignment created\n");
}

export async function seedActionPlans(staff: StaffIds): Promise<PlanDocs> {
  console.log("Creating action plans...");
  const planDocs: Record<string, mongoose.Document> = {};

  for (const [key, plan] of Object.entries(ACTION_PLANS)) {
    const closedAt =
      plan.status === "closed"
        ? daysAgo(7)
        : plan.status === "archived"
          ? daysAgo(45)
          : null;

    const doc = await SkillsHubActionPlan.create({
      teacherStaffId: staff.teacherId,
      createdBy: staff.coachId,
      title: plan.title,
      skillIds: plan.skillIds,
      why: plan.why,
      actionStep: plan.actionStep,
      status: plan.status,
      closedAt,
    });
    planDocs[key] = doc;
    console.log(`  [${plan.status}] "${plan.title}" — ${plan.skillIds.length} skills`);
  }
  console.log("");
  return planDocs as unknown as PlanDocs;
}

export async function seedActionSteps(
  staff: StaffIds,
  plans: PlanDocs,
): Promise<void> {
  console.log("Creating action steps...");

  const openSkills = ACTION_PLANS.open.skillIds;
  await SkillsHubActionStep.insertMany([
    {
      actionPlanId: plans.open._id,
      description: "Implement structured turn-and-talk routine during small group instruction with sentence starters posted visibly",
      dueDate: daysAgo(-7),
      evidenceOfCompletion: "Students independently using sentence starters during partner discussions",
      skillIds: [openSkills[1], openSkills[0]],
      completed: true,
      completedAt: daysAgo(2),
      completedBy: staff.coachId,
    },
    {
      actionPlanId: plans.open._id,
      description: "Practice normalizing mistakes by modeling think-aloud when errors occur during worked examples",
      dueDate: daysAgo(-14),
      evidenceOfCompletion: "Teacher consistently responds to errors with curiosity rather than correction",
      skillIds: [openSkills[2], openSkills[3]],
      completed: false,
    },
    {
      actionPlanId: plans.open._id,
      description: "Gradually release responsibility by having students lead their own practice after worked example",
      dueDate: daysAgo(-21),
      evidenceOfCompletion: "Students working independently for 10+ minutes with minimal prompts",
      skillIds: [openSkills[4]],
      completed: false,
    },
  ]);
  console.log("  Open plan: 3 steps (1 completed, 2 pending)");

  const closedSkills = ACTION_PLANS.closed.skillIds;
  await SkillsHubActionStep.insertMany([
    {
      actionPlanId: plans.closed._id,
      description: "Set up and run 2-minute fluency drills at the start of each class period",
      dueDate: daysAgo(20),
      evidenceOfCompletion: "Drills happening consistently with timer visible to students",
      skillIds: [closedSkills[0]],
      completed: true,
      completedAt: daysAgo(18),
      completedBy: staff.coachId,
    },
    {
      actionPlanId: plans.closed._id,
      description: "Create and display daily warm-up routine with attendance data share",
      dueDate: daysAgo(14),
      evidenceOfCompletion: "Routine posted and students complete warm-up within 5 minutes",
      skillIds: [closedSkills[1], closedSkills[2]],
      completed: true,
      completedAt: daysAgo(12),
      completedBy: staff.coachId,
    },
    {
      actionPlanId: plans.closed._id,
      description: "Implement materials routine with work-time goal posted daily",
      dueDate: daysAgo(7),
      evidenceOfCompletion: "Students independently gathering materials within 2 minutes",
      skillIds: [closedSkills[3], closedSkills[4]],
      completed: true,
      completedAt: daysAgo(8),
      completedBy: staff.coachId,
    },
  ]);
  console.log("  Closed plan: 3 steps (all completed)");

  const archivedSkills = ACTION_PLANS.archived.skillIds;
  await SkillsHubActionStep.insertMany([
    {
      actionPlanId: plans.archived._id,
      description: "Learn and use every student's preferred name within the first two weeks",
      dueDate: daysAgo(50),
      evidenceOfCompletion: "Teacher greets each student by name at the door",
      skillIds: [archivedSkills[0], archivedSkills[4]],
      completed: true,
      completedAt: daysAgo(48),
      completedBy: staff.coachId,
    },
    {
      actionPlanId: plans.archived._id,
      description: "Implement specific praise and class celebrations routine at end of each period",
      dueDate: daysAgo(40),
      evidenceOfCompletion: "Teacher gives 3+ specific praise statements per period and closes with celebration",
      skillIds: [archivedSkills[1], archivedSkills[2], archivedSkills[3]],
      completed: true,
      completedAt: daysAgo(42),
      completedBy: staff.coachId,
    },
  ]);
  console.log("  Archived plan: 2 steps (all completed)\n");
}
