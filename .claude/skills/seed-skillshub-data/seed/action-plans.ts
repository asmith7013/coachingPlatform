import mongoose from "mongoose";
import { SkillsHubActionPlan } from "@lib/skills-hub/coach/skill-progressions/skill-progression.model";
import { SkillsHubActionStep } from "@lib/skills-hub/coach/skill-progressions/progression-step.model";
import { SkillsHubCoachTeacherAssignment } from "@lib/skills-hub/admin/coaching-assignments/coaching-assignment.model";
import { daysAgo, type StaffIds } from "./config";
import type { ActionPlanConfig, ActionStepConfig } from "./teachers/teacher-seed-config.types";

export type PlanDocs = Record<string, mongoose.Document>;

export async function seedCoachingAssignment(
  staff: StaffIds,
  coachingDaysAgo: number,
): Promise<void> {
  console.log("Creating coaching assignment...");
  await SkillsHubCoachTeacherAssignment.create({
    coachStaffId: staff.coachId,
    teacherStaffId: staff.teacherId,
    schoolId: null,
    assignedAt: daysAgo(coachingDaysAgo),
  });
  console.log("  coach → teacher assignment created\n");
}

export async function seedSkillProgressions(
  staff: StaffIds,
  actionPlans: Record<string, ActionPlanConfig>,
): Promise<PlanDocs> {
  console.log("Creating action plans...");
  const planDocs: PlanDocs = {};

  for (const [key, plan] of Object.entries(actionPlans)) {
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
      skillIds: plan.skillUuids,
      why: plan.why,
      status: plan.status,
      closedAt,
    });
    planDocs[key] = doc;
    console.log(`  [${plan.status}] "${plan.title}" — ${plan.skillUuids.length} skills`);
  }
  console.log("");
  return planDocs;
}

export async function seedProgressionSteps(
  staff: StaffIds,
  plans: PlanDocs,
  actionPlans: Record<string, ActionPlanConfig>,
  actionSteps: ActionStepConfig[],
): Promise<void> {
  console.log("Creating action steps...");

  // Group steps by planKey for logging
  const stepsByPlan = new Map<string, ActionStepConfig[]>();
  for (const step of actionSteps) {
    const group = stepsByPlan.get(step.planKey) ?? [];
    group.push(step);
    stepsByPlan.set(step.planKey, group);
  }

  const records = actionSteps.map((step) => {
    const plan = actionPlans[step.planKey];
    const planDoc = plans[step.planKey];
    return {
      actionPlanId: planDoc._id,
      description: step.description,
      dueDate: daysAgo(step.dueDaysAgo),
      evidenceOfCompletion: step.evidenceOfCompletion,
      skillIds: step.skillIndexes.map((i) => plan.skillUuids[i]),
      completed: step.completed,
      ...(step.completed && step.completedDaysAgo != null
        ? { completedAt: daysAgo(step.completedDaysAgo), completedBy: staff.coachId }
        : {}),
    };
  });

  await SkillsHubActionStep.insertMany(records);

  for (const [planKey, steps] of stepsByPlan) {
    const completed = steps.filter((s) => s.completed).length;
    const pending = steps.length - completed;
    const label =
      pending === 0
        ? `${steps.length} steps (all completed)`
        : `${steps.length} steps (${completed} completed, ${pending} pending)`;
    console.log(`  ${planKey} plan: ${label}`);
  }
  console.log("");
}
