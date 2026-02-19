import { Card, Stack, Group, Skeleton, Table, Container } from "@mantine/core";

/** Skeleton for ActionPlanList — segmented control + card list */
export function ActionPlanListSkeleton() {
  return (
    <Stack gap="md">
      <Skeleton height={36} width={240} radius="sm" />
      {[1, 2, 3].map((i) => (
        <Card key={i} shadow="sm" withBorder p="md">
          <Group justify="space-between">
            <div style={{ flex: 1 }}>
              <Skeleton height={20} width="60%" mb={8} />
              <Group gap="xs">
                <Skeleton height={20} width={60} radius="xl" />
                <Skeleton height={16} width={80} radius="xl" />
              </Group>
            </div>
            <Skeleton height={16} width={16} />
          </Group>
        </Card>
      ))}
    </Stack>
  );
}

/** Skeleton for SkillProgressionView — header with active skills + domain accordions */
export function SkillMapSkeleton() {
  return (
    <Stack gap="lg">
      {/* Title row */}
      <Group gap="xs" align="baseline">
        <Skeleton height={22} width={160} />
        <Skeleton height={14} width={220} />
      </Group>

      {/* Active skills */}
      <div>
        <Skeleton height={12} width={90} mb="xs" />
        <Group gap="sm">
          {[1, 2, 3].map((i) => (
            <Card key={i} shadow="xs" withBorder p="xs" w={160}>
              <Group gap="xs" wrap="nowrap">
                <Skeleton height={28} width={28} circle />
                <Skeleton height={14} width="70%" />
              </Group>
            </Card>
          ))}
        </Group>
      </div>

      {/* Domain accordion items */}
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} shadow="sm" withBorder p="md">
          <Group gap="sm">
            <Skeleton height={28} width={28} circle />
            <div style={{ flex: 1 }}>
              <Skeleton height={18} width="40%" mb={4} />
              <Skeleton height={12} width="25%" />
            </div>
          </Group>
        </Card>
      ))}
    </Stack>
  );
}

/** Skeleton for the skills taxonomy table page */
export function TaxonomyTableSkeleton() {
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Skeleton height={32} width="40%" mb="sm" />
          <Skeleton height={16} width="60%" />
        </div>

        {[1, 2].map((section) => (
          <section key={section}>
            <Skeleton height={24} width="30%" mb="md" />
            <Table
              striped
              withTableBorder
              withColumnBorders
              style={{ tableLayout: "fixed", minWidth: 800 }}
            >
              <Table.Thead>
                <Table.Tr>
                  {[1, 2, 3, 4, 5].map((col) => (
                    <Table.Th key={col}>
                      <Skeleton height={16} width="80%" />
                    </Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {[1, 2, 3, 4].map((row) => (
                  <Table.Tr key={row}>
                    {[1, 2, 3, 4, 5].map((col) => (
                      <Table.Td key={col}>
                        <Skeleton
                          height={14}
                          width={col === 1 ? "70%" : "90%"}
                        />
                      </Table.Td>
                    ))}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </section>
        ))}
      </Stack>
    </Container>
  );
}

/** Skeleton for the skill detail page — breadcrumbs + header + content cards */
export function SkillDetailSkeleton() {
  return (
    <div className="mx-auto" style={{ maxWidth: "900px" }}>
      <Card shadow="sm" p="lg" mb="lg">
        <Group gap="xs" mb="sm">
          <Skeleton height={14} width={70} />
          <Skeleton height={14} width={10} />
          <Skeleton height={14} width={100} />
          <Skeleton height={14} width={10} />
          <Skeleton height={14} width={80} />
        </Group>
        <Group justify="space-between" align="flex-start">
          <div style={{ flex: 1 }}>
            <Group gap="sm">
              <Skeleton height={28} width="40%" />
              <Skeleton height={22} width={60} radius="xl" />
              <Skeleton height={22} width={80} radius="xl" />
            </Group>
            <Skeleton height={14} width="70%" mt="xs" />
          </div>
          <Skeleton height={32} width={300} radius="sm" />
        </Group>
      </Card>

      <Stack gap="lg">
        <Card shadow="sm" p="lg">
          <Skeleton height={18} width={150} mb="sm" />
          <Stack gap="sm">
            {[1, 2, 3].map((i) => (
              <Group key={i} gap="sm">
                <Skeleton height={24} width={24} circle />
                <div style={{ flex: 1 }}>
                  <Skeleton height={14} width="30%" mb={4} />
                  <Skeleton height={12} width="60%" />
                </div>
              </Group>
            ))}
          </Stack>
        </Card>

        <Card shadow="sm" p="lg">
          <Skeleton height={18} width={60} mb="sm" />
          <Skeleton height={80} width="100%" />
        </Card>
      </Stack>
    </div>
  );
}

/** Skeleton for the observation guide — header fields + table + buttons */
export function ObservationGuideSkeleton() {
  return (
    <Stack gap="lg">
      <Card shadow="sm" p="lg">
        <Group grow>
          <div>
            <Skeleton height={14} width={40} mb={4} />
            <Skeleton height={36} width="100%" />
          </div>
          <div>
            <Skeleton height={14} width={80} mb={4} />
            <Skeleton height={36} width="100%" />
          </div>
        </Group>
        <Skeleton height={14} width={40} mt="md" mb={4} />
        <Skeleton height={60} width="100%" />
      </Card>

      <Skeleton height={400} width="100%" radius="sm" />

      <Group justify="flex-end">
        <Skeleton height={36} width={80} radius="sm" />
        <Skeleton height={36} width={120} radius="sm" />
      </Group>
    </Stack>
  );
}
