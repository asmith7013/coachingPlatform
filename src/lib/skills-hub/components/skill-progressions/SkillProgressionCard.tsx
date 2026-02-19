"use client";

import { useTaxonomy } from "../../hooks/useTaxonomy";
import { getSkillByUuid } from "../../core/taxonomy";
import { ProgressionPlanCard } from "./ProgressionPlanCard";
import type { SkillProgressionDocument } from "../../coach/skill-progressions/skill-progression.types";

interface SkillProgressionCardProps {
  plan: SkillProgressionDocument;
  teacherStaffId: string;
}

export function SkillProgressionCard({
  plan,
  teacherStaffId,
}: SkillProgressionCardProps) {
  const { taxonomy } = useTaxonomy();

  const resolveSkillName = (id: string): string => {
    if (!taxonomy) return id;
    const skill = getSkillByUuid(taxonomy, id);
    return skill?.name ?? id;
  };

  return (
    <ProgressionPlanCard
      plan={plan}
      teacherStaffId={teacherStaffId}
      showSkillBadges
      resolveSkillName={resolveSkillName}
    />
  );
}
