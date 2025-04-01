"use client";

import React from "react";
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/typography/Heading';
import { Text } from '@/components/ui/typography/Text';
import { Button } from '@/components/ui/button';
import { spacing, textColors } from '@/lib/ui/tokens';
import { DashboardPage } from '@/components/layouts/DashboardPage';
import { EmptyState } from '@/components/ui/empty-state';
import { GenericAddForm, type Field } from "@/components/features/shared/form/GenericAddForm";
import BulkUploadForm from "@/components/features/shared/form/BulkUploadForm";
import { ResourceHeader } from "@/components/features/shared/ResourceHeader";
import { useLookFors } from "@/hooks/useLookFors";
import { uploadLookForFile } from "@actions/lookFors/lookFors";
import { createLookFor } from "@actions/lookFors/lookFors";
import { LookForInput } from "@/lib/zod-schema/look-fors/look-for";

const lookForFields: Field<LookForInput>[] = [
  {
    name: 'topic',
    label: 'Topic',
    type: 'text',
    required: true,
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
  },
  {
    name: 'studentFacing',
    label: 'Student Facing',
    type: 'select',
    options: [
      { value: 'Yes', label: 'Yes' },
      { value: 'No', label: 'No' },
    ],
    required: true,
  },
  {
    name: 'category',
    label: 'Category',
    type: 'text',
    required: true,
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
    ],
    required: true,
  },
];

export default function LookForsWrapper() {
  const { 
    lookFors, 
    loading, 
    page, 
    setPage, 
    limit, 
    total, 
    removeLookFor,
    applyFilters,
    changeSorting,
  } = useLookFors();

  const confirmDeleteLookFor = (id: string) => {
    if (window.confirm("Are you sure you want to delete this LookFor?")) {
      handleDeleteLookFor(id);
    }
  };

  const handleDeleteLookFor = async (id: string) => {
    await removeLookFor(id);
  };

  const handleSubmit = async (data: LookForInput) => {
    try {
      const lookForData: LookForInput = {
        ...data,
        lookForIndex: 0,
        schools: [],
        teachers: [],
        rubric: [],
        owners: [],
      };
      await createLookFor(lookForData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create look for' };
    }
  };

  if (loading) return <Text>Loading LookFors...</Text>;

  return (
    <DashboardPage 
      title="Look Fors"
      description="Manage and track look fors across your schools."
    >
      <ResourceHeader<LookForInput>
        page={page}
        setPage={setPage}
        total={total}
        limit={limit}
        sortOptions={[
          { key: "topic", label: "Topic" }
        ]}
        onSort={(field, order) => {
          if (field === "topic") {
            changeSorting("topic", order);
          }
        }}
        onSearch={(value) => applyFilters({ topic: value })}
      />

      {lookFors.length === 0 ? (
        <EmptyState
          title="No look fors found"
          description="Create your first look for or upload a batch to get started."
          icon="🔍"
        />
      ) : (
        lookFors.map((lookFor) => (
          <Card
            key={lookFor._id}
            className={spacing.md}
            padding="md"
            radius="lg"
          >
            <div className="flex justify-between items-center">
              <div>
                <Heading level={3} className={textColors.primary}>
                  {lookFor.studentFacing ? "✏️" : "🍎"} {lookFor.topic}
                </Heading>
                <Text variant="secondary" className={spacing.sm}>
                  {lookFor.description}
                </Text>
              </div>
              <Button
                onClick={() => lookFor._id && confirmDeleteLookFor(lookFor._id)}
                variant="danger"
                size="sm"
              >
                🗑️ Delete
              </Button>
            </div>

            <Heading level={3} className={`${textColors.primary} ${spacing.md}`}>
              Rubric
            </Heading>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {lookFor.rubric.map((rubricItem, index) => (
                <Card
                  key={index}
                  className={spacing.sm}
                >
                  <Heading level={4} className={textColors.primary}>
                    {rubricItem.category} ({rubricItem.score})
                  </Heading>
                  <Text variant="secondary" className={spacing.sm}>
                    {rubricItem.content || "No description"}
                  </Text>
                </Card>
              ))}
            </div>
          </Card>
        ))
      )}

      <GenericAddForm
        title="Add Look For"
        fields={lookForFields}
        onSubmit={handleSubmit}
      />
      <BulkUploadForm
        title="Bulk Upload Look Fors"
        description="Upload a CSV file containing Look Fors and embedded rubric rows"
        onUpload={uploadLookForFile}
      />
    </DashboardPage>
  );
}