import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { createScheduleComponentsDataErrorContext } from "./utils";
import {
  useScheduleDisplayData,
  useScheduleUI,
  useScheduleComponentsActions,
} from "./hooks";
import { PlanningStatusBar } from "./PlanningStatusBar";
import { ScheduleGrid } from "./ScheduleGrid";
import { ScheduleLegend } from "./ScheduleLegend";
import { ScheduleAssignmentType } from "@/lib/schema/enum/shared-enums";

export function ScheduleBuilderContainer({
  schoolId,
  date,
}: {
  schoolId: string;
  date: string;
}) {
  return (
    <ErrorBoundary
      context={createScheduleComponentsDataErrorContext(
        "render",
        schoolId,
        date,
      )}
      variant="default"
      showErrorId={process.env.NODE_ENV === "development"}
    >
      <ScheduleBuilderContent schoolId={schoolId} date={date} />
    </ErrorBoundary>
  );
}

function ScheduleBuilderContent({
  schoolId,
  date,
}: {
  schoolId: string;
  date: string;
}) {
  const scheduleData = useScheduleDisplayData(schoolId, date);
  const scheduleUI = useScheduleUI();
  const scheduleActions = useScheduleComponentsActions({
    schoolId,
    date,
    bellSchedule: scheduleData.bellSchedule,
  });

  // Handle portion selection using the extracted business logic
  const handlePortionSelect = async (
    teacherId: string,
    period: number,
    portion: ScheduleAssignmentType,
  ) => {
    await scheduleActions.scheduleVisit(teacherId, period, portion);
  };

  return (
    <div className="space-y-4">
      <PlanningStatusBar
        teachers={scheduleData.staff}
        visits={scheduleActions.currentVisitSchedule?.timeBlocks || []} // Use visit schedule blocks
      />

      <ScheduleGrid
        teachers={scheduleData.staff}
        timeSlots={scheduleData.bellSchedule?.timeBlocks || []}
        visits={scheduleActions.currentVisitSchedule?.timeBlocks || []} // Use visit schedule blocks
        onCellClick={scheduleUI.selectTeacherPeriod}
        onPortionSelect={handlePortionSelect} // Pass the business logic handler
        selectedTeacher={scheduleUI.uiState.selectedTeacher || undefined}
        selectedPeriod={scheduleUI.uiState.selectedPeriod || undefined}
      />

      <ScheduleLegend />
    </div>
  );
}
