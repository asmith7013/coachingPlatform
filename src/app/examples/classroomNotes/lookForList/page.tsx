"use client";

import React, { useState } from "react";
import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { Button } from '@/components/core/Button';
import { DashboardPage } from '@/components/composed/layouts/DashboardPage';
import { EmptyListWrapper } from "@/components/core/empty/EmptyListWrapper";
import { RigidResourceForm as GenericResourceForm, type Field } from "@/components/composed/forms/RigidResourceForm";
import BulkUploadForm from "@/components/composed/forms/BulkUploadForm";
import { ResourceHeader } from "@/components/composed/layouts/ResourceHeader";
import { useLookFors } from "@hooks/domain/useLookFors";
import { uploadLookForFile } from "@actions/lookFors/lookFors";
import { createLookFor } from "@actions/lookFors/lookFors";
import { LookForInput } from "@zod-schema/look-fors/look-for";
import { cn } from "@ui/utils/formatters";

const lookForFields: Field<LookForInput>[] = [
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

interface LookFor extends LookForInput {
  _id: string;
  rubric: Array<{
    category: string[];
    score: number;
    content?: string[];
    parentId?: string;
    collectionId?: string;
    hex?: string;
  }>;
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
        {lookFors.map((lookFor: LookFor) => (
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
            {lookFor.rubric.map((rubricItem, index) => (
              <Card
                key={index}
                padding="sm"
              >
                <Heading 
                  level="h4" 
                  color="default"
                  className={cn("text-primary font-medium")}
                >
                  {rubricItem.category} ({rubricItem.score})
                </Heading>
                <Text 
                  textSize="base"
                  color="muted"
                  className="mt-2"
                >
                  {rubricItem.content || "No description"}
                </Text>
              </Card>
            ))}
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