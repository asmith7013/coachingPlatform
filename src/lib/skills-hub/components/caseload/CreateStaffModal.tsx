"use client";

import { useState } from "react";
import { Modal, TextInput, Select, Button, Stack, Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { Schools } from "@schema/enum/scm";
import { createStaffMember } from "../../admin/coaching-assignments/coaching-assignment.actions";

const schoolOptions = Schools.map((s) => ({ value: s, label: s }));

interface CreateStaffModalProps {
  opened: boolean;
  onClose: () => void;
  role: "Teacher" | "Coach";
  onCreated: () => void;
}

export function CreateStaffModal({
  opened,
  onClose,
  role,
  onCreated,
}: CreateStaffModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setSaving(true);

    const result = await createStaffMember({
      staffName: name,
      email,
      role,
      schoolId: schoolId ?? undefined,
    });

    setSaving(false);

    if (!result.success) {
      setError(result.error ?? "Failed to create staff member");
      return;
    }

    notifications.show({
      title: `${role} created`,
      message: `${name} has been added as a ${role.toLowerCase()}`,
      color: "teal",
    });

    // Reset form and close
    setName("");
    setEmail("");
    setSchoolId(null);
    onCreated();
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title={`Add New ${role}`} centered>
      <Stack gap="md">
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
          >
            {error}
          </Alert>
        )}

        <TextInput
          label="Full Name"
          placeholder="e.g. Jane Smith"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
        />

        <TextInput
          label="Email"
          placeholder="jane@school.edu"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          required
        />

        <Select
          label="School"
          placeholder={
            role === "Teacher"
              ? "Select a school"
              : "Select a school (optional)"
          }
          data={schoolOptions}
          value={schoolId}
          onChange={setSchoolId}
          searchable
          clearable={role !== "Teacher"}
          required={role === "Teacher"}
          withAsterisk={role === "Teacher"}
        />

        <Button
          onClick={handleSubmit}
          loading={saving}
          disabled={
            !name.trim() || !email.trim() || (role === "Teacher" && !schoolId)
          }
          fullWidth
        >
          Create {role}
        </Button>
      </Stack>
    </Modal>
  );
}
