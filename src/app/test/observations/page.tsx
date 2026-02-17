"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@components/core/Button";
import { Card } from "@components/composed/cards";
import { Text } from "@components/core/typography/Text";
import { Heading } from "@components/core/typography/Heading";
import {
  useClassroomObservationDefaultsSimple,
  type ClassroomObservationInput,
  ClassroomObservation,
} from "@zod-schema/visits/classroom-observation";
import { useClassroomObservations } from "@hooks/domain/observations/useClassroomObservations";
import { ObservationForm } from "./ObservationForm";
import { ObservationsList } from "./ObservationsList";

type ViewMode = "list" | "create" | "edit";

export default function ObservationsTestPage() {
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedObservation, setSelectedObservation] =
    useState<ClassroomObservation | null>(null);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  // Get schema defaults
  const defaultValues = useClassroomObservationDefaultsSimple({
    cycle: "New Cycle",
    session: "New Session",
    // date: new Date(),
    // status: 'draft',
    // isSharedWithTeacher: false,
    // lessonTitle: 'New Lesson',
    // lessonCourse: 'New Course',
  });

  // Use the new unified interface for CRUD and enhancements
  const observationsMutations = useClassroomObservations.mutations();
  // const observationsWithToast = useClassroomObservations.withNotifications();
  const observationsManager = useClassroomObservations.manager();
  const {
    items: observations,
    isLoading: isLoadingList,
    error: listError,
    isCreating,
    isUpdating,
  } = observationsManager;
  const { createAsync, updateAsync, deleteAsync } = observationsMutations;

  // Handle create new observation
  const handleCreateNew = useCallback(() => {
    setSelectedObservation(null);
    setViewMode("create");
  }, []);

  // Handle edit observation
  const handleEdit = useCallback((observation: ClassroomObservation) => {
    setSelectedObservation(observation);
    setViewMode("edit");
  }, []);

  // Handle view observations list
  const handleViewList = useCallback(() => {
    setSelectedObservation(null);
    setViewMode("list");
  }, []);

  // Handle form submission (create or update)
  const handleFormSubmit = useCallback(
    async (data: ClassroomObservationInput) => {
      try {
        if (viewMode === "create") {
          const result = await createAsync!(data as ClassroomObservation);
          if (result.success) {
            setViewMode("list");
          }
        } else if (viewMode === "edit" && selectedObservation) {
          const result = await updateAsync!(selectedObservation._id, data);
          if (result.success) {
            setViewMode("list");
          }
        }
      } catch (error) {
        console.error("Failed to save observation:", error);
        throw error; // Re-throw to let form handle the error
      }
    },
    [viewMode, selectedObservation, createAsync, updateAsync],
  );

  // Handle delete observation
  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingIds((prev) => [...prev, id]);

      try {
        const result = await deleteAsync!(id);
        if (result.success) {
          // Remove from deleting list
          setDeletingIds((prev) =>
            prev.filter((deletingId) => deletingId !== id),
          );
        }
      } catch (error) {
        console.error("Failed to delete observation:", error);
        // Remove from deleting list even on error
        setDeletingIds((prev) =>
          prev.filter((deletingId) => deletingId !== id),
        );
      }
    },
    [deleteAsync],
  );

  // Handle form cancel
  const handleFormCancel = useCallback(() => {
    setSelectedObservation(null);
    setViewMode("list");
  }, []);

  // Get initial form data based on mode
  const getInitialFormData = useCallback((): ClassroomObservationInput => {
    if (viewMode === "edit" && selectedObservation) {
      // Convert the observation to input format (remove system fields)
      const {
        _id,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        ...inputData
      } = selectedObservation;
      return inputData as ClassroomObservationInput;
    }
    return defaultValues;
  }, [viewMode, selectedObservation, defaultValues]);

  // Get form error from mutations
  const getFormError = useCallback((): string | undefined => {
    if (viewMode === "create") {
      return observationsManager.createError
        ? String(observationsManager.createError)
        : undefined;
    } else if (viewMode === "edit") {
      return observationsManager.updateError
        ? String(observationsManager.updateError)
        : undefined;
    }
    return undefined;
  }, [
    viewMode,
    observationsManager.createError,
    observationsManager.updateError,
  ]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Heading level="h1" className="mb-2">
            Classroom Observations
          </Heading>
          <Text color="muted">
            Create, edit, and manage comprehensive classroom observation notes
          </Text>
        </div>

        {/* Navigation Controls */}
        <Card>
          <Card.Header>
            <Heading level="h3">Actions</Heading>
          </Card.Header>
          <Card.Body>
            <div className="flex gap-4 flex-wrap">
              <Button
                appearance={viewMode === "list" ? "solid" : "outline"}
                onClick={handleViewList}
                disabled={isCreating || isUpdating || deletingIds.length > 0}
              >
                📋 View All Observations
              </Button>

              <Button
                appearance={viewMode === "create" ? "solid" : "outline"}
                onClick={handleCreateNew}
                disabled={isCreating || isUpdating || deletingIds.length > 0}
              >
                ➕ Create New Observation
              </Button>

              {viewMode === "edit" && selectedObservation && (
                <Button appearance="solid" disabled>
                  ✏️ Editing: {selectedObservation.cycle} -{" "}
                  {selectedObservation.session}
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>

        {/* Main Content */}
        {viewMode === "list" && (
          <ObservationsList
            observations={observations}
            isLoading={isLoadingList}
            error={listError ? String(listError) : undefined}
            onEdit={handleEdit}
            onDelete={handleDelete}
            deletingIds={deletingIds}
          />
        )}

        {(viewMode === "create" || viewMode === "edit") && (
          <ObservationForm
            mode={viewMode}
            initialData={getInitialFormData()}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isSubmitting={isCreating || isUpdating}
            error={getFormError()}
          />
        )}
      </div>
    </div>
  );
}
