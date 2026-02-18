"use client";

import { Title, Text, Table, Stack, Container } from "@mantine/core";
import taxonomy from "../_data/teacher-skills.json";

interface Skill {
  id: string;
  name: string;
  description: string;
  level: 1 | 2;
}

function pairSkills(
  skills: Skill[],
): { l1: Skill | null; l2: Skill | null }[] {
  const l1 = skills.filter((s) => s.level === 1);
  const l2 = skills.filter((s) => s.level === 2);
  const rows: { l1: Skill | null; l2: Skill | null }[] = [];
  const maxLen = Math.max(l1.length, l2.length);
  for (let i = 0; i < maxLen; i++) {
    rows.push({ l1: l1[i] ?? null, l2: l2[i] ?? null });
  }
  return rows;
}

export default function SkillsPage() {
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
                      const rows = pairSkills(sub.skills as Skill[]);
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
