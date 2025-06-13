"use client";

import React, { useState, useCallback } from "react";

import { cn } from "@ui/utils/formatters";

import { useSchoolsList, useSchoolsMutations } from "@hooks/domain/useSchools";
import { createSchool, uploadSchoolFile } from "@actions/schools/schools";
import { SchoolForm } from "@components/domain/schools/SchoolForm";
import type { SchoolInput, School } from "@zod-schema/core/school";

import { Card } from '@components/composed/cards/Card';
import { Heading } from '@components/core/typography/Heading';
import { Text } from '@components/core/typography/Text';
import { Button } from '@components/core/Button';
import { DashboardPage } from '@components/composed/layouts/DashboardPage';
import BulkUploadForm from "@components/composed/forms/BulkUploadForm";
import { ResourceHeader } from "@components/composed/layouts/ResourceHeader";
import { EmptyListWrapper } from '@components/core/empty/EmptyListWrapper';

export default function SchoolList() {
  // Use the React Query-based hooks
  const {
    items: schools = [],
    total = 0,
    isLoading: loading,
    error: schoolError,
    page,
    setPage,
    pageSize: limit = 10,
    applyFilters,
    changeSorting
  } = useSchoolsList();

  // Get mutation functions from the mutations hook
  const { 
    delete: removeSchool,
    isDeleting
  } = useSchoolsMutations();

  // Use local state for performance mode instead
  const [performanceMode, setPerformanceMode] = useState(true);
  const togglePerformanceMode = useCallback(() => {
    setPerformanceMode(prev => !prev);
  }, []);

  const [searchInput, setSearchInput] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const confirmDeleteSchool = (id: string) => {
    if (window.confirm("Are you sure you want to delete this school?")) {
      handleDeleteSchool(id);
    }
  };

  const handleDeleteSchool = async (id: string) => {
    try {
      if (removeSchool) {
        removeSchool(id);
      }
    } catch (error) {
      console.error("Failed to delete school:", error);
    }
  };

  const handleCreateSchool = async (data: SchoolInput) => {
    await createSchool(data);
    setShowCreateForm(false);
  };

  if (loading) return <Text textSize="base">Loading Schools...</Text>;
  if (schoolError) return <Text textSize="base" color="danger">Error loading schools</Text>;

  return (
    <DashboardPage
      title="Schools"
      description="Manage and track schools across your district."
    >
      <ResourceHeader<SchoolInput>
        page={page}
        total={total}
        limit={limit}
        setPage={setPage}
        sortOptions={[
          { key: "schoolName", label: "School Name" },
          { key: "district", label: "District" }
        ]}
        onSort={(field, order) => changeSorting(field as string, order)}
        onSearch={(value) => applyFilters({ schoolName: value })}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        performanceMode={performanceMode}
        togglePerformanceMode={togglePerformanceMode}
      />

      <div className="mb-4">
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          intent="primary"
          appearance="solid"
        >
          {showCreateForm ? 'Cancel' : 'Create School'}
        </Button>
      </div>

      {showCreateForm && (
        <div className="mb-8">
          <SchoolForm
            title="Create New School"
            onSubmit={handleCreateSchool}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      <EmptyListWrapper items={schools} resourceName="schools">
        {schools.map((school: School) => (
          <Card
            key={school._id}
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
                  {school.emoji || '🏫'} {school.schoolName}
                </Heading>
                <Text 
                  textSize="base" 
                  color="muted"
                  className="mt-2"
                >
                  District: {school.district}
                </Text>
                {school.address && (
                  <Text 
                    textSize="base" 
                    color="muted"
                    className="mt-2"
                  >
                    {school.address}
                  </Text>
                )}
              </div>
              <Button
                onClick={() => school._id && confirmDeleteSchool(school._id)}
                textSize="sm"
                padding="sm"
                className="text-danger"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : '🗑️ Delete'}
              </Button>
            </div>
            <Heading 
              level="h3" 
              color="default"
              className={cn("text-primary font-medium mt-4")}
            >
              Grade Levels
            </Heading>
            <div className="flex flex-wrap gap-2 mt-2">
              {school.gradeLevelsSupported && school.gradeLevelsSupported.map((grade, index) => (
                <span 
                  key={index} 
                  className={cn(
                    'rounded-full px-3 py-1',
                    'text-sm',
                    'text-white',
                    'bg-primary'
                  )}
                >
                  {grade}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </EmptyListWrapper>

      <div className="mt-8">
        <BulkUploadForm
          title="Bulk Upload Schools"
          description="Upload a CSV file with school data"
          onUpload={uploadSchoolFile}
        />
      </div>
    </DashboardPage>
  );
}