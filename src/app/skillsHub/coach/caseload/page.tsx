"use client";

import { Title, Text, Card, Select } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useSkillsHubAuth } from "@/lib/skills-hub/components/layout/ViewAsContext";
import { useSkillsHubFilters } from "@/lib/skills-hub/hooks/useSkillsHubFilters";
import { useCoachCaseload } from "@/lib/skills-hub/hooks/useCoachCaseload";
import { CaseloadTable } from "@/lib/skills-hub/components/caseload/CaseloadTable";
import { getCoaches } from "@/lib/skills-hub/admin/coaching-assignments/coaching-assignment.actions";
import type { StaffOption } from "@/lib/skills-hub/admin/coaching-assignments/coaching-assignment.actions";

export default function CaseloadPage() {
  const { metadata, hasRole } = useSkillsHubAuth();
  const isAdmin = hasRole("super_admin") || hasRole("director");

  const { selectedCoachId, setSelectedCoachId } = useSkillsHubFilters();

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

  // Admins pick a coach; coaches/teachers use their own staffId
  const staffId = isAdmin ? (selectedCoachId ?? "") : metadata.staffId || "";

  const { teachers, loading, error } = useCoachCaseload(staffId);

  const coachOptions = (coaches ?? []).map((c) => ({
    value: c._id,
    label: `${c.staffName}${c.email ? ` (${c.email})` : ""}`,
  }));

  return (
    <div className="mx-auto" style={{ maxWidth: "1600px" }}>
      <Card shadow="sm" p="lg" mb="lg">
        <Title order={2}>{isAdmin ? "Caseload" : "My Caseload"}</Title>
        <Text size="sm" c="dimmed">
          Teachers assigned for coaching
        </Text>
      </Card>

      {isAdmin && (
        <Card shadow="sm" p="lg" mb="lg">
          <Select
            label="Select Coach"
            placeholder="Search for a coach..."
            searchable
            data={coachOptions}
            value={selectedCoachId}
            onChange={setSelectedCoachId}
          />
        </Card>
      )}

      {error ? (
        <Text c="red">{error}</Text>
      ) : isAdmin && !selectedCoachId ? (
        <Card shadow="sm" p="lg">
          <Text c="dimmed" ta="center" py="xl">
            Select a coach to view their caseload
          </Text>
        </Card>
      ) : (
        <Card shadow="sm" p="lg">
          <CaseloadTable teachers={teachers} loading={loading} />
        </Card>
      )}
    </div>
  );
}
