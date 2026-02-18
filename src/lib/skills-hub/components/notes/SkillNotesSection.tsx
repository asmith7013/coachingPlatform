"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, Text, Card, Group, Loader, Center } from "@mantine/core";
import { NoteEditor } from "./NoteEditor";
import { getNotes } from "../_actions/notes.actions";
import type { SkillNoteDocument } from "../_types/note.types";

interface SkillNotesSectionProps {
  teacherStaffId: string;
  skillId: string;
  isCoachView: boolean;
}

export function SkillNotesSection({
  teacherStaffId,
  skillId,
  isCoachView,
}: SkillNotesSectionProps) {
  const queryClient = useQueryClient();

  const { data: notes, isLoading } = useQuery({
    queryKey: ["skill-notes", teacherStaffId, skillId],
    queryFn: async () => {
      const result = await getNotes(teacherStaffId, { skillId });
      if (!result.success) throw new Error(result.error);
      return result.data as SkillNoteDocument[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleNoteCreated = () => {
    queryClient.invalidateQueries({
      queryKey: ["skill-notes", teacherStaffId, skillId],
    });
  };

  if (isLoading) {
    return (
      <Center py="md">
        <Loader size="sm" />
      </Center>
    );
  }

  return (
    <Stack gap="md">
      {isCoachView && (
        <NoteEditor
          teacherStaffId={teacherStaffId}
          defaultSkillIds={[skillId]}
          onNoteCreated={handleNoteCreated}
        />
      )}

      {!notes || notes.length === 0 ? (
        <Text c="dimmed" size="sm">
          No notes for this skill yet
        </Text>
      ) : (
        notes.map((note) => (
          <Card key={note._id} withBorder p="sm">
            <Group justify="space-between" mb="xs">
              <Text size="xs" c="dimmed">
                {new Date(note.createdAt).toLocaleDateString()}
              </Text>
            </Group>
            <Text size="sm">{note.content}</Text>
          </Card>
        ))
      )}
    </Stack>
  );
}
