"use client";

import React from "react";
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/typography/Heading';
import { Text } from '@/components/ui/typography/Text';
import { Button } from '@/components/ui/button';
import { spacing, textColors } from '@/lib/ui/tokens';
import GenericAddForm from "@/components/features/shared/form/GenericAddForm";
import BulkUploadForm from "@/components/features/shared/form/BulkUploadForm";
import { ResourceHeader } from "@/components/features/shared/ResourceHeader";
import { useLookFors } from "@/hooks/useLookFors";
import { uploadLookForFile } from "@actions/lookFors/lookFors";
import { createLookFor } from "@actions/lookFors/lookFors";
import { LookForInput } from "@/lib/zod-schema/look-fors/look-for";
import { LookForFieldConfig } from "@/lib/ui-schema/fieldConfig/look-fors/look-for";

const createEmptyLookFor = (): LookForInput => ({
  lookForIndex: 0,
  schools: [],
  teachers: [],
  topic: "",
  description: "",
  studentFacing: "Yes",
  rubric: [],
  owners: [],
  category: "",
  status: "draft"
});

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

  if (loading) return <Text>Loading LookFors...</Text>;

  return (
    <div className={`container mx-auto ${spacing.lg}`}>
      <Heading level={2} className={`${textColors.primary} ${spacing.md}`}>
        Look Fors
      </Heading>

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

      <div className={spacing.lg}>
        {lookFors.map((lookFor) => (
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
                  padding="sm"
                  radius="md"
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
        ))}
      </div>

      <GenericAddForm
        title="Add Look For"
        defaultValues={createEmptyLookFor()}
        onSubmit={createLookFor}
        fields={LookForFieldConfig}
      />

      <BulkUploadForm
        title="Bulk Upload Look Fors"
        description="Upload a CSV file containing Look Fors and embedded rubric rows"
        onUpload={uploadLookForFile}
      />
    </div>
  );
}