"use client";

import React from "react";
import {
  AddDayOffModal,
  DeleteDayOffModal,
  CopyToSectionsModal,
  type SectionConfigOption,
  type LessonForSubsection,
  type SubsectionsModalState,
} from "../../calendar-old/components";
import { SubsectionsModal } from "../../calendar-old/components/SubsectionsModal";
import { AddEntryModal } from "../../edit-scope-and-sequence/components/AddEntryModal";
import type { UnitScheduleLocal } from "../../calendar-old/components/types";
import type {
  ScopeAndSequence,
  ScopeAndSequenceInput,
} from "@zod-schema/scm/scope-and-sequence/scope-and-sequence";

interface CalendarModalsProps {
  // Copy modal
  showCopyModal: boolean;
  onCloseCopyModal: () => void;
  onCopy: (unitNumbers: number[]) => void;
  copySchedulesPending: boolean;
  selectedSection: SectionConfigOption | null;
  matchingSections: SectionConfigOption[];
  copyTargets: Set<string>;
  setCopyTargets: React.Dispatch<React.SetStateAction<Set<string>>>;
  unitSchedules: UnitScheduleLocal[];
  selectedUnits: Set<number>;
  setSelectedUnits: React.Dispatch<React.SetStateAction<Set<number>>>;

  // Add day off modal
  showAddDayOffModal: boolean;
  onCloseAddDayOff: () => void;
  onAddDayOff: (
    date: string,
    name: string,
    shiftSchedule: boolean,
    targetSections: Array<{ school: string; classSection: string }>,
    hasMathClass: boolean,
  ) => Promise<void>;
  addDayOffPending: boolean;

  // Delete day off modal
  showDeleteDayOffModal: boolean;
  onCloseDeleteDayOff: () => void;
  onDeleteDayOff: (date: string, shiftSchedule: boolean) => Promise<void>;
  deleteDayOffPending: boolean;
  dayOffToDelete: { date: string; name: string } | null;

  // Subsections modal
  subsectionsModal: SubsectionsModalState | null;
  onCloseSubsections: () => void;
  onSaveSubsections: (updates: LessonForSubsection[]) => void;
  updateSubsectionsPending: boolean;

  // Add lesson modal
  showAddLessonModal: boolean;
  onCloseAddLesson: () => void;
  onAddLesson: (data: ScopeAndSequenceInput) => void;
  createScopeSequencePending: boolean;
  scopeTag: string;
  selectedGrade: string;
  defaultUnit?: number;
  existingEntries: ScopeAndSequence[];
}

export function CalendarModals({
  showCopyModal,
  onCloseCopyModal,
  onCopy,
  copySchedulesPending,
  selectedSection,
  matchingSections,
  copyTargets,
  setCopyTargets,
  unitSchedules,
  selectedUnits,
  setSelectedUnits,
  showAddDayOffModal,
  onCloseAddDayOff,
  onAddDayOff,
  addDayOffPending,
  showDeleteDayOffModal,
  onCloseDeleteDayOff,
  onDeleteDayOff,
  deleteDayOffPending,
  dayOffToDelete,
  subsectionsModal,
  onCloseSubsections,
  onSaveSubsections,
  updateSubsectionsPending,
  showAddLessonModal,
  onCloseAddLesson,
  onAddLesson,
  createScopeSequencePending,
  scopeTag,
  selectedGrade,
  defaultUnit,
  existingEntries,
}: CalendarModalsProps) {
  return (
    <>
      {/* Copy To Sections Modal */}
      {showCopyModal && selectedSection && (
        <CopyToSectionsModal
          isOpen={showCopyModal}
          onClose={onCloseCopyModal}
          onCopy={onCopy}
          copying={copySchedulesPending}
          sourceSection={selectedSection}
          otherSections={matchingSections.filter(
            (s) =>
              !(
                s.school === selectedSection.school &&
                s.classSection === selectedSection.classSection
              ),
          )}
          copyTargets={copyTargets}
          setCopyTargets={setCopyTargets}
          unitSchedules={unitSchedules}
          selectedUnits={selectedUnits}
          setSelectedUnits={setSelectedUnits}
        />
      )}

      {/* Add Day Off Modal */}
      {showAddDayOffModal && selectedSection && (
        <AddDayOffModal
          isOpen={showAddDayOffModal}
          onClose={onCloseAddDayOff}
          onSubmit={onAddDayOff}
          saving={addDayOffPending}
          currentSection={selectedSection}
          allSections={matchingSections}
          unitSchedules={unitSchedules}
        />
      )}

      {/* Delete Day Off Modal */}
      {showDeleteDayOffModal && dayOffToDelete && selectedSection && (
        <DeleteDayOffModal
          isOpen={showDeleteDayOffModal}
          onClose={onCloseDeleteDayOff}
          onConfirm={onDeleteDayOff}
          deleting={deleteDayOffPending}
          event={dayOffToDelete}
        />
      )}

      {/* Subsections Modal */}
      {subsectionsModal && (
        <SubsectionsModal
          isOpen={subsectionsModal.isOpen}
          sectionName={subsectionsModal.sectionName}
          lessons={subsectionsModal.lessons}
          onClose={onCloseSubsections}
          onSave={onSaveSubsections}
          isSaving={updateSubsectionsPending}
        />
      )}

      {/* Add Lesson Modal */}
      <AddEntryModal
        isOpen={showAddLessonModal}
        onClose={onCloseAddLesson}
        onSubmit={onAddLesson}
        isLoading={createScopeSequencePending}
        defaultTag={scopeTag}
        defaultGrade={selectedGrade}
        defaultUnit={defaultUnit}
        existingEntries={existingEntries}
      />
    </>
  );
}
