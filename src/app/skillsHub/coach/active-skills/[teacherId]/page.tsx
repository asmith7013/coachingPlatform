"use client";

import { useParams, useRouter } from "next/navigation";
import { CoachTeacherSelector } from "@/lib/skills-hub/components/core/CoachTeacherSelector";
import { ActiveSkillsView } from "@/lib/skills-hub/components/skills/ActiveSkillsView";

export default function ActiveSkillsTeacherPage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = params.teacherId as string;

  const handleTeacherChange = (newTeacherId: string | null) => {
    if (newTeacherId) {
      router.push(`/skillsHub/coach/active-skills/${newTeacherId}`);
    } else {
      router.push("/skillsHub/coach/active-skills");
    }
  };

  return (
    <div className="mx-auto" style={{ maxWidth: "1600px" }}>
      <ActiveSkillsView
        key={teacherId}
        teacherStaffId={teacherId}
        showObservations
        headerContent={
          <CoachTeacherSelector
            noCard
            selectedTeacherId={teacherId}
            onTeacherChange={handleTeacherChange}
          />
        }
      />
    </div>
  );
}
