"use client";

import { Title, Text, Card } from "@mantine/core";
import { useAuthenticatedUser } from "@/hooks/auth/useAuthenticatedUser";
import { useCoachCaseload } from "../_hooks/useCoachCaseload";
import { CaseloadTable } from "../_components/CaseloadTable";

export default function CaseloadPage() {
  const { metadata } = useAuthenticatedUser();
  const staffId = metadata.staffId || "";
  const { teachers, loading, error } = useCoachCaseload(staffId);

  return (
    <div className="mx-auto" style={{ maxWidth: "1600px" }}>
      <Card shadow="sm" p="lg" mb="lg">
        <Title order={2}>My Caseload</Title>
        <Text size="sm" c="dimmed">
          Teachers assigned to you for coaching
        </Text>
      </Card>

      {error ? (
        <Text c="red">{error}</Text>
      ) : (
        <Card shadow="sm" p="lg">
          <CaseloadTable teachers={teachers} loading={loading} />
        </Card>
      )}
    </div>
  );
}
