"use client";

import React, { useState } from "react";
import { Card } from '@components/composed/cards/Card';
import { Heading } from '@components/core/typography/Heading';
import { Text } from '@components/core/typography/Text';
import { Button } from '@components/core/Button';
import { DashboardPage } from '@components/composed/layouts/DashboardPage';
import { EmptyListWrapper } from "@components/core/empty/EmptyListWrapper";
import { RigidResourceForm as GenericResourceForm } from "@components/composed/forms/RigidResourceForm";
import BulkUploadForm from "@components/composed/forms/BulkUploadForm";
import { ResourceHeader } from "@components/composed/layouts/ResourceHeader";
import { LookForWithDates, useLookFors } from "@hooks/domain/useLookFors";
import { uploadLookForFile } from "@actions/lookFors/lookFors";
import { createLookFor } from "@actions/lookFors/lookFors";
import { LookForInput } from "@zod-schema/look-fors/look-for";
import { cn } from "@ui/utils/formatters";
import type { Field } from "@ui-types/form";

// Add proper typing for rubric items
interface RubricItem {
  category: string | string[];
  score: number;
  content?: string | string[];
}

const lookForFields: Field[] = [
  {
    key: 'topic',
    label: 'Topic',
    type: 'text',
    required: true,
  },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
  },
  {
    key: 'studentFacing',
    label: 'Student Facing',
    type: 'select',
    options: [
      { value: 'Yes', label: 'Yes' },
      { value: 'No', label: 'No' },
    ],
    required: true,
  },
  {
    key: 'category',
    label: 'Category',
    type: 'text',
    required: true,
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
    ],
    required: true,
  },
];

// Helper function to safely get string value from string or array
function getStringValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return value || '';
}

export default function LookForsWrapper() {
  const {
    lookFors,
    total,
    loading,
    error: lookForError,
    page,
    setPage,
    limit,
    applyFilters,
    changeSorting,
    removeLookFor
  } = useLookFors();

  const [searchInput, setSearchInput] = useState("");

  const confirmDeleteLookFor = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this look for?')) {
      await removeLookFor(id);
    }
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

  if (loading) return <Text textSize="base">Loading Look Fors...</Text>;
  if (lookForError) return <Text textSize="base" color="danger">Error loading look fors</Text>;

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
        searchInput={searchInput}
        setSearchInput={setSearchInput}
      />

      <EmptyListWrapper items={lookFors} resourceName="look fors">
        {lookFors.map((lookFor: LookForWithDates) => (
          <Card
            key={lookFor._id}
            className="mb-4"
            padding="md"
            radius="lg"
          >
            <div className="flex justify-between items-center">
              <div>
                <Heading 
                  level="h3" 
                  color="default"
                  className={cn("text-primary font-medium")}
                >
                  {lookFor.studentFacing ? "✏️" : "🍎"} {lookFor.topic}
                </Heading>
                <Text 
                  textSize="base"
                  color="muted"
                  className="mt-2"
                >
                  {lookFor.description}
                </Text>
              </div>
              <Button
                onClick={() => lookFor._id && confirmDeleteLookFor(lookFor._id)}
                textSize="sm"
                padding="sm"
                className="text-danger"
              >
                🗑️ Delete
              </Button>
            </div>

            <Heading 
              level="h3" 
              color="default"
              className={cn("text-primary font-medium mt-4 mb-2")}
            >
              Rubric
            </Heading>
            {lookFor.rubric?.map((rubricItem: unknown, index: number) => {
              // Type guard and safe casting
              const typedRubricItem = rubricItem as RubricItem;
              
              return (
                <Card
                  key={index}
                  padding="sm"
                  className="mb-2"
                >
                  <Heading 
                    level="h4" 
                    color="default"
                    className={cn("text-primary font-medium")}
                  >
                    {getStringValue(typedRubricItem.category)} ({typedRubricItem.score || 'No score'})
                  </Heading>
                  <Text 
                    textSize="base"
                    color="muted"
                    className="mt-2"
                  >
                    {getStringValue(typedRubricItem.content) || "No description"}
                  </Text>
                </Card>
              );
            })}
          </Card>
        ))}
      </EmptyListWrapper>

      <div className="mt-8">
        <GenericResourceForm
          mode="create"
          title="Add Look For"
          onSubmit={handleSubmit}
          fields={lookForFields}
        />

        <BulkUploadForm
          title="Bulk Upload Look Fors"
          description="Upload a CSV file containing Look Fors and embedded rubric rows"
          onUpload={uploadLookForFile}
        />
      </div>
    </DashboardPage>
  );
}