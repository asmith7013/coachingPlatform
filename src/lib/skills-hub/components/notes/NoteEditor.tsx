"use client";

import { useState } from "react";
import { Textarea, Button, Stack, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createNote } from "../../coach/notes/notes.actions";

interface NoteEditorProps {
  teacherStaffId: string;
  defaultSkillIds?: string[];
  onNoteCreated: () => void;
}

export function NoteEditor({
  teacherStaffId,
  defaultSkillIds = [],
  onNoteCreated,
}: NoteEditorProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setSubmitting(true);

    const result = await createNote({
      teacherStaffId,
      content: content.trim(),
      imageUrls: [],
      tags: {
        skillIds: defaultSkillIds,
        actionPlanIds: [],
        actionStepIds: [],
      },
    });

    setSubmitting(false);

    if (result.success) {
      setContent("");
      onNoteCreated();
      notifications.show({
        title: "Note saved",
        message: "Your note has been added",
        color: "teal",
      });
    } else {
      notifications.show({
        title: "Error",
        message: result.error || "Failed to save note",
        color: "red",
      });
    }
  };

  return (
    <Stack gap="sm">
      <Textarea
        placeholder="Add a note about this skill..."
        value={content}
        onChange={(e) => setContent(e.currentTarget.value)}
        autosize
        minRows={2}
        maxRows={6}
      />
      <Group justify="flex-end">
        <Button
          size="sm"
          onClick={handleSubmit}
          loading={submitting}
          disabled={!content.trim()}
        >
          Add Note
        </Button>
      </Group>
    </Stack>
  );
}
