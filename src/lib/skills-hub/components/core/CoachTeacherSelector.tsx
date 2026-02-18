"use client";

import { useState, useEffect } from "react";
import { Card, Group, Select } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useSkillsHubAuth } from "../layout/ViewAsContext";
import { useCoachCaseload } from "../../hooks/useCoachCaseload";
import { getCoaches } from "../../admin/coaching-assignments/coaching-assignment.actions";
import type { StaffOption } from "../../admin/coaching-assignments/coaching-assignment.actions";

interface CoachTeacherSelectorProps {
  selectedTeacherId: string | null;
  onTeacherChange: (teacherId: string | null) => void;
}

export function CoachTeacherSelector({
  selectedTeacherId,
  onTeacherChange,
}: CoachTeacherSelectorProps) {
  const { metadata, hasRole } = useSkillsHubAuth();
  const isSuperAdmin = hasRole("super_admin");
  const isDirector = hasRole("director");
  const isAdmin = isSuperAdmin || isDirector;
  const isCoach = hasRole("coach");
  const isTeacher = !isAdmin && !isCoach;

  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);

  // For coaches, use their own staffId as the coach
  const coachStaffId = isAdmin
    ? (selectedCoachId ?? "")
    : metadata.staffId || "";

  // Fetch coaches list (admins only)
  const { data: coaches } = useQuery({
    queryKey: ["skillshub-coaches"],
    queryFn: async () => {
      const result = await getCoaches();
      if (!result.success) throw new Error(result.error);
      return result.data as StaffOption[];
    },
    enabled: isAdmin,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch teachers for the selected coach
  const { teachers, loading: teachersLoading } = useCoachCaseload(coachStaffId);

  const coachOptions = (coaches ?? []).map((c) => ({
    value: c._id,
    label: `${c.staffName}${c.email ? ` (${c.email})` : ""}`,
  }));

  const teacherOptions = teachers.map((assignment) => {
    const teacher = assignment.teacherStaffId;
    const name = typeof teacher === "object" ? teacher.staffName : "Unknown";
    const id = typeof teacher === "object" ? teacher._id : String(teacher);
    return { value: id, label: name };
  });

  // Teachers auto-select themselves
  useEffect(() => {
    if (isTeacher && metadata.staffId) {
      onTeacherChange(metadata.staffId);
    }
  }, [isTeacher, metadata.staffId, onTeacherChange]);

  // Clear teacher when coach changes
  const handleCoachChange = (coachId: string | null) => {
    setSelectedCoachId(coachId);
    onTeacherChange(null);
  };

  // Teachers don't see the selector
  if (isTeacher) return null;

  return (
    <Card shadow="sm" p="lg" mb="lg">
      <Group grow>
        {isAdmin && (
          <Select
            label="Coach"
            placeholder="Select a coach..."
            searchable
            data={coachOptions}
            value={selectedCoachId}
            onChange={handleCoachChange}
          />
        )}
        <Select
          label="Teacher"
          placeholder={
            !coachStaffId
              ? "Select a coach first"
              : teachersLoading
                ? "Loading..."
                : "Select a teacher..."
          }
          searchable
          data={teacherOptions}
          value={selectedTeacherId}
          onChange={onTeacherChange}
          disabled={!coachStaffId || teachersLoading}
        />
      </Group>
    </Card>
  );
}
