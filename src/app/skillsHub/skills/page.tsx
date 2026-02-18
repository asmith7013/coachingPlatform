"use client";

import { Title, Text, Table, Stack, Container, Center } from "@mantine/core";
import { useTaxonomy } from "../_hooks/useTaxonomy";
import { groupSkillsByLevel } from "../_lib/taxonomy";
import { TaxonomyTableSkeleton } from "../_components/skeletons/SkillsHubSkeletons";

export default function SkillsPage() {
  const { taxonomy, loading, error } = useTaxonomy();

  if (loading) {
    return <TaxonomyTableSkeleton />;
  }

  if (error || !taxonomy) {
    return (
      <Center py="xl">
        <Text c="red">{error || "Failed to load skills taxonomy"}</Text>
      </Center>
    );
  }

  const domains = taxonomy.domains;

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1}>SCM Teacher Skills</Title>
          <Text c="dimmed" mt="sm" maw={640}>
            {taxonomy.description}
          </Text>
        </div>

        {domains.map((domain) => (
          <section key={domain.id}>
            <Title order={3} mb="md">
              {domain.name}
            </Title>

            {domain.subDomains.length === 0 ? (
              <Text c="dimmed" fs="italic" size="sm">
                No skills defined yet.
              </Text>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <Table
                  striped
                  withTableBorder
                  withColumnBorders
                  style={{ tableLayout: "fixed", minWidth: 800 }}
                >
                  <colgroup>
                    <col style={{ width: "13%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "24%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "24%" }} />
                  </colgroup>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Sub-Domain</Table.Th>
                      <Table.Th bg="blue.0" c="blue.8">
                        Level 1 Skill
                      </Table.Th>
                      <Table.Th bg="blue.0" c="blue.8">
                        Description
                      </Table.Th>
                      <Table.Th bg="violet.0" c="violet.8">
                        Level 2 Skill
                      </Table.Th>
                      <Table.Th bg="violet.0" c="violet.8">
                        Description
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {domain.subDomains.map((sub) => {
                      const { l1Skills, l2Skills } = groupSkillsByLevel(
                        sub.skills,
                      );
                      const rowCount = Math.max(
                        l1Skills.length,
                        l2Skills.length,
                      );
                      const rows = Array.from({ length: rowCount }, (_, i) => ({
                        l1: l1Skills[i] ?? null,
                        l2: l2Skills[i] ?? null,
                      }));
                      return rows.map((row, i) => (
                        <Table.Tr key={`${sub.id}-${i}`}>
                          {i === 0 && (
                            <Table.Td
                              rowSpan={rows.length}
                              fw={500}
                              ta="center"
                              style={{ verticalAlign: "middle" }}
                            >
                              {sub.name}
                            </Table.Td>
                          )}
                          <Table.Td bg="blue.0" fw={500}>
                            {row.l1?.name ?? ""}
                          </Table.Td>
                          <Table.Td bg="blue.0" c="dimmed" fs="italic">
                            {row.l1?.description ?? ""}
                          </Table.Td>
                          <Table.Td bg="violet.0" fw={500}>
                            {row.l2?.name ?? ""}
                          </Table.Td>
                          <Table.Td bg="violet.0" c="dimmed" fs="italic">
                            {row.l2?.description ?? ""}
                          </Table.Td>
                        </Table.Tr>
                      ));
                    })}
                  </Table.Tbody>
                </Table>
              </div>
            )}
          </section>
        ))}
      </Stack>
    </Container>
  );
}
