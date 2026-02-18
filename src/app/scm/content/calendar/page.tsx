"use client";

import React from "react";
import { useCalendarState } from "./hooks/useCalendarState";
import { CalendarHeader } from "./components/CalendarHeader";
import { CalendarPanel } from "./components/CalendarPanel";
import { CalendarLegend } from "./components/CalendarLegend";
import { CalendarModals } from "./components/CalendarModals";
import { UnitPanel } from "./components/UnitPanel";

export default function Calendar2Page() {
  const state = useCalendarState();

  if (state.isInitialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CalendarHeader
        schoolYear={state.schoolYear}
        isMutating={state.isMutating}
        selectionMode={state.selectionMode}
        selectedGrade={state.selectedGrade}
        onGradeChange={state.setSelectedGrade}
        selectedSection={state.selectedSection}
        onSectionChange={state.setSelectedSection}
        matchingSections={state.matchingSections}
        unitSchedules={state.unitSchedules}
        selectedUnitIndex={state.selectedUnitIndex}
        onUnitIndexChange={state.setSelectedUnitIndex}
        onCancelSelection={() => state.setSelectionMode(null)}
        onShowCopyModal={() => state.setShowCopyModal(true)}
        onShowAddDayOff={() => state.setShowAddDayOffModal(true)}
      />

      <div className="flex h-[calc(100vh-80px)]">
        <UnitPanel
          isContentLoading={state.isContentLoading}
          isLoadingGradeData={state.isLoadingGradeData}
          pendingSectionKey={state.pendingSectionKey}
          sectionConfigsLength={state.sectionConfigs.length}
          selectedSection={state.selectedSection}
          selectedUnit={state.selectedUnit}
          selectedUnitIndex={state.selectedUnitIndex}
          selectionMode={state.selectionMode}
          calculateSchoolDays={state.calculateSchoolDays}
          onOpenSubsections={state.handleOpenSubsections}
          onStartDateSelection={state.startDateSelection}
          onClearSectionDates={state.handleClearSectionDates}
          onUnitDateChange={state.handleUnitDateChange}
          onAddLesson={() => state.setShowAddLessonModal(true)}
        />

        <CalendarPanel
          isLoading={state.isLoadingGradeData}
          currentMonth={state.currentMonth}
          prevMonth={state.prevMonth}
          nextMonth={state.nextMonth}
          selectionMode={state.selectionMode}
          selectedUnitIndex={state.selectedUnitIndex}
          getScheduleForDate={state.getScheduleForDate}
          getSectionColorIndex={state.getSectionColorIndex}
          getEventsForDate={state.getEventsForDate}
          isDayOff={state.isDayOff}
          isSectionDayOff={state.isSectionDayOff}
          isWeekend={state.isWeekend}
          onDateClick={state.handleDateClick}
          onSectionDayOffClick={state.handleSectionDayOffClick}
          onAddEvent={state.selectedSection ? state.handleAddEvent : undefined}
        />
      </div>

      <CalendarLegend
        legendEntries={state.legendEntries}
        showEventButton={!!state.selectedSection}
        onShowAddDayOff={() => state.setShowAddDayOffModal(true)}
      />

      <CalendarModals
        showCopyModal={state.showCopyModal}
        onCloseCopyModal={() => {
          state.setShowCopyModal(false);
          state.setCopyTargets(new Set());
          state.setSelectedUnits(new Set());
        }}
        onCopy={state.handleCopyToSections}
        copySchedulesPending={state.copySchedulesPending}
        selectedSection={state.selectedSection}
        matchingSections={state.matchingSections}
        copyTargets={state.copyTargets}
        setCopyTargets={state.setCopyTargets}
        unitSchedules={state.unitSchedules}
        selectedUnits={state.selectedUnits}
        setSelectedUnits={state.setSelectedUnits}
        showAddDayOffModal={state.showAddDayOffModal}
        onCloseAddDayOff={() => {
          state.setShowAddDayOffModal(false);
          state.setAddEventDate(null);
        }}
        onAddDayOff={state.handleAddDayOff}
        addDayOffPending={state.addDayOffPending}
        addDayOffDefaultDate={state.addEventDate ?? undefined}
        showDeleteDayOffModal={state.showDeleteDayOffModal}
        onCloseDeleteDayOff={() => {
          state.setShowDeleteDayOffModal(false);
          state.setDayOffToDelete(null);
        }}
        onDeleteDayOff={state.handleDeleteDayOff}
        deleteDayOffPending={state.deleteDayOffPending}
        dayOffToDelete={state.dayOffToDelete}
        subsectionsModal={state.subsectionsModal}
        onCloseSubsections={() => state.setSubsectionsModal(null)}
        onSaveSubsections={state.handleSaveSubsections}
        updateSubsectionsPending={state.updateSubsectionsPending}
        showAddLessonModal={state.showAddLessonModal}
        onCloseAddLesson={() => state.setShowAddLessonModal(false)}
        onAddLesson={state.handleAddLesson}
        createScopeSequencePending={state.createScopeSequencePending}
        scopeTag={state.scopeTag}
        selectedGrade={state.selectedGrade}
        defaultUnit={state.selectedUnit?.unitNumber}
        existingEntries={state.scopeSequenceData ?? []}
      />
    </div>
  );
}
